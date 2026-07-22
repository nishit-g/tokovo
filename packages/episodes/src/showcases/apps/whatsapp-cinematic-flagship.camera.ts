import {
  cameraSubject,
  cinematicProgram,
  type CinematicPlanBuilder,
  type CinematicShotBuilder,
} from "@tokovo/dsl";
import type { CinematicSubjectRefIR } from "@tokovo/ir";

const FPS = 30;
const DURATION = 1080;
const MAIN = "portrait-main";
const PIP = "handoff-pip";
const IOS = "creator_ios";
const ANDROID = "launch_android";
const APP = "app_whatsapp";

const body = (deviceId: string): CinematicSubjectRefIR =>
  cameraSubject.device(deviceId, "body");
const screen = (deviceId: string): CinematicSubjectRefIR =>
  cameraSubject.device(deviceId, "screen");
const keyboard = (deviceId: string): CinematicSubjectRefIR =>
  cameraSubject.device(deviceId, "keyboard");
const notification = (deviceId: string): CinematicSubjectRefIR =>
  cameraSubject.device(deviceId, "notification.banner");
const semantic = (deviceId: string, subjectId: string): CinematicSubjectRefIR =>
  cameraSubject.semantic(deviceId, APP, subjectId);
const message = (deviceId: string, entityId: string): CinematicSubjectRefIR =>
  cameraSubject.entity(deviceId, APP, "message", entityId, "bubble");
const messageMedia = (
  deviceId: string,
  entityId: string,
): CinematicSubjectRefIR =>
  cameraSubject.entity(deviceId, APP, "message", entityId, "media");

const split = cameraSubject.group(body(IOS), body(ANDROID));

function frame(
  shot: CinematicShotBuilder,
  target: CinematicSubjectRefIR,
  options: {
    position?: readonly [number, number];
    fill?: number;
    mode?: "contain" | "cover" | "width" | "height";
    min?: number;
    max?: number;
    padding?: number;
  } = {},
): CinematicShotBuilder {
  return shot.target(target).frame({
    screenPosition: options.position ?? [0.5, 0.5],
    targetFill: options.fill ?? 0.82,
    fillMode: options.mode ?? "contain",
    paddingPx: options.padding ?? 28,
    minScale: options.min ?? 0.32,
    maxScale: options.max ?? 1.5,
  });
}

function outputs(camera: CinematicPlanBuilder): void {
  camera
    .output(MAIN, {
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      defaultRigId: "split-neutral",
      coveragePolicy: "require-shots",
      safeAreaInsets: { top: 56, right: 48, bottom: 56, left: 48 },
    })
    .output(PIP, {
      viewport: { x: 600, y: 220, width: 420, height: 650 },
      zIndex: 20,
      clipRadiusPx: 44,
      shadow: { offsetX: 0, offsetY: 18, blurPx: 34, opacity: 0.5 },
      defaultRigId: "pip-hidden",
      safeAreaInsets: { top: 8, right: 8, bottom: 8, left: 8 },
    })
    .rig("split-neutral", {
      outputId: MAIN,
      subject: split,
      composer: {
        screenPosition: [0.5, 0.5],
        targetFill: 0.88,
        fillMode: "contain",
        paddingPx: 42,
        minScale: 0.35,
        maxScale: 1,
      },
      framingGuard: {
        subject: split,
        paddingPx: 42,
        screenPosition: [0.5, 0.5],
      },
      motion: { type: "minimum-jerk", durationFrames: 24 },
    })
    .rig("pip-hidden", {
      outputId: PIP,
      subject: body(ANDROID),
      composer: {
        screenPosition: [0.5, 0.5],
        targetFill: 0.9,
        fillMode: "contain",
        paddingPx: 18,
        minScale: 0.25,
        maxScale: 1,
      },
      opacity: 0,
      motion: { type: "cut" },
    });
}

function optics(camera: CinematicPlanBuilder): void {
  camera
    .lens("arrival-barrel", "wide-angle-barrel", {
      center: [0.5, 0.34],
      strength: 0.075,
      radius: 1.15,
      cropCompensation: 1.025,
    })
    .lens("typing-fisheye", "fisheye", {
      center: [0.5, 0.72],
      strength: 0.1,
      radius: 1.18,
      cropCompensation: 1.04,
    })
    .lens("horizontal-stretch", "anamorphic-edge-stretch", {
      axis: "horizontal",
      strength: 0.1,
      edgeStart: 0.74,
      cropCompensation: 1.03,
    })
    .lens("vertical-stretch", "anamorphic-edge-stretch", {
      axis: "vertical",
      strength: 0.07,
      edgeStart: 0.8,
      cropCompensation: 1.02,
    })
    .modifier("breathing", "lens-breathing", {
      amount: 0.004,
      periodFrames: 150,
    })
    .filter("studio", "color-grade", {
      brightness: -0.015,
      contrast: 1.07,
      saturation: 0.95,
      gamma: 0.99,
      temperature: -0.06,
      tint: 0.02,
    })
    .filter("proof", "color-grade", {
      brightness: 0.01,
      contrast: 1.12,
      saturation: 1.05,
      gamma: 1.01,
      temperature: 0.04,
      tint: 0.01,
    });
}

function direction(camera: CinematicPlanBuilder, kinetic: boolean): void {
  camera
    .shot("two-device-open", MAIN, 0, 60, (shot) => {
      frame(shot, split, { fill: 0.88, max: 1, padding: 42 })
        .filters("studio")
        .dollyIn({ duration: 32, toFill: 0.88, amount: 0.12 });
    })
    .shot("ios-header-arrival", MAIN, 60, 121, (shot) => {
      frame(shot, semantic(IOS, "header"), {
        position: [0.65, 0.24],
        fill: 0.72,
        mode: "width",
        min: 0.45,
        max: 1.2,
      })
        .fallback(body(IOS))
        .filters("studio")
        .dollyIn({ duration: 18, toFill: 0.72, amount: 0.16 });
      if (kinetic) shot.lens("arrival-barrel");
    })
    .shot("ios-typing-lens", MAIN, 121, 186, (shot) => {
      frame(shot, keyboard(IOS), {
        position: [0.65, 0.72],
        fill: 0.86,
        mode: "width",
        min: 0.48,
        max: 1.28,
      })
        .fallback(semantic(IOS, "input_area"))
        .filters("studio")
        .truckLeft({ duration: 16, amount: 0.015 });
      if (kinetic) shot.lens("typing-fisheye");
    })
    .shot("ios-command-arrival", MAIN, 186, 270, (shot) => {
      frame(shot, message(IOS, "ios_command"), {
        position: [0.65, 0.6],
        fill: 0.62,
        mode: "width",
        min: 0.5,
        max: 1.4,
      })
        .fallback(screen(IOS))
        .filters("studio")
        .dollyOut({ duration: 18, toFill: 0.62, amount: 0.08 });
    })
    .shot("ios-gesture-action", MAIN, 270, 360, (shot) => {
      frame(shot, semantic(IOS, "message_actions"), {
        position: [0.65, 0.48],
        fill: 0.74,
        mode: "width",
        min: 0.5,
        max: 1.35,
      })
        .fallback(message(IOS, "ios_velocity"))
        .filters("studio");
      if (kinetic) shot.whip("right", 12);
      else shot.settle(18);
    })
    .shot("ios-reply", MAIN, 360, 480, (shot) => {
      frame(shot, semantic(IOS, "last-message"), {
        position: [0.65, 0.6],
        fill: 0.62,
        mode: "width",
        min: 0.5,
        max: 1.4,
      })
        .fallback(screen(IOS))
        .filters("studio")
        .dollyOut({ duration: 22, toFill: 0.62, amount: 0.1 });
    })
    .shot("ios-media-proof", MAIN, 480, 570, (shot) => {
      frame(shot, messageMedia(IOS, "ios_proof"), {
        position: [0.65, 0.52],
        fill: 0.72,
        mode: "contain",
        min: 0.5,
        max: 1.4,
      })
        .fallback(screen(IOS))
        .filters("proof")
        .dollyIn({ duration: 20, toFill: 0.72, amount: 0.12 });
    })
    .shot("android-notification-handoff", MAIN, 570, 600, (shot) => {
      frame(shot, notification(ANDROID), {
        position: [0.35, 0.18],
        fill: 0.72,
        mode: "width",
        min: 0.45,
        max: 1.2,
      })
        .fallback(body(ANDROID))
        .filters("studio");
      if (kinetic) shot.whip("left", 12);
      else shot.cut();
    })
    .shot("android-response", MAIN, 600, 735, (shot) => {
      frame(shot, message(ANDROID, "ar_velocity"), {
        position: [0.35, 0.58],
        fill: 0.62,
        mode: "width",
        min: 0.48,
        max: 1.4,
      })
        .fallback(screen(ANDROID))
        .filters("studio")
        .dollyIn({ duration: 20, toFill: 0.62, amount: 0.14 });
      if (kinetic) shot.lens("horizontal-stretch");
    })
    .shot("split-proof", MAIN, 735, 780, (shot) => {
      frame(shot, split, { fill: 0.88, max: 1, padding: 42 })
        .filters("studio")
        .dollyOut({ duration: 22, toFill: 0.88, amount: 0.12 });
    })
    .shot("ios-video", MAIN, 780, 912, (shot) => {
      frame(shot, messageMedia(IOS, "ios_video"), {
        position: [0.65, 0.5],
        fill: 0.74,
        mode: "contain",
        min: 0.45,
        max: 1.4,
      })
        .fallback(screen(IOS))
        .filters("proof")
        .dollyIn({ duration: 24, toFill: 0.74, amount: 0.12 });
      if (kinetic) shot.lens("vertical-stretch");
    })
    .shot("calls-pip-main", MAIN, 912, 966, (shot) => {
      frame(shot, body(IOS), { position: [0.72, 0.5], fill: 0.9, max: 1.1 })
        .filters("studio")
        .settle(18);
    })
    .shot("two-device-final", MAIN, 966, DURATION, (shot) => {
      frame(shot, split, { fill: 0.88, max: 1, padding: 42 })
        .filters("studio")
        .dollyOut({ duration: 28, toFill: 0.88, amount: 0.1 });
    })
    .shot("handoff-pip", PIP, 550, 600, (shot) =>
      frame(shot, body(ANDROID), {
        position: [0.44, 0.5],
        fill: 0.92,
        max: 1,
        padding: 18,
      })
        .filters("studio")
        .opacity(0.98)
        .dollyIn({ duration: 16, toFill: 0.92, amount: 0.08 }),
    )
    .shot("calls-pip", PIP, 912, 966, (shot) =>
      frame(shot, body(ANDROID), {
        position: [0.44, 0.5],
        fill: 0.92,
        max: 1,
        padding: 18,
      })
        .filters("studio")
        .opacity(0.98)
        .settle(16),
    );
}

function plan(camera: CinematicPlanBuilder, kinetic: boolean): void {
  outputs(camera);
  optics(camera);
  direction(camera, kinetic);
}

export const whatsappCinematicFlagship = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION,
    stage: {
      width: 1080,
      height: 1920,
      devices: [
        { deviceId: IOS, x: 70, y: 510, width: 420, height: 889, zIndex: 10 },
        {
          deviceId: ANDROID,
          x: 590,
          y: 495,
          width: 420,
          height: 917,
          zIndex: 20,
        },
      ],
    },
  },
  (cinema) => {
    cinema
      .plan("restrained", (camera) => plan(camera, false))
      .plan("kinetic", (camera) => plan(camera, true), { default: true });
  },
);
