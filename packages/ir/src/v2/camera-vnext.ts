import type { CompositionProfileId } from "@tokovo/visual-system";

/**
 * Camera VNext serializable authoring contracts.
 *
 * CameraPlanIR is deliberately separate from TrackEvent. Camera direction is
 * evaluated from a prepared plan and the projected scene at frame t; it is not
 * replayed into mutable WorldState.
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export type CameraCoordinateSpaceIR =
  | "app-logical"
  | "device-screen"
  | "device-body"
  | "stage-world"
  | "output-viewport";

export interface CameraPointIR {
  x: number;
  y: number;
}

export interface CameraRectIR extends CameraPointIR {
  width: number;
  height: number;
}

export type CinematicSubjectRefIR =
  | {
      kind: "semantic";
      deviceId: string;
      appId: string;
      subjectId: string;
    }
  | {
      kind: "entity";
      deviceId: string;
      appId: string;
      entityType: string;
      entityId: string;
      region: string;
    }
  | {
      kind: "device";
      deviceId: string;
      subjectId: string;
    }
  | {
      kind: "group";
      members: readonly CinematicSubjectRefIR[];
    };

export type CameraMissingSubjectPolicyIR =
  | { type: "error" }
  | { type: "skip-shot" }
  | { type: "use-explicit"; fallback: CinematicSubjectRefIR };

export type CameraFillModeIR = "contain" | "cover" | "width" | "height";

export interface CameraComposerIR {
  /** Normalized output coordinates. */
  screenPosition: readonly [number, number];
  /** Fraction of the output viewport the padded subject should occupy. */
  targetFill: number;
  fillMode: CameraFillModeIR;
  paddingPx?: number;
  minScale?: number;
  maxScale?: number;
  /** Stage-space composer bias. */
  bias?: readonly [number, number];
}

/**
 * Keeps a semantic context subject inside the output while the composer tracks
 * a more specific child subject. This is intentionally a subject reference,
 * rather than device geometry, so the rule works for devices, apps, and stage
 * groups without teaching the camera about any of them.
 */
export interface CameraFramingGuardIR {
  subject: CinematicSubjectRefIR;
  /** Output-space clearance between the guarded subject and the viewport. */
  paddingPx?: number;
  /** Optional normalized output position for the guarded subject's center. */
  screenPosition?: readonly [number, number];
}

/**
 * Separates the physical subject that should remain compositionally stable
 * from the semantic detail receiving editorial attention.
 *
 * The composer may follow the attention subject freely until the projected
 * mount center reaches this output-space dead zone. Beyond it, translation is
 * corrected without changing authored scale, rotation, lenses, or filters.
 */
export interface CameraMountIR {
  subject: CinematicSubjectRefIR;
  /** Normalized position inside the effective output viewport. */
  screenPosition: readonly [number, number];
  /** Maximum horizontal and vertical displacement from screenPosition. */
  maxDriftPx: readonly [number, number];
}

/**
 * Device travel is never inferred. A rig either declares a stable semantic
 * mount or explicitly documents why the physical subject may travel.
 */
export type CameraTravelIR =
  | {
      mode: "stabilized";
      mount: CameraMountIR;
    }
  | {
      mode: "intentional";
      reason: string;
    };

export interface CameraTrajectoryKeyframeIR {
  frame: number;
  offsetX: number;
  offsetY: number;
  scaleMultiplier: number;
  rotationOffsetDeg: number;
}

/** Compact, random-access camera offsets baked independently from story replay. */
export interface CameraBakedTrajectoryIR {
  interpolation: "linear" | "minimum-jerk";
  keyframes: readonly CameraTrajectoryKeyframeIR[];
}

export interface CameraMovementIntentIR {
  kind:
    | "dolly-in"
    | "dolly-out"
    | "truck-left"
    | "truck-right"
    | "pedestal-up"
    | "pedestal-down"
    | "pan-left"
    | "pan-right"
    | "tilt-up"
    | "tilt-down"
    | "roll"
    | "crane-up"
    | "crane-down"
    | "orbit";
  /** Normalized authored intensity, normally in the 0..1 range. */
  amount?: number;
  /** Projective orbit direction where applicable. */
  yawDeg?: number;
  pitchDeg?: number;
}

export type CameraMotionProfileIR =
  | {
      type: "cut";
      intent?: CameraMovementIntentIR;
    }
  | {
      type: "minimum-jerk";
      durationFrames: number;
      intent?: CameraMovementIntentIR;
    }
  | {
      type: "critically-damped";
      responseFrames: number;
      intent?: CameraMovementIntentIR;
    }
  | {
      type: "whip";
      durationFrames: number;
      direction: "left" | "right" | "up" | "down" | readonly [number, number];
      intent?: CameraMovementIntentIR;
    };

export interface CameraBlendIR {
  durationFrames: number;
  curve: "linear" | "smoothstep" | "minimum-jerk";
}

/**
 * A named lens is data. `modelId` resolves through an explicit camera lens
 * registry during preparation.
 */
export interface CameraLensIR {
  id: string;
  modelId: string;
  modelVersion: number;
  parameters: JsonObject;
}

export interface CameraModifierIR {
  id: string;
  modelId: string;
  modelVersion: number;
  parameters: JsonObject;
}

/** Named deterministic image treatment resolved through the filter registry. */
export interface CameraFilterIR {
  id: string;
  modelId: string;
  modelVersion: number;
  parameters: JsonObject;
}

export interface CameraOutputShadowIR {
  offsetX: number;
  offsetY: number;
  blurPx: number;
  opacity: number;
}

export interface CameraEditorialInsetsIR {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CameraOutputIR {
  id: string;
  /** Output-space pixel rectangle within the final composition. */
  viewport: CameraRectIR;
  sourceStageNodeId: string;
  zIndex: number;
  clipRadiusPx?: number;
  shadow?: CameraOutputShadowIR;
  /** Whether authored shots must cover every frame or the default rig may cover gaps. */
  coveragePolicy: "require-shots" | "allow-default";
  /** Editorial composition policy; resolves default insets and overlay intent. */
  compositionProfileId: CompositionProfileId;
  /** Output-space editorial protection used by every rig targeting this output. */
  editorialInsets?: CameraEditorialInsetsIR;
  defaultRigId: string;
}

export interface CameraRigIR {
  id: string;
  outputId: string;
  subject: CinematicSubjectRefIR;
  composer: CameraComposerIR;
  travel: CameraTravelIR;
  framingGuard?: CameraFramingGuardIR;
  tracking?: { mode: "direct" };
  bakedTrajectory?: CameraBakedTrajectoryIR;
  rotationDeg?: number;
  opacity?: number;
  lensId?: string;
  modifierIds?: readonly string[];
  filterIds?: readonly string[];
  motion?: CameraMotionProfileIR;
}

export interface CameraShotIR {
  id: string;
  outputId: string;
  startFrame: number;
  endFrame: number;
  rigId: string;
  priority: number;
  declarationOrder: number;
  blendIn?: CameraBlendIR;
  missingSubjectPolicy: CameraMissingSubjectPolicyIR;
  source: "authored" | "automatic";
}

export interface CameraPlanIR {
  version: 2;
  id: string;
  fps: number;
  durationInFrames: number;
  outputs: readonly CameraOutputIR[];
  rigs: readonly CameraRigIR[];
  shots: readonly CameraShotIR[];
  lenses: readonly CameraLensIR[];
  modifiers: readonly CameraModifierIR[];
  filters: readonly CameraFilterIR[];
}

export interface CinematicSubjectSchemaIR {
  version: number;
  ownerId: string;
  semanticSubjectIds: readonly string[];
  entityRegions: Readonly<Record<string, readonly string[]>>;
}
