import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { repoRoot } from "./constants";

const ROOT_INPUT_FILES = [
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.base.json",
];

const WORKSPACE_INPUT_DIRS = [
  "apps/video-runner/src",
  "apps/video-runner/public",
  "packages/apps-imessage/src",
  "packages/apps-instagram/src",
  "packages/apps-linkedin/src",
  "packages/apps-snapchat/src",
  "packages/apps-teams/src",
  "packages/apps-typewriter/src",
  "packages/apps-whatsapp/src",
  "packages/apps-x/src",
  "packages/background/src",
  "packages/camera/src",
  "packages/compiler/src",
  "packages/core/src",
  "packages/device-camera/src",
  "packages/device-keyboard/src",
  "packages/device-notifications/src",
  "packages/devices/src",
  "packages/dsl/src",
  "packages/episodes/src",
  "packages/ir/src",
  "packages/overlay/src",
  "packages/react/src",
  "packages/renderer/src",
  "packages/stage/src",
  "packages/voice/src",
];

const STAGE_PAINTER_INPUT_DIRS = [
  "apps/video-runner/src",
  "apps/video-runner/public",
  "packages/apps-imessage/dist",
  "packages/apps-instagram/dist",
  "packages/apps-linkedin/dist",
  "packages/apps-snapchat/dist",
  "packages/apps-teams/dist",
  "packages/apps-typewriter/dist",
  "packages/apps-whatsapp/dist",
  "packages/apps-x/dist",
  "packages/compiler/dist",
  "packages/core/dist",
  "packages/device-camera/dist",
  "packages/device-keyboard/dist",
  "packages/device-notifications/dist",
  "packages/devices/dist",
  "packages/ir/dist",
  "packages/react/dist",
  "packages/renderer/dist",
  "packages/stage/dist",
];

const STAGE_PAINTER_PACKAGE_FILES = STAGE_PAINTER_INPUT_DIRS.filter((entry) =>
  entry.startsWith("packages/"),
).map((entry) => `${entry.slice(0, -"dist".length)}package.json`);

const IGNORED_SEGMENTS = new Set([
  "node_modules",
  "dist",
  ".turbo",
  ".next",
  "coverage",
  "tmp",
  "out",
  "__tests__",
]);

let cachedStatFingerprint = "";
let cachedSourceSignature = "";
let cachedStagePainterStatFingerprint = "";
let cachedStagePainterSourceSignature = "";

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function shouldIgnoreFile(fileName: string): boolean {
  return (
    fileName.endsWith(".test.ts") ||
    fileName.endsWith(".test.tsx") ||
    fileName.endsWith(".spec.ts") ||
    fileName.endsWith(".spec.tsx") ||
    fileName.endsWith(".js.map") ||
    fileName.endsWith(".d.ts.map")
  );
}

function walkFiles(rootDir: string, files: string[]): void {
  if (!fs.existsSync(rootDir)) {
    return;
  }

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (IGNORED_SEGMENTS.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(entryPath, files);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (shouldIgnoreFile(entry.name)) {
      continue;
    }

    files.push(entryPath);
  }
}

function buildFileSignature(filePath: string): string {
  const stat = fs.statSync(filePath);
  const relativePath = toPosixPath(path.relative(repoRoot, filePath));
  const contentHash = createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  return `${relativePath}:${stat.size}:${contentHash}`;
}

function buildFileStatFingerprint(filePath: string): string {
  const stat = fs.statSync(filePath);
  const relativePath = toPosixPath(path.relative(repoRoot, filePath));
  return `${relativePath}:${stat.size}:${stat.mtimeMs}`;
}

export function getBundleInputManifest(): {
  files: string[];
  directories: string[];
} {
  return {
    files: ROOT_INPUT_FILES.map((entry) => path.join(repoRoot, entry)).filter((entry) =>
      fs.existsSync(entry),
    ),
    directories: WORKSPACE_INPUT_DIRS.map((entry) => path.join(repoRoot, entry)).filter((entry) =>
      fs.existsSync(entry),
    ),
  };
}

export function getStagePainterInputManifest(): {
  files: string[];
  directories: string[];
} {
  return {
    files: [...ROOT_INPUT_FILES, ...STAGE_PAINTER_PACKAGE_FILES]
      .map((entry) => path.join(repoRoot, entry))
      .filter((entry) => fs.existsSync(entry)),
    directories: STAGE_PAINTER_INPUT_DIRS.map((entry) => path.join(repoRoot, entry)).filter(
      (entry) => fs.existsSync(entry),
    ),
  };
}

export function createBundleSourceSignature(): string {
  const manifest = getBundleInputManifest();
  const inputFiles = [...manifest.files];

  for (const directory of manifest.directories) {
    walkFiles(directory, inputFiles);
  }

  inputFiles.sort();
  const statFingerprint = inputFiles.map(buildFileStatFingerprint).join("\n");
  if (cachedSourceSignature && cachedStatFingerprint === statFingerprint) {
    return cachedSourceSignature;
  }

  cachedStatFingerprint = statFingerprint;
  cachedSourceSignature = createHash("sha256")
    .update(inputFiles.map(buildFileSignature).join("\n"))
    .digest("hex")
    .slice(0, 32);
  return cachedSourceSignature;
}

export function createStagePainterSourceSignature(): string {
  const manifest = getStagePainterInputManifest();
  const inputFiles = [...manifest.files];
  for (const directory of manifest.directories) {
    walkFiles(directory, inputFiles);
  }

  inputFiles.sort();
  const statFingerprint = inputFiles.map(buildFileStatFingerprint).join("\n");
  if (cachedStagePainterSourceSignature && cachedStagePainterStatFingerprint === statFingerprint) {
    return cachedStagePainterSourceSignature;
  }

  cachedStagePainterStatFingerprint = statFingerprint;
  cachedStagePainterSourceSignature = createHash("sha256")
    .update(inputFiles.map(buildFileSignature).join("\n"))
    .digest("hex")
    .slice(0, 32);
  return cachedStagePainterSourceSignature;
}
