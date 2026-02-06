import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SRC_ROOTS = [
  path.join(ROOT, "packages"),
];

const FILE_EXTS = new Set([".ts", ".tsx"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".turbo", ".next", "coverage"]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p, out);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name);
      if (FILE_EXTS.has(ext) && p.includes(`${path.sep}src${path.sep}`)) out.push(p);
    }
  }
  return out;
}

function hasFile(baseNoExt) {
  return (
    fs.existsSync(`${baseNoExt}.ts`) ||
    fs.existsSync(`${baseNoExt}.tsx`)
  );
}

function hasDirIndex(basePath) {
  return (
    fs.existsSync(path.join(basePath, "index.ts")) ||
    fs.existsSync(path.join(basePath, "index.tsx"))
  );
}

function needsFix(spec) {
  if (!spec.startsWith("./") && !spec.startsWith("../")) return false;
  // Already explicit extension (including css/svg/json) or contains query/hash.
  if (/[?#]/.test(spec)) return false;
  // Only treat as "has extension" if it's a real runtime extension.
  // Filenames like "logging.plugin" still need ".js" for Node ESM.
  const ext = path.extname(spec);
  if (
    ext === ".js" ||
    ext === ".mjs" ||
    ext === ".cjs" ||
    ext === ".json" ||
    ext === ".css" ||
    ext === ".scss" ||
    ext === ".svg" ||
    ext === ".png" ||
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".gif" ||
    ext === ".mp3" ||
    ext === ".wav" ||
    ext === ".mp4" ||
    ext === ".webm" ||
    ext === ".txt" ||
    ext === ".md"
  ) {
    return false;
  }
  return true;
}

function fixSpecifier(filePath, spec) {
  if (!needsFix(spec)) return spec;

  const absBase = path.resolve(path.dirname(filePath), spec);
  if (hasFile(absBase)) return `${spec}.js`;
  if (fs.existsSync(absBase) && fs.statSync(absBase).isDirectory() && hasDirIndex(absBase)) {
    return `${spec}/index.js`;
  }

  // If we can't resolve, leave as-is.
  return spec;
}

function transformFile(filePath) {
  const input = fs.readFileSync(filePath, "utf8");

  const re =
    /(from\s+["'])(\.{1,2}\/[^"']+)(["'])|(export\s+\*\s+from\s+["'])(\.{1,2}\/[^"']+)(["'])|(import\s+["'])(\.{1,2}\/[^"']+)(["'])/g;

  let changed = false;
  const output = input.replace(
    re,
    (
      match,
      fromPrefix,
      fromSpec,
      fromSuffix,
      exportPrefix,
      exportSpec,
      exportSuffix,
      importPrefix,
      importSpec,
      importSuffix,
    ) => {
      if (importPrefix && importSpec && importSuffix) {
        const fixed = fixSpecifier(filePath, importSpec);
        if (fixed !== importSpec) changed = true;
        return `${importPrefix}${fixed}${importSuffix}`;
      }

      if (fromPrefix && fromSpec && fromSuffix) {
        const fixed = fixSpecifier(filePath, fromSpec);
        if (fixed !== fromSpec) changed = true;
        return `${fromPrefix}${fixed}${fromSuffix}`;
      }

      if (exportPrefix && exportSpec && exportSuffix) {
        const fixed = fixSpecifier(filePath, exportSpec);
        if (fixed !== exportSpec) changed = true;
        return `${exportPrefix}${fixed}${exportSuffix}`;
      }

      return match;
    },
  );

  if (changed) {
    fs.writeFileSync(filePath, output, "utf8");
  }
  return changed;
}

let changedCount = 0;
let fileCount = 0;

for (const root of SRC_ROOTS) {
  if (!fs.existsSync(root)) continue;
  for (const pkg of fs.readdirSync(root)) {
    const pkgPath = path.join(root, pkg);
    if (!fs.statSync(pkgPath).isDirectory()) continue;
    const files = walk(pkgPath);
    for (const f of files) {
      fileCount += 1;
      if (transformFile(f)) changedCount += 1;
    }
  }
}

process.stdout.write(
  `fix-esm-imports: scanned ${fileCount} files, updated ${changedCount} files\n`,
);
