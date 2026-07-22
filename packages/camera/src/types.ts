import type { CameraPlanIR, CameraRectIR, CameraRigIR, CameraShotIR, JsonObject } from "@tokovo/ir";
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
  frame?: number;
}

export interface PreparedCameraProgram {
  version: 1;
  plan: CameraPlanIR;
  shotsByOutput: Readonly<Record<string, readonly CameraShotIR[]>>;
  /** Highest-fidelity backend required by any reachable rig or transition. */
  projectionBackendRequirement: "composited" | "texture";
  signature: string;
  diagnostics: readonly CameraDiagnostic[];
}

export interface CameraTransitionTrace {
  sourceRigId: string | null;
  targetRigId: string;
  durationFrames: number;
  curve: "linear" | "smoothstep" | "minimum-jerk" | "critically-damped";
  progress: number;
  whipActive: boolean;
}

export interface CameraEvaluationTrace {
  planId: string;
  programSignature: string;
  mode: "preview" | "render";
  selection: "shot" | "default-rig";
  shotId: string | null;
  rigId: string;
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
  projectionPassKinds: readonly CameraProjectionPass["kind"][];
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
}
