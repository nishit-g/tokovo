import { describe, expect, it } from "vitest";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp/plugin";
import { prepareTrackEpisode } from "@tokovo/compiler";
import whatsappCinematicFlagship from "./showcases/apps/whatsapp-cinematic-flagship.episode.js";

describe("WhatsApp cinematic flagship", () => {
  it("ships one two-device story with independently selectable restrained and kinetic cuts", () => {
    const ir = whatsappCinematicFlagship.build();
    const prepared = prepareTrackEpisode(ir, [WhatsAppPlugin], {
      log: false,
      validate: true,
    });
    const cinematics = prepared.cinematics;

    expect(ir.devices.map((device) => device.profile)).toEqual(["iphone16", "pixel"]);
    expect(cinematics?.storySignature).toBe(prepared.eventSignature);
    expect(cinematics?.defaultCameraPlanId).toBe("kinetic");
    expect(cinematics?.cameraPrograms.map((program) => program.plan.id)).toEqual([
      "restrained",
      "kinetic",
    ]);

    const restrained = cinematics?.cameraPrograms.find(
      (program) => program.plan.id === "restrained",
    );
    const kinetic = cinematics?.cameraPrograms.find((program) => program.plan.id === "kinetic");

    expect(restrained?.signature).not.toBe(kinetic?.signature);
    expect(restrained?.projectionBackendRequirement).toBe("composited");
    expect(kinetic?.projectionBackendRequirement).toBe("texture");
    expect(kinetic?.coverageByOutput["portrait-main"]?.gaps).toEqual([]);
    expect(kinetic?.plan.outputs).toEqual([
      expect.objectContaining({
        id: "calls-pip",
        zIndex: 20,
        clipRadiusPx: 42,
        shadow: { offsetX: 0, offsetY: 18, blurPx: 34, opacity: 0.5 },
      }),
      expect.objectContaining({
        id: "notification-handoff",
        zIndex: 20,
        clipRadiusPx: 42,
        shadow: { offsetX: 0, offsetY: 18, blurPx: 34, opacity: 0.5 },
      }),
      expect.objectContaining({ id: "portrait-main", zIndex: 0 }),
    ]);
    const lensModels = kinetic?.plan.lenses.map((lens) => lens.modelId) ?? [];
    expect(lensModels).toHaveLength(4);
    expect(lensModels).toEqual(
      expect.arrayContaining(["wide-angle-barrel", "fisheye", "anamorphic-edge-stretch"]),
    );
    expect(
      kinetic?.plan.rigs
        .map((rig) => rig.motion?.intent?.kind)
        .filter((kind): kind is NonNullable<typeof kind> => Boolean(kind)),
    ).toEqual(expect.arrayContaining(["dolly-in", "dolly-out", "truck-left"]));
    expect(ir.events.some((event) => event.kind === "CAMERA")).toBe(false);
  });
});
