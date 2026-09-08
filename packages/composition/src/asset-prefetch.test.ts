import type { EpisodeAssetRef } from "@tokovo/core";
import { describe, expect, it } from "vitest";
import { selectAssetsForPrefetch } from "./asset-prefetch.js";

function asset(
  id: string,
  input: Partial<EpisodeAssetRef> = {},
): EpisodeAssetRef {
  return {
    id,
    kind: "image",
    src: `/${id}.png`,
    strategy: "timeline",
    priority: 0,
    fromFrame: 0,
    ...input,
  };
}

describe("selectAssetsForPrefetch", () => {
  it("keeps eager and near-playhead media while rejecting distant assets", () => {
    expect(
      selectAssetsForPrefetch(
        [
          asset("distant", { fromFrame: 500 }),
          asset("near", { fromFrame: 90 }),
          asset("eager", { fromFrame: 900, strategy: "eager" }),
          asset("disabled", { strategy: "none" }),
        ],
        0,
        30,
      ).map((entry) => entry.id),
    ).toEqual(["eager", "near"]);
  });

  it("uses priority and stable source ordering for equal candidates", () => {
    expect(
      selectAssetsForPrefetch(
        [
          asset("b", { priority: 1 }),
          asset("a", { priority: 1 }),
          asset("high", { priority: 2 }),
        ],
        0,
        30,
      ).map((entry) => entry.id),
    ).toEqual(["high", "a", "b"]);
  });
});
