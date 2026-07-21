import type {
  CameraPlanIR,
  CameraRigIR,
  CameraShotIR,
  CinematicSubjectRefIR,
  EpisodeCinematicsIR,
} from "@tokovo/ir";

const FPS = 30;
const DURATION_IN_FRAMES = 1320;
const OUTPUT_ID = "portrait-main";
const DEVICE_ID = "phone";
const APP_ID = "app_whatsapp";

const device = (subjectId: string): CinematicSubjectRefIR => ({
  kind: "device",
  deviceId: DEVICE_ID,
  subjectId,
});

const semantic = (subjectId: string): CinematicSubjectRefIR => ({
  kind: "semantic",
  deviceId: DEVICE_ID,
  appId: APP_ID,
  subjectId,
});

function baseRigs(): CameraRigIR[] {
  return [
    {
      id: "device-master",
      outputId: OUTPUT_ID,
      subject: device("body"),
      composer: {
        screenPosition: [0.5, 0.5],
        targetFill: 0.84,
        fillMode: "contain",
        paddingPx: 24,
        minScale: 0.45,
        maxScale: 0.72,
      },
      motion: { type: "minimum-jerk", durationFrames: 18 },
    },
    {
      id: "conversation-header",
      outputId: OUTPUT_ID,
      subject: semantic("header"),
      composer: {
        screenPosition: [0.5, 0.23],
        targetFill: 0.72,
        fillMode: "width",
        paddingPx: 24,
        minScale: 0.52,
        maxScale: 0.88,
      },
      motion: { type: "minimum-jerk", durationFrames: 16 },
    },
    {
      id: "latest-message",
      outputId: OUTPUT_ID,
      subject: semantic("last-message"),
      composer: {
        screenPosition: [0.5, 0.64],
        targetFill: 0.67,
        fillMode: "width",
        paddingPx: 36,
        minScale: 0.62,
        maxScale: 1.4,
      },
      motion: { type: "critically-damped", responseFrames: 18 },
    },
    {
      id: "real-keyboard",
      outputId: OUTPUT_ID,
      subject: device("keyboard"),
      composer: {
        screenPosition: [0.5, 0.7],
        targetFill: 0.78,
        fillMode: "width",
        paddingPx: 22,
        minScale: 0.55,
        maxScale: 0.82,
      },
      motion: { type: "critically-damped", responseFrames: 14 },
    },
    {
      id: "app-screen",
      outputId: OUTPUT_ID,
      subject: device("screen"),
      composer: {
        screenPosition: [0.5, 0.5],
        targetFill: 0.89,
        fillMode: "contain",
        paddingPx: 12,
        minScale: 0.5,
        maxScale: 0.76,
      },
      motion: { type: "minimum-jerk", durationFrames: 20 },
    },
  ];
}

function shot(
  id: string,
  startFrame: number,
  endFrame: number,
  rigId: string,
  declarationOrder: number,
  priority = 10,
): CameraShotIR {
  return {
    id,
    outputId: OUTPUT_ID,
    startFrame,
    endFrame,
    rigId,
    priority,
    declarationOrder,
    blendIn: { durationFrames: 14, curve: "minimum-jerk" },
    missingSubjectPolicy:
      rigId === "real-keyboard"
        ? { type: "use-explicit", fallback: semantic("input_area") }
        : rigId === "latest-message" || rigId === "conversation-header"
          ? { type: "use-explicit", fallback: device("screen") }
          : { type: "error" },
    source: "authored",
  };
}

const editorialShots: CameraShotIR[] = [
  shot("enter-conversation", 60, 90, "conversation-header", 0),
  shot("first-chat-run", 90, 315, "latest-message", 1),
  shot("first-real-keyboard", 66, 144, "real-keyboard", 2, 20),
  shot("updates-and-calls", 315, 564, "app-screen", 3),
  shot("vendor-run", 564, 774, "latest-message", 4),
  shot("vendor-real-keyboard", 570, 660, "real-keyboard", 5, 20),
  shot("ops-run", 825, 1044, "latest-message", 6),
  shot("ops-real-keyboard", 828, 918, "real-keyboard", 7, 20),
  shot("closing-navigation", 1044, 1320, "app-screen", 8),
];

function plan(input: {
  id: string;
  rigs: CameraRigIR[];
  shots: CameraShotIR[];
  lenses: CameraPlanIR["lenses"];
  modifiers?: CameraPlanIR["modifiers"];
}): CameraPlanIR {
  return {
    version: 1,
    id: input.id,
    fps: FPS,
    durationInFrames: DURATION_IN_FRAMES,
    outputs: [
      {
        id: OUTPUT_ID,
        viewport: { x: 0, y: 0, width: 1080, height: 1920 },
        sourceStageNodeId: "stage.root",
        zIndex: 0,
        defaultRigId: "device-master",
      },
    ],
    rigs: input.rigs,
    shots: input.shots,
    lenses: input.lenses,
    modifiers: input.modifiers ?? [],
  };
}

const editorialPlan = plan({
  id: "whatsapp-editorial",
  rigs: baseRigs(),
  shots: editorialShots,
  lenses: [],
  modifiers: [],
});

const expressiveRigs = baseRigs().map((rig): CameraRigIR => {
  const lensId = (() => {
    switch (rig.id) {
      case "conversation-header":
        return "subtle-barrel";
      case "latest-message":
        return "typing-fisheye";
      case "real-keyboard":
        return "edge-stretch";
      case "app-screen":
        return "perspective";
      default:
        return undefined;
    }
  })();
  return {
    ...rig,
    ...(lensId ? { lensId } : {}),
    ...(rig.id === "device-master" ? { modifierIds: ["breathing"] } : {}),
  };
});
expressiveRigs.push({
  ...baseRigs().find((rig) => rig.id === "app-screen")!,
  id: "whip-navigation",
  lensId: "directional-smear",
  motion: { type: "whip", durationFrames: 12, direction: "left" },
});

const expressiveShots = editorialShots.map((entry) => ({ ...entry }));
expressiveShots.push(
  shot("vendor-whip", 552, 582, "whip-navigation", 20, 30),
  shot("ops-whip", 813, 843, "whip-navigation", 21, 30),
);

const expressivePlan = plan({
  id: "whatsapp-expressive-lenses",
  rigs: expressiveRigs,
  shots: expressiveShots,
  lenses: [
    {
      id: "subtle-barrel",
      modelId: "wide-angle-barrel",
      modelVersion: 1,
      parameters: {
        center: [0.5, 0.32],
        strength: 0.12,
        radius: 1.1,
        cropCompensation: 1.04,
      },
    },
    {
      id: "typing-fisheye",
      modelId: "fisheye",
      modelVersion: 1,
      parameters: {
        center: [0.5, 0.64],
        strength: 0.1,
        radius: 1.15,
        cropCompensation: 1.04,
      },
    },
    {
      id: "perspective",
      modelId: "perspective-tilt",
      modelVersion: 1,
      parameters: {
        tiltXDeg: 3.5,
        tiltYDeg: -2.5,
        perspectivePx: 1800,
        cropCompensation: 1.025,
      },
    },
    {
      id: "edge-stretch",
      modelId: "anamorphic-edge-stretch",
      modelVersion: 1,
      parameters: {
        axis: "horizontal",
        strength: 0.12,
        edgeStart: 0.72,
        cropCompensation: 1.035,
      },
    },
    {
      id: "directional-smear",
      modelId: "directional-smear",
      modelVersion: 1,
      parameters: {
        direction: [-1, 0.12],
        spreadPx: 28,
        samples: 6,
        decay: 0.68,
      },
    },
  ],
  modifiers: [
    {
      id: "breathing",
      modelId: "lens-breathing",
      modelVersion: 1,
      parameters: { amount: 0.006, periodFrames: 180 },
    },
  ],
});

export const whatsappFlagshipCinematics: EpisodeCinematicsIR = {
  stageProgram: {
    version: 1,
    rootNodeId: "stage.root",
    nodes: [
      {
        id: "stage.root",
        source: { kind: "group" },
        localBounds: { x: 0, y: 0, width: 1290, height: 2796 },
        initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
        zIndex: 0,
      },
      {
        id: "device.phone",
        parentId: "stage.root",
        source: { kind: "device", deviceId: DEVICE_ID },
        localBounds: { x: 0, y: 0, width: 1290, height: 2796 },
        initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
        zIndex: 10,
      },
    ],
    transformKeyframes: [],
  },
  cameraPlans: [editorialPlan, expressivePlan],
  defaultCameraPlanId: editorialPlan.id,
};
