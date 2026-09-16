import { describe, it, expect } from "vitest";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp/plugin";
import episode from "./showcases/system/camera-motion-stress.episode.js";

describe("camera motion stress fixture", () => {
  it("covers interruptions, input reflow, notification focus and navigation", () => {
    const prepared = prepareTrackEpisode(episode.build(), [WhatsAppPlugin], {
      validate: true,
      log: false,
    });
    const camera = prepared.cinematics!.cameraPrograms[0];
    expect(camera.coverageByOutput.portrait.gaps).toEqual([]);
    expect(
      camera.plan.shots.filter((shot) => shot.direction?.continuity === "velocity"),
    ).toHaveLength(3);
    expect(
      camera.plan.shots.find((shot) => shot.id === "keyboard-and-scroll")?.direction?.tracking,
    ).toBeDefined();
    expect(prepared.inputProgram?.sessions).toHaveLength(1);
    expect(prepared.notificationProgram?.records.some((record) => record.id === "qa-banner")).toBe(
      true,
    );
    expect(camera.plan.modifiers[0].modelId).toBe("impact-shake");
    expect(
      camera.plan.shots.find((shot) => shot.id === "bounded-impact")?.direction?.checkFraming,
    ).toBe(true);
    expect(
      camera.plan.shots.find((shot) => shot.id === "safe-reading")?.direction?.tracking,
    ).toMatchObject({ minimumReadingScale: 0.8, minimumTextPx: 24 });
    expect(
      camera.plan.shots.find((shot) => shot.id === "keyboard-and-scroll")?.direction?.tracking
        ?.panLimits,
    ).toBeDefined();
    expect(camera.plan.shots.find((shot) => shot.id === "banner")?.direction?.framing).toBe(
      "follow-position",
    );
  });
});
