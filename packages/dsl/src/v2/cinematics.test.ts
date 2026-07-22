import { CameraPlanSchema } from "@tokovo/ir";
import { describe, expect, it } from "vitest";
import { cameraSubject, CinematicAuthoringError, cinematicProgram } from "./cinematics.js";

describe("Camera VNext authoring", () => {
  it("authors traceable movement, lenses, filters and physical stage geometry", () => {
    const body = cameraSubject.device("phone", "body");
    const screen = cameraSubject.device("phone", "screen");
    const program = cinematicProgram(
      {
        fps: 60,
        duration: "12s",
        stage: {
          width: 1350,
          height: 2856,
          devices: [{ deviceId: "phone", width: 1350, height: 2856 }],
        },
      },
      (cinema) => {
        cinema.plan(
          "kinetic",
          (camera) => {
            camera
              .output("main", {
                viewport: { x: 0, y: 0, width: 1080, height: 1920 },
                defaultRigId: "neutral",
                compositionProfileId: "hero-device",
              })
              .rig("neutral", {
                outputId: "main",
                subject: body,
                composer: {
                  screenPosition: [0.5, 0.5],
                  targetFill: 0.82,
                  fillMode: "contain",
                  paddingPx: 24,
                },
                motion: { type: "cut" },
              })
              .lens("typing-fisheye", "fisheye", { strength: 0.1 })
              .filter("night", "color-grade", {
                brightness: -0.02,
                contrast: 1.08,
                saturation: 0.92,
                temperature: -0.08,
              })
              .shot("push", "main", "0s", "2s", (shot) =>
                shot
                  .target(screen)
                  .guard(body, { paddingPx: 28 })
                  .lens("typing-fisheye")
                  .filters("night")
                  .dollyIn({ duration: "1.2s", toFill: 0.9 }),
              )
              .shot("pull", "main", "2s", "4s", (shot) =>
                shot.target(body).dollyOut({ duration: "1s", toFill: 0.72 }),
              )
              .shot("truck", "main", "4s", "6s", (shot) =>
                shot.target(body).truckLeft({ duration: "0.8s", amount: 0.06 }),
              )
              .shot("pedestal", "main", "6s", "8s", (shot) =>
                shot.target(body).pedestalUp({ duration: "0.8s", amount: 0.05 }),
              )
              .shot("orbit", "main", "8s", "10s", (shot) =>
                shot.target(body).orbit({ duration: "1.2s", yawDeg: 5, pitchDeg: -3 }),
              )
              .shot("roll", "main", "10s", "12s", (shot) =>
                shot.target(body).roll({ duration: "0.8s", angleDeg: -2 }),
              );
          },
          { default: true },
        );
      },
    );

    const plan = CameraPlanSchema.parse(program.cameraPlans[0]);
    expect(plan.filters).toHaveLength(1);
    expect(plan.lenses.map((lens) => lens.id)).toEqual(["typing-fisheye", "orbit.orbit"]);
    expect(plan.rigs.map((rig) => rig.motion?.intent?.kind).filter(Boolean)).toEqual([
      "dolly-in",
      "dolly-out",
      "truck-left",
      "pedestal-up",
      "orbit",
      "roll",
    ]);
    expect(program.stageProgram.nodes[1]?.localBounds).toEqual({
      x: 0,
      y: 0,
      width: 1350,
      height: 2856,
    });
    expect(JSON.stringify(program)).not.toContain("undefined");
  });

  it("fails during authoring on duplicate ids and invalid cross-references", () => {
    const options = {
      fps: 60,
      duration: "2s",
      stage: {
        width: 1350,
        height: 2856,
        devices: [{ deviceId: "phone", width: 1350, height: 2856 }],
      },
    } as const;
    const body = cameraSubject.device("phone", "body");

    expect(() =>
      cinematicProgram(options, (cinema) => {
        cinema.plan("duplicate", (camera) => {
          camera
            .output("main", {
              viewport: { x: 0, y: 0, width: 1080, height: 1920 },
              defaultRigId: "neutral",
              compositionProfileId: "hero-device",
            })
            .output("main", {
              viewport: { x: 0, y: 0, width: 1080, height: 1920 },
              defaultRigId: "neutral",
              compositionProfileId: "hero-device",
            })
            .rig("neutral", {
              outputId: "main",
              subject: body,
              composer: {
                screenPosition: [0.5, 0.5],
                targetFill: 0.8,
                fillMode: "contain",
              },
            });
        });
      }),
    ).toThrowError(expect.objectContaining({ code: "CINEMATIC_ID_DUPLICATE" }));

    expect(() =>
      cinematicProgram(options, (cinema) => {
        cinema.plan("missing-default", (camera) => {
          camera.output("main", {
            viewport: { x: 0, y: 0, width: 1080, height: 1920 },
            defaultRigId: "ghost",
            compositionProfileId: "hero-device",
          });
        });
      }),
    ).toThrowError(expect.objectContaining({ code: "CINEMATIC_DEFAULT_RIG_INVALID" }));
  });

  it("exposes stable authoring errors for invalid subject and stage data", () => {
    expect(() => cameraSubject.device("", "body")).toThrow(CinematicAuthoringError);
    expect(() =>
      cinematicProgram(
        {
          fps: 60,
          duration: "2s",
          stage: {
            width: 1350,
            height: 2856,
            devices: [
              { deviceId: "phone", width: 1350, height: 2856 },
              { deviceId: "phone", width: 1350, height: 2856 },
            ],
          },
        },
        () => {},
      ),
    ).toThrowError(expect.objectContaining({ code: "CINEMATIC_ID_DUPLICATE" }));
  });
});
