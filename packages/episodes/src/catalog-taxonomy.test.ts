import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { EpisodeRegistry } from "./registry/episode-registry.js";
import {
  resolveEpisodeCatalogType,
  resolveEpisodeCategory,
} from "./types/episode-definition.js";
import appShowcaseEpisodes from "./showcases/apps/index.js";
import systemShowcaseEpisodes from "./showcases/system/index.js";
import storyEpisodes from "./stories/index.js";

const srcDir = fileURLToPath(new URL(".", import.meta.url));
const curatedDirs = [
  path.join(srcDir, "showcases", "apps"),
  path.join(srcDir, "showcases", "system"),
  path.join(srcDir, "stories"),
];

function listTypeScriptFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listTypeScriptFiles(nextPath);
    }
    if (entry.isFile() && entry.name.endsWith(".ts")) {
      return [nextPath];
    }
    return [];
  });
}

describe("enterprise episode taxonomy", () => {
  it("resolves explicit curated catalog types correctly", () => {
    expect(resolveEpisodeCatalogType(appShowcaseEpisodes[0].meta)).toBe(
      "app_showcase_flagship",
    );
    expect(resolveEpisodeCatalogType(systemShowcaseEpisodes[0].meta)).toBe(
      "system_showcase",
    );
    expect(resolveEpisodeCatalogType(storyEpisodes[0].meta)).toBe("story");
    expect(resolveEpisodeCategory(storyEpisodes[0].meta)).toBe("production");
    expect(resolveEpisodeCategory(appShowcaseEpisodes[0].meta)).toBe(
      "showcase",
    );
  });

  it("filters registry entries by catalog type and app", () => {
    const registry = new EpisodeRegistry();
    for (const episode of [
      ...appShowcaseEpisodes,
      ...systemShowcaseEpisodes,
      ...storyEpisodes,
    ]) {
      registry.register(episode);
    }

    expect(
      registry.filter({ catalogType: "app_showcase_flagship", appId: "app_whatsapp" }),
    ).toHaveLength(1);
    expect(
      registry.filter({
        catalogType: [
          "app_showcase_flagship",
          "app_showcase_exhaustive",
          "app_showcase_theme",
        ],
      }).length,
    ).toBe(appShowcaseEpisodes.length);
    expect(registry.filter({ catalogType: "system_showcase" }).length).toBe(
      systemShowcaseEpisodes.length,
    );
    expect(registry.filter({ catalogType: "story" }).length).toBe(
      storyEpisodes.length,
    );
  });

  it("ships the full new-only curated wave", () => {
    expect(appShowcaseEpisodes).toHaveLength(21);
    expect(systemShowcaseEpisodes).toHaveLength(7);
    expect(storyEpisodes).toHaveLength(8);
  });

  it("keeps curated catalogs free of obsolete wrappers and imports", () => {
    const curatedFiles = curatedDirs.flatMap(listTypeScriptFiles);
    expect(curatedFiles.length).toBeGreaterThan(0);

    for (const filePath of curatedFiles) {
      const contents = fs.readFileSync(filePath, "utf8");
      expect(contents).not.toMatch(/from\s+["'][^"']*legacy\//);
      expect(contents).not.toMatch(/from\s+["'][.]{1,2}\/legacy\//);
    }
  });
});
