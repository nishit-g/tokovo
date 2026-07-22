import type {
  CameraLensIR,
  CameraModifierIR,
  CameraPlanIR,
  CameraRigIR,
  CameraShotIR,
  CinematicSubjectRefIR,
  EpisodeCinematicsIR,
} from "@tokovo/ir";

const FPS = 60;
const DURATION_IN_FRAMES = 1440;
const MAIN_OUTPUT_ID = "portrait-main";
const PIP_OUTPUT_ID = "message-pip";
const DEVICE_ID = "director-phone";
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

const message = (
  entityId: string,
  region: "bubble" | "reply" | "media" | "reactions" = "bubble",
): CinematicSubjectRefIR => ({
  kind: "entity",
  deviceId: DEVICE_ID,
  appId: APP_ID,
  entityType: "message",
  entityId,
  region,
});

const conversationGroup: CinematicSubjectRefIR = {
  kind: "group",
  members: [semantic("header"), semantic("last-message"), semantic("input_area")],
};

type RigSpec = {
  subject: CinematicSubjectRefIR;
  screenPosition: readonly [number, number];
  targetFill: number;
  fillMode: CameraRigIR["composer"]["fillMode"];
  paddingPx: number;
  minScale: number;
  maxScale: number;
  motion: NonNullable<CameraRigIR["motion"]>;
  lensId?: string;
  modifierIds?: readonly string[];
};

const rigSpecs = {
  neutral: {
    subject: device("body"),
    screenPosition: [0.5, 0.5],
    targetFill: 0.83,
    fillMode: "contain",
    paddingPx: 24,
    minScale: 0.45,
    maxScale: 0.72,
    motion: { type: "minimum-jerk", durationFrames: 34 },
  },
  opening: {
    subject: device("body"),
    screenPosition: [0.5, 0.51],
    targetFill: 0.79,
    fillMode: "contain",
    paddingPx: 32,
    minScale: 0.43,
    maxScale: 0.7,
    motion: { type: "minimum-jerk", durationFrames: 42 },
    lensId: "opening-perspective",
    modifierIds: ["quiet-breathing"],
  },
  header: {
    subject: semantic("header"),
    screenPosition: [0.5, 0.25],
    targetFill: 0.72,
    fillMode: "width",
    paddingPx: 28,
    minScale: 0.55,
    maxScale: 0.9,
    motion: { type: "minimum-jerk", durationFrames: 28 },
    lensId: "header-barrel",
  },
  keyboardFisheye: {
    subject: device("keyboard"),
    screenPosition: [0.5, 0.7],
    targetFill: 0.77,
    fillMode: "width",
    paddingPx: 24,
    minScale: 0.58,
    maxScale: 0.84,
    motion: { type: "critically-damped", responseFrames: 24 },
    lensId: "typing-fisheye",
  },
  keyboardAnamorphic: {
    subject: device("keyboard"),
    screenPosition: [0.5, 0.69],
    targetFill: 0.79,
    fillMode: "width",
    paddingPx: 20,
    minScale: 0.58,
    maxScale: 0.86,
    motion: { type: "critically-damped", responseFrames: 22 },
    lensId: "keyboard-edge-stretch",
  },
  sentMessage: {
    subject: message("director_reply"),
    screenPosition: [0.52, 0.61],
    targetFill: 0.52,
    fillMode: "width",
    paddingPx: 42,
    minScale: 0.66,
    maxScale: 1.32,
    motion: { type: "critically-damped", responseFrames: 26 },
    modifierIds: ["quiet-breathing"],
  },
  notificationWhip: {
    subject: device("notification.banner"),
    screenPosition: [0.5, 0.2],
    targetFill: 0.73,
    fillMode: "width",
    paddingPx: 24,
    minScale: 0.54,
    maxScale: 0.92,
    motion: { type: "whip", durationFrames: 20, direction: "left" },
  },
  media: {
    subject: message("launch_board", "media"),
    screenPosition: [0.5, 0.55],
    targetFill: 0.58,
    fillMode: "contain",
    paddingPx: 34,
    minScale: 0.63,
    maxScale: 1.2,
    motion: { type: "minimum-jerk", durationFrames: 30 },
    lensId: "media-perspective",
  },
  navigation: {
    subject: device("screen"),
    screenPosition: [0.5, 0.5],
    targetFill: 0.88,
    fillMode: "contain",
    paddingPx: 14,
    minScale: 0.5,
    maxScale: 0.76,
    motion: { type: "minimum-jerk", durationFrames: 32 },
    lensId: "navigation-edge-stretch",
  },
  conversation: {
    subject: conversationGroup,
    screenPosition: [0.5, 0.5],
    targetFill: 0.84,
    fillMode: "contain",
    paddingPx: 30,
    minScale: 0.5,
    maxScale: 0.78,
    motion: { type: "minimum-jerk", durationFrames: 36 },
  },
} satisfies Record<string, RigSpec>;

type RigId = keyof typeof rigSpecs;

function buildRigs(kinetic: boolean): CameraRigIR[] {
  const mainRigs = (Object.entries(rigSpecs) as [RigId, RigSpec][]).map(
    ([id, spec]): CameraRigIR => ({
      id,
      outputId: MAIN_OUTPUT_ID,
      subject: spec.subject,
      composer: {
        screenPosition: spec.screenPosition,
        targetFill: spec.targetFill,
        fillMode: spec.fillMode,
        paddingPx: spec.paddingPx,
        minScale: spec.minScale,
        maxScale: spec.maxScale,
      },
      framingGuard: {
        subject: device("body"),
        paddingPx: 28,
        screenPosition: [0.5, 0.5],
      },
      motion:
        !kinetic && spec.motion.type === "whip"
          ? { type: "minimum-jerk", durationFrames: 30 }
          : spec.motion,
      ...(kinetic && spec.lensId ? { lensId: spec.lensId } : {}),
      ...(kinetic && spec.modifierIds ? { modifierIds: spec.modifierIds } : {}),
    }),
  );
  const pipComposer = {
    screenPosition: [0.5, 0.4] as const,
    targetFill: 0.9,
    fillMode: "width" as const,
    paddingPx: 14,
    minScale: 0.38,
    maxScale: 0.72,
  };
  return [
    ...mainRigs,
    {
      id: "pip-hidden",
      outputId: PIP_OUTPUT_ID,
      subject: device("screen"),
      composer: pipComposer,
      opacity: 0,
      motion: { type: "minimum-jerk", durationFrames: 24 },
    },
    {
      id: "pip-message",
      outputId: PIP_OUTPUT_ID,
      subject: message("director_reply"),
      composer: pipComposer,
      opacity: 0.96,
      motion: { type: "minimum-jerk", durationFrames: 26 },
    },
  ];
}

function fallbackFor(rigId: RigId): CinematicSubjectRefIR {
  if (rigId === "keyboardFisheye" || rigId === "keyboardAnamorphic") {
    return semantic("input_area");
  }
  if (rigId === "notificationWhip" || rigId === "media" || rigId === "sentMessage") {
    return device("screen");
  }
  return device("body");
}

function mainShot(
  id: string,
  startFrame: number,
  endFrame: number,
  rigId: RigId,
  declarationOrder: number,
): CameraShotIR {
  return {
    id,
    outputId: MAIN_OUTPUT_ID,
    startFrame,
    endFrame,
    rigId,
    priority: 10,
    declarationOrder,
    blendIn: {
      durationFrames: rigId === "notificationWhip" ? 20 : 28,
      curve: "minimum-jerk",
    },
    missingSubjectPolicy:
      rigId === "neutral" || rigId === "opening" || rigId === "navigation"
        ? { type: "error" }
        : { type: "use-explicit", fallback: fallbackFor(rigId) },
    source: "authored",
  };
}

const shots: CameraShotIR[] = [
  mainShot("oblique-stage-open", 0, 120, "opening", 0),
  mainShot("barrel-header-arrival", 120, 240, "header", 1),
  mainShot("fisheye-keyboard-entry", 240, 390, "keyboardFisheye", 2),
  mainShot("anamorphic-keyboard-run", 390, 540, "keyboardAnamorphic", 3),
  mainShot("exact-sent-message", 540, 636, "sentMessage", 4),
  mainShot("notification-whip", 636, 750, "notificationWhip", 5),
  mainShot("exact-media-reframe", 750, 930, "media", 6),
  mainShot("semantic-navigation", 930, 1140, "navigation", 7),
  mainShot("conversation-group-settle", 1140, 1320, "conversation", 8),
  mainShot("neutral-final", 1320, DURATION_IN_FRAMES, "neutral", 9),
  {
    id: "pip-message-hold",
    outputId: PIP_OUTPUT_ID,
    startFrame: 540,
    endFrame: 636,
    rigId: "pip-message",
    priority: 10,
    declarationOrder: 10,
    blendIn: { durationFrames: 28, curve: "minimum-jerk" },
    missingSubjectPolicy: { type: "use-explicit", fallback: device("screen") },
    source: "authored",
  },
  {
    id: "pip-message-fade",
    outputId: PIP_OUTPUT_ID,
    startFrame: 636,
    endFrame: 672,
    rigId: "pip-hidden",
    priority: 10,
    declarationOrder: 11,
    blendIn: { durationFrames: 24, curve: "minimum-jerk" },
    missingSubjectPolicy: { type: "error" },
    source: "authored",
  },
];

const lenses: CameraLensIR[] = [
  {
    id: "opening-perspective",
    modelId: "perspective-tilt",
    modelVersion: 1,
    parameters: {
      tiltXDeg: 5.5,
      tiltYDeg: -3.2,
      perspectivePx: 1750,
      cropCompensation: 1.035,
    },
  },
  {
    id: "header-barrel",
    modelId: "wide-angle-barrel",
    modelVersion: 1,
    parameters: {
      center: [0.5, 0.3],
      strength: 0.105,
      radius: 1.12,
      cropCompensation: 1.035,
    },
  },
  {
    id: "typing-fisheye",
    modelId: "fisheye",
    modelVersion: 1,
    parameters: {
      center: [0.5, 0.7],
      strength: 0.12,
      radius: 1.16,
      cropCompensation: 1.045,
    },
  },
  {
    id: "keyboard-edge-stretch",
    modelId: "anamorphic-edge-stretch",
    modelVersion: 1,
    parameters: {
      axis: "horizontal",
      strength: 0.115,
      edgeStart: 0.72,
      cropCompensation: 1.035,
    },
  },
  {
    id: "media-perspective",
    modelId: "perspective-tilt",
    modelVersion: 1,
    parameters: {
      tiltXDeg: -2.8,
      tiltYDeg: 3.6,
      perspectivePx: 1900,
      cropCompensation: 1.025,
    },
  },
  {
    id: "navigation-edge-stretch",
    modelId: "anamorphic-edge-stretch",
    modelVersion: 1,
    parameters: {
      axis: "vertical",
      strength: 0.08,
      edgeStart: 0.78,
      cropCompensation: 1.025,
    },
  },
];

const modifiers: CameraModifierIR[] = [
  {
    id: "quiet-breathing",
    modelId: "lens-breathing",
    modelVersion: 1,
    parameters: { amount: 0.0045, periodFrames: 240 },
  },
];

function plan(id: string, kinetic: boolean): CameraPlanIR {
  return {
    version: 1,
    id,
    fps: FPS,
    durationInFrames: DURATION_IN_FRAMES,
    outputs: [
      {
        id: MAIN_OUTPUT_ID,
        viewport: { x: 0, y: 0, width: 1080, height: 1920 },
        sourceStageNodeId: "stage.root",
        zIndex: 0,
        defaultRigId: "neutral",
      },
      {
        id: PIP_OUTPUT_ID,
        viewport: { x: 570, y: 250, width: 480, height: 220 },
        sourceStageNodeId: "stage.root",
        zIndex: 20,
        clipRadiusPx: 32,
        shadow: { offsetX: 0, offsetY: 18, blurPx: 28, opacity: 0.58 },
        defaultRigId: "pip-hidden",
      },
    ],
    rigs: buildRigs(kinetic),
    shots,
    lenses: kinetic ? lenses : [],
    modifiers: kinetic ? modifiers : [],
  };
}

const restrainedPlan = plan("restrained", false);
const kineticPlan = plan("kinetic", true);

export const cameraVNextCinematicFlagshipCinematics: EpisodeCinematicsIR = {
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
        id: "device.director-phone",
        parentId: "stage.root",
        source: { kind: "device", deviceId: DEVICE_ID },
        localBounds: { x: 0, y: 0, width: 1290, height: 2796 },
        initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
        zIndex: 10,
      },
    ],
    transformKeyframes: [],
  },
  cameraPlans: [restrainedPlan, kineticPlan],
  defaultCameraPlanId: kineticPlan.id,
};
