import { CameraPlanSchema } from "@tokovo/ir";
import { describe, expect, it } from "vitest";
import { cameraSubject, CinematicAuthoringError, cinematicProgram } from "./cinematics.js";

describe("Camera VNext authoring", () => {
  it("authors compact plan families without hiding the emitted camera contract", () => {
    const subject = cameraSubject.scope("phone", "app_x");
    const program = cinematicProgram(
      {
        fps: 30,
        duration: "4s",
        stage: {
          width: 1080,
          height: 1920,
          devices: [
            {
              deviceId: "phone",
              x: 270,
              y: 360,
              width: 540,
              height: 1172,
            },
          ],
        },
      },
      (cinema) => {
        cinema.planFamily({
          plans: [
            { id: "directed", default: true },
            {
              id: "optical",
              look: {
                lenses: {
                  detail: {
                    model: "fisheye",
                    strength: 0.05,
                  },
                },
              },
              defaultRigs: {
                main: { modifierIds: ["breath"] },
              },
            },
          ],
          look: {
            modifiers: {
              breath: {
                model: "lens-breathing",
                amount: 0.002,
                periodFrames: 180,
              },
            },
            filters: {
              night: {
                model: "color-grade",
                contrast: 1.08,
              },
            },
          },
          framings: {
            detail: {
              position: [0.5, 0.5],
              fill: 0.72,
              mode: "width",
              padding: 36,
              min: 0.4,
              max: 1.2,
            },
          },
          outputs: [
            {
              id: "main",
              viewport: { x: 0, y: 0, width: 1080, height: 1920 },
              compositionProfileId: "hero-device",
              coveragePolicy: "require-shots",
              travel: {
                mode: "stabilized",
                subject: subject.body,
                maxDriftPx: [54, 72],
              },
              defaultRig: {
                id: "hero",
                subject: subject.body,
                frame: {
                  fill: 0.84,
                  padding: 48,
                  min: 0.4,
                  max: 1,
                },
                framingGuard: {
                  subject: subject.body,
                  paddingPx: 48,
                  screenPosition: [0.5, 0.5],
                },
                motion: { type: "minimum-jerk", durationFrames: 18 },
              },
            },
          ],
          sequences: [
            {
              outputId: "main",
              end: "4s",
              defaults: {
                frame: "detail",
                filters: ["night"],
              },
              shots: [
                {
                  id: "establish",
                  target: subject.body,
                  duration: "2s",
                  frame: { preset: "detail", mode: "contain", fill: 0.84 },
                  motion: {
                    kind: "dolly-in",
                    duration: "600ms",
                    amount: 0.06,
                  },
                  blend: { duration: "300ms", curve: "smoothstep" },
                  trajectory: {
                    interpolation: "minimum-jerk",
                    keyframes: [
                      {
                        frame: 0,
                        offsetX: 0,
                        offsetY: 0,
                        scaleMultiplier: 1,
                        rotationOffsetDeg: 0,
                      },
                      {
                        frame: 30,
                        offsetX: -12,
                        offsetY: 8,
                        scaleMultiplier: 1.04,
                        rotationOffsetDeg: -0.5,
                      },
                    ],
                  },
                },
                {
                  id: "message",
                  target: subject.entity("message", "m1", "bubble"),
                  duration: "2s",
                  missing: subject.screen,
                  variants: {
                    optical: {
                      lens: "detail",
                      modifiers: [],
                    },
                  },
                  motion: { kind: "settle", duration: "400ms" },
                },
              ],
            },
          ],
        });
      },
    );

    expect(program.defaultCameraPlanId).toBe("directed");
    expect(program.cameraPlans).toHaveLength(2);
    const directed = program.cameraPlans[0]!;
    const optical = program.cameraPlans[1]!;
    expect(directed.shots.map((shot) => [shot.id, shot.startFrame, shot.endFrame])).toEqual([
      ["establish", 0, 60],
      ["message", 60, 120],
    ]);
    expect(directed.shots[0]?.blendIn).toEqual({
      durationFrames: 9,
      curve: "smoothstep",
    });
    expect(directed.rigs.find((rig) => rig.id === "establish.rig")).toMatchObject({
      tracking: { mode: "direct" },
      bakedTrajectory: {
        interpolation: "minimum-jerk",
        keyframes: [{ frame: 0 }, { frame: 30 }],
      },
    });
    expect(directed.rigs.find((rig) => rig.id === "message.rig")?.lensId).toBeUndefined();
    expect(optical.rigs.find((rig) => rig.id === "message.rig")?.lensId).toBe("detail");
    expect(directed.lenses).toEqual([]);
    expect(optical.lenses[0]).toMatchObject({
      id: "detail",
      modelId: "fisheye",
      modelVersion: 1,
      parameters: { strength: 0.05 },
    });
    expect(optical.rigs.find((rig) => rig.id === "hero")?.modifierIds).toEqual(["breath"]);
    expect(optical.rigs.find((rig) => rig.id === "message.rig")?.composer).toEqual({
      screenPosition: [0.5, 0.5],
      targetFill: 0.72,
      fillMode: "width",
      paddingPx: 36,
      minScale: 0.4,
      maxScale: 1.2,
    });
    expect(JSON.stringify(program)).not.toContain("undefined");
  });

  it("fails compact authoring on timing drift and misspelled plan variants", () => {
    const subject = cameraSubject.scope("phone");
    const base = {
      plans: [{ id: "main", default: true }],
      outputs: [
        {
          id: "main",
          viewport: { x: 0, y: 0, width: 1080, height: 1920 },
          compositionProfileId: "hero-device" as const,
          coveragePolicy: "require-shots" as const,
          travel: {
            mode: "stabilized" as const,
            subject: subject.body,
          },
          defaultRig: {
            subject: subject.body,
            frame: { fill: 0.82 },
          },
        },
      ],
    } as const;

    expect(() =>
      cinematicProgram(
        {
          fps: 30,
          duration: "2s",
          stage: {
            width: 1080,
            height: 1920,
            devices: [{ deviceId: "phone", width: 540, height: 1172 }],
          },
        },
        (cinema) => {
          cinema.planFamily({
            ...base,
            sequences: [
              {
                outputId: "main",
                end: "2s",
                shots: [
                  {
                    id: "short",
                    target: subject.body,
                    duration: "1s",
                  },
                ],
              },
            ],
          });
        },
      ),
    ).toThrowError(expect.objectContaining({ code: "CINEMATIC_SEQUENCE_END_MISMATCH" }));

    expect(() =>
      cinematicProgram(
        {
          fps: 30,
          duration: "2s",
          stage: {
            width: 1080,
            height: 1920,
            devices: [{ deviceId: "phone", width: 540, height: 1172 }],
          },
        },
        (cinema) => {
          cinema.planFamily({
            ...base,
            sequences: [
              {
                outputId: "main",
                end: "2s",
                shots: [
                  {
                    id: "full",
                    target: subject.body,
                    duration: "2s",
                    variants: { typo: { lens: "ghost" } },
                  },
                ],
              },
            ],
          });
        },
      ),
    ).toThrowError(expect.objectContaining({ code: "CINEMATIC_VARIANT_UNKNOWN" }));

    expect(() =>
      cinematicProgram(
        {
          fps: 30,
          duration: "2s",
          stage: {
            width: 1080,
            height: 1920,
            devices: [{ deviceId: "phone", width: 540, height: 1172 }],
          },
        },
        (cinema) => {
          cinema.planFamily({
            ...base,
            sequences: [
              {
                outputId: "main",
                end: "2s",
                shots: [
                  {
                    id: "full",
                    target: subject.body,
                    duration: "2s",
                    frame: "typo",
                  },
                ],
              },
            ],
          });
        },
      ),
    ).toThrowError(expect.objectContaining({ code: "CINEMATIC_FRAMING_UNKNOWN" }));
  });

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
                travel: {
                  mode: "stabilized",
                  mount: {
                    subject: body,
                    screenPosition: [0.5, 0.5],
                    maxDriftPx: [54, 72],
                  },
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
                  .mount(body)
                  .guard(body, { paddingPx: 28 })
                  .lens("typing-fisheye")
                  .filters("night")
                  .dollyIn({ duration: "1.2s", toFill: 0.9 }),
              )
              .shot("pull", "main", "2s", "4s", (shot) =>
                shot.target(body).mount(body).dollyOut({ duration: "1s", toFill: 0.72 }),
              )
              .shot("truck", "main", "4s", "6s", (shot) =>
                shot.target(body).mount(body).truckLeft({ duration: "0.8s", amount: 0.06 }),
              )
              .shot("pedestal", "main", "6s", "8s", (shot) =>
                shot.target(body).mount(body).pedestalUp({ duration: "0.8s", amount: 0.05 }),
              )
              .shot("orbit", "main", "8s", "10s", (shot) =>
                shot.target(body).mount(body).orbit({ duration: "1.2s", yawDeg: 5, pitchDeg: -3 }),
              )
              .shot("roll", "main", "10s", "12s", (shot) =>
                shot.target(body).mount(body).roll({ duration: "0.8s", angleDeg: -2 }),
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
              travel: {
                mode: "intentional",
                reason: "Duplicate identifier validation fixture.",
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
