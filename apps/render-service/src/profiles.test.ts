import { describe, expect, it } from "vitest";

import { DETERMINISTIC_CHROMIUM_GL, RENDER_PROFILES, getRenderProfile } from "./profiles.js";

describe("render profiles", () => {
  it("uses the pinned measured Chromium renderer for every artifact profile", () => {
    for (const profile of Object.values(RENDER_PROFILES)) {
      expect(profile.chromiumGl).toBe(DETERMINISTIC_CHROMIUM_GL);
    }
  });

  it("keeps the release profile lossless at the frame-capture boundary", () => {
    const release = getRenderProfile("release");
    expect(release.imageFormat).toBe("png");
    expect(release.chromiumGl).toBe("angle");
    expect(release.concurrency).toBeGreaterThanOrEqual(4);
    expect(release.compositorConcurrency).toBeGreaterThanOrEqual(2);
  });
});
