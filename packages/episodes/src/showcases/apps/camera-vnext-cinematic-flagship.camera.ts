import {
  cameraSubject,
  cinematicProgram,
  type CinematicPlanBuilder,
  type CinematicShotBuilder,
} from "@tokovo/dsl";
import type { CinematicSubjectRefIR } from "@tokovo/ir";

const FPS = 60;
const DURATION_IN_FRAMES = 1440;
const MAIN_OUTPUT_ID = "portrait-main";
const PIP_OUTPUT_ID = "message-pip";
const DEVICE_ID = "director-phone";
const APP_ID = "app_whatsapp";
const BODY_WIDTH = 1350;
const BODY_HEIGHT = 2856;

const device = (subjectId: string): CinematicSubjectRefIR =>
  cameraSubject.device(DEVICE_ID, subjectId);

const semantic = (subjectId: string): CinematicSubjectRefIR =>
  cameraSubject.semantic(DEVICE_ID, APP_ID, subjectId);

const message = (
  entityId: string,
  region: "bubble" | "reply" | "media" | "reactions" = "bubble",
): CinematicSubjectRefIR => cameraSubject.entity(DEVICE_ID, APP_ID, "message", entityId, region);

const conversationGroup = cameraSubject.group(
  semantic("header"),
  semantic("last-message"),
  semantic("input_area"),
);

function addOutputs(camera: CinematicPlanBuilder): void {
  camera
    .output(MAIN_OUTPUT_ID, {
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      defaultRigId: "neutral",
    })
    .output(PIP_OUTPUT_ID, {
      viewport: { x: 570, y: 250, width: 480, height: 220 },
      zIndex: 20,
      clipRadiusPx: 32,
      shadow: { offsetX: 0, offsetY: 18, blurPx: 28, opacity: 0.58 },
      defaultRigId: "pip-hidden",
    })
    .rig("neutral", {
      outputId: MAIN_OUTPUT_ID,
      subject: device("body"),
      composer: {
        screenPosition: [0.5, 0.5],
        targetFill: 0.83,
        fillMode: "contain",
        paddingPx: 24,
        minScale: 0.45,
        maxScale: 0.72,
      },
      framingGuard: {
        subject: device("body"),
        paddingPx: 28,
        screenPosition: [0.5, 0.5],
      },
      motion: { type: "minimum-jerk", durationFrames: 34 },
    })
    .rig("pip-hidden", {
      outputId: PIP_OUTPUT_ID,
      subject: device("screen"),
      composer: {
        screenPosition: [0.5, 0.4],
        targetFill: 0.9,
        fillMode: "width",
        paddingPx: 14,
        minScale: 0.38,
        maxScale: 0.72,
      },
      opacity: 0,
      motion: { type: "minimum-jerk", durationFrames: 24 },
    });
}

function addOptics(camera: CinematicPlanBuilder): void {
  camera
    .lens("header-barrel", "wide-angle-barrel", {
      center: [0.5, 0.3],
      strength: 0.105,
      radius: 1.12,
      cropCompensation: 1.035,
    })
    .lens("typing-fisheye", "fisheye", {
      center: [0.5, 0.7],
      strength: 0.12,
      radius: 1.16,
      cropCompensation: 1.045,
    })
    .lens("keyboard-edge-stretch", "anamorphic-edge-stretch", {
      axis: "horizontal",
      strength: 0.115,
      edgeStart: 0.72,
      cropCompensation: 1.035,
    })
    .lens("navigation-edge-stretch", "anamorphic-edge-stretch", {
      axis: "vertical",
      strength: 0.08,
      edgeStart: 0.78,
      cropCompensation: 1.025,
    })
    .modifier("quiet-breathing", "lens-breathing", {
      amount: 0.0045,
      periodFrames: 240,
    })
    .filter("cool-studio", "color-grade", {
      brightness: -0.018,
      contrast: 1.06,
      saturation: 0.94,
      gamma: 0.98,
      temperature: -0.08,
      tint: 0.025,
    })
    .filter("typing-focus", "color-grade", {
      brightness: -0.01,
      contrast: 1.1,
      saturation: 0.91,
      gamma: 0.97,
      temperature: -0.04,
      tint: 0.03,
    })
    .filter("media-proof", "color-grade", {
      brightness: 0.012,
      contrast: 1.12,
      saturation: 1.04,
      gamma: 1.01,
      temperature: 0.05,
      tint: 0.01,
    });
}

function guardBody(shot: CinematicShotBuilder): CinematicShotBuilder {
  return shot.guard(device("body"), {
    paddingPx: 28,
    screenPosition: [0.5, 0.5],
  });
}

function addMainShots(camera: CinematicPlanBuilder, kinetic: boolean): void {
  camera
    .shot("oblique-stage-open", MAIN_OUTPUT_ID, 0, 120, (shot) => {
      guardBody(shot)
        .target(device("body"))
        .frame({
          screenPosition: [0.5, 0.51],
          targetFill: 0.79,
          fillMode: "contain",
          paddingPx: 32,
          minScale: 0.43,
          maxScale: 0.7,
        })
        .modifiers("quiet-breathing")
        .filters("cool-studio");
      if (kinetic) {
        shot.orbit({
          duration: 42,
          amount: 0.34,
          yawDeg: -3.2,
          pitchDeg: 5.5,
          perspectivePx: 1750,
          cropCompensation: 1.035,
        });
      } else {
        shot.dollyIn({ duration: 42, toFill: 0.79, amount: 0.18 });
      }
    })
    .shot("barrel-header-arrival", MAIN_OUTPUT_ID, 120, 240, (shot) => {
      guardBody(shot)
        .target(semantic("header"))
        .frame({
          screenPosition: [0.5, 0.25],
          targetFill: 0.72,
          fillMode: "width",
          paddingPx: 28,
          minScale: 0.55,
          maxScale: 0.9,
        })
        .fallback(device("body"))
        .filters("cool-studio")
        .dollyIn({ duration: 28, toFill: 0.72, amount: 0.22 });
      if (kinetic) shot.lens("header-barrel");
    })
    .shot("fisheye-keyboard-entry", MAIN_OUTPUT_ID, 240, 390, (shot) => {
      guardBody(shot)
        .target(device("keyboard"))
        .frame({
          screenPosition: [0.5, 0.7],
          targetFill: 0.77,
          fillMode: "width",
          paddingPx: 24,
          minScale: 0.58,
          maxScale: 0.84,
        })
        .fallback(semantic("input_area"))
        .filters("typing-focus")
        .dollyIn({ duration: 24, toFill: 0.77, amount: 0.2 });
      if (kinetic) shot.lens("typing-fisheye");
    })
    .shot("anamorphic-keyboard-run", MAIN_OUTPUT_ID, 390, 540, (shot) => {
      guardBody(shot)
        .target(device("keyboard"))
        .frame({
          screenPosition: [0.5, 0.69],
          targetFill: 0.79,
          fillMode: "width",
          paddingPx: 20,
          minScale: 0.58,
          maxScale: 0.86,
        })
        .fallback(semantic("input_area"))
        .filters("typing-focus")
        .truckLeft({ duration: 22, amount: 0.026 });
      if (kinetic) shot.lens("keyboard-edge-stretch");
    })
    .shot("exact-sent-message", MAIN_OUTPUT_ID, 540, 636, (shot) => {
      guardBody(shot)
        .target(message("director_reply"))
        .frame({
          screenPosition: [0.52, 0.61],
          targetFill: 0.52,
          fillMode: "width",
          paddingPx: 42,
          minScale: 0.66,
          maxScale: 1.32,
        })
        .fallback(device("screen"))
        .modifiers("quiet-breathing")
        .filters("cool-studio")
        .dollyIn({ duration: 26, toFill: 0.52, amount: 0.14 });
    })
    .shot("notification-whip", MAIN_OUTPUT_ID, 636, 750, (shot) => {
      guardBody(shot)
        .target(device("notification.banner"))
        .frame({
          screenPosition: [0.5, 0.2],
          targetFill: 0.73,
          fillMode: "width",
          paddingPx: 24,
          minScale: 0.54,
          maxScale: 0.92,
        })
        .fallback(device("screen"))
        .filters("cool-studio");
      if (kinetic) shot.whip("left", 20);
      else shot.settle(30);
    })
    .shot("exact-media-reframe", MAIN_OUTPUT_ID, 750, 930, (shot) => {
      guardBody(shot)
        .target(message("launch_board", "media"))
        .frame({
          screenPosition: [0.5, 0.55],
          targetFill: 0.58,
          fillMode: "contain",
          paddingPx: 34,
          minScale: 0.63,
          maxScale: 1.2,
        })
        .fallback(device("screen"))
        .filters("media-proof");
      if (kinetic) {
        shot.orbit({
          duration: 30,
          amount: 0.24,
          yawDeg: 3.6,
          pitchDeg: -2.8,
          perspectivePx: 1900,
          cropCompensation: 1.025,
        });
      } else {
        shot.dollyOut({ duration: 30, toFill: 0.58, amount: 0.12 });
      }
    })
    .shot("semantic-navigation", MAIN_OUTPUT_ID, 930, 1140, (shot) => {
      guardBody(shot)
        .target(device("screen"))
        .frame({
          screenPosition: [0.5, 0.5],
          targetFill: 0.88,
          fillMode: "contain",
          paddingPx: 14,
          minScale: 0.5,
          maxScale: 0.76,
        })
        .filters("cool-studio")
        .craneUp({ duration: 32, amount: 0.022, toFill: 0.88 });
      if (kinetic) shot.lens("navigation-edge-stretch");
    })
    .shot("conversation-group-settle", MAIN_OUTPUT_ID, 1140, 1320, (shot) => {
      guardBody(shot)
        .target(conversationGroup)
        .frame({
          screenPosition: [0.5, 0.5],
          targetFill: 0.84,
          fillMode: "contain",
          paddingPx: 30,
          minScale: 0.5,
          maxScale: 0.78,
        })
        .fallback(device("body"))
        .filters("cool-studio")
        .dollyOut({ duration: 36, toFill: 0.84, amount: 0.1 });
    })
    .shot("neutral-final", MAIN_OUTPUT_ID, 1320, DURATION_IN_FRAMES, (shot) => {
      guardBody(shot)
        .target(device("body"))
        .frame({
          screenPosition: [0.5, 0.5],
          targetFill: 0.83,
          fillMode: "contain",
          paddingPx: 24,
          minScale: 0.45,
          maxScale: 0.72,
        })
        .dollyOut({ duration: 34, toFill: 0.83, amount: 0.08 });
    });
}

function addPipShots(camera: CinematicPlanBuilder): void {
  camera
    .shot("pip-message-hold", PIP_OUTPUT_ID, 540, 636, (shot) =>
      shot
        .target(message("director_reply"))
        .frame({
          screenPosition: [0.5, 0.4],
          targetFill: 0.9,
          fillMode: "width",
          paddingPx: 14,
          minScale: 0.38,
          maxScale: 0.72,
        })
        .fallback(device("screen"))
        .opacity(0.96)
        .priority(10)
        .filters("cool-studio")
        .dollyIn({ duration: 28, toFill: 0.9, amount: 0.1 }),
    )
    .shot("pip-message-fade", PIP_OUTPUT_ID, 636, 672, (shot) =>
      shot
        .target(device("screen"))
        .frame({
          screenPosition: [0.5, 0.4],
          targetFill: 0.9,
          fillMode: "width",
          paddingPx: 14,
          minScale: 0.38,
          maxScale: 0.72,
        })
        .opacity(0)
        .settle(24),
    );
}

function addPlan(camera: CinematicPlanBuilder, kinetic: boolean): void {
  addOutputs(camera);
  addOptics(camera);
  addMainShots(camera, kinetic);
  addPipShots(camera);
}

export const cameraVNextCinematicFlagshipCinematics = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION_IN_FRAMES,
    stage: {
      width: BODY_WIDTH,
      height: BODY_HEIGHT,
      devices: [
        {
          deviceId: DEVICE_ID,
          width: BODY_WIDTH,
          height: BODY_HEIGHT,
        },
      ],
    },
  },
  (cinema) => {
    cinema
      .plan("restrained", (camera) => addPlan(camera, false))
      .plan("kinetic", (camera) => addPlan(camera, true), { default: true });
  },
);
