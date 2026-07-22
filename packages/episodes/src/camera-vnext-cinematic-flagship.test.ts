import { describe, expect, it } from "vitest";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp/plugin";
import { prepareTrackEpisode } from "@tokovo/compiler";
import cameraVNextCinematicFlagship from "./showcases/apps/camera-vnext-cinematic-flagship.episode.js";

describe("Camera VNext cinematic flagship", () => {
  it("ships one immutable story with independently selectable restrained and kinetic cuts", () => {
    const ir = cameraVNextCinematicFlagship.build();
    const prepared = prepareTrackEpisode(ir, [WhatsAppPlugin], {
      log: false,
      validate: true,
    });
    const cinematics = prepared.cinematics;

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
    expect(kinetic?.plan.outputs).toEqual([
      expect.objectContaining({
        id: "message-pip",
        zIndex: 20,
        clipRadiusPx: 32,
        shadow: { offsetX: 0, offsetY: 18, blurPx: 28, opacity: 0.58 },
      }),
      expect.objectContaining({ id: "portrait-main", zIndex: 0 }),
    ]);
    expect(
      kinetic?.plan.shots.some(
        (shot) => shot.outputId === "message-pip" && shot.rigId === "pip-message",
      ),
    ).toBe(true);
    expect(kinetic?.plan.rigs.find((rig) => rig.id === "pip-message")).not.toHaveProperty("lensId");
    expect(ir.events.some((event) => event.kind === "CAMERA")).toBe(false);
  });
});
