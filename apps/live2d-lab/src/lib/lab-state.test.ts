import { describe, expect, it } from "vitest";
import {
  buildLabReactionPlan,
  getLabAssetChecks,
  LAB_SCENARIOS,
} from "./lab-state.js";

describe("live2d lab state", () => {
  it("builds a shared-runtime reaction plan for the duo crossfire scenario", () => {
    const plan = buildLabReactionPlan("duo-crossfire");
    const heroAvatar = plan.cast[0]?.visualProfile.avatar;
    const guestAvatar = plan.cast[1]?.visualProfile.avatar;

    expect(plan.formatPreset).toBe("stream-chaos-vertical");
    expect(plan.cast).toHaveLength(2);
    expect(heroAvatar?.kind).toBe("live2d");
    expect(guestAvatar?.kind).toBe("pngtuber");
    expect(guestAvatar?.kind === "pngtuber" ? guestAvatar.mode : null).toBe(
      "motion-video",
    );
    expect(guestAvatar?.kind === "pngtuber" ? guestAvatar.videoSrc : null).toBe(
      "/backgrounds/bokeh-loop.mp4",
    );
    expect(guestAvatar?.kind === "pngtuber" ? guestAvatar.mouthTrackSrc : null).toBe(
      "/pngtuber/mira/mouth_track.json",
    );
    expect(heroAvatar?.kind === "live2d" ? heroAvatar.modelJsonSrc : null).toBe(
      "/live2d/haru/Haru.model3.json",
    );
    expect(heroAvatar?.kind === "live2d" ? heroAvatar.coreScriptSrc : null).toBe(
      "/scripts/live2dcubismcore.min.js",
    );
    expect(plan.segments.map((segment) => segment.id)).toEqual(
      LAB_SCENARIOS["duo-crossfire"].segments.map((segment) => segment.id),
    );
  });

  it("surfaces the enterprise asset checks for the Haru sample rig", () => {
    const checks = getLabAssetChecks();

    expect(checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "core-script",
          label: "Cubism Core",
          expectedPath: "/scripts/live2dcubismcore.min.js",
          required: true,
        }),
        expect.objectContaining({
          id: "live2d-model",
          label: "Haru model",
          expectedPath: "/live2d/haru/Haru.model3.json",
          required: true,
        }),
        expect.objectContaining({
          id: "png-mouth-track",
          label: "PNGTuber mouth track",
          expectedPath: "/pngtuber/mira/mouth_track.json",
          required: true,
        }),
      ]),
    );
  });
});
