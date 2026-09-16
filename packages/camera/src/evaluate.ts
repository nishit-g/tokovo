import type {
  CameraMissingSubjectPolicyIR,
  CameraBakedTrajectoryIR,
  CameraOutputIR,
  CameraRectIR,
  CameraRigIR,
  CameraShotIR,
  CinematicSubjectRefIR,
} from "@tokovo/ir";
import {
  interpolateCameraPose,
  measureCameraMount,
  minimumJerk,
  solveComposer,
  stabilizeCameraPose,
} from "./composer.js";
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
  PreparedCameraTracking,
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
}):
  | {
      subjects: readonly ResolvedCinematicSubject[];
      source: "direct" | "explicit-fallback";
    }
  | undefined {
  const direct = resolveSubjects(input.ref, input.available);
  if (direct) return { subjects: direct, source: "direct" };
  if (input.policy.type === "use-explicit") {
    const fallback = resolveSubjects(input.policy.fallback, input.available);
    return fallback ? { subjects: fallback, source: "explicit-fallback" } : undefined;
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
  | { status: "framing-guard-missing" }
  | { status: "mount-missing" };

function evaluateRig(
  rig: CameraRigIR,
  policy: CameraMissingSubjectPolicyIR,
  available: SubjectIndex,
): CameraRigResolution {
  const subjectResolution = resolveWithPolicy({ ref: rig.subject, policy, available });
  if (!subjectResolution) return { status: "subject-missing" };
  const framingGuardSubjects = rig.framingGuard
    ? resolveSubjects(rig.framingGuard.subject, available)
    : [];
  if (rig.framingGuard && !framingGuardSubjects) {
    return { status: "framing-guard-missing" };
  }
  const mountSubjects =
    rig.travel.mode === "stabilized" ? resolveSubjects(rig.travel.mount.subject, available) : [];
  if (rig.travel.mode === "stabilized" && !mountSubjects) {
    return { status: "mount-missing" };
  }
  return {
    status: "resolved",
    evaluation: {
      rig,
      subjects: subjectResolution.subjects,
      framingGuardSubjects: framingGuardSubjects ?? [],
      mountSubjects: mountSubjects ?? [],
      subjectResolution: subjectResolution.source,
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
  trajectory: CameraBakedTrajectoryIR | undefined,
  frame: number,
): { pose: CameraPose2D; trace: CameraEvaluationTrace["bakedTrajectory"] } {
  if (!trajectory) return { pose, trace: null };
  const keyframes = trajectory.keyframes;
  let low = 0;
  let high = keyframes.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (keyframes[middle].frame < frame) low = middle + 1;
    else high = middle;
  }
  const rightIndex = Math.min(low, keyframes.length - 1);
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
  shot?: CameraShotIR;
  subjectFrameAt?: CameraEvaluationInput["subjectFrameAt"];
  tracking?: PreparedCameraTracking;
  registries: CameraRegistries;
}): EvaluatedRigFrame {
  let subjectBounds = unionRects(
    input.evaluation.subjects.map((subject) => subject.clippedWorldRect ?? subject.worldRect),
  );
  const framing = input.shot?.direction?.framing;
  if (input.shot && framing && framing !== "live") {
    subjectBounds = unionRects(input.evaluation.subjects.map((subject) => subject.worldRect));
    const referenceFrame = input.shot.startFrame;
    const history = input.subjectFrameAt?.(referenceFrame);
    if (!history || history.frame !== referenceFrame) {
      throw new CameraEvaluationError([
        diagnostic({
          program: input.program,
          outputId: input.output.id,
          frame: input.frame,
          shotId: input.shot.id,
          code: "CAM_SUBJECT_HISTORY_REQUIRED",
          message: "Stable framing requires exact shot-start geometry.",
        }),
      ]);
    }
    const index = new Map(
      history.subjects.map((subject) => [cinematicSubjectKey(subject.ref), subject]),
    );
    if (index.size !== history.subjects.length) {
      throw new CameraEvaluationError([
        diagnostic({
          program: input.program,
          outputId: input.output.id,
          frame: referenceFrame,
          code: "CAM_SUBJECT_DUPLICATE",
          message: "Historical geometry contains duplicate subjects.",
        }),
      ]);
    }
    const reference = resolveWithPolicy({
      ref: input.shot.direction?.framingSubject ?? input.evaluation.rig.subject,
      policy: input.shot.direction?.framingSubject
        ? { type: "error" }
        : input.shot.missingSubjectPolicy,
      available: index,
    });
    if (!reference) {
      throw new CameraEvaluationError([
        diagnostic({
          program: input.program,
          outputId: input.output.id,
          frame: referenceFrame,
          shotId: input.shot.id,
          code: "CAM_REFERENCE_SUBJECT_MISSING",
          message: "Stable framing subject is missing at shot start.",
        }),
      ]);
    }
    const bounds = unionRects(reference.subjects.map((subject) => subject.worldRect));
    if (input.shot.direction?.tracking) {
      const frameIndex = Math.min(
        input.frame - input.shot.startFrame,
        input.shot.endFrame - input.shot.startFrame - 1,
      );
      const center = input.tracking?.centersByShot[input.shot.id]?.[frameIndex];
      if (!center || input.tracking?.programSignature !== input.program.signature) {
        throw new CameraEvaluationError([
          diagnostic({
            program: input.program,
            outputId: input.output.id,
            frame: input.frame,
            shotId: input.shot.id,
            code: "CAM_TRACKING_NOT_PREPARED",
            message: "Damped tracking requires a matching prepared position track.",
          }),
        ]);
      }
      subjectBounds = {
        ...subjectBounds,
        x: center[0] - subjectBounds.width / 2,
        y: center[1] - subjectBounds.height / 2,
      };
    }
    subjectBounds =
      framing === "hold"
        ? bounds
        : {
            x: subjectBounds.x + subjectBounds.width / 2 - bounds.width / 2,
            y: subjectBounds.y + subjectBounds.height / 2 - bounds.height / 2,
            width: bounds.width,
            height: bounds.height,
          };
  }
  const framingGuardBounds = input.evaluation.framingGuardSubjects.length
    ? unionRects(input.evaluation.framingGuardSubjects.map((subject) => subject.worldRect))
    : undefined;
  const mountBounds = input.evaluation.mountSubjects.length
    ? unionRects(input.evaluation.mountSubjects.map((subject) => subject.worldRect))
    : undefined;
  const safeReading = input.shot?.direction?.tracking?.minimumReadingScale !== undefined;
  const readingScale =
    safeReading && input.shot ? input.tracking?.scaleByShot?.[input.shot.id] : undefined;
  if (safeReading && (!readingScale || !Number.isFinite(readingScale) || readingScale <= 0))
    throw new CameraEvaluationError([
      diagnostic({
        program: input.program,
        outputId: input.output.id,
        frame: input.frame,
        shotId: input.shot?.id,
        code: "CAM_TRACKING_NOT_PREPARED",
        message: "Safe reading requires its matching preflight scale.",
      }),
    ]);
  const basePose = solveComposer({
    subjectBounds,
    mountBounds,
    mountScreenPosition:
      input.evaluation.rig.travel.mode === "stabilized"
        ? input.evaluation.rig.travel.mount.screenPosition
        : undefined,
    mountMaxDriftPx:
      input.evaluation.rig.travel.mode === "stabilized"
        ? input.evaluation.rig.travel.mount.maxDriftPx
        : undefined,
    framingGuardBounds,
    framingGuardPaddingPx: input.evaluation.rig.framingGuard?.paddingPx,
    framingGuardScreenPosition: input.evaluation.rig.framingGuard?.screenPosition,
    viewport: input.output.viewport,
    compositionProfileId: input.output.compositionProfileId,
    editorialInsets: input.output.editorialInsets,
    composer: readingScale
      ? { ...input.evaluation.rig.composer, minScale: readingScale, maxScale: readingScale }
      : input.evaluation.rig.composer,
    rotationDeg: input.evaluation.rig.rotationDeg,
    opacity: input.evaluation.rig.opacity,
  });
  const movement = input.shot?.direction?.movement;
  const trajectory = applyBakedTrajectory(
    basePose,
    movement ?? input.evaluation.rig.bakedTrajectory,
    movement && input.shot
      ? Math.min(
          input.frame - input.shot.startFrame,
          input.shot.endFrame - input.shot.startFrame - 1,
        )
      : input.frame,
  );
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
  fromPose: CameraPose2D;
  toPose: CameraPose2D;
  rawProgress: number;
  durationFrames: number;
  whipDirection?: "left" | "right" | "up" | "down" | "travel" | readonly [number, number];
}): readonly CameraProjectionPass[] {
  const passes = [
    ...input.from.map((pass) => scaleProjectionPass(pass, 1 - input.progress)),
    ...input.to.map((pass) => scaleProjectionPass(pass, input.progress)),
  ].filter((pass): pass is CameraProjectionPass => pass !== undefined);
  if (input.whipDirection && input.progress > 0 && input.progress < 1) {
    if (input.whipDirection === "travel") {
      const scale = Math.exp(
        Math.log(input.fromPose.scale) * (1 - input.progress) +
          Math.log(input.toPose.scale) * input.progress,
      );
      const dx = (input.fromPose.centerX - input.toPose.centerX) * scale;
      const dy = (input.fromPose.centerY - input.toPose.centerY) * scale;
      const distance = Math.hypot(dx, dy);
      if (distance < 1e-6) return passes;
      const angle =
        ((input.fromPose.rotationDeg +
          (((((input.toPose.rotationDeg - input.fromPose.rotationDeg + 180) % 360) + 360) % 360) -
            180) *
            input.progress) *
          Math.PI) /
        180;
      const t = input.rawProgress;
      passes.push({
        kind: "directional-smear",
        direction: [
          (dx * Math.cos(angle) - dy * Math.sin(angle)) / distance,
          (dx * Math.sin(angle) + dy * Math.cos(angle)) / distance,
        ],
        spreadPx: Math.min(
          64,
          ((distance * 30 * t * t * (1 - t) ** 2) / input.durationFrames) * 0.5,
        ),
        samples: 8,
        decay: 0.62,
      });
      return passes;
    }
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
}): CameraRigResolution & { shot?: CameraShotIR } {
  const previousFrame = input.shot.startFrame - 1;
  if (previousFrame >= 0) {
    for (const previousShot of selectShots(input.program, input.output.id, previousFrame)) {
      const rig = getRigById(input.program, previousShot.rigId);
      if (!rig) continue;
      const resolution = evaluateRig(rig, previousShot.missingSubjectPolicy, input.available);
      if (resolution.status !== "subject-missing") return { ...resolution, shot: previousShot };
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
  whipDirection?: "left" | "right" | "up" | "down" | "travel" | readonly [number, number];
} {
  if (!shot.direction && shot.blendIn) {
    return {
      durationFrames: shot.blendIn.durationFrames,
      curve: shot.blendIn.curve,
      whipDirection: rig.motion?.type === "whip" ? rig.motion.direction : undefined,
    };
  }
  const motion = shot.direction?.entrance ?? rig.motion;
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

/** Prepare only opted-in tracking shots. Sampling order is fixed regardless of render order. */
export function prepareCameraTracking(
  program: PreparedCameraProgram,
  subjectFrameAt: NonNullable<CameraEvaluationInput["subjectFrameAt"]>,
): PreparedCameraTracking {
  const centersByShot: Record<string, readonly (readonly [number, number])[]> = Object.create(null);
  const scaleByShot: Record<string, number> = Object.create(null);
  for (const shot of program.plan.shots) {
    const settings = shot.direction?.tracking;
    if (!settings) continue;
    const rig = getRigById(program, shot.rigId);
    if (!rig) throw new Error(`CAM_TRACKING_RIG_MISSING: ${shot.rigId}`);
    const alpha = -Math.expm1(-Math.LN2 / (program.plan.fps * settings.halfLifeSeconds));
    const centers: (readonly [number, number])[] = [];
    const output = getOutputById(program, shot.outputId)!;
    // Sample once. Preflight the complete shot so a later attachment cannot cause zoom pumping.
    const histories =
      settings.minimumReadingScale === undefined
        ? undefined
        : Array.from({ length: shot.endFrame - shot.startFrame }, (_, index) =>
            subjectFrameAt(shot.startFrame + index),
          );
    const insets = resolveOutputEditorialInsets(output);
    const requested = settings.readingRegion;
    const region =
      requested && settings.minimumReadingScale !== undefined
        ? {
            x: Math.max(requested.x, insets.left / output.viewport.width),
            y: Math.max(requested.y, insets.top / output.viewport.height),
            width:
              Math.min(requested.x + requested.width, 1 - insets.right / output.viewport.width) -
              Math.max(requested.x, insets.left / output.viewport.width),
            height:
              Math.min(requested.y + requested.height, 1 - insets.bottom / output.viewport.height) -
              Math.max(requested.y, insets.top / output.viewport.height),
          }
        : requested;
    if (settings.minimumReadingScale !== undefined && region) {
      let scale = rig.composer.maxScale ?? 100;
      let minimumScale = settings.minimumReadingScale;
      const angle = ((rig.rotationDeg ?? 0) * Math.PI) / 180;
      for (const history of histories!) {
        const index = new Map(
          history.subjects.map((subject) => [cinematicSubjectKey(subject.ref), subject]),
        );
        const resolved = resolveWithPolicy({
          ref: rig.subject,
          policy: shot.missingSubjectPolicy,
          available: index,
        });
        if (!resolved) continue; // The main pass emits the frame-specific missing-geometry diagnostic.
        if (settings.minimumTextPx !== undefined) {
          for (const subject of resolved.subjects) {
            if (
              !subject.worldTextSizePx ||
              subject.worldTextSizePx <= 0 ||
              !Number.isFinite(subject.worldTextSizePx)
            )
              throw new CameraEvaluationError([
                diagnostic({
                  program,
                  outputId: shot.outputId,
                  frame: history.frame,
                  shotId: shot.id,
                  code: "CAM_READING_TEXT_METRICS_MISSING",
                  message:
                    "minimumTextPx requires positive layout-owned text metrics on every protected subject.",
                }),
              ]);
            minimumScale = Math.max(minimumScale, settings.minimumTextPx / subject.worldTextSizePx);
          }
        }
        const bounds = unionRects(resolved.subjects.map((subject) => subject.worldRect));
        for (const ref of settings.avoidSubjects ?? []) {
          for (const obstacle of resolveSubjects(ref, index) ?? []) {
            const other = obstacle.worldRect;
            if (
              bounds.x < other.x + other.width &&
              bounds.x + bounds.width > other.x &&
              bounds.y < other.y + other.height &&
              bounds.y + bounds.height > other.y
            )
              throw new CameraEvaluationError([
                diagnostic({
                  program,
                  outputId: shot.outputId,
                  frame: history.frame,
                  shotId: shot.id,
                  code: "CAM_READING_OCCLUDED",
                  message: `Protected content overlaps ${cinematicSubjectKey(ref)}. Scroll the app or dismiss the surface; camera movement cannot uncover overlapping device content.`,
                }),
              ]);
          }
        }
        scale = Math.min(
          scale,
          (region.width * output.viewport.width) /
            (Math.abs(Math.cos(angle)) * bounds.width + Math.abs(Math.sin(angle)) * bounds.height),
          (region.height * output.viewport.height) /
            (Math.abs(Math.sin(angle)) * bounds.width + Math.abs(Math.cos(angle)) * bounds.height),
        );
      }
      if (scale < minimumScale || !Number.isFinite(scale))
        throw new CameraEvaluationError([
          diagnostic({
            program,
            outputId: shot.outputId,
            frame: shot.startFrame,
            shotId: shot.id,
            code: "CAM_READING_FIT_IMPOSSIBLE",
            message:
              "Protected content cannot fit without violating minimumReadingScale or minimumTextPx. Split the reading beat or enlarge its safe region.",
          }),
        ]);
      scaleByShot[shot.id] = scale;
    }
    let openingBounds: CameraRectIR | undefined;
    for (let frame = shot.startFrame; frame < shot.endFrame; frame++) {
      const history = histories?.[frame - shot.startFrame] ?? subjectFrameAt(frame);
      const index = new Map(
        history.subjects.map((subject) => [cinematicSubjectKey(subject.ref), subject]),
      );
      const resolved = resolveWithPolicy({
        ref: rig.subject,
        policy: shot.missingSubjectPolicy,
        available: index,
      });
      if (history.frame !== frame || index.size !== history.subjects.length || !resolved) {
        throw new CameraEvaluationError([
          diagnostic({
            program,
            outputId: shot.outputId,
            frame,
            shotId: shot.id,
            code: "CAM_TRACKING_GEOMETRY_INVALID",
            message:
              "Tracking requires unique, visible, frame-matched geometry throughout the shot.",
          }),
        ]);
      }
      const bounds = unionRects(resolved.subjects.map((subject) => subject.worldRect));
      if (!openingBounds) {
        const reference = shot.direction?.framingSubject
          ? resolveSubjects(shot.direction.framingSubject, index)
          : resolved.subjects;
        if (!reference)
          throw new CameraEvaluationError([
            diagnostic({
              program,
              outputId: shot.outputId,
              frame,
              shotId: shot.id,
              code: "CAM_REFERENCE_SUBJECT_MISSING",
              message: "Opening framing subject is missing.",
            }),
          ]);
        openingBounds = unionRects(reference.map((subject) => subject.worldRect));
      }
      const targetX = bounds.x + bounds.width / 2;
      const targetY = bounds.y + bounds.height / 2;
      const previous = centers.at(-1);
      if (region) {
        const center = previous ?? [
          openingBounds.x + openingBounds.width / 2,
          openingBounds.y + openingBounds.height / 2,
        ];
        const pose = solveComposer({
          subjectBounds: {
            ...openingBounds,
            x: center[0] - openingBounds.width / 2,
            y: center[1] - openingBounds.height / 2,
          },
          viewport: output.viewport,
          compositionProfileId: output.compositionProfileId,
          editorialInsets: output.editorialInsets,
          composer: scaleByShot[shot.id]
            ? { ...rig.composer, minScale: scaleByShot[shot.id], maxScale: scaleByShot[shot.id] }
            : rig.composer,
          rotationDeg: rig.rotationDeg,
        });
        const angle = (pose.rotationDeg * Math.PI) / 180;
        const cos = Math.cos(angle),
          sin = Math.sin(angle);
        const dx = targetX - pose.centerX,
          dy = targetY - pose.centerY;
        const x =
          output.viewport.x + output.viewport.width / 2 + pose.scale * (cos * dx - sin * dy);
        const y =
          output.viewport.y + output.viewport.height / 2 + pose.scale * (sin * dx + cos * dy);
        const halfWidth =
          (pose.scale * (Math.abs(cos) * bounds.width + Math.abs(sin) * bounds.height)) / 2;
        const halfHeight =
          (pose.scale * (Math.abs(sin) * bounds.width + Math.abs(cos) * bounds.height)) / 2;
        const left = output.viewport.x + region.x * output.viewport.width + halfWidth;
        const right =
          output.viewport.x + (region.x + region.width) * output.viewport.width - halfWidth;
        const top = output.viewport.y + region.y * output.viewport.height + halfHeight;
        const bottom =
          output.viewport.y + (region.y + region.height) * output.viewport.height - halfHeight;
        if (left > right + 1e-7 || top > bottom + 1e-7)
          throw new CameraEvaluationError([
            diagnostic({
              program,
              outputId: shot.outputId,
              frame,
              shotId: shot.id,
              code: "CAM_READING_REGION_TOO_SMALL",
              message:
                "Subject does not fit the reading region at the authored scale. Enlarge the region or reduce scale.",
            }),
          ]);
        const correctionX = x - Math.max(left, Math.min(right, x));
        const correctionY = y - Math.max(top, Math.min(bottom, y));
        const amount = previous && settings.minimumReadingScale === undefined ? alpha : 1;
        centers.push(
          Object.freeze([
            center[0] + (amount * (cos * correctionX + sin * correctionY)) / pose.scale,
            center[1] + (amount * (-sin * correctionX + cos * correctionY)) / pose.scale,
          ] as const),
        );
        continue;
      }
      centers.push(
        Object.freeze(
          previous
            ? ([
                previous[0] + alpha * (targetX - previous[0]),
                previous[1] + alpha * (targetY - previous[1]),
              ] as const)
            : ([targetX, targetY] as const),
        ),
      );
    }
    const limits = settings.panLimits;
    if (limits) {
      // Integrate only during preparation. Random-access rendering reads the same baked path.
      const dt = 1 / program.plan.fps;
      const scale = rig.composer.maxScale!;
      const acceleration = limits.accelerationPxPerSecondSquared / scale;
      const speed = limits.speedPxPerSecond / scale;
      let vx = 0,
        vy = 0;
      for (let index = 1; index < centers.length; index++) {
        const previous = centers[index - 1];
        const dx = centers[index][0] - previous[0],
          dy = centers[index][1] - previous[1];
        const distance = Math.hypot(dx, dy);
        // Discrete stopping speed includes the next integration step's braking distance.
        const stoppingSpeed =
          Math.sqrt((acceleration * dt) ** 2 + 2 * acceleration * distance) - acceleration * dt;
        const desiredSpeed = Math.min(speed, stoppingSpeed);
        const desiredX = distance ? (dx / distance) * desiredSpeed : 0;
        const desiredY = distance ? (dy / distance) * desiredSpeed : 0;
        const delta = Math.hypot(desiredX - vx, desiredY - vy);
        const amount = delta ? Math.min(1, (acceleration * dt) / delta) : 1;
        vx += (desiredX - vx) * amount;
        vy += (desiredY - vy) * amount;
        centers[index] = Object.freeze([previous[0] + vx * dt, previous[1] + vy * dt] as const);
      }
    }
    centersByShot[shot.id] = Object.freeze(centers);
  }
  return Object.freeze({
    programSignature: program.signature,
    centersByShot: Object.freeze(centersByShot),
    scaleByShot: Object.freeze(scaleByShot),
  });
}

export function evaluateCameraOutput(
  input: CameraEvaluationInput,
  registries: CameraRegistries,
): EvaluatedCameraOutput {
  // Resolve interrupted handoffs iteratively: authored shot count must not consume the JS call stack.
  const pending = [{ frame: input.frame, iterator: evaluateCameraFrame(input, registries) }];
  // Per-evaluation memoization prevents two velocity samples branching exponentially.
  const completed = new Map<number, EvaluatedCameraOutput>();
  let resolved: EvaluatedCameraOutput | undefined;
  while (pending.length) {
    const current = pending[pending.length - 1];
    const step = current.iterator.next(resolved!);
    if (step.done) {
      resolved = step.value;
      completed.set(current.frame, resolved);
      pending.pop();
    } else {
      resolved = completed.get(step.value.frame);
      if (!resolved)
        pending.push({
          frame: step.value.frame,
          iterator: evaluateCameraFrame(step.value, registries),
        });
    }
  }
  return resolved!;
}

function* evaluateCameraFrame(
  input: CameraEvaluationInput,
  registries: CameraRegistries,
): Generator<CameraEvaluationInput, EvaluatedCameraOutput, EvaluatedCameraOutput> {
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
    if (resolution.status === "mount-missing") {
      throw new CameraEvaluationError([
        diagnostic({
          program,
          outputId,
          frame,
          code: "CAM_STABILIZATION_MOUNT_SUBJECT_MISSING",
          message: `Shot "${shot.id}" could not resolve rig "${rig.id}" stabilization mount.`,
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
    if (resolution.status === "mount-missing") {
      throw new CameraEvaluationError([
        diagnostic({
          program,
          outputId,
          frame,
          code: "CAM_DEFAULT_STABILIZATION_MOUNT_SUBJECT_MISSING",
          message: `Output "${outputId}" could not resolve default rig "${output.defaultRigId}" stabilization mount.`,
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
    shot: activeShot,
    subjectFrameAt: input.subjectFrameAt,
    tracking: input.tracking,
    registries,
  });
  let pose = target.pose;
  let projectionPasses = target.projectionPasses;
  let transitionTrace: CameraTransitionTrace | null = null;
  if (activeShot) {
    const transition = transitionForShot(activeShot, selected.rig);
    const progress = transitionProgress({
      frame: frame + (activeShot.direction?.continuity === "velocity" ? 1 : 0),
      startFrame: activeShot.startFrame,
      durationFrames: transition.durationFrames,
      curve: transition.curve,
    });
    let sourceRigId: string | null = null;
    if (progress < 1 && activeShot.direction?.source === "freeze" && activeShot.startFrame > 0) {
      if (!input.subjectFrameAt) {
        throw new CameraEvaluationError([
          diagnostic({
            program,
            outputId,
            frame,
            shotId: activeShot.id,
            code: "CAM_SUBJECT_HISTORY_REQUIRED",
            message: `Shot "${activeShot.id}" requires historical geometry for its frozen transition.`,
          }),
        ]);
      }
      const boundary = activeShot.startFrame - 1;
      // ponytail: boundary work is linear in interruption depth; cache prepared outputs if profiling warrants it.
      const source = yield {
        ...input,
        frame: boundary,
        subjectFrame: input.subjectFrameAt(boundary),
      };
      sourceRigId = source.trace.rigId;
      pose = interpolateCameraPose(source.pose, target.pose, progress, "linear");
      if (activeShot.direction.continuity === "velocity") {
        const previous =
          boundary > 0
            ? yield {
                ...input,
                frame: boundary - 1,
                subjectFrame: input.subjectFrameAt(boundary - 1),
              }
            : source;
        const t = Math.min(1, (frame - boundary) / transition.durationFrames);
        const blend = minimumJerk(t);
        // Quintic Hermite velocity basis: value 0 at both ends, derivative 1 then 0,
        // and zero acceleration at both ends for a held target. With a moving target,
        // blend=1 and blend'=carry'=0 at arrival preserve the target's own velocity.
        // Scale is interpolated in log space.
        const carry = transition.durationFrames * (t - 6 * t ** 3 + 8 * t ** 4 - 3 * t ** 5);
        const sourceIsCut =
          source.trace.transition?.durationFrames === 0 &&
          source.trace.transition.startFrame === boundary;
        const mix = (before: number, from: number, to: number) =>
          from + (to - from) * blend + (sourceIsCut ? 0 : from - before) * carry;
        const angleDelta = (from: number, to: number) =>
          ((((to - from + 180) % 360) + 360) % 360) - 180;
        pose = {
          ...pose,
          centerX: mix(previous.pose.centerX, source.pose.centerX, target.pose.centerX),
          centerY: mix(previous.pose.centerY, source.pose.centerY, target.pose.centerY),
          scale: Math.exp(
            mix(
              Math.log(previous.pose.scale),
              Math.log(source.pose.scale),
              Math.log(target.pose.scale),
            ),
          ),
          rotationDeg: mix(
            source.pose.rotationDeg -
              angleDelta(previous.pose.rotationDeg, source.pose.rotationDeg),
            source.pose.rotationDeg,
            source.pose.rotationDeg + angleDelta(source.pose.rotationDeg, target.pose.rotationDeg),
          ),
        };
      }
      projectionPasses = blendProjectionPasses({
        fromPose: source.pose,
        toPose: target.pose,
        rawProgress: Math.max(
          0,
          Math.min(1, (frame - activeShot.startFrame) / Math.max(1, transition.durationFrames)),
        ),
        durationFrames: transition.durationFrames,
        from: source.projectionPasses,
        to: target.projectionPasses,
        progress,
        whipDirection: transition.whipDirection,
      });
    } else if (progress < 1 || transition.whipDirection) {
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
      if (previous.status === "mount-missing") {
        throw new CameraEvaluationError([
          diagnostic({
            program,
            outputId,
            frame,
            code: "CAM_TRANSITION_SOURCE_MOUNT_SUBJECT_MISSING",
            message: `Shot "${activeShot.id}" could not resolve its transition source stabilization mount.`,
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
          shot: previous.shot,
          subjectFrameAt: input.subjectFrameAt,
          tracking: input.tracking,
          registries,
        });
        pose = interpolateCameraPose(source.pose, target.pose, progress, "linear");
        projectionPasses = blendProjectionPasses({
          fromPose: source.pose,
          toPose: target.pose,
          rawProgress: Math.max(
            0,
            Math.min(1, (frame - activeShot.startFrame) / Math.max(1, transition.durationFrames)),
          ),
          durationFrames: transition.durationFrames,
          from: source.projectionPasses,
          to: target.projectionPasses,
          progress,
          whipDirection: transition.whipDirection,
        });
      }
    }
    transitionTrace = {
      startFrame: activeShot.startFrame,
      sourceRigId,
      targetRigId: selected.rig.id,
      durationFrames: transition.durationFrames,
      curve: transition.curve,
      progress,
      whipActive: transition.whipDirection !== undefined && progress > 0 && progress < 1,
      movementIntent: (activeShot.direction?.entrance ?? selected.rig.motion)?.intent ?? null,
    };
  }

  if (selected.rig.travel.mode === "stabilized") {
    const mountBounds = unionRects(selected.mountSubjects.map((subject) => subject.worldRect));
    pose = stabilizeCameraPose({
      pose,
      mountBounds,
      mountScreenPosition: selected.rig.travel.mount.screenPosition,
      mountMaxDriftPx: selected.rig.travel.mount.maxDriftPx,
      viewport: output.viewport,
      compositionProfileId: output.compositionProfileId,
      editorialInsets: output.editorialInsets,
    });
  }

  const subjectBounds = unionRects(
    selected.subjects.map((subject) => subject.clippedWorldRect ?? subject.worldRect),
  );
  const effectiveInsets = resolveOutputEditorialInsets(output);
  const effectiveWidth = Math.max(
    1,
    output.viewport.width - effectiveInsets.left - effectiveInsets.right,
  );
  const effectiveHeight = Math.max(
    1,
    output.viewport.height - effectiveInsets.top - effectiveInsets.bottom,
  );
  const subjectFillRatio = Math.max(
    (subjectBounds.width * pose.scale) / effectiveWidth,
    (subjectBounds.height * pose.scale) / effectiveHeight,
  );
  const cropCompensation = projectionPasses.reduce(
    (maximum, pass) =>
      "cropCompensation" in pass ? Math.max(maximum, pass.cropCompensation) : maximum,
    1,
  );
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
      subjectResolution: selected.subjectResolution,
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
      travel:
        selected.rig.travel.mode === "stabilized"
          ? (() => {
              const measurement = measureCameraMount({
                pose,
                mountBounds: unionRects(selected.mountSubjects.map((subject) => subject.worldRect)),
                mountScreenPosition: selected.rig.travel.mount.screenPosition,
                mountMaxDriftPx: selected.rig.travel.mount.maxDriftPx,
                viewport: output.viewport,
                compositionProfileId: output.compositionProfileId,
                editorialInsets: output.editorialInsets,
              });
              return {
                mode: "stabilized" as const,
                screenPosition: selected.rig.travel.mount.screenPosition,
                projectedCenter: measurement.projectedCenter,
                desiredCenter: measurement.desiredCenter,
                driftPx: measurement.driftPx,
                maxDriftPx: measurement.maxDriftPx,
                subjects: selected.mountSubjects.map((subject) => ({
                  key: cinematicSubjectKey(subject.ref),
                  nodeId: subject.nodeId,
                  worldRect: subject.worldRect,
                  sourceVersion: subject.sourceVersion,
                  ownerId: subject.provenance.ownerId,
                  regionId: subject.provenance.regionId,
                })),
              };
            })()
          : {
              mode: "intentional",
              reason: selected.rig.travel.reason,
            },
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
      quality: {
        ...(activeShot?.direction?.checkFraming ? { checkFraming: true } : {}),
        subjectFillRatio,
        cropCompensation,
      },
    },
  };
}
