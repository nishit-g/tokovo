import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CameraLookDefinition,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";

const FPS = 30;
const DURATION = 1140;
const OUTPUT = "portrait-main";
const DEVICE = "phone";
const subject = cameraSubject.scope(DEVICE, "app_x");
const threadMessages = subject.semantic("x.thread.messages");
const composerEditor = subject.semantic("x.composer.editor");
const target = {
  reply: subject.entity("tweet", "x_intrusion_reply", "card"),
  queueAlert: subject.entity("notification", "x_queue_alert", "row"),
  token: subject.entity("message", "x_msg_token", "bubble"),
  stageDenial: subject.entity("message", "x_msg_stage", "bubble"),
  hold: subject.entity("message", "x_msg_hold", "bubble"),
  why: subject.entity("message", "x_msg_why", "bubble"),
  reveal: subject.entity("tweet", "x_last_frame", "card"),
};

const look: CameraLookDefinition = {
  lenses: {
    "evidence-wide": {
      model: "wide-angle-barrel",
      center: [0.5, 0.45],
      strength: 0.038,
      radius: 1.2,
      cropCompensation: 1.016,
    },
    "notification-pressure": {
      model: "anamorphic-edge-stretch",
      axis: "vertical",
      strength: 0.028,
      edgeStart: 0.86,
      cropCompensation: 1.01,
    },
    "keyboard-focus": {
      model: "fisheye",
      center: [0.5, 0.76],
      strength: 0.048,
      radius: 1.24,
      cropCompensation: 1.02,
    },
    "reveal-wide": {
      model: "anamorphic-edge-stretch",
      axis: "horizontal",
      strength: 0.04,
      edgeStart: 0.82,
      cropCompensation: 1.014,
    },
  },
  modifiers: {
    "held-breath": {
      model: "lens-breathing",
      amount: 0.002,
      periodFrames: 210,
    },
  },
  filters: {
    "launch-night": {
      model: "color-grade",
      brightness: -0.012,
      contrast: 1.055,
      saturation: 0.9,
      gamma: 0.995,
      temperature: -0.035,
      tint: 0.006,
    },
    "evidence-cold": {
      model: "color-grade",
      brightness: -0.018,
      contrast: 1.09,
      saturation: 0.84,
      gamma: 0.99,
      temperature: -0.07,
      tint: 0.012,
    },
    "reveal-warm": {
      model: "color-grade",
      brightness: 0.006,
      contrast: 1.065,
      saturation: 0.96,
      gamma: 1.005,
      temperature: 0.035,
      tint: 0.004,
    },
  },
};

const direction = {
  plans: [{ id: "directed", default: true }, { id: "optical" }],
  look,
  framings: {
    body: { fill: 0.84, padding: 58, max: 1 },
    reply: {
      position: [0.5, 0.52],
      fill: 0.68,
      mode: "width",
      min: 0.44,
      max: 1.28,
    },
    notification: {
      position: [0.5, 0.38],
      fill: 0.7,
      mode: "width",
      min: 0.46,
      max: 1.32,
    },
    message: { fill: 0.48, mode: "width", min: 0.42, max: 1.06 },
    keyboard: {
      position: [0.5, 0.72],
      fill: 0.8,
      mode: "width",
      min: 0.44,
      max: 1.2,
    },
    composer: {
      position: [0.5, 0.43],
      fill: 0.65,
      mode: "width",
      min: 0.42,
      max: 1.14,
    },
    reveal: {
      position: [0.5, 0.46],
      fill: 0.67,
      mode: "width",
      min: 0.44,
    },
  },
  outputs: [
    {
      id: OUTPUT,
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      coveragePolicy: "require-shots",
      compositionProfileId: "hero-device",
      travel: {
        mode: "stabilized",
        subject: subject.body,
        maxDriftPx: [54, 72],
      },
      defaultRig: {
        id: "hero-device",
        subject: subject.body,
        frame: {
          fill: 0.84,
          padding: 58,
          min: 0.36,
          max: 1,
        },
        framingGuard: {
          subject: subject.body,
          paddingPx: 58,
          screenPosition: [0.5, 0.5],
        },
        motion: { type: "minimum-jerk", durationFrames: 24 },
      },
    },
  ],
  sequences: [
    {
      outputId: OUTPUT,
      end: DURATION,
      defaults: {
        frame: {
          position: [0.5, 0.5],
          fill: 0.76,
          mode: "contain",
          padding: 42,
          min: 0.38,
          max: 1.3,
        },
        filters: ["launch-night"],
      },
      shots: [
        shot("stage-before-the-leak", 132, subject.body)
          .frame("body", { max: 1.12 })
          .dollyIn(42, { amount: 0.06 }),
        shot("the-reply", 138, target.reply)
          .frame("reply")
          .fallback(subject.screen)
          .filters("evidence-cold")
          .dollyIn(28, { amount: 0.075 })
          .when("optical", {
            lens: "evidence-wide",
            modifiers: ["held-breath"],
          }),
        shot("queue-alert", 57, target.queueAlert)
          .frame("notification")
          .fallback(subject.semantic("x.notifications.list"))
          .filters("evidence-cold")
          .settle(18)
          .when("optical", { lens: "notification-pressure" }),
        shot("messages-bridge", 48, subject.body).frame("body").filters("evidence-cold").settle(18),
        shot("thread-establishing", 39, subject.screen)
          .frame("body")
          .filters("evidence-cold")
          .settle(24),
        shot("token-evidence", 96, target.token)
          .frame("message", { position: [0.5, 0.44], fill: 0.47, max: 1.05 })
          .fallback(threadMessages)
          .filters("evidence-cold")
          .truckLeft(24, 0.012)
          .when("optical", { modifiers: ["held-breath"] }),
        shot("stage-denial", 66, target.stageDenial)
          .frame("message", { position: [0.5, 0.54] })
          .fallback(threadMessages)
          .settle(14),
        shot("type-the-decision", 48, subject.keyboard)
          .frame("keyboard")
          .fallback(subject.semantic("x.thread.composer"))
          .dollyIn(20, { amount: 0.04 })
          .when("optical", { lens: "keyboard-focus" }),
        shot("leave-it-live", 51, target.hold)
          .frame("message", { position: [0.5, 0.56] })
          .fallback(threadMessages)
          .dollyOut(26, { amount: 0.045 }),
        shot("why", 33, target.why)
          .frame({ fill: 0.42, mode: "width", min: 0.4, max: 1.04 })
          .fallback(threadMessages)
          .settle(16),
        shot("compose-bridge", 18, subject.body).frame("body").settle(18),
        shot("compose-the-reveal", 18, composerEditor).frame("composer").fallback(subject.screen),
        shot("type-the-reveal", 168, subject.keyboard)
          .frame("keyboard", { fill: 0.81 })
          .fallback(composerEditor)
          .dollyIn(30, { amount: 0.055 })
          .when("optical", {
            lens: "keyboard-focus",
            modifiers: ["held-breath"],
          }),
        shot("publish-bridge", 34, subject.body).frame("body").settle(24),
        shot("the-last-frame", 89, target.reveal)
          .frame("reveal")
          .fallback(subject.screen)
          .filters("reveal-warm")
          .dollyIn(24, { amount: 0.08 })
          .when("optical", { lens: "reveal-wide" }),
        shot("you-knew", 105, subject.body)
          .frame({ fill: 0.82, padding: 62, max: 1.1 })
          .filters("reveal-warm")
          .dollyOut(34, { amount: 0.07 }),
      ],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

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
    cinema.planFamily(direction);
  },
);
