import { XPlugin } from "@tokovo/apps-x/plugin";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { describe, expect, it } from "vitest";
import xTheLastFrame from "./stories/x-the-last-frame.episode.js";

describe("The Last Frame", () => {
  it("ships a complete X story with a safe default cut and an optical cut", () => {
    const ir = xTheLastFrame.build();
    const prepared = prepareTrackEpisode(ir, [XPlugin], {
      log: false,
      validate: true,
    });
    const cinematics = prepared.cinematics;

    expect(xTheLastFrame.meta.id).toBe("x-the-last-frame");
    expect(ir.durationInFrames).toBe(1140);
    expect(cinematics?.storySignature).toBe(prepared.eventSignature);
    expect(cinematics?.defaultCameraPlanId).toBe("directed");
    expect(
      cinematics?.cameraPrograms.map((program) => program.plan.id),
    ).toEqual(["directed", "optical"]);

    const directed = cinematics?.cameraPrograms.find(
      (program) => program.plan.id === "directed",
    );
    const optical = cinematics?.cameraPrograms.find(
      (program) => program.plan.id === "optical",
    );

    expect(directed?.projectionBackendRequirement).toBe("composited");
    expect(optical?.projectionBackendRequirement).toBe("texture");
    expect(optical?.coverageByOutput["portrait-main"]?.gaps).toEqual([]);
    expect(optical?.plan.lenses.map((lens) => lens.modelId)).toEqual(
      expect.arrayContaining([
        "wide-angle-barrel",
        "fisheye",
        "anamorphic-edge-stretch",
      ]),
    );

    const xEvents = ir.events.filter(
      (event) => event.kind === "APP" && event.appId === "app_x",
    );
    expect(xEvents.some((event) => event.type === "TWEET_REPLY")).toBe(true);
    expect(xEvents.filter((event) => event.type === "DM_SEND")).toHaveLength(5);
    expect(xEvents.some((event) => event.type === "TWEET_CREATE")).toBe(true);
    expect(ir.notificationIntents).toHaveLength(1);
    expect(ir.inputSessions).toHaveLength(1);
  });
});
