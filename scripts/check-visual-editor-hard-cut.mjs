import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

const root = process.cwd();
const roots = ["apps", "docs", "packages", "scripts"];
const rootFiles = [
  "AGENTS.md",
  "README.md",
  "eslint.config.mjs",
  "llms.txt",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.solution.json",
];
const ignoredDirectories = new Set([".next", ".turbo", "coverage", "node_modules", "out"]);
const ignoredFiles = new Set(["docs/STUDIO.md", "scripts/check-visual-editor-hard-cut.mjs"]);
const textExtensions = new Set([
  ".cjs",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

const retiredIdentifiers = [
  "@tokovo/studio-model",
  "@tokovo/studio-interactions",
  "apps/studio",
  "packages/studio-model",
  "packages/studio-interactions",
  "packages/compiler/src/studio",
  "EpisodeDocumentV1",
  "lowerEpisodeDocument",
  "StudioContribution",
  "StudioRenderJob",
  "studio-job-store",
  "studio-job-runner",
  "studio-job-worker",
  "studioEpisodes",
  "catalogs/studio",
  "TOKOVO_EPISODE_CATALOG_PROFILE=studio",
  '"dev:studio"',
  '"./studio"',
];

async function collectFiles(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolute)));
    } else if (entry.isFile() && textExtensions.has(extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
}

const files = [
  ...(await Promise.all(roots.map((directory) => collectFiles(join(root, directory))))).flat(),
  ...rootFiles.map((file) => join(root, file)),
];
const violations = [];

for (const file of files.sort()) {
  const displayPath = relative(root, file).split(sep).join("/");
  if (ignoredFiles.has(displayPath)) continue;
  const contents = await readFile(file, "utf8");
  const lines = contents.split("\n");
  for (const identifier of retiredIdentifiers) {
    lines.forEach((line, index) => {
      if (line.includes(identifier)) {
        violations.push(`${displayPath}:${index + 1}: ${identifier}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error("Visual-editor hard-cut policy failed. Retired contracts remain:\n");
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Visual-editor hard-cut policy passed (${files.length - ignoredFiles.size} files scanned).`,
  );
}
