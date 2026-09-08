import type {
  CameraMovementIntentIR,
  CameraPlanIR,
  CameraRectIR,
  CameraRigIR,
  JsonObject,
} from "@tokovo/ir";
import type { StageProjectedCinematicSubject } from "@tokovo/stage";

/** Row-major 3x3 projective matrix. */
export type Matrix3 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface CameraPose2D {
  centerX: number;
  centerY: number;
  scale: number;
  rotationDeg: number;
  opacity: number;
  clipRect: CameraRectIR;
}

export type ResolvedCinematicSubject = StageProjectedCinematicSubject;

export interface CinematicSubjectFrame {
  frame: number;
  subjects: readonly ResolvedCinematicSubject[];
}

export type CameraProjectionPass =
  | {
      kind: "radial-warp";
      model: "barrel";
      center: readonly [number, number];
      strength: number;
      radius: number;
      cropCompensation: number;
    }
  | {
      kind: "fisheye-warp";
      center: readonly [number, number];
      strength: number;
      radius: number;
      cropCompensation: number;
    }
  | {
      kind: "projective-warp";
      tiltXDeg: number;
      tiltYDeg: number;
      perspectivePx: number;
      cropCompensation: number;
    }
  | {
      kind: "anamorphic-edge-stretch";
      axis: "horizontal" | "vertical";
      strength: number;
      edgeStart: number;
      cropCompensation: number;
    }
  | {
      kind: "directional-smear";
      direction: readonly [number, number];
      spreadPx: number;
      samples: number;
      decay: number;
    }
  | {
      kind: "color-grade";
      brightness: number;
      contrast: number;
      saturation: number;
      gamma: number;
      temperature: number;
      tint: number;
    };

export interface CameraDiagnostic {
  code: string;
  severity: "error" | "warning";
  message: string;
  planId: string;
  outputId?: string;
  shotId?: string;
  rigId?: string;
  lensId?: string;
  modifierId?: string;
  filterId?: string;
  frame?: number;
}

export interface PreparedCameraProgram {
  version: 2;
  plan: CameraPlanIR;
  /** Compact JSON-safe indexes into the sorted plan arrays. */
  outputIndexById: Readonly<Record<string, number>>;
  rigIndexById: Readonly<Record<string, number>>;
  lensIndexById: Readonly<Record<string, number>>;
  modifierIndexById: Readonly<Record<string, number>>;
  filterIndexById: Readonly<Record<string, number>>;
  /** Non-overlapping interval segments keep per-frame selection O(log n) without duplicating shots. */
  shotSegmentsByOutput: Readonly<Record<string, readonly CameraShotSegment[]>>;
  coverageByOutput: Readonly<
    Record<
      string,
      {
        policy: CameraPlanIR["outputs"][number]["coveragePolicy"];
        gaps: readonly { startFrame: number; endFrame: number }[];
      }
    >
  >;
  /** Highest-fidelity backend required by any reachable rig or transition. */
  projectionBackendRequirement: "composited" | "texture";
  signature: string;
  diagnostics: readonly CameraDiagnostic[];
}

export interface CameraShotSegment {
  startFrame: number;
  endFrame: number;
  /** Indexes into `plan.shots`, already ordered by camera selection precedence. */
  shotIndexes: readonly number[];
}

export interface CameraTransitionTrace {
  sourceRigId: string | null;
  targetRigId: string;
  durationFrames: number;
  curve: "linear" | "smoothstep" | "minimum-jerk" | "critically-damped";
  progress: number;
  whipActive: boolean;
  movementIntent: CameraMovementIntentIR | null;
}

export interface CameraEvaluationTrace {
  planId: string;
  programSignature: string;
  mode: "preview" | "render";
  selection: "shot" | "default-rig";
  shotId: string | null;
  rigId: string;
  subjectResolution: "direct" | "explicit-fallback";
  desiredPose: CameraPose2D;
  finalPose: CameraPose2D;
  transition: CameraTransitionTrace | null;
  subjects: readonly {
    key: string;
    nodeId: string;
    worldRect: CameraRectIR;
    sourceVersion: number;
    ownerId: string;
    regionId: string;
  }[];
  framingGuard: {
    paddingPx: number;
    screenPosition: readonly [number, number] | null;
    subjects: readonly {
      key: string;
      nodeId: string;
      worldRect: CameraRectIR;
      sourceVersion: number;
      ownerId: string;
      regionId: string;
    }[];
  } | null;
  travel:
    | {
        mode: "stabilized";
        screenPosition: readonly [number, number];
        projectedCenter: readonly [number, number];
        desiredCenter: readonly [number, number];
        driftPx: readonly [number, number];
        maxDriftPx: readonly [number, number];
        subjects: readonly {
          key: string;
          nodeId: string;
          worldRect: CameraRectIR;
          sourceVersion: number;
          ownerId: string;
          regionId: string;
        }[];
      }
    | {
        mode: "intentional";
        reason: string;
      };
  constraints: {
    compositionProfileId: CameraPlanIR["outputs"][number]["compositionProfileId"];
    editorialInsets: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    effectiveViewport: CameraRectIR;
  };
  tracking: {
    mode: "direct";
    subjectKeys: readonly string[];
  };
  bakedTrajectory: {
    interpolation: "linear" | "minimum-jerk";
    fromFrame: number;
    toFrame: number;
    progress: number;
  } | null;
  projectionPassKinds: readonly CameraProjectionPass["kind"][];
  quality: {
    /** Dominant linear subject extent relative to the effective output viewport. */
    subjectFillRatio: number;
    /** Largest crop compensation requested by an active lens pass. */
    cropCompensation: number;
  };
}

export interface EvaluatedCameraOutput {
  frame: number;
  outputId: string;
  sourceStageNodeId: string;
  zIndex: number;
  clipRadiusPx: number;
  shadow?: CameraPlanIR["outputs"][number]["shadow"];
  activeShotId?: string;
  activeRigId: string;
  pose: CameraPose2D;
  viewMatrix: Matrix3;
  projectionPasses: readonly CameraProjectionPass[];
  resolvedSubjects: readonly ResolvedCinematicSubject[];
  diagnostics: readonly CameraDiagnostic[];
  /** Deterministic explain data. It is observational and cannot affect pixels. */
  trace: CameraEvaluationTrace;
}

export interface LensModelContext {
  frame: number;
  fps: number;
  parameters: JsonObject;
}

export interface CameraModifierResult {
  pose: CameraPose2D;
  projectionPasses: readonly CameraProjectionPass[];
}

export interface CameraModifierContext extends LensModelContext {
  pose: CameraPose2D;
  projectionPasses: readonly CameraProjectionPass[];
}

export interface CameraModifierModel {
  id: string;
  version: number;
  /** Declared capability keeps render routing explicit for third-party models. */
  projectionBackendRequirement: "composited" | "texture";
  validate(parameters: JsonObject): readonly string[];
  evaluate(context: CameraModifierContext): CameraModifierResult;
}

export interface CameraLensModel {
  id: string;
  version: number;
  /** Declared capability keeps render routing explicit for third-party models. */
  projectionBackendRequirement: "composited" | "texture";
  validate(parameters: JsonObject): readonly string[];
  evaluate(context: LensModelContext): readonly CameraProjectionPass[];
}

export interface CameraFilterModel {
  id: string;
  version: number;
  projectionBackendRequirement: "composited" | "texture";
  validate(parameters: JsonObject): readonly string[];
  evaluate(context: LensModelContext): readonly CameraProjectionPass[];
}

export interface CameraEvaluationInput {
  program: PreparedCameraProgram;
  outputId: string;
  frame: number;
  subjectFrame: CinematicSubjectFrame;
  mode: "preview" | "render";
}

export interface CameraRigEvaluation {
  rig: CameraRigIR;
  subjects: readonly ResolvedCinematicSubject[];
  framingGuardSubjects: readonly ResolvedCinematicSubject[];
  mountSubjects: readonly ResolvedCinematicSubject[];
  subjectResolution: "direct" | "explicit-fallback";
}

export interface CameraQualitySample {
  frame: number;
  outputId: string;
  viewport: CameraRectIR;
  pose: Pick<CameraPose2D, "centerX" | "centerY" | "scale" | "rotationDeg">;
  subjectResolution: "direct" | "explicit-fallback";
  subjectFillRatio: number;
  cropCompensation: number;
  intentionalDiscontinuity: boolean;
  travel:
    | {
        mode: "stabilized";
        driftPx: readonly [number, number];
        maxDriftPx: readonly [number, number];
      }
    | {
        mode: "intentional";
      };
}

export interface CameraTemporalQualityReport {
  version: 2;
  passed: boolean;
  sampleCount: number;
  outputs: readonly {
    outputId: string;
    frameRange: readonly [number, number];
    maximumPositionVelocity: number;
    maximumScaleVelocity: number;
    maximumRotationVelocityDeg: number;
    maximumPositionAcceleration: number;
    maximumPositionJerk: number;
    minimumSubjectFillRatio: number;
    maximumSubjectFillRatio: number;
    fallbackFrameCount: number;
    stabilizedFrameCount: number;
    intentionalTravelFrameCount: number;
    maximumMountDriftPx: readonly [number, number];
    cropCompensationChangeCount: number;
    discontinuityFrames: readonly number[];
    missingFrameRanges: readonly (readonly [number, number])[];
  }[];
  violations: readonly {
    code:
      | "CAM_QUALITY_FRAME_GAP"
      | "CAM_QUALITY_POSE_DISCONTINUITY"
      | "CAM_QUALITY_FILL_INVALID"
      | "CAM_QUALITY_MOUNT_DRIFT";
    outputId: string;
    frame?: number;
    message: string;
  }[];
}
