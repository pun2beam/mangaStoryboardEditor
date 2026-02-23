const DEFAULT_DSL_PATH = "./example/readme.msd";
const PAGE_SIZES = { B5: [1760, 2500], A4: [2480, 3508] };
const ACTOR_TYPES = new Set(["stand", "run", "sit", "point", "think", "surprise"]);
const EMOTIONS = new Set(["neutral", "angry", "sad", "panic", "smile", "none"]);
const EYE_TYPES = new Set(["right", "left", "up", "down", "cry", "close", "wink"]);
const FACING_TYPES = new Set(["left", "right", "back"]);
const HEAD_SHAPES = new Set(["circle", "square", "none"]);
const TEXT_DIRECTIONS = new Set(["horizontal", "vertical"]);
const HORIZONTAL_ALIGNS = new Set(["left", "center", "right"]);
const VERTICAL_ALIGNS = new Set(["top", "center", "bottom"]);
const PANEL_NEXT_DIRECTIONS = new Set(["left", "right", "bottom"]);
const PANEL_BASE_DIRECTIONS = new Set(["right.bottom", "left.bottom"]);
const POSE_POINT_NAMES = ["head", "lh", "rh", "le", "re", "neck", "waist", "groin", "lk", "rk", "lf", "rf"];
const POSE_POINT_NAME_SET = new Set(POSE_POINT_NAMES);
const BALLOON_TAIL_TARGET_Y_OFFSET = { px: 12, percent: 0 };
const TEXT_METRICS_CONTEXT = document.createElement("canvas").getContext("2d");
const MATH_EX_TO_PX = 8;
const ID_PREFIX_BY_TYPE = Object.freeze({
  page: "p",
  panel: "",
  actor: "a",
  object: "o",
  boxarrow: "ba",
  balloon: "b",
  caption: "c",
  sfx: "s",
  asset: "as",
  style: "st",
});
const ID_REFERENCE_FIELDS_BY_TYPE = Object.freeze({
  panel: ["page"],
  actor: ["panel"],
  object: ["panel"],
  boxarrow: ["panel"],
  balloon: ["panel"],
  caption: ["panel"],
  sfx: ["panel"],
  asset: ["panel"],
});
const HIERARCHICAL_BLOCK_TYPES = new Set([
  "meta",
  "page",
  "panel",
  "actor",
  "object",
  "boxarrow",
  "balloon",
  "caption",
  "sfx",
  "asset",
  "style",
]);
const HIERARCHY_PARENT_REF = Object.freeze({
  panel: { field: "page", ctxKey: "pageId" },
  actor: { field: "panel", ctxKey: "panelId" },
  object: { field: "panel", ctxKey: "panelId" },
  boxarrow: { field: "panel", ctxKey: "panelId" },
  balloon: { field: "panel", ctxKey: "panelId" },
  caption: { field: "panel", ctxKey: "panelId" },
  sfx: { field: "panel", ctxKey: "panelId" },
  asset: { field: "panel", ctxKey: "panelId" },
});
const els = {
  input: document.getElementById("dslInput"),
  errorBox: document.getElementById("errorBox"),
  banner: document.getElementById("banner"),
  viewport: document.getElementById("previewViewport"),
  canvas: document.getElementById("svgCanvas"),
  resizer: document.getElementById("resizer"),
  downloadBtn: document.getElementById("downloadSvgBtn"),
  dragHandleToggle: document.getElementById("showDragHandles"),
  poseEditorToggle: document.getElementById("showPoseEditor"),
  handDetailEditorToggle: document.getElementById("showHandDetailEditor"),
  handPresetSelect: document.getElementById("handPresetSelect"),
  handAppendageToggle: document.getElementById("showHandAppendage"),
  renumberBtn: document.getElementById("renumberIdsBtn"),
  split: document.querySelector(".split-root"),
};
const HAND_CHAIN_NAMES = ["thumb", "index", "middle", "ring", "little"];
const HAND_PRESET_NAMES = new Set(["open", "grip", "point", "peace"]);
let lastGoodSvg = "";
let debounceId = null;
let viewState = { scale: 1, panX: 0, panY: 0 };
let currentScene = null;
let isObjectDragging = false;
let selectedActorId = null;
function isDragHandleModeEnabled() {
  return Boolean(els.dragHandleToggle?.checked);
}
function isPoseEditModeEnabled() {
  return Boolean(els.poseEditorToggle?.checked);
}
function isHandDetailEditModeEnabled() {
  return isPoseEditModeEnabled() && Boolean(els.handDetailEditorToggle?.checked);
}
function isHandAppendageVisibleInUi() {
  return Boolean(els.handAppendageToggle?.checked);
}
function selectedHandPresetValue() {
  return normalizeHandPreset(els.handPresetSelect?.value);
}
function dragHandleRectFor(kind, item, panelRect, unit) {
  const target = rectTarget(panelRect);
  const offset = 10;
  const size = 14;
  const center = draggableCenterPoint(kind, item, panelRect, unit);
  if (!center) return null;
  const rawRect = { x: center.x - offset, y: center.y - offset, w: size, h: size };
  return clampRectToRect(rawRect, target);
}
function renderDragHandle(kind, id, item, panelRect, unit) {
  const handleRect = dragHandleRectFor(kind, item, panelRect, unit);
  if (!handleRect) return "";
  const attrs = renderDataAttrs(kind, id);
  const centerX = handleRect.x + handleRect.w / 2;
  const centerY = handleRect.y + handleRect.h / 2;
  const arm = Math.max(3, handleRect.w * 0.35);
  const radius = Math.max(2.5, handleRect.w * 0.18);
  const moveHandle = `<g${attrs} data-drag-handle="move" class="drag-handle drag-handle-move"><rect x="${handleRect.x}" y="${handleRect.y}" width="${handleRect.w}" height="${handleRect.h}" fill="white" stroke="black" stroke-width="1.2" rx="2" ry="2"/><line x1="${centerX - arm}" y1="${centerY}" x2="${centerX + arm}" y2="${centerY}" stroke="black" stroke-width="1.2"/><line x1="${centerX}" y1="${centerY - arm}" x2="${centerX}" y2="${centerY + arm}" stroke="black" stroke-width="1.2"/><circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="white" stroke="black" stroke-width="1"/></g>`;
  if (!ROTATABLE_KINDS.has(kind)) return moveHandle;
  const center = draggableCenterPoint(kind, item, panelRect, unit);
  if (!center) return moveHandle;
  const knobRadius = Math.max(7, handleRect.w * 0.6);
  const guideRadius = Math.max(24, handleRect.w * 3.2);
  const theta = (num(item.rot, 0) - 90) * (Math.PI / 180);
  const knobX = center.x + Math.cos(theta) * guideRadius;
  const knobY = center.y + Math.sin(theta) * guideRadius;
  const rotateHandle = `<g${attrs} data-drag-handle="rotate" class="drag-handle drag-handle-rotate"><line class="drag-handle-rotate-guide" x1="${center.x}" y1="${center.y}" x2="${knobX}" y2="${knobY}"/><circle class="drag-handle-rotate-knob" cx="${knobX}" cy="${knobY}" r="${knobRadius}"/></g>`;
  return `${moveHandle}${rotateHandle}`;
}
const ROTATABLE_KINDS = new Set(["actor", "object", "balloon", "caption", "boxarrow", "sfx"]);
function draggableCenterPoint(kind, item, panelRect, unit) {
  if (kind === "actor" || kind === "boxarrow" || kind === "sfx") {
    return pointInPanel(item.x, item.y, panelRect, unit);
  }
  const box = withinPanel({ ...item, w: item.w, h: item.h }, panelRect, unit);
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}
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
    const block = { type: blockMatch[1], props: {}, line: i + 1, order: blocks.length, sourceFormat: "flat" };
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
      const kv = bodyRaw.match(/^\s{2,}([\w.\-[\]]+)\s*:\s*(.*)$/);
      if (!kv) throw new Error(`Line ${i + 1}: key:value 形式ではありません`);
      const [, key, rawValue] = kv;
      const keyIndent = indentWidth(bodyRaw);
      if (rawValue === "|") {
        i += 1;
        const multi = [];
        const multilineIndent = keyIndent + 2;
        while (i < lines.length) {
          const m = lines[i];
          if (indentWidth(m) < multilineIndent) break;
          multi.push(m.slice(multilineIndent));
          i += 1;
        }
        block.props[key] = multi.join("\n");
        continue;
      }
      if (rawValue === "" && hasListAtIndent(lines, i + 1, keyIndent)) {
        const parsed = parseListOfObjects(lines, i + 1, keyIndent);
        block.props[key] = parsed.value;
        i = parsed.nextIndex;
        continue;
      }
      block.props[key] = parseValue(rawValue.trim());
      i += 1;
    }
    blocks.push(block);
  }
  return blocks;
}
function parseHierarchicalDsl(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const nodes = [];
  for (let i = 0; i < lines.length;) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i += 1;
      continue;
    }
    if (indentWidth(raw) !== 0) throw new Error(`Line ${i + 1}: ブロック宣言が不正です`);
    const parsed = parseHierarchicalBlock(lines, i, 0);
    nodes.push(parsed.node);
    i = parsed.nextIndex;
  }
  return flattenHierarchicalBlocks(nodes);
}
function parseHierarchicalBlock(lines, startIndex, baseIndent) {
  const raw = lines[startIndex];
  const blockMatch = raw.match(/^\s*([a-zA-Z][\w-]*)\s*:\s*$/);
  if (!blockMatch || indentWidth(raw) !== baseIndent) {
    throw new Error(`Line ${startIndex + 1}: ブロック宣言が不正です`);
  }
  const type = blockMatch[1];
  if (!HIERARCHICAL_BLOCK_TYPES.has(type)) {
    throw new Error(`Line ${startIndex + 1}: 未対応ブロック ${type}`);
  }
  const node = { type, props: {}, line: startIndex + 1, children: [] };
  let i = startIndex + 1;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i += 1;
      continue;
    }
    const indent = indentWidth(line);
    if (indent <= baseIndent) break;
    const nestedBlockMatch = line.match(/^\s*([a-zA-Z][\w-]*)\s*:\s*$/);
    if (indent === baseIndent + 2 && nestedBlockMatch && HIERARCHICAL_BLOCK_TYPES.has(nestedBlockMatch[1])) {
      const child = parseHierarchicalBlock(lines, i, baseIndent + 2);
      node.children.push(child.node);
      i = child.nextIndex;
      continue;
    }
    const kv = line.match(/^\s+([\w.\-[\]]+)\s*:\s*(.*)$/);
    if (!kv || indent !== baseIndent + 2) throw new Error(`Line ${i + 1}: key:value 形式ではありません`);
    const [, key, rawValue] = kv;
    const keyIndent = indentWidth(line);
    if (rawValue === "|") {
      i += 1;
      const multi = [];
      const multilineIndent = keyIndent + 2;
      while (i < lines.length) {
        const m = lines[i];
        if (indentWidth(m) < multilineIndent) break;
        multi.push(m.slice(multilineIndent));
        i += 1;
      }
      node.props[key] = multi.join("\n");
      continue;
    }
    if (rawValue === "" && hasListAtIndent(lines, i + 1, keyIndent)) {
      const parsed = parseListOfObjects(lines, i + 1, keyIndent);
      node.props[key] = parsed.value;
      i = parsed.nextIndex;
      continue;
    }
    node.props[key] = parseValue(rawValue.trim());
    i += 1;
  }
  return { node, nextIndex: i };
}
function flattenHierarchicalBlocks(nodes) {
  const blocks = [];
  let order = 0;
  const usedPanelIds = new Set();
  let panelIdCount = 1;
  const collectPanelIds = (list) => {
    for (const node of list) {
      if (node.type === "panel" && node.props.id !== undefined && node.props.id !== null && node.props.id !== "") {
        usedPanelIds.add(String(node.props.id));
      }
      collectPanelIds(node.children);
    }
  };
  const nextAutoPanelId = () => {
    while (true) {
      const candidate = nextIdForType("panel", panelIdCount);
      panelIdCount += 1;
      if (usedPanelIds.has(candidate)) continue;
      usedPanelIds.add(candidate);
      return candidate;
    }
  };
  collectPanelIds(nodes);
  const walk = (node, context) => {
    const props = { ...node.props };
    if (node.type === "panel" && (props.id === undefined || props.id === null || props.id === "")) {
      props.id = nextAutoPanelId();
    }
    const autoParentRefFields = [];
    const parentRef = HIERARCHY_PARENT_REF[node.type];
    if (parentRef && (props[parentRef.field] === undefined || props[parentRef.field] === null || props[parentRef.field] === "")) {
      const parentValue = context[parentRef.ctxKey];
      if (parentValue !== undefined && parentValue !== null && parentValue !== "") {
        props[parentRef.field] = parentValue;
        autoParentRefFields.push(parentRef.field);
      }
    }
    blocks.push({
      type: node.type,
      props,
      line: node.line,
      order,
      sourceFormat: "hierarchical",
      autoParentRefFields,
    });
    order += 1;
    const nextContext = { ...context };
    if (node.type === "page") {
      nextContext.pageId = props.id;
      nextContext.panelId = undefined;
    }
    if (node.type === "panel") nextContext.panelId = props.id;
    for (const child of node.children) walk(child, nextContext);
  };
  for (const node of nodes) walk(node, {});
  return blocks;
}
function looksLikeHierarchicalDsl(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  return lines.some((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return false;
    if (!/^\s{2,}/.test(line)) return false;
    const m = trimmed.match(/^([a-zA-Z][\w-]*)\s*:\s*$/);
    return Boolean(m && HIERARCHICAL_BLOCK_TYPES.has(m[1]));
  });
}
function parseBlocks(text) {
  if (looksLikeHierarchicalDsl(text)) return parseHierarchicalDsl(text);
  return parseDsl(text);
}
function indentWidth(line) {
  const m = line.match(/^\s*/);
  return m ? m[0].length : 0;
}
function hasListAtIndent(lines, startIndex, keyIndent) {
  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const indent = indentWidth(line);
    if (indent <= keyIndent) return false;
    return /^\s*-\s*/.test(line);
  }
  return false;
}
function parseListOfObjects(lines, startIndex, keyIndent) {
  const list = [];
  let i = startIndex;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      i += 1;
      continue;
    }
    const indent = indentWidth(line);
    if (indent <= keyIndent) break;
    const itemMatch = line.match(/^\s*-\s*(.*)$/);
    if (!itemMatch) throw new Error(`Line ${i + 1}: 配列形式が不正です`);
    const item = {};
    const inline = itemMatch[1].trim();
    if (inline) {
      const inlineKv = inline.match(/^([\w.\-[\]]+)\s*:\s*(.*)$/);
      if (!inlineKv) throw new Error(`Line ${i + 1}: 配列要素の key:value 形式が不正です`);
      item[inlineKv[1]] = parseValue(inlineKv[2].trim());
    }
    const itemIndent = indent;
    i += 1;
    while (i < lines.length) {
      const child = lines[i];
      const childTrimmed = child.trim();
      if (!childTrimmed || childTrimmed.startsWith("#")) {
        i += 1;
        continue;
      }
      const childIndent = indentWidth(child);
      if (childIndent <= itemIndent) break;
      if (/^\s*-\s*/.test(child)) break;
      const childKv = child.match(/^\s+([\w.\-[\]]+)\s*:\s*(.*)$/);
      if (!childKv) throw new Error(`Line ${i + 1}: 配列要素の key:value 形式が不正です`);
      item[childKv[1]] = parseValue(childKv[2].trim());
      i += 1;
    }
    list.push(item);
  }
  return { value: list, nextIndex: i };
}
function parseValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  return value;
}
function parsePosePoints(raw, line) {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const source = Array.isArray(raw) ? raw.join(" ") : String(raw);
  const tokens = source.split(/[\s,]+/).filter(Boolean);
  if (tokens.length !== 24) {
    throw new Error(`Line ${line}: actor.pose.points は24個の数値が必要です`);
  }
  const values = tokens.map((token) => Number(token));
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error(`Line ${line}: actor.pose.points に数値以外が含まれています`);
  }
  const points = {};
  for (let i = 0; i < POSE_POINT_NAMES.length; i += 1) {
    points[POSE_POINT_NAMES[i]] = { x: values[i * 2], y: values[i * 2 + 1] };
  }
  return points;
}
function parsePosePointZ(raw, line) {
  if (raw === undefined || raw === null || raw === "") return {};
  const source = Array.isArray(raw) ? raw.join(" ") : String(raw);
  const tokens = source.split(/[\s,]+/).filter(Boolean);
  if (tokens.length !== POSE_POINT_NAMES.length) {
    throw new Error(`Line ${line}: actor.pose.points.z は${POSE_POINT_NAMES.length}個の数値が必要です`);
  }
  const values = tokens.map((token) => Number(token));
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error(`Line ${line}: actor.pose.points.z に数値以外が含まれています`);
  }
  const zMap = {};
  for (let i = 0; i < POSE_POINT_NAMES.length; i += 1) {
    zMap[POSE_POINT_NAMES[i]] = values[i];
  }
  return zMap;
}
function validateAndBuild(blocks) {
  const scene = { meta: {}, pages: [], panels: [], actors: [], objects: [], boxarrows: [], balloons: [], captions: [], sfx: [], assets: [], styles: [] };
  for (const b of blocks) {
    const key = b.type === "sfx" ? "sfx" : `${b.type}s`;
    if (b.type === "meta") {
      scene.meta = b.props;
      continue;
    }
    if (!scene[key]) throw new Error(`Line ${b.line}: 未対応ブロック ${b.type}`);
    scene[key].push({ ...b.props, _line: b.line, _order: b.order });
  }
  scene.meta["text.direction"] = normalizeTextDirection(scene.meta["text.direction"] ?? scene.meta.textDirection);
  const layoutMeta = normalizeLayoutMeta(scene.meta);
  scene.layoutMeta = layoutMeta;
  const allowsImplicitPage = layoutMeta.page.mode === "auto-extend" || layoutMeta.page.mode === "auto-append";
  if (scene.pages.length === 0) {
    if (!allowsImplicitPage) {
      throw new Error("layout.page.mode: fixed では page が1つ以上必要です（auto-extend/auto-append を使う場合のみ page 省略可）");
    }
    scene.pages.push({
      id: nextAutoPageId(new Set()),
      size: "B5",
      margin: 5,
      unit: "percent",
      _line: 0,
      _order: -1,
      _virtual: true,
    });
  }
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
    p.stroke = p.stroke || "#c9ced6";
    p.strokeWidth = num(p.strokeWidth, 2);
    if (!p.id || !p.size) throw new Error(`Line ${p._line}: page id,size は必須です`);
    if (p.size === "custom" && (typeof p.width !== "number" || typeof p.height !== "number")) {
      throw new Error(`Line ${p._line}: size:custom では width,height が必須です`);
    }
  });
  for (const panel of scene.panels) {
    const panelRequiredFields = allowsImplicitPage ? ["id", "w", "h"] : ["id", "page", "w", "h"];
    const missingPanelFields = panelRequiredFields.filter((field) => panel[field] === undefined || panel[field] === null || panel[field] === "");
    if (missingPanelFields.length > 0) {
      const modeLabel = layoutMeta.page.mode ?? "fixed";
      throw new Error(`Line ${panel._line}: layout.page.mode:${modeLabel} では panel に ${missingPanelFields.join(",")} が必要です`);
    }
    const hasPanelPage = !(panel.page === undefined || panel.page === null || panel.page === "");
    if (!hasPanelPage && allowsImplicitPage) {
      panel.page = String(scene.pages[0].id);
      panel._autoAssignedPage = true;
    }
    const hasX = !(panel.x === undefined || panel.x === null || panel.x === "");
    const hasY = !(panel.y === undefined || panel.y === null || panel.y === "");
    // 既存DSL互換: x,y が両方ある場合は明示座標を優先し、欠ける場合のみ自動配置対象にする。
    panel._autoPlaced = !hasX || !hasY;
    if (panel.next !== undefined && panel.next !== null && panel.next !== "") {
      panel.next = String(panel.next).toLowerCase();
      if (!PANEL_NEXT_DIRECTIONS.has(panel.next)) {
        throw new Error(`Line ${panel._line}: panel next は left/right/bottom のいずれかを指定してください`);
      }
    } else {
      panel.next = undefined;
    }
    panel.x = num(panel.x, 0);
    panel.y = num(panel.y, 0);
    if (!dicts.pages.get(String(panel.page))) throw new Error(`Line ${panel._line}: 未定義 page 参照 ${panel.page}`);
    if (panel.w <= 0 || panel.h <= 0) throw new Error(`Line ${panel._line}: panel w/h は正数`);
  }
  const basePanelDirection = normalizePanelDirection(scene.meta?.["base.panel.direction"], "right.bottom");
  for (const panel of scene.panels) {
    if (!panel.next) continue;
    if (basePanelDirection === "right.bottom" && panel.next === "left") {
      throw new Error(`Line ${panel._line}: base.panel.direction:right.bottom のとき panel next:left は指定できません`);
    }
    if (basePanelDirection === "left.bottom" && panel.next === "right") {
      throw new Error(`Line ${panel._line}: base.panel.direction:left.bottom のとき panel next:right は指定できません`);
    }
  }
  for (const actor of scene.actors) {
    requireFields(actor, ["id"], "actor");
  }
  resolveActorInheritance(scene.actors, scene.meta);
  const inPanelItems = ["objects", "boxarrows", "balloons", "captions", "sfx"];
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
    if (actor.panel !== undefined && actor.panel !== null && actor.panel !== "") {
      if (!dicts.panels.get(String(actor.panel))) throw new Error(`Line ${actor._line}: 未定義 panel 参照 ${actor.panel}`);
    }
    if (actor.styleRef && !dicts.styles.get(String(actor.styleRef))) {
      throw new Error(`Line ${actor._line}: 未定義 styleRef ${actor.styleRef}`);
    }
  }
  for (const actor of scene.actors) {
    actor._autoPosition = actor.x === undefined || actor.x === null || actor.x === "" || actor.y === undefined || actor.y === null || actor.y === "";
    actor.pose = ACTOR_TYPES.has(actor.pose) ? actor.pose : "stand";
    actor.emotion = EMOTIONS.has(actor.emotion) ? actor.emotion : "neutral";
    actor.scale = num(actor.scale, 1);
    actor.rot = num(actor.rot, 0);
    actor.facing = FACING_TYPES.has(actor.facing) ? actor.facing : "right";
    actor.eye = EYE_TYPES.has(actor.eye) ? actor.eye : "right";
    actor["head.shape"] = HEAD_SHAPES.has(actor["head.shape"]) ? actor["head.shape"] : "circle";
    actor.x = num(actor.x, 0);
    actor.y = num(actor.y, 0);
    actor.strokeWidth = positiveNum(actor.strokeWidth, positiveNum(scene.meta?.["actor.strokeWidth"], 2));
    actor.attachments = normalizeAttachments(actor.attachments, actor._line);
    actor.appendages = normalizeAppendages(actor.appendages, actor._line);
    actor._posePoints = parsePosePoints(actor["pose.points"], actor._line);
    actor._posePointZ = parsePosePointZ(actor["pose.points.z"], actor._line);
  }
  for (const object of scene.objects) {
    object._autoPosition = object.x === undefined || object.x === null || object.x === "" || object.y === undefined || object.y === null || object.y === "";
    requireFields(object, ["text"], "object");
    object.w = num(object.w ?? object.width, 10);
    object.h = num(object.h ?? object.height, 10);
    if (object.w <= 0 || object.h <= 0) throw new Error(`Line ${object._line}: object width/height は正数`);
    object.shape = ["rect", "circle", "oval", "none"].includes(String(object.shape)) ? String(object.shape) : "rect";
    object.border = parseSizedValue(object.border, 1, pUnit(object, dicts, "panel"));
    object.fontSize = parseSizedValue(object.fontSize, 4, pUnit(object, dicts, "panel"));
    object.align = object.align || "center";
    object.padding = num(object.padding, 2);
    object.rot = num(object.rot, 0);
    object.textDirection = normalizeTextDirection(object["text.direction"] ?? object.textDirection, scene.meta["text.direction"]);
  }
  for (const boxarrow of scene.boxarrows) {
    requireFields(boxarrow, ["x", "y"], "boxarrow");
    boxarrow.w = num(boxarrow.w, 100);
    boxarrow.h = num(boxarrow.h, 100);
    if (boxarrow.w <= 0 || boxarrow.h <= 0) throw new Error(`Line ${boxarrow._line}: boxarrow w/h は正数`);
    boxarrow.px = clamp(num(boxarrow.px, 0.5), 0, 1);
    boxarrow.py = clamp(num(boxarrow.py, 0.3), 0, 1);
    boxarrow.scale = num(boxarrow.scale, 1);
    boxarrow.rot = num(boxarrow.rot, 0);
    boxarrow.opacity = clamp(num(boxarrow.opacity, 1), 0, 1);
    boxarrow.stroke = boxarrow.stroke || "#000000";
    boxarrow.fill = boxarrow.fill || "#a0f0a0";
  }
  for (const balloon of scene.balloons) {
    balloon._autoPosition = balloon.x === undefined || balloon.x === null || balloon.x === "" || balloon.y === undefined || balloon.y === null || balloon.y === "";
    requireFields(balloon, ["w", "h", "text"], "balloon");
    balloon.shape = balloon.shape || "oval";
    balloon.align = balloon.align || "center";
    balloon.fontSize = parseSizedValue(balloon.fontSize, 4, pUnit(balloon, dicts, "panel"));
    balloon.emphasisFontSize = parseOptionalSizedValue(
      balloon.emphasisFontSize,
      pUnit(balloon, dicts, "panel"),
    );
    balloon.padding = num(balloon.padding, 2);
    balloon.rot = num(balloon.rot, 0);
    balloon.textDirection = normalizeTextDirection(balloon["text.direction"] ?? balloon.textDirection, scene.meta["text.direction"]);
    const tail = balloon.tail === undefined || balloon.tail === null || balloon.tail === "" ? "none" : String(balloon.tail);
    const tailMatch = tail.match(/^(none|toActor\(([^()]+)\)|toPoint\(([^,]+),([^,]+)\))$/);
    if (!tailMatch) {
      throw new Error(`Line ${balloon._line}: balloon.tail の形式が不正です`);
    }
    if (tail.startsWith("toActor(")) {
      const actorId = tailMatch[2]?.trim();
      if (!dicts.actors.get(String(actorId))) {
        throw new Error(`Line ${balloon._line}: 未定義 actor 参照 ${actorId}`);
      }
    }
    if (tail.startsWith("toPoint(")) {
      const x = Number(tailMatch[3]?.trim());
      const y = Number(tailMatch[4]?.trim());
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error(`Line ${balloon._line}: balloon.tail の形式が不正です`);
      }
    }
    balloon.tail = tail;
  }
  for (const caption of scene.captions) {
    caption._autoPosition = caption.x === undefined || caption.x === null || caption.x === "" || caption.y === undefined || caption.y === null || caption.y === "";
    requireFields(caption, ["w", "h", "text"], "caption");
    caption.style = caption.style || "box";
    caption.align = normalizeHorizontalAlign(caption.align, "center");
    caption.valign = normalizeVerticalAlign(caption.valign, "top");
    caption.fontSize = parseSizedValue(caption.fontSize, 4, pUnit(caption, dicts, "panel"));
    caption.emphasisFontSize = parseOptionalSizedValue(
      caption.emphasisFontSize,
      pUnit(caption, dicts, "panel"),
    );
    caption.padding = num(caption.padding, 2);
    caption.rot = num(caption.rot, 0);
    caption.textDirection = normalizeTextDirection(caption["text.direction"] ?? caption.textDirection, scene.meta["text.direction"]);
  }
  for (const s of scene.sfx) {
    s._autoPosition = s.x === undefined || s.x === null || s.x === "" || s.y === undefined || s.y === null || s.y === "";
    requireFields(s, ["text"], "sfx");
    s.scale = num(s.scale, 1);
    s.rot = num(s.rot, 0);
    s.fontSize = num(s.fontSize, 8);
    s.fontWeight = num(s.fontWeight, 700);
    s.strokeWidth = num(s.strokeWidth, 1);
    s.fill = s.fill || "black";
    s.textDirection = normalizeTextDirection(s["text.direction"] ?? s.textDirection, scene.meta["text.direction"]);
  }
  for (const a of scene.assets) {
    requireFields(a, ["w", "h", "src"], "asset");
    if (a.panel !== undefined && a.panel !== null && a.panel !== "") {
      requireFields(a, ["x", "y", "panel"], "asset");
      if (!dicts.panels.get(String(a.panel))) throw new Error(`Line ${a._line}: 未定義 panel 参照 ${a.panel}`);
    }
    a.opacity = num(a.opacity, 1);
    a.clipToPanel = a.clipToPanel !== false;
    a.dx = num(a.dx, 0);
    a.dy = num(a.dy, 0);
    a.s = num(a.s, 1);
    a.rot = num(a.rot, 0);
    a.z = num(a.z, 0);
    a.flipX = a.flipX === true;
    a.anchor = normalizeAssetAnchorPoint(a.anchor, a._line);
    a.anchorRot = num(a.anchorRot, 0);
  }
  const assetsById = byId(scene.assets, "asset");
  for (const actor of scene.actors) {
    for (const attachment of actor.attachments) {
      if (!assetsById.get(String(attachment.ref))) {
        throw new Error(`Line ${actor._line}: 未定義 asset 参照 ${attachment.ref}`);
      }
      attachment.dx = typeof attachment.dx === "number" ? attachment.dx : null;
      attachment.dy = typeof attachment.dy === "number" ? attachment.dy : null;
      attachment.s = typeof attachment.s === "number" ? attachment.s : null;
      attachment.rot = typeof attachment.rot === "number" ? attachment.rot : null;
      attachment.anchorRot = typeof attachment.anchorRot === "number" ? attachment.anchorRot : null;
      attachment.z = typeof attachment.z === "number" ? attachment.z : null;
      if (attachment.flipX === true) {
        attachment.flipX = true;
      } else if (attachment.flipX === false) {
        attachment.flipX = false;
      } else {
        attachment.flipX = null;
      }
    }
    for (const appendage of actor.appendages) {
      appendage.kind = String(appendage.kind || "appendage");
      appendage.anchor = normalizeAssetAnchorPoint(appendage.anchor, actor._line);
      appendage.z = typeof appendage.z === "number" ? appendage.z : 0;
      appendage.flipX = appendage.flipX === true;
      appendage.rotAnchor = typeof appendage.rotAnchor === "number" ? appendage.rotAnchor : 0;
    }
  }
  autoPlacePanelItems(scene, dicts);
  return scene;
}
function normalizeAttachments(value, line) {
  if (value === undefined || value === null || value === "") return [];
  if (!Array.isArray(value)) throw new Error(`Line ${line}: actor.attachments は配列で指定してください`);
  return value.map((attachment) => {
    if (!attachment || typeof attachment !== "object") {
      throw new Error(`Line ${line}: actor.attachments の要素形式が不正です`);
    }
    if (attachment.ref === undefined || attachment.ref === null || attachment.ref === "") {
      throw new Error(`Line ${line}: actor.attachments.ref は必須です`);
    }
    return { ...attachment };
  });
}
function parseAppendagePointGroups(raw, line, fieldName) {
  if (raw === undefined || raw === null || raw === "") return [];
  const parsePointSequenceTokens = (source, sequenceName) => {
    const tokens = String(source).split(/[\s,]+/).filter(Boolean);
    if (tokens.length === 0) return [];
    const values = tokens.map((token) => Number(token));
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error(`Line ${line}: actor.appendages[].${sequenceName} は数値列で指定してください`);
    }
    if (values.length % 2 !== 0) {
      throw new Error(`Line ${line}: actor.appendages[].${sequenceName} は x,y ペアの偶数個で指定してください`);
    }
    const points = [];
    for (let i = 0; i < values.length; i += 2) {
      points.push({ x: values[i], y: values[i + 1] });
    }
    return points;
  };
  const toPoint = (entry) => {
    if (Array.isArray(entry) && entry.length >= 2) {
      const x = Number(entry[0]);
      const y = Number(entry[1]);
      if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
      return null;
    }
    if (entry && typeof entry === "object") {
      const x = Number(entry.x);
      const y = Number(entry.y);
      if (Number.isFinite(x) && Number.isFinite(y)) return { x, y };
      return null;
    }
    if (typeof entry === "string") {
      const m = entry.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
      if (!m) return null;
      return { x: Number(m[1]), y: Number(m[2]) };
    }
    return null;
  };
  const normalizeGroup = (group, groupIndex) => {
    if (!Array.isArray(group)) return null;
    const points = group.map((entry) => toPoint(entry));
    if (points.some((point) => !point)) {
      throw new Error(`Line ${line}: actor.appendages[].${fieldName}[${groupIndex}] に不正な点座標があります`);
    }
    return points.length >= 2 ? points : null;
  };
  if (Array.isArray(raw)) {
    const groups = raw.map((group, index) => normalizeGroup(group, index)).filter(Boolean);
    if (groups.length > 0) return groups;
  }
  const source = String(raw);
  const groups = source
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment, index) => {
      const points = parsePointSequenceTokens(segment, `${fieldName}[${index}]`);
      return points.length >= 2 ? points : null;
    })
    .filter(Boolean);
  if (groups.length === 0) {
    throw new Error(`Line ${line}: actor.appendages[].${fieldName} は 2点以上の点列を含む必要があります`);
  }
  return groups;
}
function parseAppendagePointSequence(raw, line, fieldName, options = {}) {
  const { minPoints = 2, maxPoints = Infinity, allowEmpty = false } = options;
  if (raw === undefined || raw === null || raw === "") {
    if (allowEmpty) return [];
    throw new Error(`Line ${line}: actor.appendages[].${fieldName} は点列を指定してください`);
  }
  const source = Array.isArray(raw) ? raw.join(" ") : String(raw);
  const tokens = source.split(/[\s,]+/).filter(Boolean);
  const values = tokens.map((token) => Number(token));
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error(`Line ${line}: actor.appendages[].${fieldName} は数値列で指定してください`);
  }
  if (values.length % 2 !== 0) {
    throw new Error(`Line ${line}: actor.appendages[].${fieldName} は x,y ペアの偶数個で指定してください`);
  }
  const points = [];
  for (let i = 0; i < values.length; i += 2) {
    points.push({ x: values[i], y: values[i + 1] });
  }
  if (points.length < minPoints || points.length > maxPoints) {
    if (Number.isFinite(maxPoints)) {
      throw new Error(`Line ${line}: actor.appendages[].${fieldName} は ${minPoints}〜${maxPoints} 点で指定してください`);
    }
    throw new Error(`Line ${line}: actor.appendages[].${fieldName} は ${minPoints} 点以上で指定してください`);
  }
  return points;
}
function parseIndexedAppendageChains(appendage, line, fieldName, kind) {
  const chainEntries = [];
  for (const [key, value] of Object.entries(appendage)) {
    const m = key.match(new RegExp(`^${fieldName}\\[(\\d+)\\]\\.(name|points)$`));
    if (!m) continue;
    chainEntries.push({ index: Number(m[1]), prop: m[2], value });
  }
  if (chainEntries.length === 0) return null;
  const chainsByIndex = new Map();
  for (const { index, prop, value } of chainEntries) {
    if (!chainsByIndex.has(index)) chainsByIndex.set(index, {});
    chainsByIndex.get(index)[prop] = value;
  }
  const ordered = Array.from(chainsByIndex.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([index, chain]) => ({
      index,
      name: chain.name === undefined || chain.name === null ? "" : String(chain.name),
      points: parseAppendagePointSequence(chain.points, line, `${fieldName}[${index}].points`, {
        minPoints: kind === "hand" ? 1 : 2,
        maxPoints: kind === "hand" ? 4 : Infinity,
      }),
    }));
  return ordered;
}
function validateAppendageChainsByKind(appendage, line) {
  const chains = Array.isArray(appendage.chains) ? appendage.chains : [];
  if (appendage.kind === "hand") {
    if (chains.length !== 5) {
      throw new Error(`Line ${line}: kind=hand は chains を5本（thumb/index/middle/ring/little）指定してください`);
    }
    chains.forEach((chain, idx) => {
      if (!chain || !Array.isArray(chain.points) || chain.points.length < 1 || chain.points.length > 4) {
        throw new Error(`Line ${line}: kind=hand の chains[${idx}].points は 1〜4 点で指定してください`);
      }
      if (!chain.name) {
        chain.name = HAND_CHAIN_NAMES[idx];
      }
    });
  }
  if (appendage.kind === "tail") {
    if (chains.length !== 1) {
      throw new Error(`Line ${line}: kind=tail は chains を1本指定してください`);
    }
    if (!Array.isArray(chains[0].points) || chains[0].points.length < 2) {
      throw new Error(`Line ${line}: kind=tail の chains[0].points は 2 点以上で指定してください`);
    }
  }
}
function normalizeAppendages(value, line) {
  if (value === undefined || value === null || value === "") return [];
  if (!Array.isArray(value)) throw new Error(`Line ${line}: actor.appendages は配列で指定してください`);
  return value.map((appendage) => {
    if (!appendage || typeof appendage !== "object") {
      throw new Error(`Line ${line}: actor.appendages の要素形式が不正です`);
    }
    if (appendage.id === undefined || appendage.id === null || appendage.id === "") {
      throw new Error(`Line ${line}: actor.appendages[].id は必須です`);
    }
    if (appendage.kind === undefined || appendage.kind === null || appendage.kind === "") {
      throw new Error(`Line ${line}: actor.appendages[].kind は必須です`);
    }
    if (appendage.anchor === undefined || appendage.anchor === null || appendage.anchor === "") {
      throw new Error(`Line ${line}: actor.appendages[].anchor は必須です`);
    }
    const hasIndexedField = (fieldName) => Object.keys(appendage).some((key) => new RegExp(`^${fieldName}\[\d+\]\.`).test(key));
    const kind = String(appendage.kind);
    const indexedChains = parseIndexedAppendageChains(appendage, line, "chains", kind);
    const indexedDigits = parseIndexedAppendageChains(appendage, line, "digits", kind);
    const hasChains = (appendage.chains !== undefined && appendage.chains !== null && appendage.chains !== "") || hasIndexedField("chains");
    const hasDigits = (appendage.digits !== undefined && appendage.digits !== null && appendage.digits !== "") || hasIndexedField("digits");
    const handPreset = kind === "hand" ? normalizeHandPreset(appendage.preset ?? appendage.handPreset) : undefined;
    const handDetailEdited = kind === "hand"
      ? parseBooleanLike(appendage.handDetailEdited, hasChains || Boolean(indexedChains))
      : false;
    if (!hasChains && !hasDigits && kind !== "hand") {
      throw new Error(`Line ${line}: actor.appendages[].chains または actor.appendages[].digits のいずれかは必須です`);
    }
    const chains = indexedChains
      ?? (hasChains ? parseAppendagePointGroups(appendage.chains, line, "chains").map((points, index) => ({ name: `chain-${index}`, points })) : null)
      ?? (kind === "hand" ? defaultHandChainsForPreset(handPreset) : []);
    const normalizedAppendage = {
      ...appendage,
      kind,
      ...(kind === "hand" ? { preset: handPreset, handVisible: parseBooleanLike(appendage.handVisible, true), handDetailEdited } : {}),
      chains,
      digits: indexedDigits
        ?? parseAppendagePointGroups(appendage.digits, line, "digits").map((points, index) => ({ name: `digit-${index}`, points })),
    };
    validateAppendageChainsByKind(normalizedAppendage, line);
    return normalizedAppendage;
  });
}
function defaultHandChainsForPreset(preset) {
  const safePreset = HAND_PRESET_NAMES.has(String(preset)) ? String(preset) : "open";
  const presets = {
    open: [
      [{ x: -4.8, y: -1.6 }, { x: -8, y: -4.8 }],
      [{ x: -1.8, y: -2.4 }, { x: -2.2, y: -8 }],
      [{ x: 0, y: -2.6 }, { x: 0, y: -8.6 }],
      [{ x: 1.8, y: -2.4 }, { x: 2.1, y: -8 }],
      [{ x: 3.4, y: -1.4 }, { x: 4.8, y: -6.2 }],
    ],
    grip: [
      [{ x: -4.8, y: -1.2 }, { x: -7.8, y: 0.6 }],
      [{ x: -1.8, y: -1.8 }, { x: -2.6, y: 1.8 }],
      [{ x: 0, y: -1.8 }, { x: -0.2, y: 2 }],
      [{ x: 1.8, y: -1.6 }, { x: 2.2, y: 1.9 }],
      [{ x: 3.4, y: -0.8 }, { x: 4.8, y: 2.4 }],
    ],
    point: [
      [{ x: -4.8, y: -1.2 }, { x: -7.2, y: 0.2 }],
      [{ x: -1.8, y: -2.2 }, { x: -1.9, y: -8.8 }],
      [{ x: 0, y: -1.8 }, { x: 0, y: 2.2 }],
      [{ x: 1.8, y: -1.6 }, { x: 2.2, y: 2 }],
      [{ x: 3.4, y: -0.8 }, { x: 4.6, y: 2.2 }],
    ],
    peace: [
      [{ x: -4.8, y: -1.2 }, { x: -7.2, y: 0.2 }],
      [{ x: -1.9, y: -2.4 }, { x: -2.1, y: -8.6 }],
      [{ x: 0.2, y: -2.5 }, { x: 0.3, y: -8.8 }],
      [{ x: 1.8, y: -1.4 }, { x: 2.3, y: 2.2 }],
      [{ x: 3.4, y: -0.8 }, { x: 4.8, y: 2.3 }],
    ],
  };
  return presets[safePreset].map((points, index) => ({
    name: HAND_CHAIN_NAMES[index],
    points: points.map((point) => ({ x: point.x, y: point.y })),
  }));
}
function normalizeHandPreset(value) {
  const preset = String(value ?? "").trim().toLowerCase();
  return HAND_PRESET_NAMES.has(preset) ? preset : "open";
}
function parseBooleanLike(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(text)) return true;
  if (["false", "0", "no", "off"].includes(text)) return false;
  return defaultValue;
}

function resolveActorInheritance(actors, meta = {}) {
  const actorMap = new Map(actors.map((actor) => [String(actor.id), actor]));
  const state = new Map();
  const resolvingStack = [];
  const inheritPanel = isOn(meta?.["actor.inheritPanel"] ?? meta?.actorInheritPanel);
  const mergeAttachmentsByRef = (baseAttachments, ownAttachments) => {
    const merged = [];
    const indexByRef = new Map();
    for (const attachment of baseAttachments) {
      const copy = { ...attachment };
      merged.push(copy);
      indexByRef.set(String(copy.ref), merged.length - 1);
    }
    for (const attachment of ownAttachments) {
      const ref = String(attachment.ref);
      const ownCopy = { ...attachment };
      const baseIndex = indexByRef.get(ref);
      if (baseIndex === undefined) {
        merged.push(ownCopy);
        indexByRef.set(ref, merged.length - 1);
      } else {
        merged[baseIndex] = { ...merged[baseIndex], ...ownCopy };
      }
    }
    return merged;
  };
  const mergeAppendagesById = (baseAppendages, ownAppendages) => {
    const merged = [];
    const indexById = new Map();
    for (const appendage of baseAppendages) {
      const copy = { ...appendage };
      merged.push(copy);
      indexById.set(String(copy.id), merged.length - 1);
    }
    for (const appendage of ownAppendages) {
      const appendageId = String(appendage.id);
      const ownCopy = { ...appendage };
      const baseIndex = indexById.get(appendageId);
      if (baseIndex === undefined) {
        merged.push(ownCopy);
        indexById.set(appendageId, merged.length - 1);
      } else {
        merged[baseIndex] = { ...merged[baseIndex], ...ownCopy };
      }
    }
    return merged;
  };
  const mergeActor = (actor) => {
    const actorId = String(actor.id);
    const visitState = state.get(actorId);
    if (visitState === "resolved") return actor;
    if (visitState === "resolving") {
      const cycleStart = resolvingStack.indexOf(actorId);
      const cyclePath = [...resolvingStack.slice(cycleStart), actorId].join(" -> ");
      throw new Error(`Line ${actor._line}: actor 継承が循環しています (${cyclePath})`);
    }
    state.set(actorId, "resolving");
    resolvingStack.push(actorId);
    const baseIdRaw = actor.extends;
    if (baseIdRaw !== undefined && baseIdRaw !== null && baseIdRaw !== "") {
      const baseId = String(baseIdRaw);
      const baseActor = actorMap.get(baseId);
      if (!baseActor) {
        throw new Error(`Line ${actor._line}: 未定義 actor 継承元 ${baseId}`);
      }
      const resolvedBase = mergeActor(baseActor);
      const ownProps = { ...actor };
      const inherited = { ...resolvedBase };
      if (!inheritPanel) {
        delete inherited.panel;
      }
      delete inherited.x;
      delete inherited.y;
      delete inherited._line;
      delete inherited._order;
      delete inherited.extends;
      Object.assign(actor, inherited, ownProps);
      if (Array.isArray(inherited.attachments) && Array.isArray(ownProps.attachments)) {
        actor.attachments = mergeAttachmentsByRef(inherited.attachments, ownProps.attachments);
      }
      if (Array.isArray(inherited.appendages) && Array.isArray(ownProps.appendages)) {
        actor.appendages = mergeAppendagesById(inherited.appendages, ownProps.appendages);
      }
      actor.extends = baseId;
    }
    resolvingStack.pop();
    state.set(actorId, "resolved");
    return actor;
  };
  for (const actor of actors) mergeActor(actor);
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
function positiveNum(value, fallback) {
  const parsed = num(value, fallback);
  return parsed > 0 ? parsed : fallback;
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function isOn(value) {
  return typeof value === "string" && value.toLowerCase() === "on";
}
function parseSizedValue(value, fallbackValue, defaultUnit) {
  if (value === undefined || value === null || value === "") return { value: fallbackValue, unit: defaultUnit };
  if (typeof value === "number") return { value, unit: defaultUnit };
  if (typeof value !== "string") return { value: fallbackValue, unit: defaultUnit };
  const trimmed = value.trim();
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)(px|%)?$/);
  if (!match) return { value: fallbackValue, unit: defaultUnit };
  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) return { value: fallbackValue, unit: defaultUnit };
  const unit = match[2] === "%" ? "percent" : match[2] === "px" ? "px" : defaultUnit;
  return { value: parsed, unit };
}
function normalizeTextDirection(value, fallback = "horizontal") {
  const candidate = typeof value === "string" ? value.toLowerCase() : "";
  if (TEXT_DIRECTIONS.has(candidate)) return candidate;
  return fallback;
}
function normalizeHorizontalAlign(value, fallback = "center") {
  const candidate = typeof value === "string" ? value.toLowerCase() : "";
  if (HORIZONTAL_ALIGNS.has(candidate)) return candidate;
  return fallback;
}
function normalizeVerticalAlign(value, fallback = "top") {
  const candidate = typeof value === "string" ? value.toLowerCase() : "";
  if (VERTICAL_ALIGNS.has(candidate)) return candidate;
  return fallback;
}
function pUnit(item, dicts, refKey) {
  const ref = dicts[`${refKey}s`]?.get(String(item[refKey]));
  if (!ref) return "percent";
  const page = dicts.pages.get(String(ref.page));
  return page?.unit === "px" ? "px" : "percent";
}
function intersectsRect(a, b) {
  return a.x < b.x + b.w
    && a.x + a.w > b.x
    && a.y < b.y + b.h
    && a.y + a.h > b.y;
}
function findMinNonOverlapY(panel, inner, unit, existingRects) {
  const AUTO_PLACE_MAX_STAGES = 3;
  const step = unit === "px" ? 1 : 0.01;
  const maxIterations = unit === "px" ? 100000 : 1000000;
  const precision = unit === "px" ? 0 : 2;
  const roundValue = (value) => unit === "px" ? Math.round(value) : Number(value.toFixed(precision));
  const toPercentX = (value) => unit === "px" ? value / inner.w * 100 : value;
  const toPercentY = (value) => unit === "px" ? value / inner.h * 100 : value;
  const fromCoord = (value) => unit === "px" ? value : value / inner.h * 100;

  function detectFailure(candidate, allowOverflowY) {
    const px = toPercentX(candidate.x);
    const py = toPercentY(candidate.y);
    const pw = toPercentX(candidate.w);
    const ph = toPercentY(candidate.h);
    if (px < 0) return "x<0";
    if (px + pw > 100) return "x+w>100";
    if (py < 0) return "y<0";
    if (!allowOverflowY && py > 100) return "y>100";
    if (!allowOverflowY && py + ph > 100) return "y+h>100";
    return null;
  }

  function searchByStage(startX, startY, allowOverflowY) {
    let baseY = startY;
    let lastCandidate = { x: startX, y: baseY, w: panel.w, h: panel.h };
    for (let i = 0; i < maxIterations; i += 1) {
      const candidate = { x: startX, y: baseY, w: panel.w, h: panel.h };
      lastCandidate = candidate;
      const failure = detectFailure(candidate, allowOverflowY);
      if (failure) return { ok: false, failure, candidate };
      const candidateRect = rectInPage(candidate, inner, unit);
      const hit = existingRects.find((rect) => intersectsRect(rectTarget(candidateRect), rectTarget(rect)));
      if (!hit) return { ok: true, candidate };
      const hitRect = rectTarget(hit);
      const nextY = fromCoord(hitRect.y + hitRect.h - inner.y);
      if (!Number.isFinite(nextY)) return { ok: false, failure: "invalid-next-y", candidate };
      baseY = Math.max(baseY + step, nextY);
    }
    return { ok: false, failure: "iteration-limit", candidate: lastCandidate };
  }

  const attempts = [
    { name: "primary", x: panel.x, y: panel.y, allowOverflowY: false },
    { name: "fallback", x: 0, y: panel.y, allowOverflowY: false },
    { name: "finalOverflow", x: 0, y: panel.y, allowOverflowY: true },
  ];
  const tried = new Set();
  let lastResult = { ok: false, candidate: { x: panel.x, y: panel.y, w: panel.w, h: panel.h } };

  for (let i = 0; i < Math.min(AUTO_PLACE_MAX_STAGES, attempts.length); i += 1) {
    const attempt = attempts[i];
    const key = `${roundValue(attempt.x)}:${roundValue(attempt.y)}:${attempt.allowOverflowY}`;
    if (tried.has(key)) continue;
    tried.add(key);
    lastResult = searchByStage(attempt.x, attempt.y, attempt.allowOverflowY);
    if (lastResult.ok) return roundValue(lastResult.candidate.y);
    if (attempt.name === "finalOverflow") {
      return roundValue(lastResult.candidate.y);
    }
  }

  return roundValue(lastResult.candidate.y);
}
function normalizePanelDirection(value, fallback = "right.bottom") {
  const candidate = typeof value === "string" ? value.toLowerCase() : "";
  if (PANEL_BASE_DIRECTIONS.has(candidate)) return candidate;
  return fallback;
}
function resolvePanelAutoDirection(panel, previousPanel, defaultDirection) {
  if (!panel._autoPlaced) return "bottom";
  if (previousPanel?.next) return previousPanel.next;
  return defaultDirection;
}
function panelCoordInInner(panel, previousRect, inner, unit, direction) {
  if (!previousRect) return null;
  if (unit === "px") {
    if (direction === "right") {
      return { x: previousRect.x + previousRect.w - inner.x, y: previousRect.y - inner.y };
    }
    if (direction === "left") {
      return { x: previousRect.x - inner.x - panel.w, y: previousRect.y - inner.y };
    }
    return { x: previousRect.x - inner.x, y: previousRect.y + previousRect.h - inner.y };
  }
  if (direction === "right") {
    return {
      x: ((previousRect.x + previousRect.w - inner.x) / inner.w) * 100,
      y: ((previousRect.y - inner.y) / inner.h) * 100,
    };
  }
  if (direction === "left") {
    return {
      x: ((previousRect.x - inner.x) / inner.w) * 100 - panel.w,
      y: ((previousRect.y - inner.y) / inner.h) * 100,
    };
  }
  return {
    x: ((previousRect.x - inner.x) / inner.w) * 100,
    y: ((previousRect.y + previousRect.h - inner.y) / inner.h) * 100,
  };
}
function isPanelXInBounds(panel, x, inner, unit) {
  if (unit === "px") return x >= 0 && x + panel.w <= inner.w;
  return x >= 0 && x + panel.w <= 100;
}
function intersectsLocalRect(a, b) {
  return a.x < b.x + b.w
    && a.x + a.w > b.x
    && a.y < b.y + b.h
    && a.y + a.h > b.y;
}
function findFirstNonOverlapYAtX(panel, x, existingRects, boundsMaxY, panelMargin) {
  let y = 0;
  const maxIterations = existingRects.length + 2;
  for (let i = 0; i < maxIterations; i += 1) {
    const candidate = { x, y, w: panel.w, h: panel.h };
    const hit = existingRects.find((rect) => intersectsLocalRect(candidate, rect));
    if (!hit) return y;
    y = hit.y + hit.h + panelMargin;
    if (!Number.isFinite(y)) return boundsMaxY;
  }
  return boundsMaxY;
}
function findFirstNonOverlapXAtY(panel, y, existingRects, boundsMaxX, horizontalDirection, panelMargin) {
  const minX = 0;
  const maxX = boundsMaxX - panel.w;
  if (maxX < minX) return null;
  const maxIterations = existingRects.length + 2;
  if (horizontalDirection === "left") {
    let x = maxX;
    for (let i = 0; i < maxIterations; i += 1) {
      if (x < minX) return null;
      const candidate = { x, y, w: panel.w, h: panel.h };
      const hit = existingRects.find((rect) => intersectsLocalRect(candidate, rect));
      if (!hit) return x;
      x = hit.x - panel.w - panelMargin;
    }
    return null;
  }
  let x = minX;
  for (let i = 0; i < maxIterations; i += 1) {
    if (x > maxX) return null;
    const candidate = { x, y, w: panel.w, h: panel.h };
    const hit = existingRects.find((rect) => intersectsLocalRect(candidate, rect));
    if (!hit) return x;
    x = hit.x + hit.w + panelMargin;
  }
  return null;
}
function estimateItemRectInPanel(item, kind) {
  const hasFixedPosition = !item._autoPosition;
  const baseX = hasFixedPosition ? num(item.x, 0) : 0;
  const baseY = hasFixedPosition ? num(item.y, 0) : 0;
  if (kind === "actor") {
    const s = 20 * num(item.scale, 1);
    const w = s * 0.08;
    const h = s * 0.50;
    const x = hasFixedPosition ? baseX - w / 2 : 0;
    const y = hasFixedPosition ? baseY - h : 0;
    return { x: x , y: y, w, h };
  }
  if (kind === "sfx") {
    const text = String(item.text ?? "");
    const scale = num(item.scale, 1);
    const fontSize = num(item.fontSize, 8);
    const isVertical = (item.textDirection || "horizontal") === "vertical";
    const estimatedWidth = Math.max(fontSize, text.length * fontSize * 0.7);
    const estimatedHeight = fontSize * 1.4;
    const w = (isVertical ? estimatedHeight : estimatedWidth) * scale;
    const h = (isVertical ? estimatedWidth : estimatedHeight) * scale;
    return { x: baseX, y: baseY - h * 0.8, w, h };
  }
  return { x: baseX, y: baseY, w: num(item.w, 0), h: num(item.h, 0) };
}
function applyRectToItem(item, rect, kind) {
  if (kind === "actor") {
    item.x = rect.x + rect.w / 2;
    item.y = rect.y + rect.h;
    return;
  }
  if (kind === "sfx") {
    item.x = rect.x;
    item.y = rect.y + rect.h * 0.8;
    return;
  }
  item.x = rect.x;
  item.y = rect.y;
}
function clipRectToPanelBounds(rect, maxX, maxY) {
  const left = clamp(rect.x, 0, maxX);
  const top = clamp(rect.y, 0, maxY);
  const right = clamp(rect.x + rect.w, 0, maxX);
  const bottom = clamp(rect.y + rect.h, 0, maxY);
  return { x: left, y: top, w: Math.max(0, right - left), h: Math.max(0, bottom - top) };
}
function chooseOversizedRect(kind, occupied, maxX, maxY, w, h, step) {
  if (kind !== "actor") return null;
  let best = null;
  let bestHits = Number.POSITIVE_INFINITY;
  let bestOverlap = Number.POSITIVE_INFINITY;
  for (let x = 0; x <= maxX; x += step) {
    const candidate = { x: x - w / 2, y: maxY - h, w, h };
    const clipped = clipRectToPanelBounds(candidate, maxX, maxY);
    const hits = occupied.filter((r) => intersectsLocalRect(clipped, r));
    const overlap = hits.reduce((sum, r) => {
      const ix = Math.max(0, Math.min(clipped.x + clipped.w, r.x + r.w) - Math.max(clipped.x, r.x));
      const iy = Math.max(0, Math.min(clipped.y + clipped.h, r.y + r.h) - Math.max(clipped.y, r.y));
      return sum + ix * iy;
    }, 0);
    if (hits.length < bestHits || (hits.length === bestHits && overlap < bestOverlap)) {
      best = candidate;
      bestHits = hits.length;
      bestOverlap = overlap;
      if (bestHits === 0 && bestOverlap === 0) break;
    }
  }
  return best;
}
function autoPlacePanelItems(scene, dicts) {
  const panelEntries = new Map();
  const register = (kind, item) => {
    const key = String(item.panel);
    if (!panelEntries.has(key)) panelEntries.set(key, []);
    panelEntries.get(key).push({ kind, item });
  };
  for (const actor of scene.actors) register("actor", actor);
  for (const object of scene.objects) register("object", object);
  for (const balloon of scene.balloons) register("balloon", balloon);
  for (const caption of scene.captions) register("caption", caption);
  for (const sfx of scene.sfx) register("sfx", sfx);

  for (const [panelId, entries] of panelEntries.entries()) {
    const panel = dicts.panels.get(panelId);
    if (!panel) continue;
    const page = dicts.pages.get(String(panel.page));
    const unit = page?.unit || "percent";
    const maxX = unit === "px" ? panel.w : 100;
    const maxY = unit === "px" ? panel.h : 100;
    const occupied = [];
    const step = 2;
    const margin = 1;
    entries.sort((a, b) => a.item._order - b.item._order);

    for (const { kind, item } of entries) {
      const baseRect = estimateItemRectInPanel(item, kind);
      if (!item._autoPosition) {
        occupied.push({
          x: Math.max(0, baseRect.x - margin),
          y: Math.max(0, baseRect.y - margin),
          w: baseRect.w + margin * 2,
          h: baseRect.h + margin * 2,
        });
        continue;
      }

      const w = Math.max(0, baseRect.w);
      const h = Math.max(0, baseRect.h);
      const fitsWithinPanel = w <= maxX && h <= maxY;
      const boundsMaxX = Math.max(0, maxX - w);
      const boundsMaxY = Math.max(0, maxY - h);
      let chosen = null;

      if (fitsWithinPanel) {
        for (let y = margin; y <= boundsMaxY; y += step) {
          for (let x = margin; x <= boundsMaxX; x += step) {
            const candidate = { x, y, w, h };
            if (!occupied.some((r) => intersectsLocalRect(candidate, r))) {
              chosen = candidate;
              break;
            }
          }
          if (chosen) break;
        }
      }

      if (!chosen) {
        if (fitsWithinPanel) {
          chosen = { x: 0, y: Math.max(0, maxY - h), w, h };
        } else {
          chosen = chooseOversizedRect(kind, occupied, maxX, maxY, w, h, step);
          if (!chosen && kind === "sfx") {
            chosen = { x: 0, y: maxY - h * 0.8, w, h };
          }
          if (!chosen) {
            chosen = { x: 0, y: 0, w, h };
          }
        }
      }

      applyRectToItem(item, chosen, kind);
      const occupiedRect = clipRectToPanelBounds({
        x: chosen.x - margin,
        y: chosen.y - margin,
        w: chosen.w + margin * 2,
        h: chosen.h + margin * 2,
      }, maxX, maxY);
      occupied.push(occupiedRect);
    }
  }
}

function autoPlacePanel(panel, previousPanel, existingRects, defaultPanelDirection, unit, inner, panelMargin) {
  const boundsMaxX = unit === "px" ? inner.w : 100;
  const boundsMaxY = unit === "px" ? inner.h : 100;
  const fallbackHorizontal = defaultPanelDirection === "left.bottom" ? "left" : "right";

  if (!previousPanel) {
    panel.x = fallbackHorizontal === "left" ? boundsMaxX - panel.w : 0;
    panel.y = 0;
    return;
  }

  const placeHorizontal = (direction) => {
    const x = direction === "left"
      ? previousPanel.x - panel.w - panelMargin
      : previousPanel.x + previousPanel.w + panelMargin;
    if (!isPanelXInBounds(panel, x, inner, unit)) return null;
    const y = findFirstNonOverlapYAtX(panel, x, existingRects, boundsMaxY, panelMargin);
    return { x, y };
  };

  const placeBottom = () => {
    const y = previousPanel.y + previousPanel.h + panelMargin;
    if (y > boundsMaxY) return null;
    const x = findFirstNonOverlapXAtY(panel, y, existingRects, boundsMaxX, fallbackHorizontal, panelMargin);
    if (x === null) return null;
    return { x, y };
  };

  const choose = (result) => {
    if (!result) return false;
    panel.x = result.x;
    panel.y = result.y;
    return true;
  };

  if (previousPanel.next === "left" || previousPanel.next === "right") {
    if (choose(placeHorizontal(previousPanel.next))) return;
  } else if (previousPanel.next === "bottom") {
    if (choose(placeBottom())) return;
  }

  if (choose(placeHorizontal(fallbackHorizontal))) return;
  if (choose(placeBottom())) return;
  if (choose(placeHorizontal(fallbackHorizontal))) return;

  panel.x = fallbackHorizontal === "left" ? boundsMaxX - panel.w : 0;
  panel.y = previousPanel.y + previousPanel.h + panelMargin;
}

function render(scene) {
  const showActorName = isOn(scene.meta?.["actor.name.visible"]);
  const defaultTextDirection = normalizeTextDirection(scene.meta?.["text.direction"]);
  const pageLayouts = buildPageLayouts(scene);
  const panelRects = buildPanelRects(scene, pageLayouts);
  const panelMap = new Map(scene.panels.map((p) => [String(p.id), p]));
  const actorMap = new Map(scene.actors.map((a) => [String(a.id), a]));
  const assetMap = new Map(scene.assets.map((asset) => [String(asset.id), asset]));
  const entries = [];
  for (const p of scene.panels) entries.push({ kind: "panel", z: p.z ?? 0, order: p._order, data: p });
  for (const a of scene.assets) {
    if (a.panel !== undefined && a.panel !== null && a.panel !== "") {
      entries.push({ kind: "asset", z: a.z ?? 0, order: a._order, data: a });
    }
  }
  for (const a of scene.actors) {
    if (a.panel !== undefined && a.panel !== null && a.panel !== "") {
      entries.push({ kind: "actor", z: a.z ?? 0, order: a._order, data: a });
    }
  }
  for (const o of scene.objects) entries.push({ kind: "object", z: o.z ?? 0, order: o._order, data: o });
  for (const ba of scene.boxarrows) entries.push({ kind: "boxarrow", z: ba.z ?? 0, order: ba._order, data: ba });
  for (const b of scene.balloons) entries.push({ kind: "balloon", z: b.z ?? 0, order: b._order, data: b });
  for (const c of scene.captions) entries.push({ kind: "caption", z: c.z ?? 0, order: c._order, data: c });
  for (const s of scene.sfx) entries.push({ kind: "sfx", z: s.z ?? 0, order: s._order, data: s });
  entries.sort((a, b) => a.z - b.z || a.order - b.order);
  const defs = [];
  const body = [];
  const dragHandles = [];
  const panelClipIds = new Map();
  function getPanelClipId(panelId, panelRect) {
    const key = String(panelId);
    if (panelClipIds.has(key)) return panelClipIds.get(key);
    const clipId = `panel-clip-${key}`;
    const clipRect = rectTarget(panelRect);
        defs.push(`<clipPath id="${clipId}"><rect x="${clipRect.x}" y="${clipRect.y}" width="${clipRect.w}" height="${clipRect.h}"/></clipPath>`);
    panelClipIds.set(key, clipId);
    return clipId;
  }
  function clipWhenBehindPanel(entry, panel, panelRect, markup) {
    const panelZ = panel.z ?? 0;
    if (entry.z >= panelZ) return markup;
    const clipId = getPanelClipId(panel.id, panelRect);
    return `<g clip-path="url(#${clipId})">${markup}</g>`;
  }
  for (const entry of entries) {
    if (entry.kind === "panel") {
      const panelRect = panelRects.get(String(entry.data.id));
      if (!panelRect) continue;
      const r = rectTarget(panelRect);
      body.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${entry.data.fill || "none"}" stroke="${entry.data.stroke || "black"}" stroke-width="${num(entry.data.strokeWidth, 3)}" rx="${num(entry.data.radius, 0)}" ry="${num(entry.data.radius, 0)}"/>`);
    } else if (entry.kind === "asset") {
      const panel = panelMap.get(String(entry.data.panel));
      const pageLayout = panel ? pageLayouts.get(String(panel.page)) : null;
      const panelRect = panelRects.get(String(entry.data.panel));
      if (!pageLayout || !panelRect) continue;
      const box = withinPanel(entry.data, panelRect, pageLayout.page.unit);
      let clip = "";
      if (entry.data.clipToPanel) {
        const clipId = `clip-${entry.data.id}`;
        const clipRect = rectTarget(panelRect);
        defs.push(`<clipPath id="${clipId}"><rect x="${clipRect.x}" y="${clipRect.y}" width="${clipRect.w}" height="${clipRect.h}"/></clipPath>`);
        clip = ` clip-path="url(#${clipId})"`;
      }
      const imageMarkup = `<image x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" href="${escapeXml(entry.data.src)}" opacity="${entry.data.opacity}"${clip}/>`;
      body.push(clipWhenBehindPanel(entry, panel, panelRect, imageMarkup));
    } else if (entry.kind === "actor") {
      const panel = panelMap.get(String(entry.data.panel));
      const pageLayout = panel ? pageLayouts.get(String(panel.page)) : null;
      const panelRect = panelRects.get(String(entry.data.panel));
      if (!pageLayout || !panelRect) continue;
      const actorMarkup = renderActor(entry.data, panelRect, pageLayout.page.unit, showActorName, assetMap, entry.kind, entry.data.id);
      body.push(clipWhenBehindPanel(entry, panel, panelRect, actorMarkup));
      if (isDragHandleModeEnabled()) {
        const handleMarkup = renderDragHandle(entry.kind, entry.data.id, entry.data, panelRect, pageLayout.page.unit);
        if (handleMarkup) dragHandles.push(clipWhenBehindPanel(entry, panel, panelRect, handleMarkup));
      }
    } else if (entry.kind === "object") {
      const panel = panelMap.get(String(entry.data.panel));
      const pageLayout = panel ? pageLayouts.get(String(panel.page)) : null;
      const panelRect = panelRects.get(String(entry.data.panel));
      if (!pageLayout || !panelRect) continue;
      const objectMarkup = renderObject(entry.data, panelRect, pageLayout.page.unit, defaultTextDirection, entry.kind, entry.data.id);
      body.push(clipWhenBehindPanel(entry, panel, panelRect, objectMarkup));
      if (isDragHandleModeEnabled()) {
        const handleMarkup = renderDragHandle(entry.kind, entry.data.id, entry.data, panelRect, pageLayout.page.unit);
        if (handleMarkup) dragHandles.push(clipWhenBehindPanel(entry, panel, panelRect, handleMarkup));
      }
    } else if (entry.kind === "boxarrow") {
      const panel = panelMap.get(String(entry.data.panel));
      const pageLayout = panel ? pageLayouts.get(String(panel.page)) : null;
      const panelRect = panelRects.get(String(entry.data.panel));
      if (!pageLayout || !panelRect) continue;
      const boxarrowMarkup = renderBoxArrow(entry.data, panelRect, pageLayout.page.unit, entry.kind, entry.data.id);
      if (isDragHandleModeEnabled()) {
        const handleMarkup = renderDragHandle(entry.kind, entry.data.id, entry.data, panelRect, pageLayout.page.unit);
        if (handleMarkup) dragHandles.push(clipWhenBehindPanel(entry, panel, panelRect, handleMarkup));
      }
      body.push(clipWhenBehindPanel(entry, panel, panelRect, boxarrowMarkup));
    } else if (entry.kind === "balloon") {
      const panel = panelMap.get(String(entry.data.panel));
      const pageLayout = panel ? pageLayouts.get(String(panel.page)) : null;
      const panelRect = panelRects.get(String(entry.data.panel));
      if (!pageLayout || !panelRect) continue;
      const balloonMarkup = renderBalloon(entry.data, panelRect, pageLayout.page.unit, actorMap, panelMap, panelRects, pageLayouts, defaultTextDirection, entry.kind, entry.data.id);
      body.push(clipWhenBehindPanel(entry, panel, panelRect, balloonMarkup));
      if (isDragHandleModeEnabled()) {
        const handleMarkup = renderDragHandle(entry.kind, entry.data.id, entry.data, panelRect, pageLayout.page.unit);
        if (handleMarkup) dragHandles.push(clipWhenBehindPanel(entry, panel, panelRect, handleMarkup));
      }
    } else if (entry.kind === "caption") {
      const panel = panelMap.get(String(entry.data.panel));
      const pageLayout = panel ? pageLayouts.get(String(panel.page)) : null;
      const panelRect = panelRects.get(String(entry.data.panel));
      if (!pageLayout || !panelRect) continue;
      const captionMarkup = renderCaption(entry.data, panelRect, pageLayout.page.unit, defaultTextDirection, entry.kind, entry.data.id);
      body.push(clipWhenBehindPanel(entry, panel, panelRect, captionMarkup));
      if (isDragHandleModeEnabled()) {
        const handleMarkup = renderDragHandle(entry.kind, entry.data.id, entry.data, panelRect, pageLayout.page.unit);
        if (handleMarkup) dragHandles.push(clipWhenBehindPanel(entry, panel, panelRect, handleMarkup));
      }
    } else if (entry.kind === "sfx") {
      const panel = panelMap.get(String(entry.data.panel));
      const pageLayout = panel ? pageLayouts.get(String(panel.page)) : null;
      const panelRect = panelRects.get(String(entry.data.panel));
      if (!pageLayout || !panelRect) continue;
      const sfxMarkup = renderSfx(entry.data, panelRect, pageLayout.page.unit, defaultTextDirection, entry.kind, entry.data.id);
      if (isDragHandleModeEnabled()) {
        const handleMarkup = renderDragHandle(entry.kind, entry.data.id, entry.data, panelRect, pageLayout.page.unit);
        if (handleMarkup) dragHandles.push(clipWhenBehindPanel(entry, panel, panelRect, handleMarkup));
      }
      body.push(clipWhenBehindPanel(entry, panel, panelRect, sfxMarkup));
    }
  }
  const canvas = canvasBounds(pageLayouts);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.w} ${canvas.h}" width="${canvas.w}" height="${canvas.h}">
  ${defs.length ? `<defs>${defs.join("")}</defs>` : ""}
  <g transform="translate(${viewState.panX},${viewState.panY}) scale(${viewState.scale})">
    ${renderPageFrames(pageLayouts)}
    ${body.join("\n")}
    ${dragHandles.join("\n")}
  </g>
</svg>`;
}
function buildPageLayouts(scene) {
  const layouts = new Map();
  const layoutMeta = scene.layoutMeta ?? normalizeLayoutMeta(scene.meta);
  const layoutPageMode = layoutMeta.page.mode ?? "fixed";
  const percentReference = layoutMeta.percent.reference;
  const layoutBaseDimensions = resolveLayoutBaseDimensions(scene.meta);
  const defaultPanelDirection = layoutMeta.panel.direction;
  const defaultPanelMargin = layoutMeta.panel.margin;
  const pageGap = layoutMeta.page.gap;
  const usedPageIds = new Set(scene.pages.map((page) => String(page.id)));
  let offsetY = 0;
  for (const page of scene.pages) {
    const [w, h] = pageDimensions(page);
    const panelsInPage = scene.panels.filter((panel) => String(panel.page) === String(page.id));
    const autoPageSequence = { value: 1 };
    let pageVariant = page;
    let panelIndex = 0;
    while (panelIndex < panelsInPage.length || pageVariant === page) {
      const frame = { x: 0, y: offsetY, w, h };
      const inner = {
        x: frame.x + pageVariant.margin / 100 * w,
        y: frame.y + pageVariant.margin / 100 * h,
        w: w * (1 - pageVariant.margin / 50),
        h: h * (1 - pageVariant.margin / 50),
      };
      const baseInner = layoutBaseDimensions
        ? {
          x: inner.x,
          y: inner.y,
          w: layoutBaseDimensions[0] * (1 - pageVariant.margin / 50),
          h: layoutBaseDimensions[1] * (1 - pageVariant.margin / 50),
        }
        : inner;
      const placedRects = [];
      let maxPanelBottom = 0;
      while (panelIndex < panelsInPage.length) {
        const panel = panelsInPage[panelIndex];
        if (panel._autoPlaced) {
          const previousPanel = placedRects.length > 0 ? panelsInPage[panelIndex - 1] : null;
          autoPlacePanel(panel, previousPanel, placedRects, defaultPanelDirection, pageVariant.unit, percentReference === "base-size" ? baseInner : inner, defaultPanelMargin);
        }
        const panelRect = rectTarget(rectInPage(panel, inner, pageVariant.unit, percentReference, baseInner));
        const panelBottom = panelRect.y + panelRect.h - frame.y;
        if (layoutPageMode === "auto-append" && panelBottom > frame.h && placedRects.length > 0) {
          break;
        }
        panel.page = String(pageVariant.id);
        placedRects.push({ x: panel.x, y: panel.y, w: panel.w, h: panel.h });
        maxPanelBottom = Math.max(maxPanelBottom, panelBottom);
        panelIndex += 1;
      }

      const innerBottomPadding = frame.h - (inner.y - frame.y + inner.h);
      const frameHeight = layoutPageMode === "auto-extend"
        ? Math.max(frame.h, maxPanelBottom + innerBottomPadding)
        : frame.h;
      const maxY = frame.y + frameHeight;
      const finalFrame = { ...frame, h: frameHeight };
      layouts.set(String(pageVariant.id), { page: pageVariant, frame: finalFrame, inner, baseInner, percentReference, maxY });
      offsetY = maxY + pageGap;

      if (layoutPageMode !== "auto-append" || panelIndex >= panelsInPage.length) {
        break;
      }
      const autoPageId = nextAutoPageId(usedPageIds, autoPageSequence);
      pageVariant = {
        ...page,
        id: autoPageId,
        _virtual: true,
      };
    }
  }
  return layouts;
}
function buildPanelRects(scene, pageLayouts) {
  const panelRects = new Map();
  for (const panel of scene.panels) {
    const pageLayout = pageLayouts.get(String(panel.page));
    if (!pageLayout) continue;
    panelRects.set(String(panel.id), rectInPage(panel, pageLayout.inner, pageLayout.page.unit, pageLayout.percentReference, pageLayout.baseInner));
  }
  return panelRects;
}
function renderPageFrames(pageLayouts) {
  return Array.from(pageLayouts.values())
    .map(({ page, frame }) => [
      `<rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" fill="${page.bg}"/>`,
      `<rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" fill="none" stroke="${page.stroke}" stroke-width="${page.strokeWidth}"/>`,
    ].join(""))
    .join("\n");
}
function canvasBounds(pageLayouts) {
  const values = Array.from(pageLayouts.values());
  return {
    w: values.reduce((max, { frame }) => Math.max(max, frame.x + frame.w), 0),
    h: values.reduce((max, { frame }) => Math.max(max, frame.y + frame.h), 0),
  };
}

function resolveLayoutPageMode(meta) {
  const layoutPageModeRaw = meta?.["layout.page.mode"] ?? meta?.layoutPageMode;
  if (layoutPageModeRaw === undefined || layoutPageModeRaw === null || layoutPageModeRaw === "") {
    return undefined;
  }
  const layoutPageMode = String(layoutPageModeRaw).toLowerCase();
  if (!["fixed", "auto-extend", "auto-append"].includes(layoutPageMode)) {
    throw new Error("meta.layout.page.mode は fixed / auto-extend / auto-append のいずれかを指定してください");
  }
  return layoutPageMode;
}
function normalizeLayoutMeta(meta) {
  const normalizedMeta = meta ?? {};
  const pageMode = resolveLayoutPageMode(normalizedMeta) || "fixed";
  const percentReference = resolvePercentReference(normalizedMeta);
  const hasBaseWidth = typeof normalizedMeta["layout.base.width"] === "number";
  const hasBaseHeight = typeof normalizedMeta["layout.base.height"] === "number";
  if ((hasBaseWidth && !hasBaseHeight) || (!hasBaseWidth && hasBaseHeight)) {
    throw new Error("meta.layout.base.width / meta.layout.base.height は両方指定してください");
  }
  if (hasBaseWidth && hasBaseHeight) {
    if (normalizedMeta["layout.base.width"] <= 0 || normalizedMeta["layout.base.height"] <= 0) {
      throw new Error("meta.layout.base.width / meta.layout.base.height は正数を指定してください");
    }
  }
  if (normalizedMeta["layout.base.size"] !== undefined && normalizedMeta["layout.base.size"] !== null && normalizedMeta["layout.base.size"] !== "") {
    normalizedMeta["layout.base.size"] = String(normalizedMeta["layout.base.size"]).trim();
    if (!PAGE_SIZES[normalizedMeta["layout.base.size"]]) {
      throw new Error("meta.layout.base.size は既知の用紙サイズを指定してください");
    }
  }
  if (percentReference === "base-size" && !resolveLayoutBaseDimensions(normalizedMeta)) {
    normalizedMeta["layout.base.size"] = "B5";
  }
  const persistGeneratedRaw = normalizedMeta["layout.page.persistGenerated"];
  const persistGenerated = persistGeneratedRaw === true || String(persistGeneratedRaw ?? "").toLowerCase() === "true";
  const panelDirection = normalizePanelDirection(normalizedMeta?.["base.panel.direction"], "right.bottom");
  const panelMargin = Math.max(0, num(normalizedMeta?.["base.panel.margin"], 0));
  const pageGap = Math.max(0, num(normalizedMeta?.["layout.page.gap"], 1));
  normalizedMeta["layout.page.mode"] = pageMode;
  normalizedMeta["layout.percent.reference"] = percentReference;
  normalizedMeta["layout.page.persistGenerated"] = persistGenerated;
  return {
    page: {
      mode: pageMode,
      persistGenerated,
      gap: pageGap,
    },
    percent: {
      reference: percentReference,
    },
    panel: {
      direction: panelDirection,
      margin: panelMargin,
    },
  };
}
function resolvePercentReference(meta) {
  const raw = meta?.["layout.percent.reference"] ?? meta?.layoutPercentReference;
  if (raw === undefined || raw === null || raw === "") return "page-inner";
  const normalized = String(raw).toLowerCase();
  if (!["page-inner", "base-size"].includes(normalized)) {
    throw new Error("meta.layout.percent.reference は page-inner / base-size のいずれかを指定してください");
  }
  return normalized;
}
function nextAutoPageId(usedPageIds, sequenceState = { value: 1 }) {
  let index = Math.max(1, Number(sequenceState.value) || 1);
  let candidate = `auto-p${index}`;
  while (usedPageIds.has(candidate)) {
    index += 1;
    candidate = `auto-p${index}`;
  }
  usedPageIds.add(candidate);
  sequenceState.value = index + 1;
  return candidate;
}
function resolveLayoutBaseDimensions(meta) {
  const baseWidth = meta?.["layout.base.width"];
  const baseHeight = meta?.["layout.base.height"];
  if (typeof baseWidth === "number" && typeof baseHeight === "number") {
    return [baseWidth, baseHeight];
  }
  const baseSize = String(meta?.["layout.base.size"] ?? "").trim();
  if (baseSize) return PAGE_SIZES[baseSize] || PAGE_SIZES.B5;
  return null;
}
function rectTarget(rect) {
  return rect?.draw || rect;
}
function rectBasis(rect) {
  return rect?.basis || rectTarget(rect);
}
function projectRect(rect, fromRect, toRect) {
  if (!fromRect || !toRect || fromRect === toRect) return { ...rect };
  const scaleX = fromRect.w === 0 ? 1 : toRect.w / fromRect.w;
  const scaleY = fromRect.h === 0 ? 1 : toRect.h / fromRect.h;
  return {
    x: toRect.x + (rect.x - fromRect.x) * scaleX,
    y: toRect.y + (rect.y - fromRect.y) * scaleY,
    w: rect.w * scaleX,
    h: rect.h * scaleY,
  };
}
function renderDataAttrs(kind, id) {
  return ` data-kind="${escapeXml(String(kind))}" data-id="${escapeXml(String(id))}"`;
}
function resolvedPosePointsForActor(actor, scale) {
  const preset = posePresetPoints(actor.pose, scale);
  const points = {};
  for (const name of POSE_POINT_NAMES) {
    points[name] = resolvePosePoint(actor._posePoints, name, scale) || preset[name] || { x: 0, y: 0 };
  }
  return points;
}
function renderPosePointHandles(actor, kind, id, scale) {
  if (!isPoseEditModeEnabled()) return "";
  if (!id || String(id) !== String(selectedActorId)) return "";
  const points = resolvedPosePointsForActor(actor, scale);
  return POSE_POINT_NAMES.map((name) => {
    const point = points[name];
    return `<circle class="pose-point-handle" data-kind="actor" data-id="${escapeXml(String(id))}" data-pose-point="${escapeXml(name)}" cx="${point.x}" cy="${point.y}" r="4" fill="#fff" stroke="#2563eb" stroke-width="1.2"/>`;
  }).join("");
}
function renderAttachmentPointHandles(attachments, kind, id) {
  if (!isPoseEditModeEnabled()) return "";
  if (kind !== "actor" || !id || String(id) !== String(selectedActorId)) return "";
  return attachments.map((attachment) => {
    const handlePoint = attachment.handlePoint || attachment.centerPoint || attachment.anchorPoint;
    if (!handlePoint) return "";
    return `<circle class="attachment-point-handle" data-kind="actor" data-id="${escapeXml(String(id))}" data-attachment-index="${attachment.attachmentIndex}" data-attachment-ref="${escapeXml(String(attachment.ref))}" cx="${handlePoint.x}" cy="${handlePoint.y}" r="4"/>`;
  }).join("");
}
function renderActor(actor, panelRect, unit, showActorName, assetMap, kind, id) {
  const p = pointInPanel(actor.x, actor.y, panelRect, unit);
  const s = 20 * actor.scale;
  const rot = num(actor.rot, 0);
  const mirror = actor.facing === "left" ? -1 : 1;
  const pose = hasPosePoints(actor._posePoints)
    ? poseSegmentsFromPoints(actor._posePoints, actor._posePointZ, s, actor.strokeWidth)
    : poseSegments(actor.pose, actor._posePointZ, s, actor.strokeWidth);
  const headPoint = resolveHeadPoint(actor._posePoints, s);
  const neckPoint = resolvePosePoint(actor._posePoints, "neck", s) || { x: 0, y: -s * 0.8 };
  const attachments = resolveActorAttachments(actor, assetMap);
  const appendages = resolveActorAppendages(actor, kind, id);
  const hideHeadAndFace = actor.emotion === "none";
  const faceMarkup = actor.facing === "back" || hideHeadAndFace
    ? ""
    : `${eyePath(actor.eye, s, headPoint)}${emotionPath(actor.emotion, s, headPoint)}`;
  const headShape = hideHeadAndFace ? "none" : actor["head.shape"];
  const headMarkup = headOutline(headShape, s, actor.strokeWidth, headPoint);
  const nameLabel = showActorName && actor.name
    ? `<text x="0" y="${-s * 2.9}" font-size="${Math.max(10, s * 0.55)}" text-anchor="middle" dominant-baseline="auto" fill="black">${escapeXml(String(actor.name))}</text>`
    : "";
  const poseHandles = renderPosePointHandles(actor, kind, id, s);
  const attachmentHandles = renderAttachmentPointHandles(attachments, kind, id);
  const groupTransform = rot ? `translate(${p.x},${p.y}) rotate(${rot})` : `translate(${p.x},${p.y})`;
  const attrs = renderDataAttrs(kind, id);
  const neckHeadLine = `<line x1="${headPoint.x}" y1="${headPoint.y}" x2="${neckPoint.x}" y2="${neckPoint.y}" stroke="black" stroke-width="${actor.strokeWidth}" stroke-linecap="round"/>`;
  const actorLayers = [
    ...attachments.map((attachment, index) => ({ z: num(attachment.z, 0), order: 100 + index, markup: attachment.markup })),
    ...appendages.map((appendage, index) => ({ z: num(appendage.z, 0), order: 150 + index, markup: appendage.markup })),
    { z: num(actor._posePointZ?.head, 0), order: 0, markup: neckHeadLine },
    ...pose,
    { z: 0, order: 10, markup: headMarkup },
    { z: 0, order: 11, markup: faceMarkup },
  ].sort((a, b) => (a.z - b.z) || (a.order - b.order)).map((layer) => layer.markup).join("");
  return `<g transform="${groupTransform}"${attrs}>
    <g transform="scale(${mirror},1)">
      ${actorLayers}
      ${attachmentHandles}
    </g>
    ${nameLabel}
    ${poseHandles}
  </g>`;
}
function renderHandChainHandles(actor, appendage, appendageIndex, anchorPoint, appendageScale, kind, id) {
  if (!isHandDetailEditModeEnabled()) return "";
  if (kind !== "actor" || !id || String(id) !== String(selectedActorId)) return "";
  if (appendage.kind !== "hand") return "";
  const chains = Array.isArray(appendage.chains) ? appendage.chains : [];
  return chains.map((chain, chainIndex) => {
    const chainPoints = Array.isArray(chain?.points) ? chain.points : [];
    if (chainPoints.length === 0) return "";
    return chainPoints.map((point, pointIndex) => {
      const x = anchorPoint.x + point.x * appendageScale;
      const y = anchorPoint.y + point.y * appendageScale;
      return `<circle class="hand-chain-point-handle" data-kind="actor" data-id="${escapeXml(String(id))}" data-appendage-index="${appendageIndex}" data-chain-index="${chainIndex}" data-chain-point-index="${pointIndex}" cx="${x}" cy="${y}" r="4"/>`;
    }).join("");
  }).join("");
}
function resolveActorAppendages(actor, kind, id) {
  if (!Array.isArray(actor.appendages) || actor.appendages.length === 0) return [];
  const poseScale = 20 * actor.scale;
  const appendageScale = actor.scale;
  return actor.appendages.flatMap((appendage, appendageIndex) => {
    const anchorPoint = resolveAttachmentAnchorPoint(actor, appendage.anchor, poseScale);
    if (appendage.kind === "hand" && appendage.handVisible === false) {
      return [];
    }
    const buildPolyline = (pointGroups, className, width) => pointGroups
      .map((group) => {
        const chainPoints = Array.isArray(group?.points) ? group.points : group;
        const points = chainPoints
          .map((point) => `${anchorPoint.x + point.x * appendageScale},${anchorPoint.y + point.y * appendageScale}`)
          .join(" ");
        return `<polyline class="${className}" points="${points}" fill="none" stroke="black" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
      })
      .join("");
    const chainMarkup = buildPolyline(appendage.chains || [], "appendage-chain", Math.max(1, actor.strokeWidth * 0.9));
    const digitsMarkup = buildPolyline(appendage.digits || [], "appendage-digit", Math.max(1, actor.strokeWidth * 0.7));
    const detailHandles = renderHandChainHandles(actor, appendage, appendageIndex, anchorPoint, appendageScale, kind, id);
    const transforms = [];
    if (appendage.rotAnchor) transforms.push(`rotate(${appendage.rotAnchor} ${anchorPoint.x} ${anchorPoint.y})`);
    if (appendage.flipX) transforms.push(`translate(${anchorPoint.x} ${anchorPoint.y}) scale(-1,1) translate(${-anchorPoint.x} ${-anchorPoint.y})`);
    const transform = transforms.length > 0 ? ` transform="${transforms.join(" ")}"` : "";
    return [{
      appendageIndex,
      id: appendage.id,
      kind: appendage.kind,
      z: appendage.z,
      markup: `<g data-appendage-id="${escapeXml(String(appendage.id))}" data-appendage-kind="${escapeXml(String(appendage.kind))}"${transform}>${chainMarkup}${digitsMarkup}${detailHandles}</g>`,
    }];
  });
}
function resolvePosePoint(points, name, scale) {
  const raw = points?.[name];
  if (!raw) return null;
  if (Array.isArray(raw) && raw.length >= 2) {
    return { x: num(raw[0], 0) * scale, y: num(raw[1], 0) * scale };
  }
  if (typeof raw === "object") {
    return { x: num(raw.x, 0) * scale, y: num(raw.y, 0) * scale };
  }
  return null;
}
function hasPosePoints(points) {
  if (!points || typeof points !== "object") return false;
  return Object.keys(points).length > 0;
}
function resolveHeadPoint(points, scale) {
  return resolvePosePoint(points, "head", scale) || { x: 0, y: -scale * 2.2 };
}
function headOutline(shape, s, strokeWidth, headPoint = { x: 0, y: -s * 2.2 }) {
  const radius = s * 0.45;
  if (shape === "square") {
    const side = radius * 2;
    return `<rect x="${headPoint.x - radius}" y="${headPoint.y - radius}" width="${side}" height="${side}" fill="white" stroke="black" stroke-width="${strokeWidth}"/>`;
  }
  if (shape === "none") return "";
  return `<circle cx="${headPoint.x}" cy="${headPoint.y}" r="${radius}" fill="white" stroke="black" stroke-width="${strokeWidth}"/>`;
}
function resolveActorAttachments(actor, assetMap) {
  if (!Array.isArray(actor.attachments) || actor.attachments.length === 0) return [];
  const poseScale = 20 * actor.scale;
  return actor.attachments.flatMap((attachment, attachmentIndex) => {
    const asset = assetMap.get(String(attachment.ref));
    if (!asset) return [];
    const dx = attachment.dx ?? asset.dx ?? 0;
    const dy = attachment.dy ?? asset.dy ?? 0;
    const scale = actor.scale * (attachment.s ?? asset.s ?? 1);
    const width = asset.w * scale;
    const height = asset.h * scale;
    const rot = attachment.rot ?? asset.rot ?? 0;
    const anchorRot = attachment.anchorRot ?? asset.anchorRot ?? 0;
    const flipX = attachment.flipX ?? asset.flipX ?? false;
    const z = attachment.z ?? asset.z ?? 0;
    const anchorPoint = resolveAttachmentAnchorPoint(actor, asset.anchor, poseScale);
    const x = anchorPoint.x + dx * actor.scale;
    const y = anchorPoint.y + dy * actor.scale;
    const dragBasis = resolveAttachmentDragBasis(asset);
    const basisOffsetX = dragBasis === "center" ? width / 2 : 0;
    const basisOffsetY = dragBasis === "center" ? height / 2 : 0;
    const handlePoint = { x: x + basisOffsetX, y: y + basisOffsetY };
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const cx = centerX;
    const cy = centerY;
    const anchorCx = anchorPoint.x;
    const anchorCy = anchorPoint.y;
    // actor.facing === "left" applies scale(-1,1) to the parent <g>.
    // Attachment flipX adds another scale(-1,1) around the attachment center,
    // so a double inversion cancels out and the image is rendered in normal orientation.
    const transforms = [];
    if (rot) transforms.push(`rotate(${rot} ${cx} ${cy})`);
    if (anchorRot) transforms.push(`rotate(${anchorRot} ${anchorCx} ${anchorCy})`);
    if (flipX) transforms.push(`translate(${cx} ${cy}) scale(-1,1) translate(${-cx} ${-cy})`);
    const transform = transforms.length > 0 ? ` transform="${transforms.join(" ")}"` : "";
    return [{
      ref: attachment.ref,
      attachmentIndex,
      z,
      anchorPoint,
      handlePoint,
      centerPoint: { x: centerX, y: centerY },
      markup: `<image x="${x}" y="${y}" width="${width}" height="${height}" href="${escapeXml(asset.src)}" opacity="${asset.opacity}"${transform}/>`
    }];
  });
}
function normalizeAssetAnchorPoint(rawValue, line) {
  if (rawValue === undefined || rawValue === null || rawValue === "") return "head";
  const value = String(rawValue).trim().toLowerCase();
  if (POSE_POINT_NAME_SET.has(value)) return value;
  throw new Error(`Line ${line}: asset.anchor は ${POSE_POINT_NAMES.join(",")} のいずれかで指定してください`);
}
function resolveAttachmentAnchorPoint(actor, anchorName, poseScale) {
  const resolved = resolvePosePoint(actor._posePoints, anchorName, poseScale);
  if (resolved) return resolved;
  const presetPoints = posePresetPoints(actor.pose, poseScale);
  return presetPoints[anchorName] || presetPoints.head;
}
function posePresetPoints(pose, s) {
  const shoulderY = -s * 1.5;
  const groin = { x: 0, y: -s * 0.8 };
  const armTargets = {
    stand: { lh: { x: -s * 0.55, y: -s * 1 }, rh: { x: s * 0.55, y: -s * 1 } },
    run: { lh: { x: s * 0.7, y: -s * 1.1 }, rh: { x: -s * 0.3, y: -s * 0.6 } },
    sit: { lh: { x: s * 0.4, y: -s * 1.1 }, rh: { x: -s * 0.45, y: -s * 1 } },
    point: { lh: { x: s * 0.9, y: -s * 1.5 }, rh: { x: -s * 0.45, y: -s * 1 } },
    think: { lh: { x: s * 0.2, y: -s * 1.7 }, rh: { x: -s * 0.5, y: -s } },
    surprise: { lh: { x: s * 0.9, y: -s * 1.7 }, rh: { x: -s * 0.9, y: -s * 1.7 } },
  };
  const legTargets = {
    stand: { lk: { x: -s * 0.225, y: -s * 0.4 }, lf: { x: -s * 0.45, y: 0 }, rk: { x: s * 0.225, y: -s * 0.4 }, rf: { x: s * 0.45, y: 0 } },
    run: { lk: { x: -s * 0.45, y: -s * 0.5 }, lf: { x: -s * 0.9, y: -s * 0.2 }, rk: { x: s * 0.4, y: -s * 0.4 }, rf: { x: s * 0.8, y: 0 } },
    sit: { lk: { x: s * 0.6, y: -s * 0.5 }, lf: { x: s, y: -s * 0.5 }, rk: { x: s * 0.3, y: -s * 0.25 }, rf: { x: s * 0.6, y: -s * 0.5 } },
    point: { lk: { x: -s * 0.225, y: -s * 0.4 }, lf: { x: -s * 0.45, y: 0 }, rk: { x: s * 0.225, y: -s * 0.4 }, rf: { x: s * 0.45, y: 0 } },
    think: { lk: { x: -s * 0.175, y: -s * 0.4 }, lf: { x: -s * 0.35, y: 0 }, rk: { x: s * 0.175, y: -s * 0.4 }, rf: { x: s * 0.35, y: 0 } },
    surprise: { lk: { x: -s * 0.3, y: -s * 0.4 }, lf: { x: -s * 0.6, y: 0 }, rk: { x: s * 0.3, y: -s * 0.4 }, rf: { x: s * 0.6, y: 0 } },
  };
  const arm = armTargets[pose] || armTargets.stand;
  const leg = legTargets[pose] || legTargets.stand;
  return {
    head: { x: 0, y: -s * 2.2 },
    neck: { x: 0, y: shoulderY },
    waist: { x: 0, y: (shoulderY + groin.y) / 2 },
    groin,
    le: { x: arm.lh.x / 2, y: (shoulderY + arm.lh.y) / 2 },
    lh: arm.lh,
    re: { x: arm.rh.x / 2, y: (shoulderY + arm.rh.y) / 2 },
    rh: arm.rh,
    lk: leg.lk,
    lf: leg.lf,
    rk: leg.rk,
    rf: leg.rf,
  };
}
function poseSegments(pose, pointZ, s, strokeWidth) {
  const presetPoints = posePresetPoints(pose, s);
  const point = (name) => presetPoints[name] || null;
  return poseLinesWithZ(point, pointZ, strokeWidth);
}
function poseSegmentsFromPoints(points, pointZ, s, strokeWidth) {
  const presetPoints = posePresetPoints("stand", s);
  const point = (name) => resolvePosePoint(points, name, s) || presetPoints[name] || null;
  return poseLinesWithZ(point, pointZ, strokeWidth);
}
function poseLinesWithZ(pointResolver, pointZ, strokeWidth) {
  const lineDefs = [
    ["neck", "le", "le"],
    ["le", "lh", "lh"],
    ["neck", "re", "re"],
    ["re", "rh", "rh"],
    ["neck", "waist", "waist"],
    ["waist", "groin", "groin"],
    ["groin", "lk", "lk"],
    ["lk", "lf", "lf"],
    ["groin", "rk", "rk"],
    ["rk", "rf", "rf"],
  ];
  const segments = [];
  for (let i = 0; i < lineDefs.length; i += 1) {
    const [from, to, zKey] = lineDefs[i];
    const start = pointResolver(from);
    const end = pointResolver(to);
    if (!start || !end) continue;
    segments.push({
      z: num(pointZ?.[zKey], 0),
      order: i,
      markup: `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="black" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    });
  }
  return segments;
}
function eyePath(eye, s, headPoint = { x: 0, y: -s * 2.2 }) {
  const headY = headPoint.y;
  const eyeY = headY - s * 0.04;
  const leftX = headPoint.x - s * 0.14;
  const rightX = headPoint.x + s * 0.14;
  const eyeRadius = s * 0.05;
  const openEyes = (leftDx = 0, leftDy = 0, rightDx = 0, rightDy = 0) => [
    `<circle cx="${leftX}" cy="${eyeY}" r="${eyeRadius}" fill="white" stroke="black" stroke-width="1"/>`,
    `<circle cx="${rightX}" cy="${eyeY}" r="${eyeRadius}" fill="white" stroke="black" stroke-width="1"/>`,
    `<circle cx="${leftX + leftDx}" cy="${eyeY + leftDy}" r="${eyeRadius * 0.45}" fill="black"/>`,
    `<circle cx="${rightX + rightDx}" cy="${eyeY + rightDy}" r="${eyeRadius * 0.45}" fill="black"/>`,
  ].join("");
  if (eye === "left") return openEyes(-s * 0.018, 0, -s * 0.018, 0);
  if (eye === "up") return openEyes(0, -s * 0.018, 0, -s * 0.018);
  if (eye === "down") return openEyes(0, s * 0.018, 0, s * 0.018);
  if (eye === "cry") {
    return [
      openEyes(0, s * 0.015, 0, s * 0.015),
      `<line x1="${leftX}" y1="${eyeY + eyeRadius}" x2="${leftX}" y2="${eyeY + s * 0.2}" stroke="#4fa3ff" stroke-width="1.4"/>`,
      `<line x1="${rightX}" y1="${eyeY + eyeRadius}" x2="${rightX}" y2="${eyeY + s * 0.2}" stroke="#4fa3ff" stroke-width="1.4"/>`,
    ].join("");
  }
  if (eye === "close") {
    return [
      `<line x1="${leftX - s * 0.06}" y1="${eyeY}" x2="${leftX + s * 0.06}" y2="${eyeY}" stroke="black" stroke-width="1.5"/>`,
      `<line x1="${rightX - s * 0.06}" y1="${eyeY}" x2="${rightX + s * 0.06}" y2="${eyeY}" stroke="black" stroke-width="1.5"/>`,
    ].join("");
  }
  if (eye === "wink") {
    return [
      `<line x1="${leftX - s * 0.06}" y1="${eyeY}" x2="${leftX + s * 0.06}" y2="${eyeY}" stroke="black" stroke-width="1.5"/>`,
      `<circle cx="${rightX}" cy="${eyeY}" r="${eyeRadius}" fill="white" stroke="black" stroke-width="1"/>`,
      `<circle cx="${rightX}" cy="${eyeY}" r="${eyeRadius * 0.45}" fill="black"/>`,
    ].join("");
  }
  return openEyes(s * 0.018, 0, s * 0.018, 0);
}
function emotionPath(emotion, s, headPoint = { x: 0, y: -s * 2.2 }) {
  const y = headPoint.y;
  const mouthY = y + s * 0.3;
  if (emotion === "smile") return `<path d="M ${headPoint.x - s * 0.15} ${mouthY} Q ${headPoint.x} ${mouthY + s * 0.15} ${headPoint.x + s * 0.15} ${mouthY}" stroke="black" fill="none" stroke-width="1.5"/>`;
  if (emotion === "sad") return `<path d="M ${headPoint.x - s * 0.15} ${mouthY + s * 0.1} Q ${headPoint.x} ${mouthY - s * 0.1} ${headPoint.x + s * 0.15} ${mouthY + s * 0.1}" stroke="black" fill="none" stroke-width="1.5"/>`;
  if (emotion === "angry") return `<line x1="${headPoint.x - s * 0.2}" y1="${mouthY}" x2="${headPoint.x + s * 0.2}" y2="${mouthY}" stroke="black" stroke-width="2"/>`;
  if (emotion === "panic") return `<circle cx="${headPoint.x}" cy="${mouthY}" r="${s * 0.1}" fill="none" stroke="black" stroke-width="1.5"/>`;
  return `<line x1="${headPoint.x - s * 0.15}" y1="${mouthY}" x2="${headPoint.x + s * 0.15}" y2="${mouthY}" stroke="black" stroke-width="1.5"/>`;
}
function renderBalloon(balloon, panelRect, unit, actorMap, panelMap, panelRects, pageLayouts, defaultTextDirection, kind, id) {
  const r = withinPanel(balloon, panelRect, unit);
  const attrs = renderDataAttrs(kind, id);
  const balloonCenter = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  const rotation = num(balloon.rot, 0);
  const isThoughtBalloon = balloon.shape === "thought";
  let shape = "";
  if (balloon.shape === "box") {
    shape = `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="white" stroke="black"/>`;
  } else if (isThoughtBalloon) {
    shape = `<ellipse cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" rx="${r.w / 2}" ry="${r.h / 2}" fill="white" stroke="black"/>`;
  } else {
    shape = `<ellipse cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" rx="${r.w / 2}" ry="${r.h / 2}" fill="white" stroke="black"/>`;
  }
  let tail = "";
  if (typeof balloon.tail === "string" && balloon.tail.startsWith("toActor(")) {
    const id = balloon.tail.match(/^toActor\((.+)\)$/)?.[1];
    const actor = actorMap.get(String(id));
    if (actor) {
      const actorPanel = panelMap.get(String(actor.panel));
      const pRect = panelRects.get(String(actor.panel));
      const actorPage = actorPanel ? pageLayouts.get(String(actorPanel.page)) : null;
      if (!pRect || !actorPage) {
        const text = renderText(balloon.text, r, balloon.fontSize, balloon.align, balloon.padding, unit, balloon.lineHeight, "center", balloon.textDirection || defaultTextDirection, true, balloon.emphasisFontSize);
        const centerX = r.x + r.w / 2;
        const centerY = r.y + r.h / 2;
        return `<g${attrs} transform="rotate(${balloon.rot} ${centerX} ${centerY})">${shape}${text}</g>`;
      }
      const actorUnit = actorPage.page.unit;
      const targetYOffset = actorUnit === "px" ? BALLOON_TAIL_TARGET_Y_OFFSET.px : BALLOON_TAIL_TARGET_Y_OFFSET.percent;
      const actorFeet = pointInPanel(actor.x, actor.y - targetYOffset, pRect, actorUnit);
      const actorScale = num(actor.scale, 1);
      const actorSize = 20 * actorScale;
      const actorRot = num(actor.rot, 0);
      const faceWidth = actorSize * 0.95;
      const actorRect = {
        x: actorFeet.x - faceWidth / 2,
        y: actorFeet.y - actorSize * 2.7,
        w: faceWidth,
        h: actorSize * 2.7,
      };
      const mouthLocal = { x: 0, y: -actorSize * 1.9 };
      const mouthTarget = rotatePointAround(
        { x: actorFeet.x + mouthLocal.x, y: actorFeet.y + mouthLocal.y },
        actorFeet,
        actorRot,
      );
      const start = resolveBalloonTailStart(r, balloonCenter, mouthTarget, rotation);
      const end = anchorPointOnRectTowardPoint(actorRect, mouthTarget, start);
      tail = isThoughtBalloon
        ? renderThoughtTailBubbles(start, end, r)
        : `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="black"/>`;
    }
  } else if (typeof balloon.tail === "string" && balloon.tail.startsWith("toPoint(")) {
    const match = balloon.tail.match(/^toPoint\(([^,]+),([^,]+)\)$/);
    const x = Number(match?.[1]?.trim());
    const y = Number(match?.[2]?.trim());
    if (Number.isFinite(x) && Number.isFinite(y)) {
      const target = pointInPanel(x, y, panelRect, unit);
      const start = resolveBalloonTailStart(r, balloonCenter, target, rotation);
      tail = isThoughtBalloon
        ? renderThoughtTailBubbles(start, target, r)
        : `<line x1="${start.x}" y1="${start.y}" x2="${target.x}" y2="${target.y}" stroke="black"/>`;
    }
  }
  const text = renderText(balloon.text, r, balloon.fontSize, balloon.align, balloon.padding, unit, balloon.lineHeight, "center", balloon.textDirection || defaultTextDirection, true, balloon.emphasisFontSize);
  const centerX = r.x + r.w / 2;
  const centerY = r.y + r.h / 2;
  return `${tail}<g${attrs} transform="rotate(${rotation} ${centerX} ${centerY})">${shape}${text}</g>`;
}
function resolveBalloonTailStart(balloonRect, balloonCenter, target, rotationDeg) {
  const targetInBalloonFrame = rotatePointAround(target, balloonCenter, -rotationDeg);
  const directionToTarget = resolveOctantDirection(balloonCenter, targetInBalloonFrame);
  const startInBalloonFrame = anchorPointOnRect(balloonRect, directionToTarget);
  return rotatePointAround(startInBalloonFrame, balloonCenter, rotationDeg);
}
function rotatePointAround(point, center, rotationDeg) {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}
function renderThoughtTailBubbles(balloonAnchor, targetAnchor, balloonRect) {
  const diameterBase = Math.max(6, Math.min(balloonRect.w, balloonRect.h) * 0.08);
  const radii = [diameterBase * 0.22, diameterBase * 0.33, diameterBase * 0.45];
  const stops = [0.32, 0.52, 0.72];
  return stops
    .map((t, index) => {
      const x = targetAnchor.x + (balloonAnchor.x - targetAnchor.x) * t;
      const y = targetAnchor.y + (balloonAnchor.y - targetAnchor.y) * t;
      return `<circle cx="${x}" cy="${y}" r="${radii[index]}" fill="white" stroke="black"/>`;
    })
    .join("");
}
function resolveOctantDirection(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const xDir = Math.abs(dx) < 1e-6 ? 0 : dx > 0 ? 1 : -1;
  const yDir = Math.abs(dy) < 1e-6 ? 0 : dy > 0 ? 1 : -1;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (xDir === 0 && yDir === 0) return "bottom";
  if (xDir === 0) return yDir > 0 ? "bottom" : "top";
  if (yDir === 0) return xDir > 0 ? "right" : "left";
  if (absX > absY * 1.5) return xDir > 0 ? "right" : "left";
  if (absY > absX * 1.5) return yDir > 0 ? "bottom" : "top";
  if (xDir > 0 && yDir > 0) return "bottomRight";
  if (xDir > 0 && yDir < 0) return "topRight";
  if (xDir < 0 && yDir > 0) return "bottomLeft";
  return "topLeft";
}
function anchorPointOnRect(rect, direction) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const anchors = {
    top: { x: cx, y: rect.y },
    bottom: { x: cx, y: rect.y + rect.h },
    left: { x: rect.x, y: cy },
    right: { x: rect.x + rect.w, y: cy },
    topLeft: { x: rect.x, y: rect.y },
    topRight: { x: rect.x + rect.w, y: rect.y },
    bottomLeft: { x: rect.x, y: rect.y + rect.h },
    bottomRight: { x: rect.x + rect.w, y: rect.y + rect.h },
  };
  return anchors[direction] || anchors.bottom;
}
function anchorPointOnRectTowardPoint(rect, fromPoint, towardPoint) {
  const dx = towardPoint.x - fromPoint.x;
  const dy = towardPoint.y - fromPoint.y;
  const epsilon = 1e-6;
  if (Math.abs(dx) < epsilon && Math.abs(dy) < epsilon) {
    return { x: fromPoint.x, y: fromPoint.y };
  }
  const candidates = [];
  const pushCandidate = (t, x, y) => {
    if (t <= epsilon) return;
    if (x < rect.x - epsilon || x > rect.x + rect.w + epsilon) return;
    if (y < rect.y - epsilon || y > rect.y + rect.h + epsilon) return;
    candidates.push({ t, x, y });
  };
  if (Math.abs(dx) >= epsilon) {
    const leftT = (rect.x - fromPoint.x) / dx;
    pushCandidate(leftT, rect.x, fromPoint.y + dy * leftT);
    const rightT = (rect.x + rect.w - fromPoint.x) / dx;
    pushCandidate(rightT, rect.x + rect.w, fromPoint.y + dy * rightT);
  }
  if (Math.abs(dy) >= epsilon) {
    const topT = (rect.y - fromPoint.y) / dy;
    pushCandidate(topT, fromPoint.x + dx * topT, rect.y);
    const bottomT = (rect.y + rect.h - fromPoint.y) / dy;
    pushCandidate(bottomT, fromPoint.x + dx * bottomT, rect.y + rect.h);
  }
  if (candidates.length === 0) {
    const fallbackDirection = resolveOctantDirection(fromPoint, towardPoint);
    return anchorPointOnRect(rect, fallbackDirection);
  }
  candidates.sort((a, b) => a.t - b.t);
  const closest = candidates[0];
  return { x: closest.x, y: closest.y };
}
function renderCaption(caption, panelRect, unit, defaultTextDirection, kind, id) {
  const r = withinPanel(caption, panelRect, unit);
  const attrs = renderDataAttrs(kind, id);
  const box = caption.style === "none" ? "" : `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="white" stroke="black"/>`;
  const text = renderText(
    caption.text,
    r,
    caption.fontSize,
    caption.align,
    caption.padding,
    unit,
    caption.lineHeight,
    caption.valign,
    caption.textDirection || defaultTextDirection,
    true,
    caption.emphasisFontSize,
  );
  const centerX = r.x + r.w / 2;
  const centerY = r.y + r.h / 2;
  return `<g${attrs} transform="rotate(${caption.rot} ${centerX} ${centerY})">${box}${text}</g>`;
}
function renderSfx(sfx, panelRect, unit, defaultTextDirection, kind, id) {
  const p = pointInPanel(sfx.x, sfx.y, panelRect, unit);
  const attrs = renderDataAttrs(kind, id);
  const fontSize = sizeInUnit(sfx.fontSize, panelRect, unit, "x");
  const direction = sfx.textDirection || defaultTextDirection;
  const textAttrs = direction === "vertical" ? ' writing-mode="vertical-rl" text-orientation="upright"' : '';
  return `<text${attrs} x="${p.x}" y="${p.y}" font-size="${fontSize}" transform="rotate(${sfx.rot} ${p.x} ${p.y}) scale(${sfx.scale})" fill="${sfx.fill}" stroke="${sfx.stroke || "none"}" stroke-width="${sfx.strokeWidth}" font-weight="${sfx.fontWeight}"${textAttrs}>${escapeXml(sfx.text)}</text>`;
}
function renderObject(object, panelRect, unit, defaultTextDirection, kind, id) {
  const r = withinPanel({ ...object, w: object.w, h: object.h }, panelRect, unit);
  const attrs = renderDataAttrs(kind, id);
  const border = normalizeTextSize(object.border, unit);
  const borderWidth = border.unit === "percent" ? sizeInUnit(border.value, r, "percent", "x") : border.value;
  let shape = "";
  if (object.shape === "rect") {
    shape = `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="none" stroke="black" stroke-width="${borderWidth}"/>`;
  } else if (object.shape === "circle") {
    const radius = Math.min(r.w, r.h) / 2;
    shape = `<circle cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" r="${radius}" fill="none" stroke="black" stroke-width="${borderWidth}"/>`;
  } else if (object.shape === "oval") {
    shape = `<ellipse cx="${r.x + r.w / 2}" cy="${r.y + r.h / 2}" rx="${r.w / 2}" ry="${r.h / 2}" fill="none" stroke="black" stroke-width="${borderWidth}"/>`;
  }
  const text = renderText(object.text, r, object.fontSize, object.align, object.padding, unit, object.lineHeight, "center", object.textDirection || defaultTextDirection);
  const centerX = r.x + r.w / 2;
  const centerY = r.y + r.h / 2;
  return `<g${attrs} transform="rotate(${object.rot} ${centerX} ${centerY})">${shape}${text}</g>`;
}
function renderBoxArrow(boxarrow, panelRect, unit, kind, id) {
  const center = pointInPanel(boxarrow.x, boxarrow.y, panelRect, unit);
  const attrs = renderDataAttrs(kind, id);
  const w = sizeInUnit(boxarrow.w, panelRect, unit, "x");
  const h = sizeInUnit(boxarrow.h, panelRect, unit, "y");
  const points = [
    [-w / 2, boxarrow.py * h - h / 2],
    [boxarrow.px * w - w / 2, boxarrow.py * h - h / 2],
    [boxarrow.px * w - w / 2, -h / 2],
    [w / 2, 0 ],
    [boxarrow.px * w - w / 2, +h / 2],
    [boxarrow.px * w - w / 2, -boxarrow.py * h + h / 2],
    [-w / 2, -boxarrow.py * h + h / 2],
  ];
  const pointsAttr = points.map(([x, y]) => `${x},${y}`).join(" ");
  return `<g${attrs} transform="translate(${center.x} ${center.y}) rotate(${boxarrow.rot}) scale(${boxarrow.scale})" opacity="${boxarrow.opacity}"><polygon points="${pointsAttr}" fill="${boxarrow.fill}" stroke="${boxarrow.stroke}" stroke-width="2"/></g>`;
}
function renderText(text, rect, fontSize, align, padding, unit, lineHeight = 1.2, verticalAlign = "top", textDirection = "horizontal", enableMath = false, emphasisFontSize = null) {
  const rawText = String(text);
  const lines = rawText.split("\n");
  const direction = textDirection === "vertical" ? "vertical" : "horizontal";
  const sizeSpec = normalizeTextSize(fontSize, unit);
  const baseSize = sizeSpec.unit === "percent" ? sizeSpec.value / 100 * rect.w : sizeSpec.value;
  const paddingX = sizeInUnit(padding, rect, unit, "x");
  const paddingY = sizeInUnit(padding, rect, unit, "y");
  const emphasisSpec = normalizeOptionalTextSize(emphasisFontSize, sizeSpec.unit);
  const emphasisSize = emphasisSpec ? (emphasisSpec.unit === "percent" ? emphasisSpec.value / 100 * rect.w : emphasisSpec.value) : baseSize * 1.35;
  if (direction === "vertical") {
    const emphasisLines = lines.map(tokenizeEmphasisLine);
    const hasEmphasis = emphasisLines.some((segments) => segments.some((segment) => segment.emphasis));
    const x0 = align === "left"
      ? rect.x + rect.w - paddingX - baseSize * 0.5
      : align === "right"
        ? rect.x + paddingX + baseSize * 0.5
        : rect.x + rect.w / 2;
    const columnStep = baseSize * lineHeight;
    const totalTextWidth = baseSize + (lines.length - 1) * columnStep;
    const startX = verticalAlign === "center"
      ? x0 + totalTextWidth / 2 - baseSize / 2
      : verticalAlign === "bottom"
        ? x0 + totalTextWidth - baseSize
        : x0;
    const y = verticalAlign === "center"
      ? rect.y + paddingY + (rect.h - paddingY * 2) / 2
      : verticalAlign === "bottom"
        ? rect.y + rect.h - paddingY
        : rect.y + paddingY;
    const anchor = verticalAlign === "center" ? "middle" : verticalAlign === "bottom" ? "end" : "start";
    const tspans = hasEmphasis
      ? emphasisLines.map((segments, i) => {
        const content = segments.map((segment) => {
          const segmentSize = segment.emphasis ? emphasisSize : baseSize;
          return `<tspan font-size="${segmentSize}">${escapeXml(segment.value)}</tspan>`;
        }).join("");
        return `<tspan x="${startX - i * columnStep}" y="${y}">${content}</tspan>`;
      }).join("")
      : lines.map((line, i) => `<tspan x="${startX - i * columnStep}" y="${y}">${escapeXml(line)}</tspan>`).join("");
    return `<text x="${startX}" y="${y}" font-size="${baseSize}" text-anchor="${anchor}" writing-mode="vertical-rl" text-orientation="upright">${tspans}</text>`;
  }
  if (enableMath) {
    const tokenized = tokenizeRichText(rawText);
    if (hasRichSyntax(tokenized)) {
      return renderHorizontalRichText(tokenized.lines, rect, baseSize, emphasisSize, align, paddingX, paddingY, lineHeight, verticalAlign);
    }
  }
  const x = align === "left" ? rect.x + paddingX : align === "right" ? rect.x + rect.w - paddingX : rect.x + rect.w / 2;
  const anchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
  const totalTextHeight = baseSize + (lines.length - 1) * baseSize * lineHeight;
  const y0 = verticalAlign === "center"
    ? rect.y + paddingY + (rect.h - paddingY * 2 - totalTextHeight) / 2 + baseSize
    : verticalAlign === "bottom"
      ? rect.y + rect.h - paddingY - totalTextHeight + baseSize
      : rect.y + baseSize + paddingY;
  const tspans = lines.map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : baseSize * lineHeight}">${escapeXml(line)}</tspan>`).join("");
  return `<text x="${x}" y="${y0}" font-size="${baseSize}" text-anchor="${anchor}">${tspans}</text>`;
}
function hasRichSyntax(tokenized) {
  const hasMath = tokenized.tokens.some((token) => token.type === "math");
  if (hasMath) return true;
  return tokenized.lines.some((line) => line.some((token) => token.type === "emphasis"));
}
function tokenizeRichText(text) {
  const tokens = [];
  let cursor = 0;
  while (cursor < text.length) {
    if (text.startsWith("$$", cursor)) {
      const end = text.indexOf("$$", cursor + 2);
      if (end === -1) {
        tokens.push({ type: "text", value: text.slice(cursor) });
        break;
      }
      tokens.push({ type: "math", value: text.slice(cursor, end + 2) });
      cursor = end + 2;
      continue;
    }
    if (text[cursor] === "$") {
      const newline = text.indexOf("\n", cursor + 1);
      const searchEnd = newline === -1 ? text.length : newline;
      const end = text.indexOf("$", cursor + 1);
      if (end !== -1 && end < searchEnd) {
        tokens.push({ type: "math", value: text.slice(cursor, end + 1) });
        cursor = end + 1;
        continue;
      }
      tokens.push({ type: "text", value: "$" });
      cursor += 1;
      continue;
    }
    const nextMathStart = text.indexOf("$", cursor);
    const end = nextMathStart === -1 ? text.length : nextMathStart;
    tokens.push({ type: "text", value: text.slice(cursor, end) });
    cursor = end;
  }
  const lines = [[]];
  for (const token of tokens) {
    if (token.type === "math") {
      lines[lines.length - 1].push(token);
      continue;
    }
    const chunks = token.value.split("\n");
    chunks.forEach((chunk, index) => {
      if (chunk) lines[lines.length - 1].push(...tokenizeEmphasisLine(chunk));
      if (index < chunks.length - 1) lines.push([]);
    });
  }
  return { tokens, lines };
}
function tokenizeEmphasisLine(text) {
  const segments = [];
  let cursor = 0;
  while (cursor < text.length) {
    const start = text.indexOf("**", cursor);
    if (start === -1) {
      if (cursor < text.length) segments.push({ type: "text", value: text.slice(cursor), emphasis: false });
      break;
    }
    if (start > cursor) segments.push({ type: "text", value: text.slice(cursor, start), emphasis: false });
    const end = text.indexOf("**", start + 2);
    if (end === -1) {
      segments.push({ type: "text", value: text.slice(start), emphasis: false });
      break;
    }
    const emphasized = text.slice(start + 2, end);
    if (emphasized) segments.push({ type: "emphasis", value: emphasized, emphasis: true });
    cursor = end + 2;
  }
  return segments;
}
function renderHorizontalRichText(lines, rect, baseSize, emphasisSize, align, paddingX, paddingY, lineHeight, verticalAlign) {
  const renderedLines = lines.map((lineTokens) => renderLineWithRichTokens(lineTokens, baseSize, emphasisSize));
  if (!renderedLines.length) return "";
  const baselineSteps = renderedLines.map((_line, index) => {
    if (index === 0) return 0;
    const previousLine = renderedLines[index - 1];
    const currentLine = renderedLines[index];
    return Math.max(baseSize * lineHeight, previousLine.descent + currentLine.ascent);
  });
  const totalTextHeight = renderedLines[0].ascent
    + baselineSteps.slice(1).reduce((sum, step) => sum + step, 0)
    + renderedLines[renderedLines.length - 1].descent;
  const contentTop = verticalAlign === "center"
    ? rect.y + paddingY + (rect.h - paddingY * 2 - totalTextHeight) / 2
    : rect.y + paddingY;
  const firstBaseline = contentTop + renderedLines[0].ascent;
  const availableWidth = rect.w - paddingX * 2;
  return renderedLines.map((line, i) => {
    const baselineY = firstBaseline + baselineSteps.slice(1, i + 1).reduce((sum, step) => sum + step, 0);
    const startX = align === "left"
      ? rect.x + paddingX
      : align === "right"
        ? rect.x + rect.w - paddingX - line.width
        : rect.x + rect.w / 2 - line.width / 2;
    let cursorX = startX;
    const chunks = line.parts.map((part) => {
      if (part.type === "text") {
        const weightAttr = part.emphasis ? ' font-weight="700"' : "";
        const markup = `<text x="${cursorX}" y="${baselineY}" font-size="${part.fontSize || baseSize}" text-anchor="start"${weightAttr}>${escapeXml(part.value)}</text>`;
        cursorX += part.width;
        return markup;
      }
      const topY = baselineY - part.ascent;
      const markup = `<svg x="${cursorX}" y="${topY}" width="${part.width}" height="${part.height}" viewBox="${part.viewBox}" overflow="visible">${part.inner}</svg>`;
      cursorX += part.width;
      return markup;
    }).join("");
    return `<g clip-path="inset(0 ${Math.max(0, line.width - availableWidth)} 0 0)">${chunks}</g>`;
  }).join("");
}
function renderLineWithRichTokens(tokens, baseSize, emphasisSize) {
  const parts = tokens.map((token) => {
    if (token.type === "math") return renderMathToken(token.value, baseSize);
    return renderPlainTextToken(token.value, token.type === "emphasis" ? emphasisSize : baseSize, token.type === "emphasis");
  });
  const width = parts.reduce((sum, part) => sum + part.width, 0);
  const ascent = parts.reduce((max, part) => Math.max(max, part.ascent ?? baseSize * 0.8), baseSize * 0.8);
  const descent = parts.reduce((max, part) => Math.max(max, part.descent ?? baseSize * 0.2), baseSize * 0.2);
  return { parts, width, ascent, descent };
}
function renderPlainTextToken(text, baseSize, emphasis = false) {
  if (TEXT_METRICS_CONTEXT) TEXT_METRICS_CONTEXT.font = `${emphasis ? "700 " : ""}${baseSize}px sans-serif`;
  const width = TEXT_METRICS_CONTEXT ? TEXT_METRICS_CONTEXT.measureText(text).width : text.length * baseSize * 0.6;
  return { type: "text", value: text, width, ascent: baseSize * 0.8, descent: baseSize * 0.2, fontSize: baseSize, emphasis };
}
function renderMathToken(token, baseSize) {
  const tex = token.startsWith("$$") ? token.slice(2, -2) : token.slice(1, -1);
  const display = token.startsWith("$$");
  const mathjax = window.MathJax;
  if (!mathjax || typeof mathjax.tex2svg !== "function") {
    return renderPlainTextToken(token, baseSize);
  }
  try {
    const node = mathjax.tex2svg(tex, { display });
    const svg = node.querySelector("svg");
    if (!svg) return renderPlainTextToken(token, baseSize);
    const width = cssLengthToPx(svg.getAttribute("width"), baseSize);
    const height = cssLengthToPx(svg.getAttribute("height"), baseSize);
    const ascentRatio = display ? 0.5 : 0.8;
    const ascent = height * ascentRatio;
    return {
      type: "math",
      width,
      height,
      ascent,
      descent: Math.max(0, height - ascent),
      inner: svg.innerHTML,
      viewBox: svg.getAttribute("viewBox") || `0 0 ${Math.max(1, width)} ${Math.max(1, height)}`,
    };
  } catch (_error) {
    return renderPlainTextToken(token, baseSize);
  }
}
function normalizeOptionalTextSize(fontSize, defaultUnit) {
  if (fontSize === undefined || fontSize === null || fontSize === "") return null;
  return normalizeTextSize(fontSize, defaultUnit);
}
function parseOptionalSizedValue(value, defaultUnit) {
  if (value === undefined || value === null || value === "") return null;
  return parseSizedValue(value, 0, defaultUnit);
}
function cssLengthToPx(value, baseSize) {
  if (!value) return baseSize;
  const m = String(value).trim().match(/^([\d.]+)(px|em|ex)?$/);
  if (!m) return baseSize;
  const n = Number(m[1]);
  const unit = m[2] || "px";
  if (unit === "px") return n;
  if (unit === "em") return n * baseSize;
  if (unit === "ex") return n * (baseSize / 2 || MATH_EX_TO_PX);
  return n;
}
function normalizeTextSize(fontSize, defaultUnit) {
  if (typeof fontSize === "object" && fontSize && typeof fontSize.value === "number") {
    return { value: fontSize.value, unit: fontSize.unit === "px" ? "px" : "percent" };
  }
  return { value: num(fontSize, 4), unit: defaultUnit };
}
function rectInPage(box, inner, unit, percentReference = "page-inner", baseRect = null) {
  if (unit === "px") return { x: inner.x + box.x, y: inner.y + box.y, w: box.w, h: box.h };
  const basisRect = percentReference === "base-size" && baseRect ? baseRect : inner;
  const basisProjection = {
    x: basisRect.x + basisRect.w * (box.x / 100),
    y: basisRect.y + basisRect.h * (box.y / 100),
    w: basisRect.w * (box.w / 100),
    h: basisRect.h * (box.h / 100),
  };
  if (basisRect === inner) return basisProjection;
  return { draw: projectRect(basisProjection, basisRect, inner), basis: basisProjection };
}
function withinPanel(box, panelRect, unit) {
  const targetRect = rectTarget(panelRect);
  const basisRect = rectBasis(panelRect);
  if (unit === "px") return { x: targetRect.x + box.x, y: targetRect.y + box.y, w: box.w, h: box.h };
  const basisProjection = {
    x: basisRect.x + basisRect.w * (box.x / 100),
    y: basisRect.y + basisRect.h * (box.y / 100),
    w: basisRect.w * (box.w / 100),
    h: basisRect.h * (box.h / 100),
  };
  return projectRect(basisProjection, basisRect, targetRect);
}
function pointInPanel(x, y, panelRect, unit) {
  const targetRect = rectTarget(panelRect);
  const basisRect = rectBasis(panelRect);
  if (unit === "px") return { x: targetRect.x + x, y: targetRect.y + y };
  const p = {
    x: basisRect.x + basisRect.w * (x / 100),
    y: basisRect.y + basisRect.h * (y / 100),
  };
  return {
    x: targetRect.x + (p.x - basisRect.x) * (basisRect.w === 0 ? 1 : targetRect.w / basisRect.w),
    y: targetRect.y + (p.y - basisRect.y) * (basisRect.h === 0 ? 1 : targetRect.h / basisRect.h),
  };
}
function pointFromPanel(point, panelRect, unit) {
  const targetRect = rectTarget(panelRect);
  const basisRect = rectBasis(panelRect);
  if (unit === "px") return { x: point.x - targetRect.x, y: point.y - targetRect.y };
  const projected = {
    x: basisRect.x + (point.x - targetRect.x) * (targetRect.w === 0 ? 1 : basisRect.w / targetRect.w),
    y: basisRect.y + (point.y - targetRect.y) * (targetRect.h === 0 ? 1 : basisRect.h / targetRect.h),
  };
  return {
    x: basisRect.w === 0 ? 0 : ((projected.x - basisRect.x) / basisRect.w) * 100,
    y: basisRect.h === 0 ? 0 : ((projected.y - basisRect.y) / basisRect.h) * 100,
  };
}
function rectFromPanel(rect, panelRect, unit) {
  const targetRect = rectTarget(panelRect);
  const basisRect = rectBasis(panelRect);
  if (unit === "px") {
    return { x: rect.x - targetRect.x, y: rect.y - targetRect.y, w: rect.w, h: rect.h };
  }
  const projected = projectRect(rect, targetRect, basisRect);
  return {
    x: basisRect.w === 0 ? 0 : ((projected.x - basisRect.x) / basisRect.w) * 100,
    y: basisRect.h === 0 ? 0 : ((projected.y - basisRect.y) / basisRect.h) * 100,
    w: basisRect.w === 0 ? 0 : (projected.w / basisRect.w) * 100,
    h: basisRect.h === 0 ? 0 : (projected.h / basisRect.h) * 100,
  };
}
function clampPointToRect(point, rect) {
  return {
    x: Math.max(rect.x, Math.min(rect.x + rect.w, point.x)),
    y: Math.max(rect.y, Math.min(rect.y + rect.h, point.y)),
  };
}
function clampRectToRect(rect, bounds) {
  const maxX = bounds.x + Math.max(0, bounds.w - rect.w);
  const maxY = bounds.y + Math.max(0, bounds.h - rect.h);
  return {
    ...rect,
    x: Math.max(bounds.x, Math.min(maxX, rect.x)),
    y: Math.max(bounds.y, Math.min(maxY, rect.y)),
  };
}
function roundedCoord(value, unit) {
  if (unit === "px") return Math.round(value);
  return Math.round(value * 100) / 100;
}
function roundedPoseCoord(value) {
  return roundedCoord(value, "percent");
}
function resolveAttachmentDragBasis(asset) {
  if (asset?.dragBasis === "center") return "center";
  return "top-left";
}
function posePointsToDslString(pointsByName, scale) {
  const safeScale = scale || 1;
  const values = [];
  for (const name of POSE_POINT_NAMES) {
    const point = pointsByName[name] || { x: 0, y: 0 };
    values.push(String(roundedPoseCoord(point.x / safeScale)));
    values.push(String(roundedPoseCoord(point.y / safeScale)));
  }
  return values.join(",");
}
function roundedRotation(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? Math.round(rounded) : rounded;
}
function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}
function angleFromPointClockwiseTop(point, center) {
  const radians = Math.atan2(point.y - center.y, point.x - center.x);
  return normalizeDegrees((radians * 180) / Math.PI + 90);
}
function signedAngleDelta(current, start) {
  return ((current - start + 540) % 360) - 180;
}
function sizeInUnit(v, rect, unit, axis) {
  const basisRect = rectBasis(rect);
  const targetRect = rectTarget(rect);
  if (unit === "px") return v;
  const basisSize = axis === "x" ? basisRect.w : basisRect.h;
  const targetSize = axis === "x" ? targetRect.w : targetRect.h;
  const basisValue = basisSize * (v / 100);
  return basisValue * (basisSize === 0 ? 1 : targetSize / basisSize);
}
function pageDimensions(page) {
  if (page.size === "custom") return [page.width, page.height];
  return PAGE_SIZES[page.size] || PAGE_SIZES.B5;
}
function escapeXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}
function syncDragHandleModeClass() {
  els.canvas.classList.toggle("drag-handle-active", isDragHandleModeEnabled() || isPoseEditModeEnabled());
}
function syncHandUiFromSelectedActor() {
  if (!currentScene || !selectedActorId) return;
  const actor = currentScene.actors?.find((entry) => String(entry.id) === String(selectedActorId));
  if (!actor) return;
  const hand = actor.appendages?.find((appendage) => appendage?.kind === "hand");
  if (!hand) return;
  if (els.handPresetSelect) {
    els.handPresetSelect.value = normalizeHandPreset(hand.preset);
  }
  if (els.handAppendageToggle) {
    els.handAppendageToggle.checked = hand.handVisible !== false;
  }
}
function applyHandUiStateToActorBlock(actorBlock, actorId) {
  if (!actorBlock || actorBlock.type !== "actor" || String(actorBlock.props.id) !== String(actorId)) return;
  if (!Array.isArray(actorBlock.props.appendages)) return;
  for (const appendage of actorBlock.props.appendages) {
    if (!appendage || typeof appendage !== "object" || appendage.kind !== "hand") continue;
    appendage.preset = selectedHandPresetValue();
    appendage.handVisible = isHandAppendageVisibleInUi();
    const hasExplicitChains = Array.isArray(appendage.chains) && appendage.chains.length > 0;
    const detailEdited = parseBooleanLike(appendage.handDetailEdited, hasExplicitChains);
    if (detailEdited) {
      appendage.handDetailEdited = true;
    } else {
      delete appendage.handDetailEdited;
      delete appendage.chains;
    }
  }
}
function update() {
  try {
    const blocks = parseBlocks(els.input.value);
    const scene = validateAndBuild(blocks);
    currentScene = scene;
    const svg = render(scene);
    lastGoodSvg = svg;
    els.canvas.innerHTML = svg;
    els.errorBox.hidden = true;
    els.banner.hidden = true;
    syncHandUiFromSelectedActor();
  } catch (err) {
    if (lastGoodSvg) {
      els.canvas.innerHTML = lastGoodSvg;
      els.banner.hidden = false;
      els.banner.textContent = `パース/検証エラー: ${err.message}`;
    }
    els.errorBox.hidden = false;
    els.errorBox.textContent = String(err.message);
  } finally {
    syncDragHandleModeClass();
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
    if (isObjectDragging) return;
    if (e.target.closest?.("[data-kind][data-id]")) return;
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
function setupObjectDrag() {
  const DRAGGABLE_KINDS = new Set(["actor", "object", "balloon", "caption", "boxarrow", "sfx"]);
  let state = null;

  function sceneCollectionKey(kind) {
    if (kind === "sfx") return "sfx";
    if (kind === "boxarrow") return "boxarrows";
    return `${kind}s`;
  }

  function escapeCssValue(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function dragTargetsFor(kind, id) {
    const kindSelector = escapeCssValue(String(kind));
    const idSelector = escapeCssValue(String(id));
    const selector = `[data-kind="${kindSelector}"][data-id="${idSelector}"]`;
    return Array.from(els.canvas.querySelectorAll(selector)).map((element) => ({
      element,
      originalTransform: element.getAttribute("transform") || "",
    }));
  }

  function scenePointFromEvent(event) {
    const group = els.canvas.querySelector("svg > g");
    if (!group || typeof group.getScreenCTM !== "function") return null;
    const matrix = group.getScreenCTM();
    if (!matrix) return null;
    const svg = group.ownerSVGElement;
    if (!svg || typeof svg.createSVGPoint !== "function") return null;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(matrix.inverse());
  }

  function actorLocalPointFromScene(scenePoint, actor, panelRect, unit) {
    const center = pointInPanel(actor.x, actor.y, panelRect, unit);
    const dx = scenePoint.x - center.x;
    const dy = scenePoint.y - center.y;
    const radians = (num(actor.rot, 0) * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const unrotatedX = dx * cos + dy * sin;
    const unrotatedY = -dx * sin + dy * cos;
    const mirror = actor.facing === "left" ? -1 : 1;
    return { x: unrotatedX * mirror, y: unrotatedY };
  }

  function actorWithPanel(actorId) {
    const actor = currentScene?.actors?.find((entry) => String(entry.id) === String(actorId));
    if (!actor) return null;
    const panel = currentScene.panels.find((entry) => String(entry.id) === String(actor.panel));
    if (!panel) return null;
    const pageLayouts = buildPageLayouts(currentScene);
    const panelRects = buildPanelRects(currentScene, pageLayouts);
    const panelRect = panelRects.get(String(panel.id));
    const pageLayout = pageLayouts.get(String(panel.page));
    if (!panelRect || !pageLayout) return null;
    return { actor, panelRect, unit: pageLayout.page.unit };
  }

  function findBlock(blocks, kind, id) {
    return blocks.find((block) => block.type === kind && String(block.props.id) === id);
  }

  function attachmentDeltaFromScenePoint(scenePoint, actorState) {
    if (!actorState?.actor || !actorState?.asset || !actorState.panelRect) return null;
    const localPoint = actorLocalPointFromScene(scenePoint, actorState.actor, actorState.panelRect, actorState.unit);
    const actorScale = num(actorState.actor.scale, 0);
    const safeActorScale = Math.max(Math.abs(actorScale), 1e-6);
    const poseScale = 20 * safeActorScale;
    const anchorPoint = resolveAttachmentAnchorPoint(actorState.actor, actorState.asset.anchor, poseScale);
    const attachmentScale = safeActorScale * (actorState.attachment?.s ?? actorState.asset.s ?? 1);
    const width = num(actorState.asset.w, 0) * attachmentScale;
    const height = num(actorState.asset.h, 0) * attachmentScale;
    const dragBasis = resolveAttachmentDragBasis(actorState.asset);
    const basisOffsetX = dragBasis === "center" ? width / 2 : 0;
    const basisOffsetY = dragBasis === "center" ? height / 2 : 0;
    const rawDx = (localPoint.x - anchorPoint.x - basisOffsetX) / safeActorScale;
    const rawDy = (localPoint.y - anchorPoint.y - basisOffsetY) / safeActorScale;
    if (!Number.isFinite(rawDx) || !Number.isFinite(rawDy)) return null;
    return {
      dx: rawDx,
      dy: rawDy,
      roundedDx: roundedPoseCoord(rawDx),
      roundedDy: roundedPoseCoord(rawDy),
      localPoint,
    };
  }

  els.canvas.addEventListener("pointerdown", (event) => {
    if (!currentScene) return;
    const target = event.target.closest?.("[data-kind][data-id]");
    if (!target) return;
    const kind = target.dataset.kind;
    const id = target.dataset.id;
    if (kind === "actor" && id) {
      const selectionChanged = String(selectedActorId) !== String(id);
      selectedActorId = id;
      syncHandUiFromSelectedActor();
      if (selectionChanged && isPoseEditModeEnabled() && !target.dataset.posePoint) {
        update();
      }
    }
    const attachmentIndex = target.dataset.attachmentIndex;
    const attachmentRef = target.dataset.attachmentRef;
    if (attachmentIndex !== undefined) {
      if (!isPoseEditModeEnabled() || kind !== "actor" || !id) return;
      if (attachmentRef === undefined) return;
      const actorInfo = actorWithPanel(id);
      if (!actorInfo) return;
      const parsedAttachmentIndex = Number.parseInt(attachmentIndex, 10);
      if (!Number.isInteger(parsedAttachmentIndex) || parsedAttachmentIndex < 0) return;
      const actorAttachment = actorInfo.actor.attachments?.[parsedAttachmentIndex];
      if (!actorAttachment || String(actorAttachment.ref) !== String(attachmentRef)) return;
      const asset = currentScene?.assets?.find((entry) => String(entry.id) === String(actorAttachment.ref));
      if (!asset) return;
      const start = scenePointFromEvent(event);
      if (!start) return;
      const attachmentPointTargets = Array.from(els.canvas.querySelectorAll(
        `[data-kind="actor"][data-id="${escapeCssValue(String(id))}"][data-attachment-index="${escapeCssValue(String(parsedAttachmentIndex))}"][data-attachment-ref="${escapeCssValue(String(attachmentRef))}"]`
      ));
      const startDelta = attachmentDeltaFromScenePoint(start, {
        actor: actorInfo.actor,
        attachment: actorAttachment,
        asset,
        panelRect: actorInfo.panelRect,
        unit: actorInfo.unit,
      });
      if (!startDelta) return;
      target.setPointerCapture(event.pointerId);
      isObjectDragging = true;
      state = {
        pointerId: event.pointerId,
        captureTarget: target,
        targets: [],
        kind: "actor",
        id,
        handleType: "attachment-point",
        actor: actorInfo.actor,
        attachmentIndex: parsedAttachmentIndex,
        attachmentRef: String(attachmentRef),
        attachment: actorAttachment,
        asset,
        start,
        panelRect: actorInfo.panelRect,
        unit: actorInfo.unit,
        startDx: startDelta.dx,
        startDy: startDelta.dy,
        attachmentPointTargets,
      };
      event.preventDefault();
      return;
    }
    const appendageIndex = target.dataset.appendageIndex;
    const chainIndex = target.dataset.chainIndex;
    const chainPointIndex = target.dataset.chainPointIndex;
    if (appendageIndex !== undefined && chainIndex !== undefined && chainPointIndex !== undefined) {
      if (!isHandDetailEditModeEnabled() || kind !== "actor" || !id) return;
      const actorInfo = actorWithPanel(id);
      if (!actorInfo) return;
      const parsedAppendageIndex = Number.parseInt(appendageIndex, 10);
      const parsedChainIndex = Number.parseInt(chainIndex, 10);
      const parsedChainPointIndex = Number.parseInt(chainPointIndex, 10);
      if (!Number.isInteger(parsedAppendageIndex) || !Number.isInteger(parsedChainIndex) || !Number.isInteger(parsedChainPointIndex)) return;
      const actorAppendage = actorInfo.actor.appendages?.[parsedAppendageIndex];
      const chain = actorAppendage?.chains?.[parsedChainIndex];
      const pointInChain = chain?.points?.[parsedChainPointIndex];
      if (!actorAppendage || actorAppendage.kind !== "hand" || !pointInChain) return;
      const start = scenePointFromEvent(event);
      if (!start) return;
      const chainPointTargets = Array.from(els.canvas.querySelectorAll(
        `[data-kind="actor"][data-id="${escapeCssValue(String(id))}"][data-appendage-index="${escapeCssValue(String(parsedAppendageIndex))}"][data-chain-index="${escapeCssValue(String(parsedChainIndex))}"][data-chain-point-index="${escapeCssValue(String(parsedChainPointIndex))}"]`
      ));
      target.setPointerCapture(event.pointerId);
      isObjectDragging = true;
      state = {
        pointerId: event.pointerId,
        captureTarget: target,
        targets: [],
        kind: "actor",
        id,
        handleType: "hand-chain-point",
        actor: actorInfo.actor,
        appendageIndex: parsedAppendageIndex,
        chainIndex: parsedChainIndex,
        chainPointIndex: parsedChainPointIndex,
        appendage: actorAppendage,
        start,
        panelRect: actorInfo.panelRect,
        unit: actorInfo.unit,
        chainPointTargets,
      };
      event.preventDefault();
      return;
    }
    const posePointName = target.dataset.posePoint;
    if (posePointName) {
      if (!isPoseEditModeEnabled() || kind !== "actor" || !id) return;
      const actorInfo = actorWithPanel(id);
      if (!actorInfo) return;
      const start = scenePointFromEvent(event);
      if (!start) return;
      const actorScale = 20 * actorInfo.actor.scale;
      const posePreviewPoints = resolvedPosePointsForActor(actorInfo.actor, actorScale);
      const kindSelector = escapeCssValue("actor");
      const idSelector = escapeCssValue(String(id));
      const poseTargets = Array.from(els.canvas.querySelectorAll(`[data-kind="${kindSelector}"][data-id="${idSelector}"][data-pose-point]`));
      target.setPointerCapture(event.pointerId);
      isObjectDragging = true;
      state = {
        pointerId: event.pointerId,
        captureTarget: target,
        targets: [],
        kind: "actor",
        id,
        start,
        panelRect: actorInfo.panelRect,
        unit: actorInfo.unit,
        handleType: "pose-point",
        actor: actorInfo.actor,
        posePointName,
        posePointTargets: poseTargets,
        posePreviewPoints,
        actorScale,
      };
      event.preventDefault();
      return;
    }
    if (!isDragHandleModeEnabled()) return;
    const handleType = target.dataset.dragHandle;
    if (handleType !== "move" && handleType !== "rotate") return;
    if (handleType === "rotate" && !ROTATABLE_KINDS.has(kind)) return;
    if (!DRAGGABLE_KINDS.has(kind) || !id) return;
    const item = currentScene[sceneCollectionKey(kind)]?.find((entry) => String(entry.id) === id);
    if (!item) return;
    const panel = currentScene.panels.find((entry) => String(entry.id) === String(item.panel));
    if (!panel) return;
    const pageLayouts = buildPageLayouts(currentScene);
    const panelRects = buildPanelRects(currentScene, pageLayouts);
    const panelRect = panelRects.get(String(panel.id));
    const pageLayout = pageLayouts.get(String(panel.page));
    if (!panelRect || !pageLayout) return;
    const start = scenePointFromEvent(event);
    if (!start) return;
    const unit = pageLayout.page.unit;
    const originalRect = kind === "actor" || kind === "boxarrow" || kind === "sfx"
      ? null
      : withinPanel(item, panelRect, unit);
    const originalPoint = draggableCenterPoint(kind, item, panelRect, unit);
    const targets = dragTargetsFor(kind, id);
    if (targets.length === 0) return;
    const rotationTargets = handleType === "rotate"
      ? targets.filter((targetState) => !targetState.element.dataset.dragHandle)
      : [];
    if (handleType === "rotate" && (!originalPoint || rotationTargets.length === 0)) return;
    const startAngle = handleType === "rotate" && originalPoint
      ? angleFromPointClockwiseTop(start, originalPoint)
      : null;
    target.setPointerCapture(event.pointerId);
    isObjectDragging = true;
    state = {
      pointerId: event.pointerId,
      captureTarget: target,
      targets,
      kind,
      id,
      start,
      panelRect,
      unit,
      handleType,
      originalRect,
      originalPoint,
      rotationTargets,
      startAngle,
      startRot: num(item.rot, 0),
    };
    event.preventDefault();
  });

  els.canvas.addEventListener("pointermove", (event) => {
    if (!state || event.pointerId !== state.pointerId) return;
    const point = scenePointFromEvent(event);
    if (!point) return;
    if (state.handleType === "pose-point") {
      const localPoint = actorLocalPointFromScene(point, state.actor, state.panelRect, state.unit);
      state.posePreviewPoints[state.posePointName] = localPoint;
      for (const handle of state.posePointTargets) {
        const name = handle.dataset.posePoint;
        const posePoint = state.posePreviewPoints[name];
        if (!posePoint) continue;
        handle.setAttribute("cx", String(posePoint.x));
        handle.setAttribute("cy", String(posePoint.y));
      }
    } else if (state.handleType === "attachment-point") {
      const delta = attachmentDeltaFromScenePoint(point, state);
      if (!delta) return;
      state.previewDx = delta.dx;
      state.previewDy = delta.dy;
      for (const handle of state.attachmentPointTargets) {
        handle.setAttribute("cx", String(delta.localPoint.x));
        handle.setAttribute("cy", String(delta.localPoint.y));
      }
    } else if (state.handleType === "hand-chain-point") {
      const localPoint = actorLocalPointFromScene(point, state.actor, state.panelRect, state.unit);
      const safeScale = Math.max(Math.abs(num(state.actor.scale, 0)), 1e-6);
      const anchorPoint = resolveAttachmentAnchorPoint(state.actor, state.appendage.anchor, 20 * safeScale);
      const pointX = (localPoint.x - anchorPoint.x) / safeScale;
      const pointY = (localPoint.y - anchorPoint.y) / safeScale;
      if (!Number.isFinite(pointX) || !Number.isFinite(pointY)) return;
      state.previewChainPoint = { x: roundedPoseCoord(pointX), y: roundedPoseCoord(pointY) };
      for (const handle of state.chainPointTargets) {
        handle.setAttribute("cx", String(anchorPoint.x + state.previewChainPoint.x * safeScale));
        handle.setAttribute("cy", String(anchorPoint.y + state.previewChainPoint.y * safeScale));
      }
    } else if (state.handleType === "rotate" && state.originalPoint && state.startAngle !== null) {
      const currentAngle = angleFromPointClockwiseTop(point, state.originalPoint);
      const angleDelta = signedAngleDelta(currentAngle, state.startAngle);
      for (const targetState of state.rotationTargets) {
        const rotatePreview = `rotate(${angleDelta} ${state.originalPoint.x} ${state.originalPoint.y})`;
        targetState.element.setAttribute("transform", `${rotatePreview} ${targetState.originalTransform}`.trim());
      }
    } else {
      const dx = point.x - state.start.x;
      const dy = point.y - state.start.y;
      const dragTransform = `translate(${dx},${dy})`;
      for (const targetState of state.targets) {
        targetState.element.setAttribute("transform", `${dragTransform} ${targetState.originalTransform}`.trim());
      }
    }
    event.preventDefault();
  });

  const finishDrag = (event) => {
    if (!state || event.pointerId !== state.pointerId) return;
    const point = scenePointFromEvent(event) || state.start;
    const dx = point.x - state.start.x;
    const dy = point.y - state.start.y;
    try {
      const blocks = parseBlocks(els.input.value);
      const block = findBlock(blocks, state.kind, state.id);
      if (block) {
        if (state.handleType === "pose-point") {
          const localPoint = actorLocalPointFromScene(point, state.actor, state.panelRect, state.unit);
          state.posePreviewPoints[state.posePointName] = localPoint;
          block.props["pose.points"] = posePointsToDslString(state.posePreviewPoints, state.actorScale);
          const updatedBlocks = blocks;
          els.input.value = stringifyBlocks(updatedBlocks);
          update();
        } else if (state.handleType === "attachment-point") {
          const attachments = block.props.attachments;
          if (!Array.isArray(attachments)) return;
          const attachment = attachments[state.attachmentIndex];
          if (!attachment || typeof attachment !== "object") return;
          if (String(attachment.ref) !== state.attachmentRef) return;
          const delta = attachmentDeltaFromScenePoint(point, state);
          if (!delta) return;
          attachment.dx = delta.roundedDx;
          attachment.dy = delta.roundedDy;
          applyHandUiStateToActorBlock(block, state.id);
          const updatedBlocks = blocks;
          els.input.value = stringifyBlocks(updatedBlocks);
          update();
        } else if (state.handleType === "hand-chain-point") {
          const appendages = block.props.appendages;
          if (!Array.isArray(appendages)) return;
          const appendage = appendages[state.appendageIndex];
          if (!appendage || appendage.kind !== "hand") return;
          if (!Array.isArray(appendage.chains) || appendage.chains.length === 0) {
            appendage.chains = defaultHandChainsForPreset(normalizeHandPreset(appendage.preset));
          }
          const chain = appendage?.chains?.[state.chainIndex];
          const chainPoint = chain?.points?.[state.chainPointIndex];
          if (!chainPoint) return;
          const localPoint = actorLocalPointFromScene(point, state.actor, state.panelRect, state.unit);
          const safeScale = Math.max(Math.abs(num(state.actor.scale, 0)), 1e-6);
          const anchorPoint = resolveAttachmentAnchorPoint(state.actor, appendage.anchor, 20 * safeScale);
          const pointX = roundedPoseCoord((localPoint.x - anchorPoint.x) / safeScale);
          const pointY = roundedPoseCoord((localPoint.y - anchorPoint.y) / safeScale);
          chainPoint.x = pointX;
          chainPoint.y = pointY;
          appendage.handDetailEdited = true;
          applyHandUiStateToActorBlock(block, state.id);
          const updatedBlocks = blocks;
          els.input.value = stringifyBlocks(updatedBlocks);
          update();
        } else if (state.handleType === "rotate" && state.originalPoint && state.startAngle !== null) {
          const currentAngle = angleFromPointClockwiseTop(point, state.originalPoint);
          const angleDelta = signedAngleDelta(currentAngle, state.startAngle);
          const nextRotation = normalizeDegrees(state.startRot + angleDelta);
          if (state.kind === "sfx") {
            block.props.rot = roundedRotation(nextRotation);
          } else {
            block.props.rot = roundedRotation(nextRotation);
          }
          const updatedBlocks = blocks;
          els.input.value = stringifyBlocks(updatedBlocks);
          update();
        } else {
          let nextPosition = null;
          if ((state.kind === "actor" || state.kind === "boxarrow" || state.kind === "sfx") && state.originalPoint) {
            const moved = { x: state.originalPoint.x + dx, y: state.originalPoint.y + dy };
            nextPosition = pointFromPanel(moved, state.panelRect, state.unit);
          } else if (state.originalRect) {
            const moved = {
              ...state.originalRect,
              x: state.originalRect.x + dx,
              y: state.originalRect.y + dy,
            };
            nextPosition = rectFromPanel(moved, state.panelRect, state.unit);
          }
          if (!nextPosition) return;
          block.props.x = roundedCoord(nextPosition.x, state.unit);
          block.props.y = roundedCoord(nextPosition.y, state.unit);
          const updatedBlocks = blocks;
          els.input.value = stringifyBlocks(updatedBlocks);
          update();
        }
      }
    } finally {
      for (const targetState of state.targets) {
        targetState.element.setAttribute("transform", targetState.originalTransform);
      }
      if (state.captureTarget?.hasPointerCapture?.(state.pointerId)) {
        state.captureTarget.releasePointerCapture(state.pointerId);
      }
      state = null;
      isObjectDragging = false;
    }
  };

  els.canvas.addEventListener("pointerup", finishDrag);
  els.canvas.addEventListener("pointercancel", finishDrag);
}
function persistSelectedActorHandUiState() {
  if (!selectedActorId) return;
  const blocks = parseBlocks(els.input.value);
  const actorBlock = blocks.find((block) => block.type === "actor" && String(block.props.id) === String(selectedActorId));
  if (!actorBlock) return;
  applyHandUiStateToActorBlock(actorBlock, selectedActorId);
  els.input.value = stringifyBlocks(blocks);
  update();
}
function setupDragHandleToggle() {
  if (els.dragHandleToggle) {
    els.dragHandleToggle.addEventListener("change", () => {
      syncDragHandleModeClass();
      update();
    });
  }
  if (els.poseEditorToggle) {
    els.poseEditorToggle.addEventListener("change", () => {
      syncDragHandleModeClass();
      update();
    });
  }
  if (els.handDetailEditorToggle) {
    els.handDetailEditorToggle.addEventListener("change", () => {
      update();
    });
  }
  if (els.handPresetSelect) {
    els.handPresetSelect.addEventListener("change", () => {
      persistSelectedActorHandUiState();
    });
  }
  if (els.handAppendageToggle) {
    els.handAppendageToggle.addEventListener("change", () => {
      persistSelectedActorHandUiState();
    });
  }
  syncDragHandleModeClass();
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
function nextIdForType(type, count) {
  const prefix = ID_PREFIX_BY_TYPE[type] ?? type;
  const renumberedValue = 1000 + (count - 1) * 10;
  return `${prefix}${renumberedValue}`;
}
function serializeValue(value, indentLevel) {
  if (Array.isArray(value)) return serializeList(value, indentLevel);
  if (typeof value === "string" && value.includes("\n")) {
    const body = value.split("\n").map((line) => `${" ".repeat(indentLevel + 2)}${line}`).join("\n");
    return `|\n${body}`;
  }
  return String(value);
}
function serializeList(list, indentLevel) {
  if (list.length === 0) return "";
  const lines = [];
  for (const item of list) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const entries = Object.entries(item);
      if (entries.length === 0) {
        lines.push(`${" ".repeat(indentLevel)}-`);
        continue;
      }
      const [firstKey, firstValue] = entries[0];
      lines.push(`${" ".repeat(indentLevel)}- ${firstKey}: ${serializeValue(firstValue, indentLevel + 2)}`);
      for (let i = 1; i < entries.length; i += 1) {
        const [key, value] = entries[i];
        lines.push(`${" ".repeat(indentLevel + 2)}${key}: ${serializeValue(value, indentLevel + 2)}`);
      }
      continue;
    }
    lines.push(`${" ".repeat(indentLevel)}- ${serializeValue(item, indentLevel + 2)}`);
  }
  return `\n${lines.join("\n")}`;
}
function stringifyFlatBlocks(blocks) {
  const out = [];
  for (const block of blocks) {
    out.push(`${block.type}:`);
    for (const [key, value] of Object.entries(block.props)) {
      if (Array.isArray(value)) {
        out.push(`  ${key}:${serializeList(value, 4)}`);
      } else {
        out.push(`  ${key}: ${serializeValue(value, 2)}`);
      }
    }
    out.push("");
  }
  return out.join("\n").trimEnd();
}
function stringifyHierarchicalBlocks(blocks) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  const pagesById = new Map();
  const panelsById = new Map();
  const pageChildren = new Map();
  const panelChildren = new Map();
  for (const block of sortedBlocks) {
    if (block.type === "page") {
      pagesById.set(String(block.props.id ?? ""), block);
      pageChildren.set(block, []);
    }
    if (block.type === "panel") {
      panelsById.set(String(block.props.id ?? ""), block);
      panelChildren.set(block, []);
    }
  }
  const topLevel = [];
  for (const block of sortedBlocks) {
    if (block.type === "panel") {
      const page = pagesById.get(String(block.props.page ?? ""));
      if (page) {
        pageChildren.get(page).push(block);
        continue;
      }
    }
    if (HIERARCHY_PARENT_REF[block.type]?.field === "panel") {
      const panel = panelsById.get(String(block.props.panel ?? ""));
      if (panel) {
        panelChildren.get(panel).push(block);
        continue;
      }
    }
    if (block.type !== "panel" && !HIERARCHY_PARENT_REF[block.type]) topLevel.push(block);
    if (block.type === "panel" && !pagesById.get(String(block.props.page ?? ""))) topLevel.push(block);
    if (HIERARCHY_PARENT_REF[block.type]?.field === "panel" && !panelsById.get(String(block.props.panel ?? ""))) topLevel.push(block);
  }
  const out = [];
  const writeBlock = (block, indentLevel, omitFields = new Set()) => {
    const indent = " ".repeat(indentLevel);
    out.push(`${indent}${block.type}:`);
    for (const [key, value] of Object.entries(block.props)) {
      if (omitFields.has(key)) continue;
      if (Array.isArray(value)) {
        out.push(`${indent}  ${key}:${serializeList(value, indentLevel + 4)}`);
      } else {
        out.push(`${indent}  ${key}: ${serializeValue(value, indentLevel + 2)}`);
      }
    }
    if (block.type === "page") {
      for (const panel of pageChildren.get(block) ?? []) {
        const omit = new Set(panel.autoParentRefFields ?? []);
        writeBlock(panel, indentLevel + 2, omit);
      }
    }
    if (block.type === "panel") {
      for (const child of panelChildren.get(block) ?? []) {
        const omit = new Set(child.autoParentRefFields ?? []);
        writeBlock(child, indentLevel + 2, omit);
      }
    }
  };
  for (const block of topLevel) {
    writeBlock(block, 0);
    out.push("");
  }
  return out.join("\n").trimEnd();
}
function stringifyBlocks(blocks) {
  const metaBlock = blocks.find((block) => block.type === "meta");
  const layoutMeta = normalizeLayoutMeta(metaBlock?.props ?? {});
  let blocksForSerialization = blocks;
  if (!layoutMeta.page.persistGenerated) {
    blocksForSerialization = blocks.filter((block) => !(block.type === "page" && String(block.props.id ?? "").startsWith("auto-p")));
  }
  const prefersHierarchical = blocksForSerialization.some((block) => block.sourceFormat === "hierarchical");
  if (prefersHierarchical) return stringifyHierarchicalBlocks(blocksForSerialization);
  return stringifyFlatBlocks(blocksForSerialization);
}
function buildIdRemap(blocks) {
  const countersByType = {};
  const remap = {};
  for (const block of blocks) {
    if (block.type === "meta" || block.props.id === undefined || block.props.id === null || block.props.id === "") continue;
    countersByType[block.type] = (countersByType[block.type] ?? 0) + 1;
    const oldId = String(block.props.id);
    const newId = nextIdForType(block.type, countersByType[block.type]);
    if (!remap[block.type]) remap[block.type] = new Map();
    remap[block.type].set(oldId, newId);
    block.props.id = newId;
  }
  return remap;
}
function rewriteReferences(blocks, remap) {
  for (const block of blocks) {
    const refFields = ID_REFERENCE_FIELDS_BY_TYPE[block.type] ?? [];
    for (const field of refFields) {
      if (block.props[field] === undefined || block.props[field] === null || block.props[field] === "") continue;
      const refType = field;
      const mapped = remap[refType]?.get(String(block.props[field]));
      if (mapped) block.props[field] = mapped;
    }
    if (block.type === "actor" && Array.isArray(block.props.attachments)) {
      const assetMap = remap.asset;
      if (assetMap) {
        for (const attachment of block.props.attachments) {
          if (!attachment || typeof attachment !== "object") continue;
          const mapped = assetMap.get(String(attachment.ref));
          if (mapped) attachment.ref = mapped;
        }
      }
    }
    if (block.type === "actor" && typeof block.props.lookAt === "string") {
      const lookAtMatch = block.props.lookAt.match(/^actor:(.+)$/);
      if (lookAtMatch) {
        const oldId = lookAtMatch[1].trim();
        const mapped = remap.actor?.get(oldId);
        if (mapped) block.props.lookAt = `actor:${mapped}`;
      }
    }
    if (block.type === "balloon" && typeof block.props.tail === "string") {
      const match = block.props.tail.match(/^toActor\(([^()]+)\)$/);
      if (match) {
        const oldId = match[1].trim();
        const mapped = remap.actor?.get(oldId);
        if (mapped) block.props.tail = `toActor(${mapped})`;
      }
    }
    if (block.props.styleRef !== undefined && block.props.styleRef !== null && block.props.styleRef !== "") {
      const mapped = remap.style?.get(String(block.props.styleRef));
      if (mapped) block.props.styleRef = mapped;
    }
  }
}
function setupRenumberIds() {
  if (!els.renumberBtn) return;
  els.renumberBtn.addEventListener("click", () => {
    const blocks = parseBlocks(els.input.value);
    blocks.sort((a, b) => a.order - b.order);
    const remap = buildIdRemap(blocks);
    rewriteReferences(blocks, remap);
    const scene = validateAndBuild(blocks);
    if (scene.layoutMeta?.page.persistGenerated) {
      const pageLayouts = buildPageLayouts(scene);
      const existingPageIds = new Set(blocks.filter((block) => block.type === "page").map((block) => String(block.props.id ?? "")));
      const insertionOrderBase = blocks.length;
      let generatedOrder = 0;
      for (const { page } of pageLayouts.values()) {
        const pageId = String(page.id);
        if (!page._virtual || existingPageIds.has(pageId)) continue;
        blocks.push({
          type: "page",
          props: {
            id: pageId,
            size: page.size,
            ...(page.size === "custom" ? { width: page.width, height: page.height } : {}),
            margin: page.margin,
            unit: page.unit,
            bg: page.bg,
            stroke: page.stroke,
            strokeWidth: page.strokeWidth,
          },
          line: 0,
          order: insertionOrderBase + generatedOrder,
          sourceFormat: blocks.some((block) => block.sourceFormat === "hierarchical") ? "hierarchical" : "flat",
          autoParentRefFields: [],
        });
        existingPageIds.add(pageId);
        generatedOrder += 1;
      }
    }
    els.input.value = stringifyBlocks(blocks);
    update();
  });
}
async function loadDefaultDsl() {
  const response = await fetch(DEFAULT_DSL_PATH, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`初期DSLの読み込みに失敗しました (${response.status})`);
  }
  return response.text();
}
async function init() {
  try {
    els.input.value = await loadDefaultDsl();
  } catch (error) {
    showError(error);
    els.input.value = "";
  }
  els.input.addEventListener("input", debouncedUpdate);
  setupResize();
  setupPanZoom();
  setupObjectDrag();
  setupDragHandleToggle();
  setupDownload();
  setupRenumberIds();
  update();
}
void init();
