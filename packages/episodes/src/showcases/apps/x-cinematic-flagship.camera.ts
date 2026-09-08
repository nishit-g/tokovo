import {
  cameraSubject,
  cinematicProgram,
  cinematicShot as shot,
  type CinematicPlanFamilyDefinition,
} from "@tokovo/dsl";

const FPS = 30;
const DURATION = 1260;
const OUTPUT = "portrait-main";
const DEVICE = "phone";
const subject = cameraSubject.scope(DEVICE, "app_x");
const target = {
  heroMedia: subject.entity("tweet", "x_launch_cut", "media"),
  notification: subject.entity("notification", "x_nt_mention", "row"),
  message: subject.entity("message", "x_msg_reply", "bubble"),
  newPost: subject.entity("tweet", "x_authored_post", "card"),
  poll: subject.entity("tweet", "x_poll", "poll"),
  video: subject.entity("tweet", "x_video", "media"),
  profile: subject.entity("profile", "x_creator", "header"),
};

const direction = {
  plans: [{ id: "restrained", default: true }, { id: "kinetic" }],
  look: {
    lenses: {
      "keyboard-fisheye": {
        model: "fisheye",
        center: [0.5, 0.76],
        strength: 0.065,
        radius: 1.22,
        cropCompensation: 1.025,
      },
      "media-anamorphic": {
        model: "anamorphic-edge-stretch",
        axis: "horizontal",
        strength: 0.055,
        edgeStart: 0.8,
        cropCompensation: 1.018,
      },
      "detail-barrel": {
        model: "wide-angle-barrel",
        center: [0.5, 0.46],
        strength: 0.045,
        radius: 1.18,
        cropCompensation: 1.018,
      },
      "profile-vertical": {
        model: "anamorphic-edge-stretch",
        axis: "vertical",
        strength: 0.04,
        edgeStart: 0.84,
        cropCompensation: 1.012,
      },
    },
    modifiers: {
      "quiet-breathing": {
        model: "lens-breathing",
        amount: 0.0025,
        periodFrames: 180,
      },
    },
    filters: {
      "studio-neutral": {
        model: "color-grade",
        brightness: -0.01,
        contrast: 1.045,
        saturation: 0.94,
        gamma: 1,
        temperature: -0.025,
        tint: 0.008,
      },
      "media-proof": {
        model: "color-grade",
        brightness: 0.008,
        contrast: 1.085,
        saturation: 1.035,
        gamma: 1.005,
        temperature: 0.018,
        tint: 0.006,
      },
    },
  },
  framings: {
    establish: { fill: 0.86, max: 1, padding: 54 },
    hero: {
      position: [0.5, 0.49],
      fill: 0.7,
      min: 0.42,
      max: 1.35,
    },
    notification: {
      position: [0.5, 0.37],
      fill: 0.72,
      mode: "width",
      min: 0.48,
      max: 1.4,
    },
    message: {
      position: [0.5, 0.45],
      fill: 0.58,
      mode: "width",
      min: 0.48,
      max: 1.16,
    },
    keyboard: {
      position: [0.5, 0.73],
      fill: 0.84,
      mode: "width",
      min: 0.45,
      max: 1.25,
    },
    post: {
      position: [0.5, 0.47],
      fill: 0.69,
      mode: "width",
      min: 0.44,
      max: 1.42,
    },
    poll: {
      position: [0.5, 0.52],
      fill: 0.71,
      mode: "width",
      min: 0.45,
      max: 1.4,
    },
    video: { fill: 0.73, min: 0.44, max: 1.38 },
    profile: {
      position: [0.5, 0.4],
      fill: 0.75,
      mode: "width",
      min: 0.44,
      max: 1.34,
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
        frame: { fill: 0.86, padding: 54, min: 0.34, max: 1 },
        framingGuard: {
          subject: subject.body,
          paddingPx: 54,
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
          fill: 0.82,
          mode: "contain",
          padding: 34,
          min: 0.34,
          max: 1.45,
        },
      },
      shots: [
        shot("device-establish", 120, subject.body)
          .frame("establish")
          .filters("studio-neutral")
          .dollyIn(38, { amount: 0.075 }),
        shot("hero-post", 150, target.heroMedia)
          .frame("hero")
          .fallback(subject.screen)
          .filters("media-proof")
          .dollyIn(28, { amount: 0.1 })
          .when("kinetic", { lens: "media-anamorphic" }),
        shot("notification-depth", 150, target.notification)
          .frame("notification")
          .fallback(subject.screen)
          .filters("studio-neutral")
          .settle(20),
        shot("dm-delivery", 180, target.message)
          .frame("message")
          .fallback(subject.screen)
          .filters("studio-neutral")
          .dollyOut(26, { amount: 0.045 }),
        shot("composer-keyboard", 180, subject.keyboard)
          .frame("keyboard")
          .fallback(subject.body)
          .filters("studio-neutral")
          .truckLeft(20, 0.01)
          .when("kinetic", { lens: "keyboard-fisheye" }),
        shot("new-post-proof", 120, target.newPost)
          .frame("post")
          .fallback(subject.screen)
          .filters("studio-neutral")
          .dollyIn(22, { amount: 0.09 }),
        shot("poll-selection", 120, target.poll)
          .frame("poll")
          .fallback(subject.screen)
          .filters("studio-neutral")
          .when("kinetic", { lens: "detail-barrel" }),
        shot("video-lifecycle", 120, target.video)
          .frame("video")
          .fallback(subject.screen)
          .filters("media-proof")
          .dollyIn(24, { amount: 0.08 })
          .when("kinetic", { lens: "media-anamorphic" }),
        shot("profile-finale", 120, target.profile)
          .frame("profile")
          .fallback(subject.body)
          .filters("studio-neutral")
          .dollyOut(30, { amount: 0.08 })
          .when("kinetic", { lens: "profile-vertical" }),
      ],
    },
  ],
} satisfies CinematicPlanFamilyDefinition;

export const xCinematicFlagship = cinematicProgram(
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
