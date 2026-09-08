import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

const root = process.cwd();
const roots = ["apps", "docs", "packages", "scripts"];
const rootFiles = ["package.json", "pnpm-lock.yaml", "tsconfig.solution.json", "README.md"];
const ignoredDirectories = new Set([".next", ".turbo", "coverage", "dist", "node_modules", "out"]);
const ignoredFiles = new Set(["scripts/check-camera-hard-cut.mjs"]);
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
  ".yaml",
  ".yml",
]);

const retiredIdentifiers = [
  "@tokovo/device-camera",
  "packages/device-camera",
  "useCameraEngine",
  "MultiDeviceRenderer",
  "CameraDirectorPlugin",
  "world.camera",
  "activeEffects",
  "effectCleanupBuffer",
  "deviceTransforms",
  "resolveAnchorWithFallback",
  "trackCinematic(",
  "camera.layout(",
  ".director(",
  "scene.focus",
  "scene.follow",
  'kind: "CAMERA"',
  "kind: 'CAMERA'",
];
const rawEpisodeCameraContracts = [
  "CameraPlanIR",
  "CameraRigIR",
  "CameraShotIR",
  "EpisodeCinematicsIR",
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
  if (displayPath.startsWith("packages/episodes/src/")) {
    for (const identifier of rawEpisodeCameraContracts) {
      lines.forEach((line, index) => {
        if (line.includes(identifier)) {
          violations.push(`${displayPath}:${index + 1}: raw episode camera contract ${identifier}`);
        }
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Camera hard-cut policy failed. Retired identifiers remain:\n");
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Camera hard-cut policy passed (${files.length - ignoredFiles.size} files scanned).`);
}
