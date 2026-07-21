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

export type CameraMotionProfileIR =
  | {
      type: "cut";
    }
  | {
      type: "minimum-jerk";
      durationFrames: number;
    }
  | {
      type: "critically-damped";
      responseFrames: number;
    }
  | {
      type: "whip";
      durationFrames: number;
      direction: "left" | "right" | "up" | "down" | readonly [number, number];
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

export interface CameraOutputIR {
  id: string;
  /** Output-space pixel rectangle within the final composition. */
  viewport: CameraRectIR;
  sourceStageNodeId: string;
  zIndex: number;
  clipRadiusPx?: number;
  defaultRigId: string;
}

export interface CameraRigIR {
  id: string;
  outputId: string;
  subject: CinematicSubjectRefIR;
  composer: CameraComposerIR;
  rotationDeg?: number;
  opacity?: number;
  lensId?: string;
  modifierIds?: readonly string[];
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
  version: 1;
  id: string;
  fps: number;
  durationInFrames: number;
  outputs: readonly CameraOutputIR[];
  rigs: readonly CameraRigIR[];
  shots: readonly CameraShotIR[];
  lenses: readonly CameraLensIR[];
  modifiers: readonly CameraModifierIR[];
}

export interface CinematicSubjectSchemaIR {
  version: number;
  ownerId: string;
  semanticSubjectIds: readonly string[];
  entityRegions: Readonly<Record<string, readonly string[]>>;
}
