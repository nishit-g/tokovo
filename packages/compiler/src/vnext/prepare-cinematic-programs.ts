import type { CameraPlanIR, StageProgramIR } from "@tokovo/ir";
import {
  prepareCameraPlan,
  type CameraRegistries,
  type PreparedCameraProgram,
} from "@tokovo/camera";
import { prepareStageProgram, type PreparedStageProgram } from "@tokovo/stage";

export interface CinematicProgramsIR {
  fps: number;
  durationInFrames: number;
  storySignature: string;
  stageProgram: StageProgramIR;
  cameraPlans: readonly CameraPlanIR[];
  defaultCameraPlanId: string;
}

export interface PreparedCinematicPrograms {
  version: 2;
  storySignature: string;
  stageProgram: PreparedStageProgram;
  cameraPrograms: readonly PreparedCameraProgram[];
  /** JSON-safe O(1) plan selection without duplicating prepared programs. */
  cameraProgramIndexById: Readonly<Record<string, number>>;
  defaultCameraPlanId: string;
  stageSignature: string;
  cameraSignatures: Readonly<Record<string, string>>;
}

export class CinematicProgramPreparationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "CinematicProgramPreparationError";
    this.code = code;
  }
}

export function prepareCinematicPrograms(
  input: CinematicProgramsIR,
  registries: CameraRegistries,
): PreparedCinematicPrograms {
  if (!Number.isInteger(input.fps) || input.fps <= 0) {
    throw new CinematicProgramPreparationError(
      "CINEMATIC_FPS_INVALID",
      "Cinematic program fps must be a positive integer.",
    );
  }
  if (!Number.isInteger(input.durationInFrames) || input.durationInFrames <= 0) {
    throw new CinematicProgramPreparationError(
      "CINEMATIC_DURATION_INVALID",
      "Cinematic duration must be a positive integer.",
    );
  }
  if (input.storySignature.length === 0) {
    throw new CinematicProgramPreparationError(
      "CINEMATIC_STORY_SIGNATURE_MISSING",
      "A story signature is required to prove camera-independent replay.",
    );
  }
  if (input.cameraPlans.length === 0) {
    throw new CinematicProgramPreparationError(
      "CINEMATIC_CAMERA_PLANS_EMPTY",
      "At least one CameraPlan is required.",
    );
  }

  const preparedStage = prepareStageProgram(input.stageProgram);
  const outOfRangeStageKeyframe = preparedStage.program.transformKeyframes.find(
    (keyframe) => keyframe.frame >= input.durationInFrames,
  );
  if (outOfRangeStageKeyframe) {
    throw new CinematicProgramPreparationError(
      "CINEMATIC_STAGE_KEYFRAME_OUT_OF_RANGE",
      `Stage keyframe for "${outOfRangeStageKeyframe.nodeId}" at frame ${outOfRangeStageKeyframe.frame} is outside the episode.`,
    );
  }
  const stageNodeIds = new Set(preparedStage.program.nodes.map((node) => node.id));
  const seenPlanIds = new Set<string>();
  const cameraPrograms = input.cameraPlans.map((plan) => {
    if (seenPlanIds.has(plan.id)) {
      throw new CinematicProgramPreparationError(
        "CINEMATIC_CAMERA_PLAN_DUPLICATE",
        `Duplicate CameraPlan id "${plan.id}".`,
      );
    }
    seenPlanIds.add(plan.id);
    if (plan.fps !== input.fps || plan.durationInFrames !== input.durationInFrames) {
      throw new CinematicProgramPreparationError(
        "CINEMATIC_CAMERA_TIMING_MISMATCH",
        `CameraPlan "${plan.id}" timing must match the episode.`,
      );
    }
    for (const output of plan.outputs) {
      if (!stageNodeIds.has(output.sourceStageNodeId)) {
        throw new CinematicProgramPreparationError(
          "CINEMATIC_OUTPUT_STAGE_NODE_MISSING",
          `CameraPlan "${plan.id}" output "${output.id}" references missing stage node "${output.sourceStageNodeId}".`,
        );
      }
    }
    return prepareCameraPlan(plan, registries);
  });
  if (!seenPlanIds.has(input.defaultCameraPlanId)) {
    throw new CinematicProgramPreparationError(
      "CINEMATIC_DEFAULT_CAMERA_MISSING",
      `Default CameraPlan "${input.defaultCameraPlanId}" is not present.`,
    );
  }

  return {
    version: 2,
    storySignature: input.storySignature,
    stageProgram: preparedStage,
    cameraPrograms,
    cameraProgramIndexById: Object.fromEntries(
      cameraPrograms.map((program, index) => [program.plan.id, index] as const),
    ),
    defaultCameraPlanId: input.defaultCameraPlanId,
    stageSignature: preparedStage.signature,
    cameraSignatures: Object.fromEntries(
      cameraPrograms
        .map((program) => [program.plan.id, program.signature] as const)
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  };
}

export function selectPreparedCameraProgram(
  prepared: PreparedCinematicPrograms,
  cameraPlanId = prepared.defaultCameraPlanId,
): PreparedCameraProgram {
  const index = Object.prototype.hasOwnProperty.call(prepared.cameraProgramIndexById, cameraPlanId)
    ? prepared.cameraProgramIndexById[cameraPlanId]
    : undefined;
  const program = index === undefined ? undefined : prepared.cameraPrograms[index];
  if (!program) {
    throw new CinematicProgramPreparationError(
      "CINEMATIC_CAMERA_PLAN_NOT_PREPARED",
      `Prepared CameraPlan "${cameraPlanId}" does not exist.`,
    );
  }
  return program;
}
