import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";
import { solveEditorialOverlayViewport } from "@tokovo/visual-system";

const FPS = 30;
const DURATION = 1080;
const MAIN = "portrait-main";
const NOTIFICATION_HANDOFF = "notification-handoff";
const CALLS_PIP = "calls-pip";
const IOS = "creator_ios";
const ANDROID = "launch_android";
const ios = cameraSubject.scope(IOS, "app_whatsapp");
const android = cameraSubject.scope(ANDROID, "app_whatsapp");
const split = cameraSubject.group(ios.body, android.body);
const pipViewport = solveEditorialOverlayViewport({
  canvas: { width: 1080, height: 1920 },
  overlay: { width: 330, height: 580 },
  compositionProfileId: "handoff-pip",
  protectedRegions: [{ x: 90, y: 240, width: 560, height: 1440 }],
});
const target = {
  iosHeader: ios.semantic("header"),
  iosCommand: ios.entity("message", "ios_command", "bubble"),
  iosActions: ios.semantic("message_actions"),
  iosReply: ios.semantic("last-message"),
  iosProof: ios.entity("message", "ios_proof", "media"),
  androidNotification: android.device("notification.banner"),
  androidResponse: android.entity("message", "ar_velocity", "bubble"),
  iosVideo: ios.entity("message", "ios_video", "media"),
};

const direction = {
  plans: [{ id: "restrained" }, { id: "kinetic", default: true }],
  look: {
    lenses: {
      "arrival-barrel": {
        model: "wide-angle-barrel",
        center: [0.5, 0.34],
        strength: 0.075,
        radius: 1.15,
        cropCompensation: 1.025,
      },
      "typing-fisheye": {
        model: "fisheye",
        center: [0.5, 0.72],
        strength: 0.1,
        radius: 1.18,
        cropCompensation: 1.04,
      },
      "horizontal-stretch": {
        model: "anamorphic-edge-stretch",
        axis: "horizontal",
        strength: 0.1,
        edgeStart: 0.74,
        cropCompensation: 1.03,
      },
      "vertical-stretch": {
        model: "anamorphic-edge-stretch",
        axis: "vertical",
        strength: 0.07,
        edgeStart: 0.8,
        cropCompensation: 1.02,
      },
    },
    modifiers: {
      breathing: {
        model: "lens-breathing",
        amount: 0.004,
        periodFrames: 150,
      },
    },
    filters: {
      studio: {
        model: "color-grade",
        brightness: -0.015,
        contrast: 1.07,
        saturation: 0.95,
        gamma: 0.99,
        temperature: -0.06,
        tint: 0.02,
      },
      proof: {
        model: "color-grade",
        brightness: 0.01,
        contrast: 1.12,
        saturation: 1.05,
        gamma: 1.01,
        temperature: 0.04,
        tint: 0.01,
      },
    },
  },
  framings: {
    split: { fill: 0.88, max: 1, padding: 42 },
    iosHeader: {
      position: [0.65, 0.24],
      fill: 0.72,
      mode: "width",
      min: 0.45,
      max: 1.2,
    },
    iosKeyboard: {
      position: [0.65, 0.72],
      fill: 0.86,
      mode: "width",
      min: 0.48,
      max: 1.28,
    },
    iosMessage: {
      position: [0.65, 0.6],
      fill: 0.62,
      mode: "width",
      min: 0.5,
      max: 1.4,
    },
    iosActions: {
      position: [0.65, 0.48],
      fill: 0.74,
      mode: "width",
      min: 0.5,
      max: 1.35,
    },
    iosProof: {
      position: [0.65, 0.52],
      fill: 0.72,
      min: 0.5,
      max: 1.4,
    },
    androidNotification: {
      position: [0.34, 0.2],
      fill: 0.7,
      mode: "width",
      min: 0.45,
      max: 2.4,
    },
    androidMessage: {
      position: [0.35, 0.58],
      fill: 0.62,
      mode: "width",
      min: 0.48,
      max: 1.4,
    },
    iosVideo: {
      position: [0.65, 0.5],
      fill: 0.74,
      min: 0.45,
      max: 1.4,
    },
    callsMain: { position: [0.36, 0.5], fill: 0.92, max: 2.2 },
    pip: { position: [0.44, 0.5], fill: 0.92, max: 1, padding: 18 },
  },
  outputs: [
    {
      id: MAIN,
      viewport: { x: 0, y: 0, width: 1080, height: 1920 },
      coveragePolicy: "require-shots",
      compositionProfileId: "hero-device",
      travel: {
        mode: "stabilized",
        subject: split,
        maxDriftPx: [58, 72],
      },
      defaultRig: {
        id: "split-neutral",
        subject: split,
        frame: { fill: 0.88, padding: 42, min: 0.35, max: 1 },
        framingGuard: {
          subject: split,
          paddingPx: 42,
          screenPosition: [0.5, 0.5],
        },
        motion: { type: "minimum-jerk", durationFrames: 24 },
      },
    },
    {
      id: NOTIFICATION_HANDOFF,
      viewport: pipViewport,
      zIndex: 20,
      clipRadiusPx: 42,
      shadow: { offsetX: 0, offsetY: 18, blurPx: 34, opacity: 0.5 },
      compositionProfileId: "handoff-pip",
      travel: {
        mode: "stabilized",
        subject: ios.body,
        maxDriftPx: [18, 22],
      },
      defaultRig: {
        id: "notification-hidden",
        subject: ios.body,
        frame: { fill: 0.9, padding: 18, min: 0.25, max: 1 },
        opacity: 0,
        motion: { type: "cut" },
      },
    },
    {
      id: CALLS_PIP,
      viewport: pipViewport,
      zIndex: 20,
      clipRadiusPx: 42,
      shadow: { offsetX: 0, offsetY: 18, blurPx: 34, opacity: 0.5 },
      compositionProfileId: "handoff-pip",
      travel: {
        mode: "stabilized",
        subject: android.body,
        maxDriftPx: [18, 22],
      },
      defaultRig: {
        id: "calls-pip-hidden",
        subject: android.body,
        frame: { fill: 0.9, padding: 18, min: 0.25, max: 1 },
        opacity: 0,
        motion: { type: "cut" },
      },
    },
  ],
  sequences: [
    {
      outputId: MAIN,
      end: DURATION,
      defaults: {
        frame: {
          position: [0.5, 0.5],
          fill: 0.82,
          mode: "contain",
          padding: 28,
          min: 0.32,
          max: 1.5,
        },
        filters: ["studio"],
      },
      shots: [
        shot("two-device-open", 60, split).frame("split").dollyIn(32, { amount: 0.12 }),
        shot("ios-header-arrival", 61, target.iosHeader)
          .frame("iosHeader")
          .fallback(ios.body)
          .dollyIn(18, { amount: 0.16 })
          .when("kinetic", { lens: "arrival-barrel" }),
        shot("ios-typing-lens", 65, ios.keyboard)
          .frame("iosKeyboard")
          .fallback(ios.semantic("input_area"))
          .truckLeft(16, 0.015)
          .when("kinetic", { lens: "typing-fisheye" }),
        shot("ios-command-arrival", 84, target.iosCommand)
          .frame("iosMessage")
          .fallback(ios.screen)
          .dollyOut(18, { amount: 0.08 }),
        shot("ios-gesture-action", 90, target.iosActions)
          .frame("iosActions")
          .fallback(ios.entity("message", "ios_velocity", "bubble"))
          .settle(18)
          .when("kinetic", { motion: { kind: "whip", direction: "right", duration: 12 } }),
        shot("ios-reply", 120, target.iosReply)
          .frame("iosMessage")
          .fallback(ios.screen)
          .dollyOut(22, { amount: 0.1 }),
        shot("ios-media-proof", 90, target.iosProof)
          .frame("iosProof")
          .fallback(ios.screen)
          .filters("proof")
          .dollyIn(20, { amount: 0.12 }),
        shot("android-notification-handoff", 30, target.androidNotification)
          .frame("androidNotification")
          .fallback(android.body)
          .cut()
          .when("kinetic", { motion: { kind: "whip", direction: "left", duration: 12 } }),
        shot("android-response", 135, target.androidResponse)
          .frame("androidMessage")
          .fallback(android.screen)
          .dollyIn(20, { amount: 0.14 })
          .when("kinetic", { lens: "horizontal-stretch" }),
        shot("split-proof", 45, split).frame("split").dollyOut(22, { amount: 0.12 }),
        shot("ios-video", 132, target.iosVideo)
          .frame("iosVideo")
          .fallback(ios.screen)
          .filters("proof")
          .dollyIn(24, { amount: 0.12 })
          .when("kinetic", { lens: "vertical-stretch" }),
        shot("calls-pip-main", 54, ios.body).frame("callsMain").settle(18),
        shot("two-device-final", 114, split).frame("split").dollyOut(28, { amount: 0.1 }),
      ],
    },
    {
      outputId: NOTIFICATION_HANDOFF,
      start: 570,
      end: 600,
      defaults: {
        frame: {
          position: [0.5, 0.5],
          fill: 0.82,
          mode: "contain",
          padding: 28,
          min: 0.32,
          max: 1.5,
        },
        filters: ["studio"],
      },
      shots: [
        shot("notification-source-context", 30, ios.body)
          .frame("pip")
          .opacity(0.98)
          .dollyIn(14, { amount: 0.06 }),
      ],
    },
    {
      outputId: CALLS_PIP,
      start: 912,
      end: 966,
      defaults: {
        frame: {
          position: [0.5, 0.5],
          fill: 0.82,
          mode: "contain",
          padding: 28,
          min: 0.32,
          max: 1.5,
        },
        filters: ["studio"],
      },
      shots: [shot("calls-pip", 54, android.body).frame("pip").opacity(0.98).settle(16)],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

export const whatsappCinematicFlagship = cinematicProgram(
  {
    fps: FPS,
    duration: DURATION,
    stage: {
      width: 1080,
      height: 1920,
      devices: [
        {
          deviceId: IOS,
          x: 70,
          y: 510,
          width: 420,
          height: 889,
          zIndex: 10,
        },
        {
          deviceId: ANDROID,
          x: 650,
          y: 495,
          width: 420,
          height: 917,
          zIndex: 20,
        },
      ],
    },
  },
  (cinema) => {
    cinema.planFamily(direction);
  },
);
