/* eslint-disable no-console */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

/**
 * Fast local renderer wrapper.
 *
 * Usage:
 *   EPISODE_ID=v2-creator-series-showcase pnpm --filter video-runner render:fast
 *
 * Notes:
 * - This reuses a cached bundle keyed by the video-runner dependency graph.
 * - It is tuned for speed on a MacBook (GPU + concurrency).
 * - For final exports, use a quality profile.
 */

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const entryPoint = path.join(appRoot, "src/index.ts");
const releaseCompositionId = "episode-render";
const rootConfigFiles = [
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "turbo.json",
  "tsconfig.json",
];

const episodeId = process.env.EPISODE_ID ?? "v2-creator-series-showcase";
const outDir = process.env.OUT_DIR ?? path.join(repoRoot, "out");
const outFile = process.env.OUT_FILE ?? path.join(outDir, `${episodeId}.mp4`);

function parseConcurrency(rawValue) {
  if (!rawValue) {
    return Math.min(Math.max(os.cpus().length - 1, 1), 8);
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(
      `CONCURRENCY must be a positive number, received: ${rawValue}`,
    );
  }
  return Math.floor(parsed);
}
const concurrency = parseConcurrency(process.env.CONCURRENCY);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listGitLines(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getGitScalar(args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    return fallback;
  }
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function getWorkspacePackageDirs() {
  const packagesDir = path.join(repoRoot, "packages");
  const packageDirs = new Map();

  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageDir = path.join(packagesDir, entry.name);
    const packageJsonPath = path.join(packageDir, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      continue;
    }

    const packageJson = readJson(packageJsonPath);
    if (typeof packageJson.name === "string") {
      packageDirs.set(packageJson.name, packageDir);
    }
  }

  return packageDirs;
}

function getWorkspaceDependencyNames(packageJson) {
  const names = new Set();
  for (const field of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    for (const name of Object.keys(packageJson[field] ?? {})) {
      if (name.startsWith("@tokovo/")) {
        names.add(name);
      }
    }
  }
  return [...names];
}

function resolveBundleRoots() {
  const packageDirs = getWorkspacePackageDirs();
  const roots = new Set([appRoot]);
  const queue = [appRoot];
  const visited = new Set();

  while (queue.length > 0) {
    const currentDir = queue.shift();
    if (!currentDir) {
      continue;
    }

    const packageJsonPath = path.join(currentDir, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      continue;
    }

    const packageJson = readJson(packageJsonPath);
    const packageName =
      typeof packageJson.name === "string" ? packageJson.name : currentDir;
    if (visited.has(packageName)) {
      continue;
    }
    visited.add(packageName);

    for (const dependencyName of getWorkspaceDependencyNames(packageJson)) {
      const dependencyDir = packageDirs.get(dependencyName);
      if (!dependencyDir) {
        continue;
      }
      if (!roots.has(dependencyDir)) {
        roots.add(dependencyDir);
      }
      queue.push(dependencyDir);
    }
  }

  return [...roots].sort();
}

function getRelevantPathspecs() {
  const bundleRoots = resolveBundleRoots().map((dir) =>
    toPosixPath(path.relative(repoRoot, dir)),
  );
  const publicDir = path.join(appRoot, "public");
  const configFiles = rootConfigFiles.filter((file) =>
    fs.existsSync(path.join(repoRoot, file)),
  );
  if (fs.existsSync(publicDir)) {
    bundleRoots.push(toPosixPath(path.relative(repoRoot, publicDir)));
  }
  return [...configFiles, ...bundleRoots];
}

function getDirtyFiles(pathspecs) {
  const statusLines = listGitLines([
    "status",
    "--short",
    "--untracked-files=normal",
    "--",
    ...pathspecs,
  ]);
  const dirtyFiles = new Set();

  for (const line of statusLines) {
    const match = line.match(/^[ MARCUD?!]{2}\s+(.+)$/);
    if (!match?.[1]) {
      continue;
    }

    const relativePath = match[1]
      .split(" -> ")
      .pop()
      ?.trim();
    if (relativePath) {
      dirtyFiles.add(relativePath);
    }
  }

  return dirtyFiles;
}

function getFileSignature(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);

  if (!fs.existsSync(absolutePath)) {
    return `${relativePath}:deleted`;
  }

  const stat = fs.statSync(absolutePath);
  if (stat.isDirectory()) {
    return `${relativePath}:directory:${stat.mtimeMs}`;
  }

  return `${relativePath}:file:${stat.size}:${Math.trunc(stat.mtimeMs)}`;
}

function createSourceSignature() {
  const pathspecs = getRelevantPathspecs();
  const dirtyFiles = getDirtyFiles(pathspecs);
  const headRevision = getGitScalar(["rev-parse", "HEAD"], "no-git-head");
  const signatureParts = [
    `head:${headRevision}`,
    `roots:${pathspecs.join("|")}`,
    ...[...dirtyFiles].sort().map((relativePath) => getFileSignature(relativePath)),
  ];

  return Buffer.from(signatureParts.join("\n"))
    .toString("base64url")
    .slice(0, 32);
}

async function getServeUrl() {
  if (process.env.TOKOVO_SERVE_URL) {
    return process.env.TOKOVO_SERVE_URL;
  }

  const signature = createSourceSignature();
  const bundleDir = path.join(repoRoot, ".remotion", "bundles", signature);
  const indexPath = path.join(bundleDir, "index.html");

  if (fs.existsSync(indexPath)) {
    console.log(`[render:fast] reusing bundle ${signature}`);
    return bundleDir;
  }

  fs.mkdirSync(bundleDir, { recursive: true });
  console.log(`[render:fast] bundling source signature ${signature}`);

  return bundle({
    entryPoint,
    outDir: bundleDir,
    rootDir: appRoot,
    enableCaching: true,
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const inputProps = { episodeId };
  const publicAssetBaseUrl = process.env.TOKOVO_PUBLIC_ASSET_BASE_URL?.trim();
  const serveUrl = await getServeUrl();
  const composition = await selectComposition({
    serveUrl,
    id: releaseCompositionId,
    inputProps,
    envVariables: publicAssetBaseUrl
      ? { TOKOVO_PUBLIC_ASSET_BASE_URL: publicAssetBaseUrl }
      : undefined,
  });

  console.log(`[render:fast] episode=${episodeId}`);
  console.log(`[render:fast] out=${outFile}`);
  console.log(`[render:fast] concurrency=${concurrency}`);

  await renderMedia({
    composition,
    serveUrl,
    inputProps,
    outputLocation: outFile,
    codec: "h264",
    concurrency,
    videoBitrate: "8M",
    x264Preset: "veryfast",
    hardwareAcceleration: "if-possible",
    chromiumOptions: {
      gl: "angle",
    },
    envVariables: {
      TOKOVO_RENDER_PROFILE: "fast",
      ...(publicAssetBaseUrl
        ? { TOKOVO_PUBLIC_ASSET_BASE_URL: publicAssetBaseUrl }
        : {}),
    },
  });
}

main().catch((error) => {
  console.error("[render:fast] failed", error);
  process.exit(1);
});
