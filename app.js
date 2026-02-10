const DEFAULT_DSL = `meta:
  title: テスト
  author: DEF

page:
  id:p1
  size:B5
  margin:5
  unit:percent

panel:
  id:1
  page:p1
  x:0
  y:0
  w:60
  h:60

panel:
  id:2
  page:p1
  x:62
  y:0
  w:38
  h:35

panel:
  id:3
  page:p1
  x:62
  y:37
  w:38
  h:23

actor:
  id:a1
  panel:1
  x:20
  y:55
  pose:run
  emotion:panic
  facing:right
  name:主人公

actor:
  id:a2
  panel:1
  x:50
  y:55
  pose:stand
  emotion:angry
  facing:left
  name:先生

balloon:
  id:b1
  panel:1
  x:5
  y:5
  w:35
  h:18
  tail:toActor(a1)
  text: |
    ヤバい！
    遅刻だ！

caption:
  id:c1
  panel:2
  x:5
  y:5
  w:30
  h:10
  text: 翌朝

sfx:
  id:s1
  panel:3
  x:10
  y:15
  rotate:-15
  text: ドーン`;

const PAGE_SIZES = { B5: [1760, 2500], A4: [2480, 3508] };
const ACTOR_TYPES = new Set(["stand", "run", "sit", "point", "think", "surprise"]);
const EMOTIONS = new Set(["neutral", "angry", "sad", "panic", "smile"]);

const els = {
  input: document.getElementById("dslInput"),
  errorBox: document.getElementById("errorBox"),
  banner: document.getElementById("banner"),
  viewport: document.getElementById("previewViewport"),
  canvas: document.getElementById("svgCanvas"),
  resizer: document.getElementById("resizer"),
  downloadBtn: document.getElementById("downloadSvgBtn"),
  split: document.querySelector(".split-root"),
};

let lastGoodSvg = "";
let debounceId = null;
let viewState = { scale: 1, panX: 0, panY: 0 };
let currentScene = null;

function parseDsl(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length;) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i += 1;
      continue;
    }
    const blockMatch = raw.match(/^([a-zA-Z][\w-]*)\s*:\s*$/);
    if (!blockMatch) throw new Error(`Line ${i + 1}: ブロック宣言が不正です`);
    const block = { type: blockMatch[1], props: {}, line: i + 1, order: blocks.length };
    i += 1;

    while (i < lines.length) {
      const bodyRaw = lines[i];
      const bodyTrimmed = bodyRaw.trim();
      if (!bodyTrimmed) {
        i += 1;
        continue;
      }
      if (!/^\s+/.test(bodyRaw)) break;
      if (bodyTrimmed.startsWith("#")) {
        i += 1;
        continue;
      }

      const kv = bodyRaw.match(/^\s{2,}([\w-]+)\s*:\s*(.*)$/);
      if (!kv) throw new Error(`Line ${i + 1}: key:value 形式ではありません`);
      const [, key, rawValue] = kv;

      if (rawValue === "|") {
        i += 1;
        const multi = [];
        while (i < lines.length) {
          const m = lines[i];
          if (!/^\s{4,}/.test(m) && m.trim() !== "") break;
          if (m.trim() === "") {
            multi.push("");
          } else {
            multi.push(m.replace(/^\s{4}/, ""));
          }
          i += 1;
        }
        block.props[key] = multi.join("\n");
        continue;
      }

      block.props[key] = parseValue(rawValue.trim());
      i += 1;
    }

    blocks.push(block);
  }
  return blocks;
}

function parseValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  return value;
}

function validateAndBuild(blocks) {
  const scene = { meta: {}, pages: [], panels: [], actors: [], balloons: [], captions: [], sfx: [], assets: [], styles: [] };
  for (const b of blocks) {
    const key = `${b.type}s`;
    if (b.type === "meta") {
      scene.meta = b.props;
      continue;
    }
    if (!scene[key]) throw new Error(`Line ${b.line}: 未対応ブロック ${b.type}`);
    scene[key].push({ ...b.props, _line: b.line, _order: b.order });
  }

  if (scene.pages.length === 0) throw new Error("page は1つ以上必要です");

  const dicts = {
    pages: byId(scene.pages, "page"),
    panels: byId(scene.panels, "panel"),
    actors: byId(scene.actors, "actor"),
    styles: byId(scene.styles, "style"),
  };

  scene.pages.forEach((p) => {
    p.margin = num(p.margin, 5);
    p.unit = p.unit || "percent";
    p.bg = p.bg || "white";
    if (!p.id || !p.size) throw new Error(`Line ${p._line}: page id,size は必須です`);
    if (p.size === "custom" && (typeof p.width !== "number" || typeof p.height !== "number")) {
      throw new Error(`Line ${p._line}: size:custom では width,height が必須です`);
    }
  });

  for (const panel of scene.panels) {
    requireFields(panel, ["id", "page", "x", "y", "w", "h"], "panel");
    if (!dicts.pages.get(String(panel.page))) throw new Error(`Line ${panel._line}: 未定義 page 参照 ${panel.page}`);
    if (panel.w <= 0 || panel.h <= 0) throw new Error(`Line ${panel._line}: panel w/h は正数`);
  }

  const inPanelItems = ["actors", "balloons", "captions", "sfx", "assets"];
  for (const type of inPanelItems) {
    for (const item of scene[type]) {
      requireFields(item, ["id", "panel"], type.slice(0, -1));
      if (!dicts.panels.get(String(item.panel))) throw new Error(`Line ${item._line}: 未定義 panel 参照 ${item.panel}`);
      if (item.styleRef && !dicts.styles.get(String(item.styleRef))) {
        throw new Error(`Line ${item._line}: 未定義 styleRef ${item.styleRef}`);
      }
    }
  }

  for (const actor of scene.actors) {
    actor.pose = ACTOR_TYPES.has(actor.pose) ? actor.pose : "stand";
    actor.emotion = EMOTIONS.has(actor.emotion) ? actor.emotion : "neutral";
    actor.scale = num(actor.scale, 1);
    actor.facing = actor.facing === "left" ? "left" : "right";
    actor.x = num(actor.x, 0);
    actor.y = num(actor.y, 0);
  }

  for (const balloon of scene.balloons) {
    requireFields(balloon, ["x", "y", "w", "h", "text"], "balloon");
    balloon.shape = balloon.shape || "oval";
    balloon.align = balloon.align || "center";
    balloon.fontSize = num(balloon.fontSize, 4);
    balloon.padding = num(balloon.padding, 2);
  }

  for (const caption of scene.captions) {
    requireFields(caption, ["x", "y", "w", "h", "text"], "caption");
    caption.style = caption.style || "box";
    caption.align = caption.align || "center";
    caption.fontSize = num(caption.fontSize, 4);
    caption.padding = num(caption.padding, 2);
  }

  for (const s of scene.sfx) {
    requireFields(s, ["x", "y", "text"], "sfx");
    s.scale = num(s.scale, 1);
    s.rotate = num(s.rotate, 0);
    s.fontSize = num(s.fontSize, 8);
    s.fill = s.fill || "black";
  }

  for (const a of scene.assets) {
    requireFields(a, ["x", "y", "w", "h", "src"], "asset");
    a.opacity = num(a.opacity, 1);
    a.clipToPanel = a.clipToPanel !== false;
  }

  return scene;
}

function byId(arr, type) {
  const map = new Map();
  for (const item of arr) {
    const id = String(item.id ?? "");
    if (!id) throw new Error(`Line ${item._line}: ${type} id は必須`);
    if (map.has(id)) throw new Error(`Line ${item._line}: ${type} id 重複 ${id}`);
    map.set(id, item);
  }
  return map;
}

function requireFields(obj, fields, type) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === "") throw new Error(`Line ${obj._line}: ${type}.${f} は必須です`);
  }
}

function num(value, fallback) {
  return typeof value === "number" ? value : fallback;
}

function render(scene) {
  const page = scene.pages[0];
  const [w, h] = pageDimensions(page);
  const inner = {
    x: page.margin / 100 * w,
    y: page.margin / 100 * h,
    w: w * (1 - page.margin / 50),
    h: h * (1 - page.margin / 50),
  };

  const panelMap = new Map(scene.panels.map((p) => [String(p.id), p]));
  const actorMap = new Map(scene.actors.map((a) => [String(a.id), a]));

  const entries = [];
  for (const p of scene.panels) entries.push({ kind: "panel", z: p.z ?? 0, order: p._order, data: p });
  for (const a of scene.assets) entries.push({ kind: "asset", z: a.z ?? 0, order: a._order, data: a });
  for (const a of scene.actors) entries.push({ kind: "actor", z: a.z ?? 0, order: a._order, data: a });
  for (const b of scene.balloons) entries.push({ kind: "balloon", z: b.z ?? 0, order: b._order, data: b });
  for (const c of scene.captions) entries.push({ kind: "caption", z: c.z ?? 0, order: c._order, data: c });
  for (const s of scene.sfx) entries.push({ kind: "sfx", z: s.z ?? 0, order: s._order, data: s });
  entries.sort((a, b) => a.z - b.z || a.order - b.order);

  const defs = [];
  const body = [];

  for (const entry of entries) {
    if (entry.kind === "panel") {
      const r = rectInPage(entry.data, inner, page.unit);
      body.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${entry.data.fill || "none"}" stroke="${entry.data.stroke || "black"}" stroke-width="${num(entry.data.strokeWidth, 3)}" rx="${num(entry.data.radius, 0)}" ry="${num(entry.data.radius, 0)}"/>`);
    } else if (entry.kind === "asset") {
      const panel = panelMap.get(String(entry.data.panel));
      const panelRect = rectInPage(panel, inner, page.unit);
      const box = withinPanel(entry.data, panelRect, page.unit);
      let clip = "";
      if (entry.data.clipToPanel) {
        const clipId = `clip-${entry.data.id}`;
        defs.push(`<clipPath id="${clipId}"><rect x="${panelRect.x}" y="${panelRect.y}" width="${panelRect.w}" height="${panelRect.h}"/></clipPath>`);
        clip = ` clip-path="url(#${clipId})"`;
      }
      body.push(`<image x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" href="${escapeXml(entry.data.src)}" opacity="${entry.data.opacity}"${clip}/>`);
    } else if (entry.kind === "actor") {
      const panel = panelMap.get(String(entry.data.panel));
      const panelRect = rectInPage(panel, inner, page.unit);
      body.push(renderActor(entry.data, panelRect, page.unit));
    } else if (entry.kind === "balloon") {
      const panel = panelMap.get(String(entry.data.panel));
      const panelRect = rectInPage(panel, inner, page.unit);
      body.push(renderBalloon(entry.data, panelRect, page.unit, actorMap, panelMap, scene));
    } else if (entry.kind === "caption") {
      const panel = panelMap.get(String(entry.data.panel));
      const panelRect = rectInPage(panel, inner, page.unit);
      body.push(renderCaption(entry.data, panelRect, page.unit));
    } else if (entry.kind === "sfx") {
      const panel = panelMap.get(String(entry.data.panel));
      const panelRect = rectInPage(panel, inner, page.unit);
      body.push(renderSfx(entry.data, panelRect, page.unit));
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="${page.bg}"/>
  ${defs.length ? `<defs>${defs.join("")}</defs>` : ""}
  <g transform="translate(${viewState.panX},${viewState.panY}) scale(${viewState.scale})">${body.join("\n")}</g>
</svg>`;
}

function renderActor(actor, panelRect, unit) {
  const p = pointInPanel(actor.x, actor.y, panelRect, unit);
  const s = 20 * actor.scale;
  const mirror = actor.facing === "left" ? -1 : 1;

  const pose = poseSegments(actor.pose, s);
  const emotion = emotionPath(actor.emotion, s);

  return `<g transform="translate(${p.x},${p.y}) scale(${mirror},1)">
    <circle cx="0" cy="${-s * 2.2}" r="${s * 0.45}" fill="none" stroke="black" stroke-width="2"/>
    <line x1="0" y1="${-s * 1.7}" x2="0" y2="${-s * 0.8}" stroke="black" stroke-width="2"/>
    ${pose}
    ${emotion}
  </g>`;
}

function poseSegments(pose, s) {
  const sets = {
    stand: [[0, -s * 1.3, -s * 0.55, -s * 1], [0, -s * 1.3, s * 0.55, -s * 1], [0, -s * 0.8, -s * 0.45, 0], [0, -s * 0.8, s * 0.45, 0]],
    run: [[0, -s * 1.3, s * 0.7, -s * 1.1], [0, -s * 1.25, -s * 0.3, -s * 0.6], [0, -s * 0.8, -s * 0.9, -s * 0.2], [0, -s * 0.8, s * 0.8, 0]],
    sit: [[0, -s * 1.3, s * 0.4, -s * 1.1], [0, -s * 1.3, -s * 0.45, -s * 1], [0, -s * 0.8, s * 0.6, -s * 0.5], [s * 0.6, -s * 0.5, s * 1, -s * 0.5]],
    point: [[0, -s * 1.3, s * 0.9, -s * 1.5], [0, -s * 1.3, -s * 0.45, -s * 1], [0, -s * 0.8, -s * 0.45, 0], [0, -s * 0.8, s * 0.45, 0]],
    think: [[0, -s * 1.3, s * 0.2, -s * 1.7], [0, -s * 1.3, -s * 0.5, -s], [0, -s * 0.8, -s * 0.35, 0], [0, -s * 0.8, s * 0.35, 0]],
    surprise: [[0, -s * 1.3, s * 0.9, -s * 1.7], [0, -s * 1.3, -s * 0.9, -s * 1.7], [0, -s * 0.8, -s * 0.6, 0], [0, -s * 0.8, s * 0.6, 0]],
  };
  return sets[pose].map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="2"/>`).join("");
}

function emotionPath(emotion, s) {
  const y = -s * 2.2;
  const mouthY = y + s * 0.3;
  if (emotion === "smile") return `<path d="M ${-s * 0.15} ${mouthY} Q 0 ${mouthY + s * 0.15} ${s * 0.15} ${mouthY}" stroke="black" fill="none" stroke-width="1.5"/>`;
  if (emotion === "sad") return `<path d="M ${-s * 0.15} ${mouthY + s * 0.1} Q 0 ${mouthY - s * 0.1} ${s * 0.15} ${mouthY + s * 0.1}" stroke="black" fill="none" stroke-width="1.5"/>`;
  if (emotion === "angry") return `<line x1="${-s * 0.2}" y1="${mouthY}" x2="${s * 0.2}" y2="${mouthY}" stroke="black" stroke-width="2"/>`;
  if (emotion === "panic") return `<circle cx="0" cy="${mouthY}" r="${s * 0.1}" fill="none" stroke="black" stroke-width="1.5"/>`;
  return `<line x1="${-s * 0.15}" y1="${mouthY}" x2="${s * 0.15}" y2="${mouthY}" stroke="black" stroke-width="1.5"/>`;
}

function renderBalloon(balloon, panelRect, unit, actorMap, panelMap) {
  const r = withinPanel(balloon, panelRect, unit);
  let shape = "";
  if (balloon.shape === "box") {
    shape = `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="white" stroke="black"/>`;
  } else if (balloon.shape === "thought") {
    shape = `<ellipse cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" rx="${r.w / 2}" ry="${r.h / 2}" fill="white" stroke="black"/>`;
    shape += `<circle cx="${r.x + r.w * 0.25}" cy="${r.y + r.h + 12}" r="5" fill="white" stroke="black"/>`;
    shape += `<circle cx="${r.x + r.w * 0.2}" cy="${r.y + r.h + 22}" r="3" fill="white" stroke="black"/>`;
  } else {
    shape = `<ellipse cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" rx="${r.w / 2}" ry="${r.h / 2}" fill="white" stroke="black"/>`;
  }

  let tail = "";
  if (typeof balloon.tail === "string" && balloon.tail.startsWith("toActor(")) {
    const id = balloon.tail.match(/^toActor\((.+)\)$/)?.[1];
    const actor = actorMap.get(String(id));
    if (actor) {
      const pRect = rectInPage(panelMap.get(String(actor.panel)), { x: 0, y: 0, w: panelRect.w + panelRect.x, h: panelRect.h + panelRect.y }, unit);
      const target = pointInPanel(actor.x, actor.y - 12, pRect, unit);
      tail = `<line x1="${r.x + r.w / 2}" y1="${r.y + r.h}" x2="${target.x}" y2="${target.y}" stroke="black"/>`;
    }
  }

  const text = renderText(balloon.text, r, balloon.fontSize, balloon.align, balloon.padding, unit, balloon.lineHeight);
  return `<g>${shape}${tail}${text}</g>`;
}

function renderCaption(caption, panelRect, unit) {
  const r = withinPanel(caption, panelRect, unit);
  const box = caption.style === "none" ? "" : `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="white" stroke="black"/>`;
  const text = renderText(caption.text, r, caption.fontSize, caption.align, caption.padding, unit, caption.lineHeight);
  return `<g>${box}${text}</g>`;
}

function renderSfx(sfx, panelRect, unit) {
  const p = pointInPanel(sfx.x, sfx.y, panelRect, unit);
  const fontSize = unit === "percent" ? sfx.fontSize / 100 * panelRect.w : sfx.fontSize;
  return `<text x="${p.x}" y="${p.y}" font-size="${fontSize}" transform="rotate(${sfx.rotate} ${p.x} ${p.y}) scale(${sfx.scale})" fill="${sfx.fill}" stroke="${sfx.stroke || "none"}" font-weight="700">${escapeXml(sfx.text)}</text>`;
}

function renderText(text, rect, fontSize, align, padding, unit, lineHeight = 1.2) {
  const lines = String(text).split("\n");
  const x = align === "left" ? rect.x + sizeInUnit(padding, rect, unit, "x") : align === "right" ? rect.x + rect.w - sizeInUnit(padding, rect, unit, "x") : rect.x + rect.w / 2;
  const anchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
  const baseSize = unit === "percent" ? fontSize / 100 * rect.w : fontSize;
  const y0 = rect.y + baseSize + sizeInUnit(padding, rect, unit, "y");
  const tspans = lines.map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : baseSize * lineHeight}">${escapeXml(line)}</tspan>`).join("");
  return `<text x="${x}" y="${y0}" font-size="${baseSize}" text-anchor="${anchor}">${tspans}</text>`;
}

function rectInPage(box, inner, unit) {
  if (unit === "px") return { x: inner.x + box.x, y: inner.y + box.y, w: box.w, h: box.h };
  return {
    x: inner.x + inner.w * (box.x / 100),
    y: inner.y + inner.h * (box.y / 100),
    w: inner.w * (box.w / 100),
    h: inner.h * (box.h / 100),
  };
}

function withinPanel(box, panelRect, unit) {
  if (unit === "px") return { x: panelRect.x + box.x, y: panelRect.y + box.y, w: box.w, h: box.h };
  return {
    x: panelRect.x + panelRect.w * (box.x / 100),
    y: panelRect.y + panelRect.h * (box.y / 100),
    w: panelRect.w * (box.w / 100),
    h: panelRect.h * (box.h / 100),
  };
}

function pointInPanel(x, y, panelRect, unit) {
  if (unit === "px") return { x: panelRect.x + x, y: panelRect.y + y };
  return { x: panelRect.x + panelRect.w * (x / 100), y: panelRect.y + panelRect.h * (y / 100) };
}

function sizeInUnit(v, rect, unit, axis) {
  if (unit === "px") return v;
  return axis === "x" ? rect.w * (v / 100) : rect.h * (v / 100);
}

function pageDimensions(page) {
  if (page.size === "custom") return [page.width, page.height];
  return PAGE_SIZES[page.size] || PAGE_SIZES.B5;
}

function escapeXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function update() {
  try {
    const blocks = parseDsl(els.input.value);
    const scene = validateAndBuild(blocks);
    currentScene = scene;
    const svg = render(scene);
    lastGoodSvg = svg;
    els.canvas.innerHTML = svg;
    els.errorBox.hidden = true;
    els.banner.hidden = true;
  } catch (err) {
    if (lastGoodSvg) {
      els.canvas.innerHTML = lastGoodSvg;
      els.banner.hidden = false;
      els.banner.textContent = `パース/検証エラー: ${err.message}`;
    }
    els.errorBox.hidden = false;
    els.errorBox.textContent = String(err.message);
  }
}

function debouncedUpdate() {
  clearTimeout(debounceId);
  debounceId = setTimeout(update, 200);
}

function setupResize() {
  let dragging = false;
  els.resizer.addEventListener("mousedown", () => (dragging = true));
  window.addEventListener("mouseup", () => (dragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = els.split.getBoundingClientRect();
    const left = Math.min(Math.max(20, ((e.clientX - rect.left) / rect.width) * 100), 80);
    els.split.style.gridTemplateColumns = `${left}% 8px 1fr`;
  });
}

function setupPanZoom() {
  let dragging = false;
  let prev = null;
  els.viewport.addEventListener("wheel", (e) => {
    if (!e.ctrlKey || !currentScene) return;
    e.preventDefault();
    viewState.scale = Math.min(Math.max(0.4, viewState.scale + (e.deltaY < 0 ? 0.08 : -0.08)), 3);
    update();
  }, { passive: false });

  els.viewport.addEventListener("mousedown", (e) => {
    dragging = true;
    prev = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener("mouseup", () => (dragging = false));
  window.addEventListener("mousemove", (e) => {
    if (!dragging || !prev || !currentScene) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    prev = { x: e.clientX, y: e.clientY };
    viewState.panX += dx;
    viewState.panY += dy;
    update();
  });
}

function setupDownload() {
  els.downloadBtn.addEventListener("click", () => {
    if (!lastGoodSvg) return;
    const blob = new Blob([lastGoodSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(currentScene?.meta?.title || "storyboard").replace(/\s+/g, "_")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function init() {
  els.input.value = DEFAULT_DSL;
  els.input.addEventListener("input", debouncedUpdate);
  setupResize();
  setupPanZoom();
  setupDownload();
  update();
}

init();
