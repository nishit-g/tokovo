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
import { applyCameraModifiers } from "./modifiers.js";
import { cameraPoseToViewMatrix } from "./matrix.js";
import { getRigById } from "./program.js";
import type {
  CameraDiagnostic,
  CameraTransitionTrace,
  CameraEvaluationInput,
  CameraRigEvaluation,
  EvaluatedCameraOutput,
  PreparedCameraProgram,
  ResolvedCinematicSubject,
  CameraPose2D,
  CameraProjectionPass,
} from "./types.js";

function subjectKey(ref: CinematicSubjectRefIR): string {
  switch (ref.kind) {
    case "semantic":
      return `semantic:${ref.deviceId}:${ref.appId}:${ref.subjectId}`;
    case "entity":
      return `entity:${ref.deviceId}:${ref.appId}:${ref.entityType}:${ref.entityId}:${ref.region}`;
    case "device":
      return `device:${ref.deviceId}:${ref.subjectId}`;
    case "group":
      return `group:${ref.members.map(subjectKey).join("|")}`;
  }
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

function resolveSubjects(
  ref: CinematicSubjectRefIR,
  available: readonly ResolvedCinematicSubject[],
): readonly ResolvedCinematicSubject[] | undefined {
  if (ref.kind === "group") {
    const memberGroups = ref.members.map((member) => resolveSubjects(member, available));
    if (memberGroups.some((members) => members === undefined)) return undefined;
    return memberGroups.flatMap((members) => members ?? []);
  }
  const key = subjectKey(ref);
  const resolved = available.find((subject) => subjectKey(subject.ref) === key);
  return resolved?.visible ? [resolved] : undefined;
}

function resolveWithPolicy(input: {
  ref: CinematicSubjectRefIR;
  policy: CameraMissingSubjectPolicyIR;
  available: readonly ResolvedCinematicSubject[];
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
  return (program.shotsByOutput[outputId] ?? [])
    .filter((shot) => frame >= shot.startFrame && frame < shot.endFrame)
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        left.declarationOrder - right.declarationOrder ||
        left.id.localeCompare(right.id),
    );
}

function evaluateRig(
  rig: CameraRigIR,
  policy: CameraMissingSubjectPolicyIR,
  available: readonly ResolvedCinematicSubject[],
): CameraRigEvaluation | undefined {
  const subjects = resolveWithPolicy({ ref: rig.subject, policy, available });
  if (!subjects) return undefined;
  const framingGuardSubjects = rig.framingGuard
    ? resolveSubjects(rig.framingGuard.subject, available)
    : [];
  if (rig.framingGuard && !framingGuardSubjects) {
    throw new Error(`Camera rig "${rig.id}" could not resolve its framing guard subject.`);
  }
  return { rig, subjects, framingGuardSubjects: framingGuardSubjects ?? [] };
}

interface EvaluatedRigFrame extends CameraRigEvaluation {
  pose: CameraPose2D;
  projectionPasses: readonly CameraProjectionPass[];
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
    composer: input.evaluation.rig.composer,
    rotationDeg: input.evaluation.rig.rotationDeg,
    opacity: input.evaluation.rig.opacity,
  });
  const lens = input.evaluation.rig.lensId
    ? input.program.plan.lenses.find((candidate) => candidate.id === input.evaluation.rig.lensId)
    : undefined;
  const lensModel = lens ? input.registries.lenses.get(lens.modelId, lens.modelVersion) : undefined;
  const projectionPasses =
    lensModel && lens
      ? lensModel.evaluate({
          frame: input.frame,
          fps: input.program.plan.fps,
          parameters: lens.parameters,
        })
      : [];
  const modifiers = (input.evaluation.rig.modifierIds ?? []).map((modifierId) => {
    const modifier = input.program.plan.modifiers.find((candidate) => candidate.id === modifierId);
    if (!modifier) {
      throw new Error(`Prepared camera rig references missing modifier "${modifierId}".`);
    }
    const model = input.registries.modifiers.get(modifier.modelId, modifier.modelVersion);
    if (!model) {
      throw new Error(
        `Prepared camera modifier model "${modifier.modelId}@${modifier.modelVersion}" is missing.`,
      );
    }
    return { model, parameters: modifier.parameters };
  });
  const modified = applyCameraModifiers({
    frame: input.frame,
    fps: input.program.plan.fps,
    pose: basePose,
    projectionPasses,
    modifiers,
  });
  return {
    ...input.evaluation,
    pose: modified.pose,
    projectionPasses: modified.projectionPasses,
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
  available: readonly ResolvedCinematicSubject[];
}): CameraRigEvaluation | undefined {
  const previousFrame = input.shot.startFrame - 1;
  if (previousFrame >= 0) {
    for (const previousShot of selectShots(input.program, input.output.id, previousFrame)) {
      const rig = getRigById(input.program, previousShot.rigId);
      if (!rig) continue;
      const evaluated = evaluateRig(rig, previousShot.missingSubjectPolicy, input.available);
      if (evaluated) return evaluated;
    }
  }
  const defaultRig = getRigById(input.program, input.output.defaultRigId);
  return defaultRig ? evaluateRig(defaultRig, { type: "error" }, input.available) : undefined;
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
  const output = program.plan.outputs.find((candidate) => candidate.id === outputId);
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
  const seenSubjectKeys = new Set<string>();
  for (const subject of subjectFrame.subjects) {
    const key = subjectKey(subject.ref);
    if (seenSubjectKeys.has(key)) {
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
    seenSubjectKeys.add(key);
  }

  let activeShot: CameraShotIR | undefined;
  let selected: CameraRigEvaluation | undefined;
  for (const shot of selectShots(program, outputId, frame)) {
    const rig = getRigById(program, shot.rigId);
    if (!rig) continue;
    const evaluated = evaluateRig(rig, shot.missingSubjectPolicy, subjectFrame.subjects);
    if (evaluated) {
      activeShot = shot;
      selected = evaluated;
      break;
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
    selected = defaultRig
      ? evaluateRig(defaultRig, defaultPolicy, subjectFrame.subjects)
      : undefined;
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
        available: subjectFrame.subjects,
      });
      if (previous) {
        sourceRigId = previous.rig.id;
        const source = evaluateRigFrame({
          program,
          output,
          frame,
          evaluation: previous,
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
      transition: transitionTrace,
      subjects: selected.subjects.map((subject) => ({
        key: subjectKey(subject.ref),
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
              key: subjectKey(subject.ref),
              nodeId: subject.nodeId,
              worldRect: subject.worldRect,
              sourceVersion: subject.sourceVersion,
              ownerId: subject.provenance.ownerId,
              regionId: subject.provenance.regionId,
            })),
          }
        : null,
      projectionPassKinds: projectionPasses.map((pass) => pass.kind),
    },
  };
}
