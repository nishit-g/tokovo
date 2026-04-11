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
    "apps/render-service/src",
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
    "packages/publishing/src",
    "packages/react/src",
    "packages/renderer/src",
    "packages/voice/src",
];
const IGNORED_SEGMENTS = new Set([
    "node_modules",
    "dist",
    ".turbo",
    ".next",
    "coverage",
    "tmp",
    "out",
]);
function toPosixPath(filePath) {
    return filePath.split(path.sep).join("/");
}
function walkFiles(rootDir, files) {
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
        files.push(entryPath);
    }
}
function buildFileSignature(filePath) {
    const stat = fs.statSync(filePath);
    const relativePath = toPosixPath(path.relative(repoRoot, filePath));
    return `${relativePath}:${stat.size}:${Math.trunc(stat.mtimeMs)}`;
}
export function getBundleInputManifest() {
    return {
        files: ROOT_INPUT_FILES.map((entry) => path.join(repoRoot, entry)).filter((entry) => fs.existsSync(entry)),
        directories: WORKSPACE_INPUT_DIRS.map((entry) => path.join(repoRoot, entry)).filter((entry) => fs.existsSync(entry)),
    };
}
export function createBundleSourceSignature() {
    const manifest = getBundleInputManifest();
    const inputFiles = [...manifest.files];
    for (const directory of manifest.directories) {
        walkFiles(directory, inputFiles);
    }
    inputFiles.sort();
    return createHash("sha256")
        .update(inputFiles.map(buildFileSignature).join("\n"))
        .digest("hex")
        .slice(0, 32);
}
