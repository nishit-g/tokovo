import type {
  CameraRectIR,
  CinematicSubjectRefIR,
  StageMatrix2DIR,
  StageNodeIR,
  StageProgramIR,
} from "@tokovo/ir";

export interface StageDiagnostic {
  code: string;
  severity: "error" | "warning";
  message: string;
  nodeId?: string;
  frame?: number;
}

export interface PreparedStageProgram {
  version: 2;
  program: StageProgramIR;
  nodesById: Readonly<Record<string, StageNodeIR>>;
  /** Topological evaluation order. */
  nodeOrder: readonly string[];
  /** Stable z-order used to paint evaluated nodes without sorting every frame. */
  paintOrder: readonly string[];
  /** Compact indexes into `program.transformKeyframes`, grouped by node. */
  keyframeIndexesByNode: Readonly<Record<string, readonly number[]>>;
  signature: string;
  diagnostics: readonly StageDiagnostic[];
}

export interface EvaluatedStageNode {
  id: string;
  source: StageNodeIR["source"];
  localTransform: StageMatrix2DIR;
  worldTransform: StageMatrix2DIR;
  localBounds: CameraRectIR;
  worldBounds: CameraRectIR;
  zIndex: number;
  clip?: CameraRectIR;
}

export interface EvaluatedStageFrame {
  frame: number;
  rootNodeId: string;
  nodes: readonly EvaluatedStageNode[];
  diagnostics: readonly StageDiagnostic[];
}

export interface LocalCinematicSubject {
  ref: CinematicSubjectRefIR;
  localRect: CameraRectIR;
  nodeId: string;
  visible: boolean;
  clippedLocalRect?: CameraRectIR;
  textSizePx?: number;
  sourceVersion: number;
  provenance: {
    ownerId: string;
    regionId: string;
  };
}

export interface StageProjectedCinematicSubject extends LocalCinematicSubject {
  worldRect: CameraRectIR;
  clippedWorldRect?: CameraRectIR;
  worldTextSizePx?: number;
}
