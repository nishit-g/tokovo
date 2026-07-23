import {
  cameraSubject,
  cinematicProgram,
  type CinematicPlanBuilder,
  type CinematicShotBuilder,
} from "@tokovo/dsl";
import type { CinematicSubjectRefIR } from "@tokovo/ir";

const FPS = 30;
const DURATION = 1260;
const OUTPUT = "portrait-main";
const DEVICE = "phone";
const APP = "app_x";

const body = (): CinematicSubjectRefIR => cameraSubject.device(DEVICE, "body");
const screen = (): CinematicSubjectRefIR => cameraSubject.device(DEVICE, "screen");
const keyboard = (): CinematicSubjectRefIR => cameraSubject.device(DEVICE, "keyboard");
const semantic = (subjectId: string): CinematicSubjectRefIR =>
  cameraSubject.semantic(DEVICE, APP, subjectId);
const entity = (type: string, id: string, region: string): CinematicSubjectRefIR =>
  cameraSubject.entity(DEVICE, APP, type, id, region);

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
    targetFill: options.fill ?? 0.82,
    fillMode: options.mode ?? "contain",
    paddingPx: options.padding ?? 34,
    minScale: options.min ?? 0.34,
    maxScale: options.max ?? 1.45,
  });
}

function optics(camera: CinematicPlanBuilder): void {
  camera
    .lens("keyboard-fisheye", "fisheye", {
      center: [0.5, 0.76],
      strength: 0.065,
      radius: 1.22,
      cropCompensation: 1.025,
    })
    .lens("media-anamorphic", "anamorphic-edge-stretch", {
      axis: "horizontal",
      strength: 0.055,
      edgeStart: 0.8,
      cropCompensation: 1.018,
    })
    .lens("detail-barrel", "wide-angle-barrel", {
      center: [0.5, 0.46],
      strength: 0.045,
      radius: 1.18,
      cropCompensation: 1.018,
    })
    .lens("profile-vertical", "anamorphic-edge-stretch", {
      axis: "vertical",
      strength: 0.04,
      edgeStart: 0.84,
      cropCompensation: 1.012,
    })
    .modifier("quiet-breathing", "lens-breathing", {
      amount: 0.0025,
      periodFrames: 180,
    })
    .filter("studio-neutral", "color-grade", {
      brightness: -0.01,
      contrast: 1.045,
      saturation: 0.94,
      gamma: 1,
      temperature: -0.025,
      tint: 0.008,
    })
    .filter("media-proof", "color-grade", {
      brightness: 0.008,
      contrast: 1.085,
      saturation: 1.035,
      gamma: 1.005,
      temperature: 0.018,
      tint: 0.006,
    });
}

function direction(camera: CinematicPlanBuilder, kinetic: boolean): void {
  camera
    .shot("device-establish", OUTPUT, 0, 120, (shot) => {
      frame(shot, body(), { fill: 0.86, max: 1, padding: 54 })
        .filters("studio-neutral")
        .dollyIn({ duration: 38, toFill: 0.86, amount: 0.075 });
    })
    .shot("hero-post", OUTPUT, 120, 270, (shot) => {
      frame(shot, entity("tweet", "x_launch_cut", "media"), {
        position: [0.5, 0.49], fill: 0.7, mode: "contain", min: 0.42, max: 1.35,
      })
        .fallback(entity("tweet", "x_launch_cut", "card"))
        .fallback(screen())
        .filters("media-proof")
        .dollyIn({ duration: 28, toFill: 0.7, amount: 0.1 });
      if (kinetic) shot.lens("media-anamorphic");
    })
    .shot("notification-depth", OUTPUT, 270, 420, (shot) => {
      frame(shot, entity("notification", "x_nt_mention", "row"), {
        position: [0.5, 0.37], fill: 0.72, mode: "width", min: 0.48, max: 1.4,
      })
        .fallback(semantic("x.notifications.list"))
        .fallback(screen())
        .filters("studio-neutral")
        .settle(20);
    })
    .shot("dm-delivery", OUTPUT, 420, 600, (shot) => {
      frame(shot, entity("message", "x_msg_reply", "bubble"), {
        position: [0.5, 0.45], fill: 0.58, mode: "width", min: 0.48, max: 1.16,
      })
        .fallback(semantic("x.thread.messages"))
        .fallback(screen())
        .filters("studio-neutral")
        .dollyOut({ duration: 26, toFill: 0.58, amount: 0.045 });
    })
    .shot("composer-keyboard", OUTPUT, 600, 780, (shot) => {
      frame(shot, keyboard(), {
        position: [0.5, 0.73], fill: 0.84, mode: "width", min: 0.45, max: 1.25,
      })
        .fallback(semantic("x.composer.editor"))
        .fallback(body())
        .filters("studio-neutral")
        .truckLeft({ duration: 20, amount: 0.01 });
      if (kinetic) shot.lens("keyboard-fisheye");
    })
    .shot("new-post-proof", OUTPUT, 780, 900, (shot) => {
      frame(shot, entity("tweet", "x_authored_post", "card"), {
        position: [0.5, 0.47], fill: 0.69, mode: "width", min: 0.44, max: 1.42,
      })
        .fallback(screen())
        .filters("studio-neutral")
        .dollyIn({ duration: 22, toFill: 0.69, amount: 0.09 });
    })
    .shot("poll-selection", OUTPUT, 900, 1020, (shot) => {
      frame(shot, entity("tweet", "x_poll", "poll"), {
        position: [0.5, 0.52], fill: 0.71, mode: "width", min: 0.45, max: 1.4,
      })
        .fallback(entity("tweet", "x_poll", "card"))
        .fallback(screen())
        .filters("studio-neutral");
      if (kinetic) shot.lens("detail-barrel");
    })
    .shot("video-lifecycle", OUTPUT, 1020, 1140, (shot) => {
      frame(shot, entity("tweet", "x_video", "media"), {
        position: [0.5, 0.5], fill: 0.73, mode: "contain", min: 0.44, max: 1.38,
      })
        .fallback(screen())
        .filters("media-proof")
        .dollyIn({ duration: 24, toFill: 0.73, amount: 0.08 });
      if (kinetic) shot.lens("media-anamorphic");
    })
    .shot("profile-finale", OUTPUT, 1140, DURATION, (shot) => {
      frame(shot, entity("profile", "x_creator", "header"), {
        position: [0.5, 0.4], fill: 0.75, mode: "width", min: 0.44, max: 1.34,
      })
        .fallback(body())
        .filters("studio-neutral")
        .dollyOut({ duration: 30, toFill: 0.75, amount: 0.08 });
      if (kinetic) shot.lens("profile-vertical");
    });
}

function plan(camera: CinematicPlanBuilder, kinetic: boolean): void {
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
        targetFill: 0.86,
        fillMode: "contain",
        paddingPx: 54,
        minScale: 0.34,
        maxScale: 1,
      },
      framingGuard: { subject: body(), paddingPx: 54, screenPosition: [0.5, 0.5] },
      motion: { type: "minimum-jerk", durationFrames: 24 },
    });
  optics(camera);
  direction(camera, kinetic);
}

export const xCinematicFlagship = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION,
    stage: {
      width: 1080,
      height: 1920,
      devices: [{ deviceId: DEVICE, x: 270, y: 360, width: 540, height: 1172, zIndex: 10 }],
    },
  },
  (cinema) => {
    cinema
      .plan("restrained", (camera) => plan(camera, false), { default: true })
      .plan("kinetic", (camera) => plan(camera, true));
  },
);
