import { describe, expect, it } from "vitest";
import { XPlugin } from "@tokovo/apps-x/plugin";
import { prepareTrackEpisode } from "@tokovo/compiler";
import xCinematicFlagship from "./showcases/apps/x-cinematic-flagship.episode.js";
import xNativeThemeMatrix from "./showcases/apps/x-native-theme-matrix-vnext.episode.js";

describe("X VNext cinematic proofs", () => {
  it("ships release-safe and kinetic cuts over exact entity subjects", () => {
    const prepared = prepareTrackEpisode(xCinematicFlagship.build(), [XPlugin], {
      log: false,
      validate: true,
    });
    const cinematics = prepared.cinematics;
    expect(cinematics?.defaultCameraPlanId).toBe("restrained");
    expect(cinematics?.cameraPrograms.map((program) => program.plan.id)).toEqual([
      "restrained",
      "kinetic",
    ]);

    const restrained = cinematics?.cameraPrograms.find((program) => program.plan.id === "restrained");
    const kinetic = cinematics?.cameraPrograms.find((program) => program.plan.id === "kinetic");
    expect(restrained?.projectionBackendRequirement).toBe("composited");
    expect(kinetic?.projectionBackendRequirement).toBe("texture");
    expect(restrained?.coverageByOutput["portrait-main"]?.gaps).toEqual([]);
    expect(kinetic?.coverageByOutput["portrait-main"]?.gaps).toEqual([]);
    expect(kinetic?.plan.lenses.map((lens) => lens.modelId)).toEqual(
      expect.arrayContaining([
        "fisheye",
        "wide-angle-barrel",
        "anamorphic-edge-stretch",
      ]),
    );

    const entityTargets = kinetic?.plan.rigs
      .map((rig) => rig.subject)
      .filter((subject) => subject.kind === "entity") ?? [];
    expect(entityTargets).toEqual(expect.arrayContaining([
      expect.objectContaining({ entityType: "tweet", entityId: "x_launch_cut", region: "media" }),
      expect.objectContaining({ entityType: "notification", entityId: "x_nt_mention", region: "row" }),
      expect.objectContaining({ entityType: "message", entityId: "x_msg_reply", region: "bubble" }),
      expect.objectContaining({ entityType: "profile", entityId: "x_creator", region: "header" }),
    ]));
  });

  it("frames the three native theme experiences as one covered tableau", () => {
    const prepared = prepareTrackEpisode(xNativeThemeMatrix.build(), [XPlugin], {
      log: false,
      validate: true,
    });
    const program = prepared.cinematics?.cameraPrograms[0];
    expect(prepared.initialWorld.devices).toMatchObject({
      ios_light: { appAppearance: "light" },
      android_dim: { appAppearance: "dark", appTheme: "x-dim" },
      ios_lights_out_hi: { appAppearance: "dark", appTheme: "x-lights-out" },
    });
    expect(program?.coverageByOutput["portrait-main"]?.gaps).toEqual([]);
    expect(program?.projectionBackendRequirement).toBe("composited");
  });
});
