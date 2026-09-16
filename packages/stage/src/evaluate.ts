import type { StageMatrix2DIR, StageTransformKeyframeIR } from "@tokovo/ir";
import { multiplyStageMatrices, transformStageRect } from "./matrix.js";
import type {
  EvaluatedStageFrame,
  EvaluatedStageNode,
  LocalCinematicSubject,
  PreparedStageProgram,
  StageProjectedCinematicSubject,
} from "./types.js";

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function minimumJerk(progress: number): number {
  const value = clamp(progress, 0, 1);
  return value * value * value * (10 + value * (-15 + value * 6));
}

function interpolateMatrix(
  from: StageMatrix2DIR,
  to: StageMatrix2DIR,
  progress: number,
): StageMatrix2DIR {
  const interpolate = (left: number, right: number): number => left + (right - left) * progress;
  return {
    a: interpolate(from.a, to.a),
    b: interpolate(from.b, to.b),
    c: interpolate(from.c, to.c),
    d: interpolate(from.d, to.d),
    tx: interpolate(from.tx, to.tx),
    ty: interpolate(from.ty, to.ty),
  };
}

function intersectRects(
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number },
) {
  const x = Math.max(left.x, right.x);
  const y = Math.max(left.y, right.y);
  const rightEdge = Math.min(left.x + left.width, right.x + right.width);
  const bottomEdge = Math.min(left.y + left.height, right.y + right.height);
  if (rightEdge <= x || bottomEdge <= y) return undefined;
  return { x, y, width: rightEdge - x, height: bottomEdge - y };
}

function evaluateLocalTransform(input: {
  initial: StageMatrix2DIR;
  frame: number;
  keyframes: readonly StageTransformKeyframeIR[];
  keyframeIndexes: readonly number[];
}): StageMatrix2DIR {
  let minimum = 0;
  let maximum = input.keyframeIndexes.length - 1;
  let localTargetIndex = input.keyframeIndexes.length;
  while (minimum <= maximum) {
    const middle = (minimum + maximum) >>> 1;
    const keyframe = input.keyframes[input.keyframeIndexes[middle]];
    if (keyframe.frame >= input.frame) {
      localTargetIndex = middle;
      maximum = middle - 1;
    } else {
      minimum = middle + 1;
    }
  }
  if (localTargetIndex >= input.keyframeIndexes.length) {
    const lastIndex = input.keyframeIndexes.at(-1);
    return lastIndex === undefined ? input.initial : input.keyframes[lastIndex].transform;
  }
  const target = input.keyframes[input.keyframeIndexes[localTargetIndex]];
  if (target.frame === input.frame) return target.transform;
  const previousIndex = input.keyframeIndexes[localTargetIndex - 1];
  const previous = previousIndex === undefined ? undefined : input.keyframes[previousIndex];
  const fromTransform = previous?.transform ?? input.initial;
  const fromFrame = previous?.frame ?? 0;
  if (target.interpolation === "hold" || target.frame <= fromFrame) return fromTransform;
  const rawProgress = (input.frame - fromFrame) / (target.frame - fromFrame);
  const progress =
    target.interpolation === "minimum-jerk" ? minimumJerk(rawProgress) : clamp(rawProgress, 0, 1);
  return interpolateMatrix(fromTransform, target.transform, progress);
}

export function evaluateStageFrame(
  prepared: PreparedStageProgram,
  frame: number,
): EvaluatedStageFrame {
  if (!Number.isInteger(frame) || frame < 0) {
    throw new Error("Stage frame must be a non-negative integer.");
  }
  const evaluatedById = new Map<string, EvaluatedStageNode>();
  for (const nodeId of prepared.nodeOrder) {
    const node = prepared.nodesById[nodeId];
    const localTransform = evaluateLocalTransform({
      initial: node.initialTransform,
      frame,
      keyframes: prepared.program.transformKeyframes,
      keyframeIndexes: prepared.keyframeIndexesByNode[nodeId] ?? [],
    });
    const parent = node.parentId ? evaluatedById.get(node.parentId) : undefined;
    const worldTransform = parent
      ? multiplyStageMatrices(parent.worldTransform, localTransform)
      : localTransform;
    evaluatedById.set(nodeId, {
      id: node.id,
      source: node.source,
      localTransform,
      worldTransform,
      localBounds: node.localBounds,
      worldBounds: transformStageRect(worldTransform, node.localBounds),
      zIndex: node.zIndex,
      clip: node.clip,
    });
  }
  return {
    frame,
    rootNodeId: prepared.program.rootNodeId,
    nodes: prepared.paintOrder.map((nodeId) => evaluatedById.get(nodeId)!),
    diagnostics: [],
  };
}

export function projectCinematicSubjects(
  stage: EvaluatedStageFrame,
  subjects: readonly LocalCinematicSubject[],
): readonly StageProjectedCinematicSubject[] {
  const nodes = new Map(stage.nodes.map((node) => [node.id, node] as const));
  return subjects.map((subject) => {
    const node = nodes.get(subject.nodeId);
    if (!node) {
      throw new Error(
        `Cinematic subject references missing evaluated stage node "${subject.nodeId}".`,
      );
    }
    const hasClip = subject.clippedLocalRect !== undefined || node.clip !== undefined;
    const subjectClip = subject.clippedLocalRect ?? subject.localRect;
    const clippedLocalRect = node.clip
      ? intersectRects(subjectClip, node.clip)
      : subject.clippedLocalRect;
    // Smallest singular value: a conservative em-size under rotation, shear and nonuniform scale.
    const { a, b, c, d } = node.worldTransform;
    const sum = a * a + b * b + c * c + d * d;
    const textScale = Math.sqrt(
      Math.max(0, (sum - Math.sqrt(Math.max(0, sum * sum - 4 * (a * d - b * c) ** 2))) / 2),
    );
    return {
      ...subject,
      visible: subject.visible && (!hasClip || clippedLocalRect !== undefined),
      worldRect: transformStageRect(node.worldTransform, subject.localRect),
      ...(subject.textSizePx === undefined
        ? {}
        : { worldTextSizePx: subject.textSizePx * textScale }),
      clippedWorldRect: clippedLocalRect
        ? transformStageRect(node.worldTransform, clippedLocalRect)
        : undefined,
    };
  });
}
