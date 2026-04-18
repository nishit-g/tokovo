import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearEpisodeRenderDataCaches,
  getEpisodeRenderData,
} from "../render-data.ts";

describe("video-runner reactor avatar assets", () => {
  beforeEach(() => {
    clearEpisodeRenderDataCaches();
  });

  it("collects pngtuber and live2d preview assets for the baseline reactor demo", async () => {
    const renderData = await getEpisodeRenderData("v2-reactor-baseline");
    const assetPaths = renderData.prepared.assetRefs.map((asset) => asset.path);
    const hero = renderData.reactionPlan?.cast.find((member) => member.id === "hero");
    const guest = renderData.reactionPlan?.cast.find((member) => member.id === "guest");
    const cubismCorePath = fileURLToPath(
      new URL("../../public/scripts/live2dcubismcore.min.js", import.meta.url),
    );
    const haruModelPath = fileURLToPath(
      new URL("../../public/live2d/haru/Haru.model3.json", import.meta.url),
    );

    expect(hero?.visualProfile.avatar?.kind).toBe("live2d");
    expect(guest?.visualProfile.avatar?.kind).toBe("pngtuber");
    expect(hero?.visualProfile.avatar?.modelJsonSrc).toBe("/live2d/haru/Haru.model3.json");
    expect(renderData.reactionPlan?.characterPresets).toHaveLength(2);
    expect(renderData.reactionPlan?.assetRegistry).toHaveLength(2);
    expect(existsSync(cubismCorePath)).toBe(true);
    expect(existsSync(haruModelPath)).toBe(true);
    expect(assetPaths).toContain(
      "reactionPlan.cast.hero.visualProfile.avatar.coreScriptSrc",
    );
    expect(assetPaths).toContain(
      "reactionPlan.cast.hero.visualProfile.avatar.modelJsonSrc",
    );
    expect(assetPaths).toContain(
      "reactionPlan.cast.hero.visualProfile.avatar.previewPosterSrc",
    );
    expect(assetPaths).toContain(
      "reactionPlan.cast.guest.visualProfile.avatar.frames.speaking",
    );
  });
});
