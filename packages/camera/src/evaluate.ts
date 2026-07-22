import type {
  CameraMissingSubjectPolicyIR,
  CameraOutputIR,
  CameraRectIR,
  CameraRigIR,
  CameraShotIR,
  CinematicSubjectRefIR,
} from "@tokovo/ir";
import { interpolateCameraPose, minimumJerk, solveComposer } from "./composer.js";
import type { CameraRegistries } from "./lenses.js";
import { requireEditorialCompositionProfile } from "@tokovo/visual-system";
import { applyCameraModifiers } from "./modifiers.js";
import { cameraPoseToViewMatrix } from "./matrix.js";
import {
  getFilterById,
  getLensById,
  getModifierById,
  getOutputById,
  getRigById,
} from "./program.js";
import { cinematicSubjectKey } from "./subjects.js";
import type {
  CameraDiagnostic,
  CameraEvaluationTrace,
  CameraTransitionTrace,
  CameraEvaluationInput,
  CameraRigEvaluation,
  EvaluatedCameraOutput,
  PreparedCameraProgram,
  ResolvedCinematicSubject,
  CameraPose2D,
  CameraProjectionPass,
} from "./types.js";

function resolveOutputEditorialInsets(output: CameraOutputIR) {
  return (
    output.editorialInsets ??
    requireEditorialCompositionProfile(output.compositionProfileId).editorialInsets
  );
}

function unionRects(rects: readonly CameraRectIR[]): CameraRectIR {
  const minimumX = Math.min(...rects.map((rect) => rect.x));
  const minimumY = Math.min(...rects.map((rect) => rect.y));
  const maximumX = Math.max(...rects.map((rect) => rect.x + rect.width));
  const maximumY = Math.max(...rects.map((rect) => rect.y + rect.height));
  return {
    x: minimumX,
    y: minimumY,
    width: maximumX - minimumX,
    height: maximumY - minimumY,
  };
}

type SubjectIndex = ReadonlyMap<string, ResolvedCinematicSubject>;

function resolveSubjects(
  ref: CinematicSubjectRefIR,
  available: SubjectIndex,
): readonly ResolvedCinematicSubject[] | undefined {
  if (ref.kind === "group") {
    const memberGroups = ref.members.map((member) => resolveSubjects(member, available));
    if (memberGroups.some((members) => members === undefined)) return undefined;
    return memberGroups.flatMap((members) => members ?? []);
  }
  const key = cinematicSubjectKey(ref);
  const resolved = available.get(key);
  return resolved?.visible ? [resolved] : undefined;
}

function resolveWithPolicy(input: {
  ref: CinematicSubjectRefIR;
  policy: CameraMissingSubjectPolicyIR;
  available: SubjectIndex;
}): readonly ResolvedCinematicSubject[] | undefined {
  const direct = resolveSubjects(input.ref, input.available);
  if (direct) return direct;
  if (input.policy.type === "use-explicit") {
    return resolveSubjects(input.policy.fallback, input.available);
  }
  return undefined;
}

function selectShots(
  program: PreparedCameraProgram,
  outputId: string,
  frame: number,
): readonly CameraShotIR[] {
  const segments = program.shotSegmentsByOutput[outputId] ?? [];
  let minimum = 0;
  let maximum = segments.length - 1;
  while (minimum <= maximum) {
    const middle = (minimum + maximum) >>> 1;
    const segment = segments[middle];
    if (frame < segment.startFrame) {
      maximum = middle - 1;
      continue;
    }
    if (frame >= segment.endFrame) {
      minimum = middle + 1;
      continue;
    }
    return segment.shotIndexes.map((index) => program.plan.shots[index]);
  }
  return [];
}

type CameraRigResolution =
  | { status: "resolved"; evaluation: CameraRigEvaluation }
  | { status: "subject-missing" }
  | { status: "framing-guard-missing" };

function evaluateRig(
  rig: CameraRigIR,
  policy: CameraMissingSubjectPolicyIR,
  available: SubjectIndex,
): CameraRigResolution {
  const subjects = resolveWithPolicy({ ref: rig.subject, policy, available });
  if (!subjects) return { status: "subject-missing" };
  const framingGuardSubjects = rig.framingGuard
    ? resolveSubjects(rig.framingGuard.subject, available)
    : [];
  if (rig.framingGuard && !framingGuardSubjects) {
    return { status: "framing-guard-missing" };
  }
  return {
    status: "resolved",
    evaluation: {
      rig,
      subjects,
      framingGuardSubjects: framingGuardSubjects ?? [],
    },
  };
}

interface EvaluatedRigFrame extends CameraRigEvaluation {
  pose: CameraPose2D;
  projectionPasses: readonly CameraProjectionPass[];
  trajectoryTrace: CameraEvaluationTrace["bakedTrajectory"];
}

function applyBakedTrajectory(
  pose: CameraPose2D,
  rig: CameraRigIR,
  frame: number,
): { pose: CameraPose2D; trace: CameraEvaluationTrace["bakedTrajectory"] } {
  const trajectory = rig.bakedTrajectory;
  if (!trajectory) return { pose, trace: null };
  const keyframes = trajectory.keyframes;
  let rightIndex = keyframes.findIndex((keyframe) => keyframe.frame >= frame);
  if (rightIndex < 0) rightIndex = keyframes.length - 1;
  const leftIndex = Math.max(0, rightIndex - (keyframes[rightIndex]?.frame === frame ? 0 : 1));
  const left = keyframes[leftIndex];
  const right = keyframes[Math.max(leftIndex, rightIndex)];
  const rawProgress =
    right.frame === left.frame
      ? 1
      : Math.max(0, Math.min(1, (frame - left.frame) / (right.frame - left.frame)));
  const progress =
    trajectory.interpolation === "minimum-jerk" ? minimumJerk(rawProgress) : rawProgress;
  const mix = (from: number, to: number) => from + (to - from) * progress;
  const scaleMultiplier = Math.exp(
    mix(Math.log(left.scaleMultiplier), Math.log(right.scaleMultiplier)),
  );
  return {
    pose: {
      ...pose,
      centerX: pose.centerX + mix(left.offsetX, right.offsetX),
      centerY: pose.centerY + mix(left.offsetY, right.offsetY),
      scale: pose.scale * scaleMultiplier,
      rotationDeg: pose.rotationDeg + mix(left.rotationOffsetDeg, right.rotationOffsetDeg),
    },
    trace: {
      interpolation: trajectory.interpolation,
      fromFrame: left.frame,
      toFrame: right.frame,
      progress,
    },
  };
}

function evaluateRigFrame(input: {
  program: PreparedCameraProgram;
  output: CameraOutputIR;
  frame: number;
  evaluation: CameraRigEvaluation;
  registries: CameraRegistries;
}): EvaluatedRigFrame {
  const subjectBounds = unionRects(
    input.evaluation.subjects.map((subject) => subject.clippedWorldRect ?? subject.worldRect),
  );
  const framingGuardBounds = input.evaluation.framingGuardSubjects.length
    ? unionRects(input.evaluation.framingGuardSubjects.map((subject) => subject.worldRect))
    : undefined;
  const basePose = solveComposer({
    subjectBounds,
    framingGuardBounds,
    framingGuardPaddingPx: input.evaluation.rig.framingGuard?.paddingPx,
    framingGuardScreenPosition: input.evaluation.rig.framingGuard?.screenPosition,
    viewport: input.output.viewport,
    compositionProfileId: input.output.compositionProfileId,
    editorialInsets: input.output.editorialInsets,
    composer: input.evaluation.rig.composer,
    rotationDeg: input.evaluation.rig.rotationDeg,
    opacity: input.evaluation.rig.opacity,
  });
  const trajectory = applyBakedTrajectory(basePose, input.evaluation.rig, input.frame);
  const lens = input.evaluation.rig.lensId
    ? getLensById(input.program, input.evaluation.rig.lensId)
    : undefined;
  if (input.evaluation.rig.lensId && !lens) {
    throwPreparedDefinitionMissing({
      program: input.program,
      outputId: input.output.id,
      frame: input.frame,
      rigId: input.evaluation.rig.id,
      kind: "lens",
      id: input.evaluation.rig.lensId,
    });
  }
  const lensModel = lens ? input.registries.lenses.get(lens.modelId, lens.modelVersion) : undefined;
  if (lens && !lensModel) {
    throwPreparedModelMissing({
      program: input.program,
      outputId: input.output.id,
      frame: input.frame,
      rigId: input.evaluation.rig.id,
      kind: "lens",
      id: `${lens.modelId}@${lens.modelVersion}`,
    });
  }
  const projectionPasses =
    lensModel && lens
      ? lensModel.evaluate({
          frame: input.frame,
          fps: input.program.plan.fps,
          parameters: lens.parameters,
        })
      : [];
  const modifiers = (input.evaluation.rig.modifierIds ?? []).map((modifierId) => {
    const modifier = getModifierById(input.program, modifierId);
    if (!modifier) {
      throwPreparedDefinitionMissing({
        program: input.program,
        outputId: input.output.id,
        frame: input.frame,
        rigId: input.evaluation.rig.id,
        kind: "modifier",
        id: modifierId,
      });
    }
    const model = input.registries.modifiers.get(modifier.modelId, modifier.modelVersion);
    if (!model) {
      throwPreparedModelMissing({
        program: input.program,
        outputId: input.output.id,
        frame: input.frame,
        rigId: input.evaluation.rig.id,
        kind: "modifier",
        id: `${modifier.modelId}@${modifier.modelVersion}`,
      });
    }
    return { model, parameters: modifier.parameters };
  });
  const modified = applyCameraModifiers({
    frame: input.frame,
    fps: input.program.plan.fps,
    pose: trajectory.pose,
    projectionPasses,
    modifiers,
  });
  const filterPasses = (input.evaluation.rig.filterIds ?? []).flatMap((filterId) => {
    const filter = getFilterById(input.program, filterId);
    if (!filter) {
      throwPreparedDefinitionMissing({
        program: input.program,
        outputId: input.output.id,
        frame: input.frame,
        rigId: input.evaluation.rig.id,
        kind: "filter",
        id: filterId,
      });
    }
    const model = input.registries.filters.get(filter.modelId, filter.modelVersion);
    if (!model) {
      throwPreparedModelMissing({
        program: input.program,
        outputId: input.output.id,
        frame: input.frame,
        rigId: input.evaluation.rig.id,
        kind: "filter",
        id: `${filter.modelId}@${filter.modelVersion}`,
      });
    }
    return model.evaluate({
      frame: input.frame,
      fps: input.program.plan.fps,
      parameters: filter.parameters,
    });
  });
  return {
    ...input.evaluation,
    pose: modified.pose,
    projectionPasses: [...modified.projectionPasses, ...filterPasses],
    trajectoryTrace: trajectory.trace,
  };
}

function scaleProjectionPass(
  pass: CameraProjectionPass,
  amount: number,
): CameraProjectionPass | undefined {
  const mix = Math.max(0, Math.min(1, amount));
  if (mix <= 1e-6) return undefined;
  switch (pass.kind) {
    case "radial-warp":
    case "fisheye-warp":
      return {
        ...pass,
        strength: pass.strength * mix,
        cropCompensation: 1 + (pass.cropCompensation - 1) * mix,
      };
    case "projective-warp":
      return {
        ...pass,
        tiltXDeg: pass.tiltXDeg * mix,
        tiltYDeg: pass.tiltYDeg * mix,
        cropCompensation: 1 + (pass.cropCompensation - 1) * mix,
      };
    case "anamorphic-edge-stretch":
      return {
        ...pass,
        strength: pass.strength * mix,
        cropCompensation: 1 + (pass.cropCompensation - 1) * mix,
      };
    case "directional-smear":
      return { ...pass, spreadPx: pass.spreadPx * mix };
    case "color-grade":
      return {
        ...pass,
        brightness: pass.brightness * mix,
        contrast: 1 + (pass.contrast - 1) * mix,
        saturation: 1 + (pass.saturation - 1) * mix,
        gamma: 1 + (pass.gamma - 1) * mix,
        temperature: pass.temperature * mix,
        tint: pass.tint * mix,
      };
  }
}

function blendProjectionPasses(input: {
  from: readonly CameraProjectionPass[];
  to: readonly CameraProjectionPass[];
  progress: number;
  whipDirection?: "left" | "right" | "up" | "down" | readonly [number, number];
}): readonly CameraProjectionPass[] {
  const passes = [
    ...input.from.map((pass) => scaleProjectionPass(pass, 1 - input.progress)),
    ...input.to.map((pass) => scaleProjectionPass(pass, input.progress)),
  ].filter((pass): pass is CameraProjectionPass => pass !== undefined);
  if (input.whipDirection && input.progress > 0 && input.progress < 1) {
    const direction: readonly [number, number] =
      typeof input.whipDirection !== "string"
        ? input.whipDirection
        : input.whipDirection === "left"
          ? ([-1, 0] as const)
          : input.whipDirection === "right"
            ? ([1, 0] as const)
            : input.whipDirection === "up"
              ? ([0, -1] as const)
              : ([0, 1] as const);
    passes.push({
      kind: "directional-smear",
      direction,
      spreadPx: Math.sin(input.progress * Math.PI) * 64,
      samples: 8,
      decay: 0.62,
    });
  }
  return passes;
}

function resolvePreviousRig(input: {
  program: PreparedCameraProgram;
  output: CameraOutputIR;
  shot: CameraShotIR;
  available: SubjectIndex;
}): CameraRigResolution {
  const previousFrame = input.shot.startFrame - 1;
  if (previousFrame >= 0) {
    for (const previousShot of selectShots(input.program, input.output.id, previousFrame)) {
      const rig = getRigById(input.program, previousShot.rigId);
      if (!rig) continue;
      const resolution = evaluateRig(rig, previousShot.missingSubjectPolicy, input.available);
      if (resolution.status !== "subject-missing") return resolution;
    }
  }
  const defaultRig = getRigById(input.program, input.output.defaultRigId);
  return defaultRig
    ? evaluateRig(defaultRig, { type: "error" }, input.available)
    : { status: "subject-missing" };
}

function transitionForShot(
  shot: CameraShotIR,
  rig: CameraRigIR,
): {
  durationFrames: number;
  curve: "linear" | "smoothstep" | "minimum-jerk" | "critically-damped";
  whipDirection?: "left" | "right" | "up" | "down" | readonly [number, number];
} {
  if (shot.blendIn) {
    return {
      durationFrames: shot.blendIn.durationFrames,
      curve: shot.blendIn.curve,
      whipDirection: rig.motion?.type === "whip" ? rig.motion.direction : undefined,
    };
  }
  const motion = rig.motion;
  if (!motion || motion.type === "cut") return { durationFrames: 0, curve: "linear" };
  if (motion.type === "minimum-jerk") {
    return { durationFrames: motion.durationFrames, curve: "minimum-jerk" };
  }
  if (motion.type === "critically-damped") {
    return {
      durationFrames: motion.responseFrames,
      curve: "critically-damped",
    };
  }
  return {
    durationFrames: motion.durationFrames,
    curve: "minimum-jerk",
    whipDirection: motion.direction,
  };
}

function transitionProgress(input: {
  frame: number;
  startFrame: number;
  durationFrames: number;
  curve: "linear" | "smoothstep" | "minimum-jerk" | "critically-damped";
}): number {
  if (input.durationFrames <= 0) return 1;
  const raw = Math.max(0, Math.min(1, (input.frame - input.startFrame) / input.durationFrames));
  if (input.curve === "minimum-jerk") return minimumJerk(raw);
  if (input.curve === "smoothstep") return raw * raw * (3 - 2 * raw);
  if (input.curve === "critically-damped") {
    const response = 1 - (1 + raw * 6) * Math.exp(-raw * 6);
    const terminal = 1 - 7 * Math.exp(-6);
    return response / terminal;
  }
  return raw;
}

function diagnostic(input: {
  program: PreparedCameraProgram;
  outputId: string;
  frame: number;
  code: string;
  message: string;
  shotId?: string;
  rigId?: string;
}): CameraDiagnostic {
  return {
    code: input.code,
    severity: "error",
    message: input.message,
    planId: input.program.plan.id,
    outputId: input.outputId,
    frame: input.frame,
    shotId: input.shotId,
    rigId: input.rigId,
  };
}

function throwPreparedDefinitionMissing(input: {
  program: PreparedCameraProgram;
  outputId: string;
  frame: number;
  rigId: string;
  kind: "lens" | "modifier" | "filter";
  id: string;
}): never {
  throw new CameraEvaluationError([
    diagnostic({
      ...input,
      code: "CAM_PREPARED_DEFINITION_MISSING",
      message: `Prepared camera ${input.kind} "${input.id}" is missing.`,
    }),
  ]);
}

function throwPreparedModelMissing(input: {
  program: PreparedCameraProgram;
  outputId: string;
  frame: number;
  rigId: string;
  kind: "lens" | "modifier" | "filter";
  id: string;
}): never {
  throw new CameraEvaluationError([
    diagnostic({
      ...input,
      code: "CAM_PREPARED_MODEL_MISSING",
      message: `Prepared camera ${input.kind} model "${input.id}" is not registered.`,
    }),
  ]);
}

export class CameraEvaluationError extends Error {
  readonly diagnostics: readonly CameraDiagnostic[];

  constructor(diagnostics: readonly CameraDiagnostic[]) {
    super(diagnostics.map((entry) => entry.message).join("\n"));
    this.name = "CameraEvaluationError";
    this.diagnostics = diagnostics;
  }
}

export function evaluateCameraOutput(
  input: CameraEvaluationInput,
  registries: CameraRegistries,
): EvaluatedCameraOutput {
  const { program, outputId, frame, subjectFrame } = input;
  if (!Number.isInteger(frame) || frame < 0 || frame >= program.plan.durationInFrames) {
    throw new CameraEvaluationError([
      diagnostic({
        program,
        outputId,
        frame,
        code: "CAM_FRAME_OUT_OF_RANGE",
        message: `Camera frame ${frame} is outside [0, ${program.plan.durationInFrames}).`,
      }),
    ]);
  }
  const output = getOutputById(program, outputId);
  if (!output) {
    throw new CameraEvaluationError([
      diagnostic({
        program,
        outputId,
        frame,
        code: "CAM_OUTPUT_MISSING",
        message: `Camera output "${outputId}" does not exist.`,
      }),
    ]);
  }
  if (subjectFrame.frame !== frame) {
    throw new CameraEvaluationError([
      diagnostic({
        program,
        outputId,
        frame,
        code: "CAM_SUBJECT_FRAME_MISMATCH",
        message: `Subject frame ${subjectFrame.frame} does not match camera frame ${frame}.`,
      }),
    ]);
  }
  const subjectIndex = new Map<string, ResolvedCinematicSubject>();
  for (const subject of subjectFrame.subjects) {
    const key = cinematicSubjectKey(subject.ref);
    if (subjectIndex.has(key)) {
      throw new CameraEvaluationError([
        diagnostic({
          program,
          outputId,
          frame,
          code: "CAM_SUBJECT_DUPLICATE",
          message: `Subject frame contains duplicate exact subject "${key}".`,
        }),
      ]);
    }
    subjectIndex.set(key, subject);
  }

  let activeShot: CameraShotIR | undefined;
  let selected: CameraRigEvaluation | undefined;
  for (const shot of selectShots(program, outputId, frame)) {
    const rig = getRigById(program, shot.rigId);
    if (!rig) continue;
    const resolution = evaluateRig(rig, shot.missingSubjectPolicy, subjectIndex);
    if (resolution.status === "resolved") {
      activeShot = shot;
      selected = resolution.evaluation;
      break;
    }
    if (resolution.status === "framing-guard-missing") {
      throw new CameraEvaluationError([
        diagnostic({
          program,
          outputId,
          frame,
          code: "CAM_FRAMING_GUARD_SUBJECT_MISSING",
          message: `Shot "${shot.id}" could not resolve rig "${rig.id}" framing guard.`,
          shotId: shot.id,
          rigId: rig.id,
        }),
      ]);
    }
    if (shot.missingSubjectPolicy.type === "error") {
      throw new CameraEvaluationError([
        diagnostic({
          program,
          outputId,
          frame,
          code: "CAM_SUBJECT_MISSING",
          message: `Shot "${shot.id}" could not resolve its subject.`,
          shotId: shot.id,
          rigId: rig.id,
        }),
      ]);
    }
  }

  if (!selected) {
    const defaultRig = getRigById(program, output.defaultRigId);
    const defaultPolicy: CameraMissingSubjectPolicyIR = { type: "error" };
    const resolution = defaultRig
      ? evaluateRig(defaultRig, defaultPolicy, subjectIndex)
      : { status: "subject-missing" as const };
    if (resolution.status === "framing-guard-missing") {
      throw new CameraEvaluationError([
        diagnostic({
          program,
          outputId,
          frame,
          code: "CAM_DEFAULT_FRAMING_GUARD_SUBJECT_MISSING",
          message: `Output "${outputId}" could not resolve default rig "${output.defaultRigId}" framing guard.`,
          rigId: output.defaultRigId,
        }),
      ]);
    }
    selected = resolution.status === "resolved" ? resolution.evaluation : undefined;
    if (!selected) {
      throw new CameraEvaluationError([
        diagnostic({
          program,
          outputId,
          frame,
          code: "CAM_DEFAULT_SUBJECT_MISSING",
          message: `Output "${outputId}" could not resolve its default rig subject.`,
          rigId: output.defaultRigId,
        }),
      ]);
    }
  }

  const target = evaluateRigFrame({
    program,
    output,
    frame,
    evaluation: selected,
    registries,
  });
  let pose = target.pose;
  let projectionPasses = target.projectionPasses;
  let transitionTrace: CameraTransitionTrace | null = null;
  if (activeShot) {
    const transition = transitionForShot(activeShot, selected.rig);
    const progress = transitionProgress({
      frame,
      startFrame: activeShot.startFrame,
      durationFrames: transition.durationFrames,
      curve: transition.curve,
    });
    let sourceRigId: string | null = null;
    if (progress < 1 || transition.whipDirection) {
      const previous = resolvePreviousRig({
        program,
        output,
        shot: activeShot,
        available: subjectIndex,
      });
      if (previous.status === "framing-guard-missing") {
        throw new CameraEvaluationError([
          diagnostic({
            program,
            outputId,
            frame,
            code: "CAM_TRANSITION_SOURCE_GUARD_SUBJECT_MISSING",
            message: `Shot "${activeShot.id}" could not resolve its transition source framing guard.`,
            shotId: activeShot.id,
            rigId: selected.rig.id,
          }),
        ]);
      }
      if (previous.status === "resolved") {
        sourceRigId = previous.evaluation.rig.id;
        const source = evaluateRigFrame({
          program,
          output,
          frame,
          evaluation: previous.evaluation,
          registries,
        });
        pose = interpolateCameraPose(source.pose, target.pose, progress, "linear");
        projectionPasses = blendProjectionPasses({
          from: source.projectionPasses,
          to: target.projectionPasses,
          progress,
          whipDirection: transition.whipDirection,
        });
      }
    }
    transitionTrace = {
      sourceRigId,
      targetRigId: selected.rig.id,
      durationFrames: transition.durationFrames,
      curve: transition.curve,
      progress,
      whipActive: transition.whipDirection !== undefined && progress > 0 && progress < 1,
      movementIntent: selected.rig.motion?.intent ?? null,
    };
  }

  return {
    frame,
    outputId,
    sourceStageNodeId: output.sourceStageNodeId,
    zIndex: output.zIndex,
    clipRadiusPx: output.clipRadiusPx ?? 0,
    shadow: output.shadow,
    activeShotId: activeShot?.id,
    activeRigId: selected.rig.id,
    pose,
    viewMatrix: cameraPoseToViewMatrix(pose),
    projectionPasses,
    resolvedSubjects: selected.subjects,
    diagnostics: [],
    trace: {
      planId: program.plan.id,
      programSignature: program.signature,
      mode: input.mode,
      selection: activeShot ? "shot" : "default-rig",
      shotId: activeShot?.id ?? null,
      rigId: selected.rig.id,
      desiredPose: target.pose,
      finalPose: pose,
      transition: transitionTrace,
      subjects: selected.subjects.map((subject) => ({
        key: cinematicSubjectKey(subject.ref),
        nodeId: subject.nodeId,
        worldRect: subject.worldRect,
        sourceVersion: subject.sourceVersion,
        ownerId: subject.provenance.ownerId,
        regionId: subject.provenance.regionId,
      })),
      framingGuard: selected.rig.framingGuard
        ? {
            paddingPx: selected.rig.framingGuard.paddingPx ?? 0,
            screenPosition: selected.rig.framingGuard.screenPosition ?? null,
            subjects: selected.framingGuardSubjects.map((subject) => ({
              key: cinematicSubjectKey(subject.ref),
              nodeId: subject.nodeId,
              worldRect: subject.worldRect,
              sourceVersion: subject.sourceVersion,
              ownerId: subject.provenance.ownerId,
              regionId: subject.provenance.regionId,
            })),
          }
        : null,
      constraints: {
        compositionProfileId: output.compositionProfileId,
        editorialInsets: resolveOutputEditorialInsets(output),
        effectiveViewport: {
          x: output.viewport.x + resolveOutputEditorialInsets(output).left,
          y: output.viewport.y + resolveOutputEditorialInsets(output).top,
          width:
            output.viewport.width -
            resolveOutputEditorialInsets(output).left -
            resolveOutputEditorialInsets(output).right,
          height:
            output.viewport.height -
            resolveOutputEditorialInsets(output).top -
            resolveOutputEditorialInsets(output).bottom,
        },
      },
      tracking: {
        mode: selected.rig.tracking?.mode ?? "direct",
        subjectKeys: selected.subjects.map((subject) => cinematicSubjectKey(subject.ref)),
      },
      bakedTrajectory: target.trajectoryTrace,
      projectionPassKinds: projectionPasses.map((pass) => pass.kind),
    },
  };
}
