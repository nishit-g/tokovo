import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const dryRun = process.argv.includes("--dry-run");

async function childDirectories(parent) {
  const entries = await fs.readdir(path.join(workspaceRoot, parent), {
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(parent, entry.name));
}

const packageDirectories = [
  ...(await childDirectories("apps")),
  ...(await childDirectories("packages")),
];
const candidates = new Set([
  "tmp",
  ".remotion/bundles",
  "packages/core/coverage",
  ...packageDirectories.flatMap((directory) => [
    path.join(directory, "dist"),
    path.join(directory, "build"),
    path.join(directory, ".next"),
  ]),
]);

for (const directory of packageDirectories) {
  const entries = await fs.readdir(path.join(workspaceRoot, directory), {
    withFileTypes: true,
  });
  for (const entry of entries) {
    if (entry.isFile() && /^tsconfig(?:\..+)?\.tsbuildinfo$/.test(entry.name)) {
      candidates.add(path.join(directory, entry.name));
    }
  }
}

const existing = [];
for (const relativePath of [...candidates].sort()) {
  const absolutePath = path.join(workspaceRoot, relativePath);
  if (
    path.dirname(absolutePath) === workspaceRoot &&
    !["tmp"].includes(relativePath)
  ) {
    throw new Error(
      `Refusing unexpected workspace-root target: ${relativePath}`,
    );
  }
  try {
    await fs.lstat(absolutePath);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    )
      continue;
    throw error;
  }
  existing.push({ absolutePath, relativePath });
}

for (const target of existing) {
  console.log(`${dryRun ? "would remove" : "removed"} ${target.relativePath}`);
  if (!dryRun)
    await fs.rm(target.absolutePath, { recursive: true, force: false });
}

console.log(
  `${dryRun ? "Found" : "Removed"} ${existing.length} generated build target${existing.length === 1 ? "" : "s"}.`,
);
