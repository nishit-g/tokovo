import {
  cameraSubject,
  cinematicProgram,
  type CinematicPlanBuilder,
  type CinematicShotBuilder,
} from "@tokovo/dsl";
import type { CinematicSubjectRefIR } from "@tokovo/ir";

const FPS = 30;
const DURATION = 1140;
const OUTPUT = "portrait-main";
const DEVICE = "phone";
const APP = "app_x";

const body = (): CinematicSubjectRefIR => cameraSubject.device(DEVICE, "body");
const screen = (): CinematicSubjectRefIR =>
  cameraSubject.device(DEVICE, "screen");
const keyboard = (): CinematicSubjectRefIR =>
  cameraSubject.device(DEVICE, "keyboard");
const semantic = (subjectId: string): CinematicSubjectRefIR =>
  cameraSubject.semantic(DEVICE, APP, subjectId);
const entity = (
  type: string,
  id: string,
  region: string,
): CinematicSubjectRefIR => cameraSubject.entity(DEVICE, APP, type, id, region);

function frame(
  shot: CinematicShotBuilder,
  subject: CinematicSubjectRefIR,
  options: {
    position?: readonly [number, number];
    fill?: number;
    mode?: "contain" | "cover" | "width" | "height";
    min?: number;
    max?: number;
    padding?: number;
  } = {},
): CinematicShotBuilder {
  return shot.target(subject).frame({
    screenPosition: options.position ?? [0.5, 0.5],
    targetFill: options.fill ?? 0.76,
    fillMode: options.mode ?? "contain",
    paddingPx: options.padding ?? 42,
    minScale: options.min ?? 0.38,
    maxScale: options.max ?? 1.3,
  });
}

function registerLook(camera: CinematicPlanBuilder): void {
  camera
    .lens("evidence-wide", "wide-angle-barrel", {
      center: [0.5, 0.45],
      strength: 0.038,
      radius: 1.2,
      cropCompensation: 1.016,
    })
    .lens("notification-pressure", "anamorphic-edge-stretch", {
      axis: "vertical",
      strength: 0.028,
      edgeStart: 0.86,
      cropCompensation: 1.01,
    })
    .lens("keyboard-focus", "fisheye", {
      center: [0.5, 0.76],
      strength: 0.048,
      radius: 1.24,
      cropCompensation: 1.02,
    })
    .lens("reveal-wide", "anamorphic-edge-stretch", {
      axis: "horizontal",
      strength: 0.04,
      edgeStart: 0.82,
      cropCompensation: 1.014,
    })
    .modifier("held-breath", "lens-breathing", {
      amount: 0.002,
      periodFrames: 210,
    })
    .filter("launch-night", "color-grade", {
      brightness: -0.012,
      contrast: 1.055,
      saturation: 0.9,
      gamma: 0.995,
      temperature: -0.035,
      tint: 0.006,
    })
    .filter("evidence-cold", "color-grade", {
      brightness: -0.018,
      contrast: 1.09,
      saturation: 0.84,
      gamma: 0.99,
      temperature: -0.07,
      tint: 0.012,
    })
    .filter("reveal-warm", "color-grade", {
      brightness: 0.006,
      contrast: 1.065,
      saturation: 0.96,
      gamma: 1.005,
      temperature: 0.035,
      tint: 0.004,
    });
}

function direct(camera: CinematicPlanBuilder, optical: boolean): void {
  camera
    .shot("stage-before-the-leak", OUTPUT, 0, 132, (shot) => {
      frame(shot, body(), { fill: 0.84, max: 1.12, padding: 58 })
        .filters("launch-night")
        .dollyIn({ duration: 42, toFill: 0.84, amount: 0.06 });
    })
    .shot("the-reply", OUTPUT, 132, 270, (shot) => {
      frame(shot, entity("tweet", "x_intrusion_reply", "card"), {
        position: [0.5, 0.52],
        fill: 0.68,
        mode: "width",
        min: 0.44,
        max: 1.28,
      })
        .fallback(screen())
        .filters("evidence-cold")
        .dollyIn({ duration: 28, toFill: 0.68, amount: 0.075 });
      if (optical) shot.lens("evidence-wide").modifiers("held-breath");
    })
    .shot("queue-alert", OUTPUT, 270, 327, (shot) => {
      frame(shot, entity("notification", "x_queue_alert", "row"), {
        position: [0.5, 0.38],
        fill: 0.7,
        mode: "width",
        min: 0.46,
        max: 1.32,
      })
        .fallback(semantic("x.notifications.list"))
        .filters("evidence-cold")
        .settle(18);
      if (optical) shot.lens("notification-pressure");
    })
    .shot("messages-bridge", OUTPUT, 327, 375, (shot) => {
      frame(shot, body(), { fill: 0.84, max: 1, padding: 58 })
        .filters("evidence-cold")
        .settle(18);
    })
    .shot("thread-establishing", OUTPUT, 375, 414, (shot) => {
      frame(shot, screen(), { fill: 0.84, max: 1, padding: 58 })
        .filters("evidence-cold")
        .settle(24);
    })
    .shot("token-evidence", OUTPUT, 414, 510, (shot) => {
      frame(shot, entity("message", "x_msg_token", "bubble"), {
        position: [0.5, 0.44],
        fill: 0.47,
        mode: "width",
        min: 0.42,
        max: 1.05,
      })
        .fallback(semantic("x.thread.messages"))
        .filters("evidence-cold")
        .truckLeft({ duration: 24, amount: 0.012 });
      if (optical) shot.modifiers("held-breath");
    })
    .shot("stage-denial", OUTPUT, 510, 576, (shot) => {
      frame(shot, entity("message", "x_msg_stage", "bubble"), {
        position: [0.5, 0.54],
        fill: 0.48,
        mode: "width",
        min: 0.42,
        max: 1.06,
      })
        .fallback(semantic("x.thread.messages"))
        .filters("launch-night")
        .settle(14);
    })
    .shot("type-the-decision", OUTPUT, 576, 624, (shot) => {
      frame(shot, keyboard(), {
        position: [0.5, 0.72],
        fill: 0.8,
        mode: "width",
        min: 0.44,
        max: 1.2,
      })
        .fallback(semantic("x.thread.composer"))
        .filters("launch-night")
        .dollyIn({ duration: 20, toFill: 0.8, amount: 0.04 });
      if (optical) shot.lens("keyboard-focus");
    })
    .shot("leave-it-live", OUTPUT, 624, 675, (shot) => {
      frame(shot, entity("message", "x_msg_hold", "bubble"), {
        position: [0.5, 0.56],
        fill: 0.48,
        mode: "width",
        min: 0.42,
        max: 1.06,
      })
        .fallback(semantic("x.thread.messages"))
        .filters("launch-night")
        .dollyOut({ duration: 26, toFill: 0.48, amount: 0.045 });
    })
    .shot("why", OUTPUT, 675, 708, (shot) => {
      frame(shot, entity("message", "x_msg_why", "bubble"), {
        position: [0.5, 0.5],
        fill: 0.42,
        mode: "width",
        min: 0.4,
        max: 1.04,
      })
        .fallback(semantic("x.thread.messages"))
        .filters("launch-night")
        .settle(16);
    })
    .shot("compose-bridge", OUTPUT, 708, 726, (shot) => {
      frame(shot, body(), { fill: 0.84, max: 1, padding: 58 })
        .filters("launch-night")
        .settle(18);
    })
    .shot("compose-the-reveal", OUTPUT, 726, 744, (shot) => {
      frame(shot, semantic("x.composer.editor"), {
        position: [0.5, 0.43],
        fill: 0.65,
        mode: "width",
        min: 0.42,
        max: 1.14,
      })
        .fallback(screen())
        .filters("launch-night");
    })
    .shot("type-the-reveal", OUTPUT, 744, 912, (shot) => {
      frame(shot, keyboard(), {
        position: [0.5, 0.72],
        fill: 0.81,
        mode: "width",
        min: 0.44,
        max: 1.2,
      })
        .fallback(semantic("x.composer.editor"))
        .filters("launch-night")
        .dollyIn({ duration: 30, toFill: 0.81, amount: 0.055 });
      if (optical) shot.lens("keyboard-focus").modifiers("held-breath");
    })
    .shot("publish-bridge", OUTPUT, 912, 946, (shot) => {
      frame(shot, body(), { fill: 0.84, max: 1, padding: 58 })
        .filters("launch-night")
        .settle(24);
    })
    .shot("the-last-frame", OUTPUT, 946, 1035, (shot) => {
      frame(shot, entity("tweet", "x_last_frame", "card"), {
        position: [0.5, 0.46],
        fill: 0.67,
        mode: "width",
        min: 0.44,
        max: 1.3,
      })
        .fallback(screen())
        .filters("reveal-warm")
        .dollyIn({ duration: 24, toFill: 0.67, amount: 0.08 });
      if (optical) shot.lens("reveal-wide");
    })
    .shot("you-knew", OUTPUT, 1035, DURATION, (shot) => {
      frame(shot, body(), { fill: 0.82, max: 1.1, padding: 62 })
        .filters("reveal-warm")
        .dollyOut({ duration: 34, toFill: 0.82, amount: 0.07 });
    });
}

function buildPlan(camera: CinematicPlanBuilder, optical: boolean): void {
  camera
    .output(OUTPUT, {
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      defaultRigId: "hero-device",
      coveragePolicy: "require-shots",
      compositionProfileId: "hero-device",
    })
    .rig("hero-device", {
      outputId: OUTPUT,
      subject: body(),
      composer: {
        screenPosition: [0.5, 0.5],
        targetFill: 0.84,
        fillMode: "contain",
        paddingPx: 58,
        minScale: 0.36,
        maxScale: 1,
      },
      framingGuard: {
        subject: body(),
        paddingPx: 58,
        screenPosition: [0.5, 0.5],
      },
      motion: { type: "minimum-jerk", durationFrames: 24 },
    });

  registerLook(camera);
  direct(camera, optical);
}

export const xTheLastFrameCamera = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION,
    stage: {
      width: 1080,
      height: 1920,
      devices: [
        {
          deviceId: DEVICE,
          x: 270,
          y: 360,
          width: 540,
          height: 1172,
          zIndex: 10,
        },
      ],
    },
  },
  (cinema) => {
    cinema
      .plan("directed", (camera) => buildPlan(camera, false), { default: true })
      .plan("optical", (camera) => buildPlan(camera, true));
  },
);
