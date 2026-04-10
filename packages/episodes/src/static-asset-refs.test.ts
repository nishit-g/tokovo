import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const episodesRoot = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = path.resolve(episodesRoot, "../../..");
const publicRoot = path.join(repoRoot, "apps", "video-runner", "public");
const episodeSourceRoots = [
  path.join(episodesRoot, "showcases"),
  path.join(episodesRoot, "stories"),
  path.join(episodesRoot, "legacy"),
  path.join(episodesRoot, "tests"),
  path.join(episodesRoot, "v2"),
];

const assetPattern =
  /(?:src|avatar|avatarUrl|thumbnail|imageUrl|coverImage)\s*:\s*"([^"]+)"|background\(\{[\s\S]*?src:\s*"([^"]+)"/g;

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(nextPath);
    }
    if (entry.isFile() && nextPath.endsWith(".ts")) {
      return [nextPath];
    }
    return [];
  });
}

function collectAssetRefs(filePath: string): string[] {
  const contents = fs.readFileSync(filePath, "utf8");
  const refs: string[] = [];

  for (const match of contents.matchAll(assetPattern)) {
    const value = match[1] ?? match[2];
    if (!value?.startsWith("/")) {
      continue;
    }
    refs.push(value);
  }

  return refs;
}

describe("episode static asset references", () => {
  it("only points at files that exist in video-runner public", () => {
    const missing: Array<{ asset: string; file: string }> = [];

    for (const root of episodeSourceRoots) {
      for (const filePath of listFiles(root)) {
        for (const assetPath of collectAssetRefs(filePath)) {
          const fullPath = path.join(publicRoot, assetPath.slice(1));
          if (!fs.existsSync(fullPath)) {
            missing.push({ asset: assetPath, file: filePath });
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
