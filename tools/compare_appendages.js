#!/usr/bin/env node
const fs = require('fs');

function usage() {
  console.error('Usage: node tools/compare_appendages.js <before.msd> <after.msd> <actorId>');
}

function lineIndent(line) {
  const m = line.match(/^\s*/);
  return m ? m[0].length : 0;
}

function extractActorAppendages(text, actorId) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const actorMatch = line.match(/^(\s*)actor:\s*$/);
    if (!actorMatch) continue;
    const actorIndent = actorMatch[1].length;
    let id = '';
    let appendages = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const current = lines[j];
      if (!current.trim()) continue;
      const indent = lineIndent(current);
      if (indent <= actorIndent && /^[a-z]+:\s*$/.test(current.trim())) break;
      if (indent === actorIndent + 2) {
        const idMatch = current.match(/^\s*id:\s*(.+?)\s*$/);
        if (idMatch) id = idMatch[1];
        const appMatch = current.match(/^\s*appendages:\s*$/);
        if (appMatch) {
          const result = parseAppendageList(lines, j + 1, actorIndent + 4);
          appendages = result.appendages;
          j = result.lastIndex;
        }
      }
    }
    if (id === actorId) return appendages;
  }
  return null;
}

function parseAppendageList(lines, start, listIndent) {
  const appendages = [];
  let current = null;
  let lastIndex = start;
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;
    const indent = lineIndent(line);
    if (indent < listIndent) {
      lastIndex = i - 1;
      break;
    }
    if (indent === listIndent) {
      const item = line.match(/^\s*-\s*(.*)$/);
      if (!item) {
        lastIndex = i - 1;
        break;
      }
      current = {};
      appendages.push(current);
      if (item[1]) {
        const inline = item[1].match(/^([^:]+):\s*(.*)$/);
        if (inline) current[inline[1].trim()] = inline[2].trim();
      }
      lastIndex = i;
      continue;
    }
    if (indent >= listIndent + 2 && current) {
      const kv = line.match(/^\s*([^:]+):\s*(.*)$/);
      if (kv) current[kv[1].trim()] = kv[2].trim();
      lastIndex = i;
      continue;
    }
    lastIndex = i - 1;
    break;
  }
  return { appendages, lastIndex };
}

function identity(item, idx) {
  const id = (item.id || '').trim();
  if (id) return `id:${id}`;
  const ref = (item.ref || '').trim();
  const anchor = (item.anchor || '').trim();
  if (ref && anchor) return `ref:${ref}|anchor:${anchor}`;
  return `unknown#${idx}`;
}

function keySet(item) {
  return new Set(Object.keys(item || {}).map((k) => k.trim()).filter(Boolean));
}

function sorted(arr) {
  return [...arr].sort((a, b) => a.localeCompare(b));
}

const [, , beforePath, afterPath, actorId] = process.argv;
if (!beforePath || !afterPath || !actorId) {
  usage();
  process.exit(2);
}

const beforeText = fs.readFileSync(beforePath, 'utf8');
const afterText = fs.readFileSync(afterPath, 'utf8');
const before = extractActorAppendages(beforeText, actorId);
const after = extractActorAppendages(afterText, actorId);

if (!before) {
  console.error(`[NG] actor not found in before file: ${actorId}`);
  process.exit(1);
}
if (!after) {
  console.error(`[NG] actor not found in after file: ${actorId}`);
  process.exit(1);
}

console.log(`before.count=${before.length}`);
console.log(`after.count=${after.length}`);
if (before.length !== after.length) {
  console.error('[NG] appendages count changed');
}

const beforeIds = before.map(identity);
const afterIds = after.map(identity);
console.log(`before.identities=${beforeIds.join(', ')}`);
console.log(`after.identities=${afterIds.join(', ')}`);

const beforeOnly = beforeIds.filter((id) => !afterIds.includes(id));
const afterOnly = afterIds.filter((id) => !beforeIds.includes(id));
if (beforeOnly.length) console.log(`beforeOnly=${beforeOnly.join(', ')}`);
if (afterOnly.length) console.log(`afterOnly=${afterOnly.join(', ')}`);

let failed = before.length !== after.length || beforeOnly.length > 0 || afterOnly.length > 0;

for (let i = 0; i < Math.min(before.length, after.length); i += 1) {
  const b = before[i];
  const a = after[i];
  const bKeys = keySet(b);
  const aKeys = keySet(a);
  const added = sorted([...aKeys].filter((k) => !bKeys.has(k)));
  const removed = sorted([...bKeys].filter((k) => !aKeys.has(k)));
  const idKey = identity(a, i);
  console.log(`entry[${i}] ${idKey}`);
  console.log(`  +keys: ${added.join(', ') || '(none)'}`);
  console.log(`  -keys: ${removed.join(', ') || '(none)'}`);
  const implicitAdded = added.filter((k) => !['id', 'ref', 'anchor'].includes(k));
  if (implicitAdded.length) {
    console.error(`  [NG] implicit key generation detected: ${implicitAdded.join(', ')}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
console.log('[OK] no implicit generation beyond id/ref+anchor and appendage count unchanged.');
