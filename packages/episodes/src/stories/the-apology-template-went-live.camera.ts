import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CameraLookDefinition,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";

const FPS = 30;
const DURATION = 1260;
const OUTPUT = "portrait-main";
const DEVICE = "phone";

const whatsapp = cameraSubject.scope(DEVICE, "app_whatsapp");
const x = cameraSubject.scope(DEVICE, "app_x");
const instagram = cameraSubject.scope(DEVICE, "app_instagram");

const target = {
  whatsappMissingFile: whatsapp.entity("message", "wa_missing_file", "bubble"),
  whatsappLegalCopy: whatsapp.entity("message", "wa_legal_copy", "bubble"),
  xApology: x.entity("tweet", "x_apology_template", "card"),
  xReply: x.entity("tweet", "x_honest_reply", "card"),
  instagramStory: instagram.semantic("story_viewer"),
  instagramStoryReply: instagram.semantic("story_reply_bar"),
  whatsappCeoKeepIt: whatsapp.entity("message", "wa_ceo_keep_it", "bubble"),
  whatsappStrategy: whatsapp.entity("message", "wa_strategy", "bubble"),
  whatsappCeoFinal: whatsapp.entity("message", "wa_ceo_final", "bubble"),
};

const look: CameraLookDefinition = {
  lenses: {
    "war-room-barrel": {
      model: "wide-angle-barrel",
      center: [0.5, 0.46],
      strength: 0.032,
      radius: 1.2,
      cropCompensation: 1.014,
    },
    "public-fisheye": {
      model: "fisheye",
      center: [0.5, 0.47],
      strength: 0.044,
      radius: 1.24,
      cropCompensation: 1.019,
    },
    "keyboard-punch": {
      model: "fisheye",
      center: [0.5, 0.76],
      strength: 0.052,
      radius: 1.22,
      cropCompensation: 1.022,
    },
    "story-edge-stretch": {
      model: "anamorphic-edge-stretch",
      axis: "vertical",
      strength: 0.034,
      edgeStart: 0.84,
      cropCompensation: 1.013,
    },
    "payoff-wide": {
      model: "anamorphic-edge-stretch",
      axis: "horizontal",
      strength: 0.038,
      edgeStart: 0.82,
      cropCompensation: 1.014,
    },
  },
  modifiers: {
    "held-breath": {
      model: "lens-breathing",
      amount: 0.002,
      periodFrames: 180,
    },
  },
  filters: {
    "studio-neutral": {
      model: "color-grade",
      brightness: -0.012,
      contrast: 1.055,
      saturation: 0.93,
      gamma: 0.998,
      temperature: -0.025,
      tint: 0.006,
    },
    "panic-cold": {
      model: "color-grade",
      brightness: -0.018,
      contrast: 1.085,
      saturation: 0.86,
      gamma: 0.99,
      temperature: -0.065,
      tint: 0.012,
    },
    "public-hot": {
      model: "color-grade",
      brightness: 0.002,
      contrast: 1.09,
      saturation: 1.01,
      gamma: 1.002,
      temperature: 0.025,
      tint: 0.004,
    },
    "punchline-warm": {
      model: "color-grade",
      brightness: 0.006,
      contrast: 1.065,
      saturation: 0.97,
      gamma: 1.005,
      temperature: 0.04,
      tint: 0.003,
    },
  },
};

const direction = {
  plans: [{ id: "directed", default: true }, { id: "optical" }],
  look,
  framings: {
    body: { fill: 0.84, padding: 58, max: 1 },
    message: {
      position: [0.5, 0.52],
      fill: 0.49,
      mode: "width",
      min: 0.42,
      max: 1.08,
    },
    tweet: {
      position: [0.5, 0.48],
      fill: 0.67,
      mode: "width",
      min: 0.44,
      max: 1.32,
    },
    keyboard: {
      position: [0.5, 0.73],
      fill: 0.81,
      mode: "width",
      min: 0.44,
      max: 1.22,
    },
    story: {
      position: [0.5, 0.49],
      fill: 0.78,
      mode: "contain",
      min: 0.42,
      max: 1.18,
    },
    dm: {
      position: [0.5, 0.54],
      fill: 0.53,
      mode: "width",
      min: 0.42,
      max: 1.12,
    },
    payoff: {
      position: [0.5, 0.55],
      fill: 0.47,
      mode: "width",
      min: 0.41,
      max: 1.08,
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
        subject: whatsapp.body,
        maxDriftPx: [54, 72],
      },
      defaultRig: {
        id: "hero-device",
        subject: whatsapp.body,
        frame: {
          fill: 0.84,
          padding: 58,
          min: 0.36,
          max: 1,
        },
        framingGuard: {
          subject: whatsapp.body,
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
          max: 1.32,
        },
        filters: ["studio-neutral"],
      },
      shots: [
        shot("war-room-hook", 90, whatsapp.body).frame("body").dollyIn(36, { amount: 0.055 }),
        shot("who-shipped-v7", 90, target.whatsappMissingFile)
          .frame("message", { position: [0.5, 0.48] })
          .fallback(whatsapp.semantic("last-message"))
          .filters("panic-cold")
          .dollyIn(24, { amount: 0.065 })
          .when("optical", {
            lens: "war-room-barrel",
            modifiers: ["held-breath"],
          }),
        shot("the-placeholder", 90, target.whatsappLegalCopy)
          .frame("message", { position: [0.5, 0.56] })
          .fallback(whatsapp.semantic("last-message"))
          .filters("panic-cold")
          .truckRight(24, 0.012),
        shot("open-x-whip", 45, x.body)
          .frame("body")
          .fallback(whatsapp.body)
          .filters("panic-cold")
          .cut()
          .when("optical", {
            motion: { kind: "whip", direction: "left", duration: 12 },
          }),
        shot("public-apology", 105, target.xApology)
          .frame("tweet")
          .fallback(x.screen)
          .filters("public-hot")
          .dollyIn(28, { amount: 0.075 })
          .when("optical", {
            lens: "public-fisheye",
            modifiers: ["held-breath"],
          }),
        shot("the-internet-replies", 75, target.xReply)
          .frame("tweet", { fill: 0.64, position: [0.5, 0.54] })
          .fallback(x.semantic("x.tweet.thread"))
          .filters("public-hot")
          .settle(18),
        shot("compose-bridge", 30, x.body).frame("body").filters("public-hot").cut(),
        shot("type-the-explanation", 120, x.keyboard)
          .frame("keyboard")
          .fallback(x.semantic("x.composer.editor"))
          .filters("public-hot")
          .dollyIn(30, { amount: 0.05 })
          .when("optical", {
            lens: "keyboard-punch",
            modifiers: ["held-breath"],
          }),
        shot("explanation-is-now-content", 60, x.screen).frame("body").filters("public-hot").cut(),
        shot("open-instagram-whip", 45, instagram.body)
          .frame("body")
          .fallback(x.body)
          .filters("public-hot")
          .cut(),
        shot("accountability-speedrun", 105, target.instagramStory)
          .frame("story")
          .fallback(instagram.screen)
          .filters("public-hot")
          .settle(24)
          .when("optical", {
            lens: "story-edge-stretch",
            motion: {
              kind: "orbit",
              duration: 30,
              yawDeg: 2.8,
              pitchDeg: -1.4,
              perspectivePx: 1500,
              cropCompensation: 1.012,
            },
          }),
        shot("story-second-beat", 60, target.instagramStoryReply)
          .frame("story", { position: [0.5, 0.55], fill: 0.76 })
          .fallback(instagram.screen)
          .filters("public-hot")
          .tiltDown(22, 0.012)
          .when("optical", { lens: "story-edge-stretch" }),
        shot("the-meme-is-everywhere", 90, instagram.screen)
          .frame("body")
          .filters("panic-cold")
          .cut(),
        shot("back-to-whatsapp", 45, whatsapp.body)
          .frame("body")
          .fallback(instagram.body)
          .filters("panic-cold")
          .cut()
          .when("optical", {
            motion: { kind: "whip", direction: "left", duration: 12 },
          }),
        shot("ceo-says-keep-it", 90, target.whatsappCeoKeepIt)
          .frame("payoff")
          .fallback(whatsapp.semantic("last-message"))
          .filters("punchline-warm")
          .dollyIn(24, { amount: 0.055 })
          .when("optical", { lens: "payoff-wide" }),
        shot("question-typing-bridge", 9, whatsapp.body)
          .frame("body")
          .filters("punchline-warm")
          .dollyOut(9, { amount: 0.035 }),
        shot("type-the-question", 81, whatsapp.keyboard)
          .frame("keyboard")
          .fallback(whatsapp.body)
          .filters("punchline-warm")
          .dollyIn(24, { amount: 0.042 })
          .when("optical", { lens: "keyboard-punch" }),
        shot("rename-the-file", 30, target.whatsappCeoFinal)
          .frame("payoff", { fill: 0.45 })
          .fallback(whatsapp.semantic("last-message"))
          .filters("punchline-warm")
          .cut()
          .when("optical", { lens: "payoff-wide" }),
      ],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

export const theApologyTemplateWentLiveCamera = cinematicProgram(
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
