import { InstagramPlugin } from "@tokovo/apps-instagram/plugin";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp/plugin";
import { XPlugin } from "@tokovo/apps-x/plugin";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { describe, expect, it } from "vitest";
import theApologyTemplateWentLive from "./stories/the-apology-template-went-live.episode.js";

describe("The Apology Template Went Live", () => {
  it("compiles a complete single-device, multi-app optical story", () => {
    const ir = theApologyTemplateWentLive.build();
    const prepared = prepareTrackEpisode(
      ir,
      [WhatsAppPlugin, XPlugin, InstagramPlugin],
      {
        log: false,
        validate: true,
      },
    );
    const cinematics = prepared.cinematics;

    expect(theApologyTemplateWentLive.meta.id).toBe(
      "the-apology-template-went-live",
    );
    expect(ir.durationInFrames).toBe(1260);
    expect(ir.devices).toHaveLength(1);
    expect(ir.devices[0]?.installedApps).toEqual([
      "app_whatsapp",
      "app_x",
      "app_instagram",
    ]);
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
    expect(optical?.plan.lenses.length).toBeGreaterThanOrEqual(5);

    const appIds = new Set(
      ir.events.flatMap((event) =>
        event.kind === "APP" ? [event.appId] : [],
      ),
    );
    expect(appIds).toEqual(
      new Set(["app_whatsapp", "app_x", "app_instagram"]),
    );
    expect(
      ir.events.filter(
        (event) => event.kind === "DEVICE" && event.type === "OPEN_APP",
      ),
    ).toHaveLength(3);
    expect(ir.notificationIntents).toHaveLength(1);
    expect(ir.inputSessions).toHaveLength(2);
    expect(ir.inputSessions?.map((session) => session.fieldId)).toEqual([
      "post",
      "composer",
    ]);
  });
});
