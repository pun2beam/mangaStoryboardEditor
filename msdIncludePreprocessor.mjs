const INCLUDE_DIRECTIVE = /^\s*#include\s+"([^"]+)"\s*$/;

export class MsdIncludeError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "MsdIncludeError";
    this.details = details;
  }
}

function normalizePath(path) {
  const isAbsolute = path.startsWith("/");
  const parts = [];
  for (const token of path.split("/")) {
    if (!token || token === ".") continue;
    if (token === "..") {
      if (parts.length > 0 && parts[parts.length - 1] !== "..") parts.pop();
      else if (!isAbsolute) parts.push("..");
      continue;
    }
    parts.push(token);
  }
  return `${isAbsolute ? "/" : ""}${parts.join("/")}` || (isAbsolute ? "/" : ".");
}

function dirname(path) {
  const normalized = normalizePath(path);
  if (normalized === "/") return "/";
  const index = normalized.lastIndexOf("/");
  if (index <= 0) return ".";
  return normalized.slice(0, index);
}

function joinPath(base, target) {
  if (target.startsWith("/")) return normalizePath(target);
  if (!base || base === ".") return normalizePath(target);
  return normalizePath(`${base}/${target}`);
}

function formatIncludeChain(chain) {
  return chain.map((entry) => `${entry.file}:${entry.line}`).join(" -> ");
}

export async function preprocessMsdIncludes(entryFilePath, options) {
  const { readFile, projectRoot = "." } = options || {};
  if (typeof readFile !== "function") throw new Error("preprocessMsdIncludes: readFile(path) が必要です");
  const normalizedRoot = normalizePath(projectRoot);

  const expandFile = async (filePath, includeStack, prefetchedSource = null) => {
    const normalizedPath = normalizePath(filePath);
    const source = prefetchedSource ?? (await readFile(normalizedPath));
    const lines = source.replace(/\r\n?/g, "\n").split("\n");
    const resultLines = [];

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const match = line.match(INCLUDE_DIRECTIVE);
      if (!match) {
        resultLines.push(line);
        continue;
      }
      const includeTarget = match[1].trim();
      const includeLine = index + 1;
      const resolveCandidates = [
        joinPath(dirname(normalizedPath), includeTarget),
        joinPath(normalizedRoot, includeTarget),
      ];
      const uniqueCandidates = [...new Set(resolveCandidates)];

      let resolvedPath = null;
      let resolvedText = null;
      let lastError = null;
      for (const candidate of uniqueCandidates) {
        try {
          resolvedText = await readFile(candidate);
          resolvedPath = candidate;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!resolvedPath) {
        const chain = [...includeStack, { file: normalizedPath, line: includeLine }];
        throw new MsdIncludeError(
          `include 解決エラー: ${normalizedPath}:${includeLine} で "${includeTarget}" が見つかりません。探索順: ${uniqueCandidates.join(", ")} / includeチェーン: ${formatIncludeChain(chain)}`,
          { type: "not_found", file: normalizedPath, line: includeLine, includeTarget, includeChain: chain, candidates: uniqueCandidates, cause: lastError }
        );
      }

      if (includeStack.some((entry) => entry.file === resolvedPath)) {
        const chain = [...includeStack, { file: normalizedPath, line: includeLine }, { file: resolvedPath, line: 1 }];
        throw new MsdIncludeError(
          `循環 include を検出しました: ${normalizedPath}:${includeLine} -> ${resolvedPath} / includeチェーン: ${formatIncludeChain(chain)}`,
          { type: "cycle", file: normalizedPath, line: includeLine, includeTarget, includeChain: chain }
        );
      }

      const nestedStack = [...includeStack, { file: normalizedPath, line: includeLine }];
      const expanded = await expandFile(resolvedPath, nestedStack, resolvedText);
      resultLines.push(expanded);
    }
    return resultLines.join("\n");
  };

  return expandFile(entryFilePath, []);
}
