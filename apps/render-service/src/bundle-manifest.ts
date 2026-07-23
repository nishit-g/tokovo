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

const WORKSPACE_PACKAGE_DIRS = [
  "packages/apps-imessage",
  "packages/apps-instagram",
  "packages/apps-linkedin",
  "packages/apps-snapchat",
  "packages/apps-teams",
  "packages/apps-typewriter",
  "packages/apps-whatsapp",
  "packages/apps-x",
  "packages/background",
  "packages/camera",
  "packages/compiler",
  "packages/core",
  "packages/device-keyboard",
  "packages/device-notifications",
  "packages/devices",
  "packages/dsl",
  "packages/episodes",
  "packages/ir",
  "packages/overlay",
  "packages/react",
  "packages/renderer",
  "packages/stage",
  "packages/visual-system",
  "packages/voice",
];

const WORKSPACE_INPUT_DIRS = [
  "apps/video-runner/src",
  "apps/video-runner/public",
  ...WORKSPACE_PACKAGE_DIRS.flatMap((entry) => [`${entry}/src`, `${entry}/dist`]),
];

const WORKSPACE_PACKAGE_FILES = WORKSPACE_PACKAGE_DIRS.map(
  (entry) => `${entry}/package.json`,
);

const CAMERA_LAYER_PAINTER_INPUT_DIRS = [
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
  "packages/background/dist",
  "packages/compiler/dist",
  "packages/core/dist",
  "packages/device-keyboard/dist",
  "packages/device-notifications/dist",
  "packages/devices/dist",
  "packages/ir/dist",
  "packages/overlay/dist",
  "packages/react/dist",
  "packages/renderer/dist",
  "packages/stage/dist",
  "packages/voice/dist",
];

const CAMERA_LAYER_PAINTER_PACKAGE_FILES =
  CAMERA_LAYER_PAINTER_INPUT_DIRS.filter((entry) =>
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
let cachedCameraLayerPainterStatFingerprint = "";
let cachedCameraLayerPainterSourceSignature = "";

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
  const contentHash = createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
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
    files: [...ROOT_INPUT_FILES, ...WORKSPACE_PACKAGE_FILES]
      .map((entry) => path.join(repoRoot, entry))
      .filter((entry) => fs.existsSync(entry)),
    directories: WORKSPACE_INPUT_DIRS.map((entry) =>
      path.join(repoRoot, entry),
    ).filter((entry) => fs.existsSync(entry)),
  };
}

export function getCameraLayerPainterInputManifest(): {
  files: string[];
  directories: string[];
} {
  return {
    files: [...ROOT_INPUT_FILES, ...CAMERA_LAYER_PAINTER_PACKAGE_FILES]
      .map((entry) => path.join(repoRoot, entry))
      .filter((entry) => fs.existsSync(entry)),
    directories: CAMERA_LAYER_PAINTER_INPUT_DIRS.map((entry) =>
      path.join(repoRoot, entry),
    ).filter((entry) => fs.existsSync(entry)),
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

export function createCameraLayerPainterSourceSignature(): string {
  const manifest = getCameraLayerPainterInputManifest();
  const inputFiles = [...manifest.files];
  for (const directory of manifest.directories) {
    walkFiles(directory, inputFiles);
  }

  inputFiles.sort();
  const statFingerprint = inputFiles.map(buildFileStatFingerprint).join("\n");
  if (
    cachedCameraLayerPainterSourceSignature &&
    cachedCameraLayerPainterStatFingerprint === statFingerprint
  ) {
    return cachedCameraLayerPainterSourceSignature;
  }

  cachedCameraLayerPainterStatFingerprint = statFingerprint;
  cachedCameraLayerPainterSourceSignature = createHash("sha256")
    .update(inputFiles.map(buildFileSignature).join("\n"))
    .digest("hex")
    .slice(0, 32);
  return cachedCameraLayerPainterSourceSignature;
}
