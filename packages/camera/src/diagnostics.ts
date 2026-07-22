import type {
  CameraPlanIR,
  CinematicSubjectRefIR,
  JsonValue,
} from "@tokovo/ir";
import { cinematicSubjectKey } from "./subjects.js";
import type {
  CinematicSubjectFrame,
  EvaluatedCameraOutput,
  PreparedCameraProgram,
} from "./types.js";

export interface CameraProgramManifest {
  version: 1;
  planId: string;
  signature: string;
  fps: number;
  durationInFrames: number;
  projectionBackendRequirement: "composited" | "texture";
  outputs: readonly {
    id: string;
    defaultRigId: string;
    coverage: PreparedCameraProgram["coverageByOutput"][string];
  }[];
  rigIds: readonly string[];
  shotIds: readonly string[];
  lensIds: readonly string[];
  modifierIds: readonly string[];
  filterIds: readonly string[];
  diagnostics: PreparedCameraProgram["diagnostics"];
}

export function createCameraProgramManifest(
  program: PreparedCameraProgram,
): CameraProgramManifest {
  return {
    version: 1,
    planId: program.plan.id,
    signature: program.signature,
    fps: program.plan.fps,
    durationInFrames: program.plan.durationInFrames,
    projectionBackendRequirement: program.projectionBackendRequirement,
    outputs: program.plan.outputs.map((output) => ({
      id: output.id,
      defaultRigId: output.defaultRigId,
      coverage: program.coverageByOutput[output.id],
    })),
    rigIds: program.plan.rigs.map((rig) => rig.id),
    shotIds: program.plan.shots.map((shot) => shot.id),
    lensIds: program.plan.lenses.map((lens) => lens.id),
    modifierIds: program.plan.modifiers.map((modifier) => modifier.id),
    filterIds: program.plan.filters.map((filter) => filter.id),
    diagnostics: program.diagnostics,
  };
}

export function explainCameraProgramFrame(input: {
  program: PreparedCameraProgram;
  outputId: string;
  frame: number;
}): {
  planId: string;
  signature: string;
  outputId: string;
  frame: number;
  candidateShots: readonly {
    id: string;
    rigId: string;
    subject: CinematicSubjectRefIR;
    missingSubjectPolicy: CameraPlanIR["shots"][number]["missingSubjectPolicy"];
  }[];
  defaultRig: { id: string; subject: CinematicSubjectRefIR };
} {
  const output = input.program.plan.outputs.find(
    (candidate) => candidate.id === input.outputId,
  );
  if (!output)
    throw new Error(`Camera output "${input.outputId}" does not exist.`);
  if (
    !Number.isInteger(input.frame) ||
    input.frame < 0 ||
    input.frame >= input.program.plan.durationInFrames
  ) {
    throw new Error(
      `Camera frame ${input.frame} is outside the prepared plan.`,
    );
  }
  const segment = (
    input.program.shotSegmentsByOutput[input.outputId] ?? []
  ).find(
    (candidate) =>
      input.frame >= candidate.startFrame && input.frame < candidate.endFrame,
  );
  const candidateShots = (segment?.shotIndexes ?? []).map((index) => {
    const shot = input.program.plan.shots[index];
    const rig = input.program.plan.rigs[input.program.rigIndexById[shot.rigId]];
    return {
      id: shot.id,
      rigId: shot.rigId,
      subject: rig.subject,
      missingSubjectPolicy: shot.missingSubjectPolicy,
    };
  });
  const defaultRig =
    input.program.plan.rigs[input.program.rigIndexById[output.defaultRigId]];
  if (!defaultRig) {
    throw new Error(
      `Camera default rig "${output.defaultRigId}" does not exist.`,
    );
  }
  return {
    planId: input.program.plan.id,
    signature: input.program.signature,
    outputId: input.outputId,
    frame: input.frame,
    candidateShots,
    defaultRig: { id: defaultRig.id, subject: defaultRig.subject },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function diffValues(
  left: unknown,
  right: unknown,
  path: string,
  output: Array<{
    path: string;
    left: JsonValue | undefined;
    right: JsonValue | undefined;
  }>,
): void {
  if (Object.is(left, right)) return;
  if (Array.isArray(left) && Array.isArray(right)) {
    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
      diffValues(left[index], right[index], `${path}[${index}]`, output);
    }
    return;
  }
  if (isRecord(left) && isRecord(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of [...keys].sort()) {
      diffValues(left[key], right[key], path ? `${path}.${key}` : key, output);
    }
    return;
  }
  output.push({
    path,
    left: left as JsonValue | undefined,
    right: right as JsonValue | undefined,
  });
}

export function diffCameraPrograms(
  left: PreparedCameraProgram,
  right: PreparedCameraProgram,
): {
  equal: boolean;
  leftSignature: string;
  rightSignature: string;
  changes: readonly {
    path: string;
    left: JsonValue | undefined;
    right: JsonValue | undefined;
  }[];
} {
  const changes: Array<{
    path: string;
    left: JsonValue | undefined;
    right: JsonValue | undefined;
  }> = [];
  diffValues(left.plan, right.plan, "plan", changes);
  return {
    equal: changes.length === 0,
    leftSignature: left.signature,
    rightSignature: right.signature,
    changes,
  };
}

export function createCinematicSubjectManifest(frame: CinematicSubjectFrame): {
  frame: number;
  subjects: readonly {
    key: string;
    nodeId: string;
    visible: boolean;
    worldRect: CinematicSubjectFrame["subjects"][number]["worldRect"];
    clippedWorldRect?: CinematicSubjectFrame["subjects"][number]["clippedWorldRect"];
    ownerId: string;
    regionId: string;
  }[];
} {
  return {
    frame: frame.frame,
    subjects: frame.subjects
      .map((subject) => ({
        key: cinematicSubjectKey(subject.ref),
        nodeId: subject.nodeId,
        visible: subject.visible,
        worldRect: subject.worldRect,
        ...(subject.clippedWorldRect
          ? { clippedWorldRect: subject.clippedWorldRect }
          : {}),
        ownerId: subject.provenance.ownerId,
        regionId: subject.provenance.regionId,
      }))
      .sort((left, right) => left.key.localeCompare(right.key)),
  };
}

export function explainEvaluatedCameraOutput(
  output: EvaluatedCameraOutput,
): EvaluatedCameraOutput["trace"] {
  return output.trace;
}
