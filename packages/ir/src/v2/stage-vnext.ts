import type { CameraRectIR } from "./camera-vnext.js";

export interface StageMatrix2DIR {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}

export type StageNodeSourceIR =
  | { kind: "device"; deviceId: string }
  | { kind: "background" }
  | { kind: "overlay"; overlayId: string }
  | { kind: "group" };

export interface StageNodeIR {
  id: string;
  parentId?: string;
  source: StageNodeSourceIR;
  localBounds: CameraRectIR;
  initialTransform: StageMatrix2DIR;
  zIndex: number;
  clip?: CameraRectIR;
}

export interface StageTransformKeyframeIR {
  frame: number;
  nodeId: string;
  transform: StageMatrix2DIR;
  interpolation: "hold" | "linear" | "minimum-jerk";
}

/**
 * Stage placement is a prepared program, never camera state.
 */
export interface StageProgramIR {
  version: 1;
  rootNodeId: string;
  nodes: readonly StageNodeIR[];
  transformKeyframes: readonly StageTransformKeyframeIR[];
}
