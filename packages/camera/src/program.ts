import type {
  CameraFilterIR,
  CameraLensIR,
  CameraModifierIR,
  CameraOutputIR,
  CameraPlanIR,
  CameraRigIR,
  CameraShotIR,
  CinematicSubjectRefIR,
} from "@tokovo/ir";
import { CameraPlanSchema } from "@tokovo/ir";
import type { CameraRegistries } from "./lenses.js";
import type {
  CameraDiagnostic,
  CameraShotSegment,
  PreparedCameraProgram,
} from "./types.js";
import { cinematicSubjectKey } from "./subjects.js";

export class CameraPreparationError extends Error {
  readonly diagnostics: readonly CameraDiagnostic[];

  constructor(diagnostics: readonly CameraDiagnostic[]) {
    super(
      `Camera preparation failed with ${diagnostics.length} diagnostic(s): ${diagnostics
        .map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`)
        .join(" | ")}`,
    );
    this.name = "CameraPreparationError";
    this.diagnostics = diagnostics;
  }
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function isJsonSafe(value: unknown, seen = new Set<object>()): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  const safe = Array.isArray(value)
    ? value.every((entry) => isJsonSafe(entry, seen))
    : Object.values(value).every((entry) => isJsonSafe(entry, seen));
  seen.delete(value);
  return safe;
}

function duplicateIds<T extends { id: string }>(
  items: readonly T[],
): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  }
  return [...duplicates].sort();
}

function intervalsOverlap(left: CameraShotIR, right: CameraShotIR): boolean {
  return left.startFrame < right.endFrame && right.startFrame < left.endFrame;
}

function outputCoverageGaps(
  plan: CameraPlanIR,
  outputId: string,
): readonly { startFrame: number; endFrame: number }[] {
  const intervals = plan.shots
    .filter(
      (shot) =>
        shot.outputId === outputId &&
        Number.isInteger(shot.startFrame) &&
        Number.isInteger(shot.endFrame) &&
        shot.startFrame >= 0 &&
        shot.endFrame > shot.startFrame &&
        shot.endFrame <= plan.durationInFrames,
    )
    .map((shot) => ({ startFrame: shot.startFrame, endFrame: shot.endFrame }))
    .sort(
      (left, right) =>
        left.startFrame - right.startFrame || left.endFrame - right.endFrame,
    );
  const gaps: { startFrame: number; endFrame: number }[] = [];
  let cursor = 0;
  for (const interval of intervals) {
    if (interval.startFrame > cursor) {
      gaps.push({ startFrame: cursor, endFrame: interval.startFrame });
    }
    cursor = Math.max(cursor, interval.endFrame);
  }
  if (cursor < plan.durationInFrames) {
    gaps.push({ startFrame: cursor, endFrame: plan.durationInFrames });
  }
  return gaps;
}

function diagnostic(
  planId: string,
  code: string,
  message: string,
  fields: Partial<CameraDiagnostic> = {},
): CameraDiagnostic {
  return { code, severity: "error", message, planId, ...fields };
}

function validateLens(
  planId: string,
  lens: CameraLensIR,
  registries: CameraRegistries,
): CameraDiagnostic[] {
  const model = registries.lenses.get(lens.modelId, lens.modelVersion);
  if (!model) {
    return [
      diagnostic(
        planId,
        "CAM_LENS_MODEL_MISSING",
        `Lens model "${lens.modelId}@${lens.modelVersion}" is not registered.`,
        { lensId: lens.id },
      ),
    ];
  }
  return model.validate(lens.parameters).map((message) =>
    diagnostic(planId, "CAM_LENS_PARAMETERS_INVALID", message, {
      lensId: lens.id,
    }),
  );
}

function validateFilter(
  planId: string,
  filter: CameraFilterIR,
  registries: CameraRegistries,
): CameraDiagnostic[] {
  const model = registries.filters.get(filter.modelId, filter.modelVersion);
  if (!model) {
    return [
      diagnostic(
        planId,
        "CAM_FILTER_MODEL_MISSING",
        `Filter model "${filter.modelId}@${filter.modelVersion}" is not registered.`,
        { filterId: filter.id },
      ),
    ];
  }
  return model
    .validate(filter.parameters)
    .map((message) =>
      diagnostic(planId, "CAM_FILTER_PARAMETERS_INVALID", message, {
        filterId: filter.id,
      }),
    );
}

function validateSubjectGroups(
  planId: string,
  ref: CinematicSubjectRefIR,
  fields: Partial<CameraDiagnostic>,
): CameraDiagnostic[] {
  if (ref.kind !== "group") return [];
  const diagnostics: CameraDiagnostic[] = [];
  const seen = new Set<string>();
  for (const member of ref.members) {
    const key = cinematicSubjectKey(member);
    if (seen.has(key)) {
      diagnostics.push(
        diagnostic(
          planId,
          "CAM_SUBJECT_GROUP_MEMBER_DUPLICATE",
          `Cinematic subject group contains duplicate member "${key}".`,
          fields,
        ),
      );
    }
    seen.add(key);
    diagnostics.push(...validateSubjectGroups(planId, member, fields));
  }
  return diagnostics;
}

function sortPlan(plan: CameraPlanIR): CameraPlanIR {
  return {
    ...plan,
    outputs: [...plan.outputs].sort((a, b) => a.id.localeCompare(b.id)),
    rigs: [...plan.rigs]
      .map((rig) => ({
        ...rig,
        ...(rig.bakedTrajectory
          ? {
              bakedTrajectory: {
                ...rig.bakedTrajectory,
                keyframes: [...rig.bakedTrajectory.keyframes].sort(
                  (left, right) => left.frame - right.frame,
                ),
              },
            }
          : {}),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    shots: [...plan.shots].sort(
      (a, b) =>
        a.outputId.localeCompare(b.outputId) ||
        a.startFrame - b.startFrame ||
        b.priority - a.priority ||
        a.declarationOrder - b.declarationOrder ||
        a.id.localeCompare(b.id),
    ),
    lenses: [...plan.lenses].sort((a, b) => a.id.localeCompare(b.id)),
    modifiers: [...plan.modifiers].sort((a, b) => a.id.localeCompare(b.id)),
    filters: [...plan.filters].sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function indexById<T extends { id: string }>(
  items: readonly T[],
): Readonly<Record<string, number>> {
  return Object.fromEntries(
    items.map((item, index) => [item.id, index] as const),
  );
}

function getIndexedDefinition<T>(
  items: readonly T[],
  indexes: Readonly<Record<string, number>>,
  id: string,
): T | undefined {
  if (!Object.prototype.hasOwnProperty.call(indexes, id)) return undefined;
  const index = indexes[id];
  return Number.isInteger(index) ? items[index] : undefined;
}

function compareShotSelection(left: CameraShotIR, right: CameraShotIR): number {
  return (
    right.priority - left.priority ||
    left.declarationOrder - right.declarationOrder ||
    left.id.localeCompare(right.id)
  );
}

function buildShotSegments(
  plan: CameraPlanIR,
): Readonly<Record<string, readonly CameraShotSegment[]>> {
  const segmentsByOutput: Record<string, readonly CameraShotSegment[]> = {};
  for (const output of plan.outputs) {
    const starts = new Map<number, number[]>();
    const ends = new Map<number, number[]>();
    const boundaries = new Set([0, plan.durationInFrames]);
    for (const [shotIndex, shot] of plan.shots.entries()) {
      if (shot.outputId !== output.id) continue;
      const startIndexes = starts.get(shot.startFrame) ?? [];
      startIndexes.push(shotIndex);
      starts.set(shot.startFrame, startIndexes);
      const endIndexes = ends.get(shot.endFrame) ?? [];
      endIndexes.push(shotIndex);
      ends.set(shot.endFrame, endIndexes);
      boundaries.add(shot.startFrame);
      boundaries.add(shot.endFrame);
    }

    const orderedBoundaries = [...boundaries].sort(
      (left, right) => left - right,
    );
    const active = new Set<number>();
    const segments: CameraShotSegment[] = [];
    for (let index = 0; index < orderedBoundaries.length - 1; index += 1) {
      const startFrame = orderedBoundaries[index];
      const endFrame = orderedBoundaries[index + 1];
      for (const shotIndex of ends.get(startFrame) ?? [])
        active.delete(shotIndex);
      for (const shotIndex of starts.get(startFrame) ?? [])
        active.add(shotIndex);
      segments.push({
        startFrame,
        endFrame,
        shotIndexes: [...active].sort((left, right) =>
          compareShotSelection(plan.shots[left], plan.shots[right]),
        ),
      });
    }
    segmentsByOutput[output.id] = segments;
  }
  return segmentsByOutput;
}

export function prepareCameraPlan(
  sourcePlan: CameraPlanIR,
  registries: CameraRegistries,
): PreparedCameraProgram {
  const diagnostics: CameraDiagnostic[] = [];
  const parsed = CameraPlanSchema.safeParse(sourcePlan);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push(
        diagnostic(
          typeof sourcePlan?.id === "string" ? sourcePlan.id : "unknown-plan",
          "CAM_PLAN_SCHEMA_INVALID",
          `${issue.path.join(".") || "cameraPlan"}: ${issue.message}`,
        ),
      );
    }
    throw new CameraPreparationError(diagnostics);
  }
  const plan = sortPlan(parsed.data);

  if (!isJsonSafe(plan)) {
    diagnostics.push(
      diagnostic(
        plan.id,
        "CAM_PLAN_NOT_JSON_SAFE",
        "CameraPlan contains undefined, non-finite, cyclic, or non-JSON values.",
      ),
    );
  }
  if (plan.version !== 1) {
    diagnostics.push(
      diagnostic(
        plan.id,
        "CAM_PLAN_VERSION_UNSUPPORTED",
        `Unsupported CameraPlan version ${plan.version}.`,
      ),
    );
  }
  if (!Number.isFinite(plan.fps) || plan.fps <= 0) {
    diagnostics.push(
      diagnostic(
        plan.id,
        "CAM_PLAN_FPS_INVALID",
        "CameraPlan fps must be positive.",
      ),
    );
  }
  if (!Number.isInteger(plan.durationInFrames) || plan.durationInFrames <= 0) {
    diagnostics.push(
      diagnostic(
        plan.id,
        "CAM_PLAN_DURATION_INVALID",
        "CameraPlan duration must be a positive integer.",
      ),
    );
  }

  const categories: ReadonlyArray<
    readonly [string, readonly { id: string }[]]
  > = [
    ["output", plan.outputs],
    ["rig", plan.rigs],
    ["shot", plan.shots],
    ["lens", plan.lenses],
    ["modifier", plan.modifiers],
    ["filter", plan.filters],
  ] as const;
  for (const [category, items] of categories) {
    for (const id of duplicateIds(items)) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_ID_DUPLICATE",
          `Duplicate ${category} id "${id}".`,
        ),
      );
    }
  }

  const outputIds = new Set(plan.outputs.map((output) => output.id));
  const rigsById = new Map(plan.rigs.map((rig) => [rig.id, rig] as const));
  const lensIds = new Set(plan.lenses.map((lens) => lens.id));
  const modifierIds = new Set(plan.modifiers.map((modifier) => modifier.id));
  const filterIds = new Set(plan.filters.map((filter) => filter.id));

  for (const output of plan.outputs) {
    const defaultRig = rigsById.get(output.defaultRigId);
    if (!defaultRig || defaultRig.outputId !== output.id) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_OUTPUT_DEFAULT_RIG_INVALID",
          `Output "${output.id}" requires a default rig owned by that output.`,
          { outputId: output.id, rigId: output.defaultRigId },
        ),
      );
    }
    if (output.viewport.width <= 0 || output.viewport.height <= 0) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_OUTPUT_VIEWPORT_INVALID",
          `Output "${output.id}" has invalid bounds.`,
          {
            outputId: output.id,
          },
        ),
      );
    }
    if (
      output.clipRadiusPx !== undefined &&
      output.clipRadiusPx >
        Math.min(output.viewport.width, output.viewport.height) / 2
    ) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_OUTPUT_CLIP_RADIUS_INVALID",
          `Output "${output.id}" clip radius exceeds half its shortest edge.`,
          { outputId: output.id },
        ),
      );
    }
    const insets = output.safeAreaInsets;
    if (
      insets &&
      (insets.left + insets.right >= output.viewport.width ||
        insets.top + insets.bottom >= output.viewport.height)
    ) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_OUTPUT_SAFE_AREA_INVALID",
          `Output "${output.id}" safe-area insets leave no usable viewport.`,
          { outputId: output.id },
        ),
      );
    }
  }

  for (const rig of plan.rigs) {
    diagnostics.push(
      ...validateSubjectGroups(plan.id, rig.subject, { rigId: rig.id }),
    );
    if (rig.framingGuard) {
      diagnostics.push(
        ...validateSubjectGroups(plan.id, rig.framingGuard.subject, {
          rigId: rig.id,
        }),
      );
    }
    if (!outputIds.has(rig.outputId)) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_RIG_OUTPUT_MISSING",
          `Rig "${rig.id}" references a missing output.`,
          {
            outputId: rig.outputId,
            rigId: rig.id,
          },
        ),
      );
    }
    if (rig.lensId && !lensIds.has(rig.lensId)) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_RIG_LENS_MISSING",
          `Rig "${rig.id}" references missing lens "${rig.lensId}".`,
          {
            rigId: rig.id,
            lensId: rig.lensId,
          },
        ),
      );
    }
    for (const modifierId of rig.modifierIds ?? []) {
      if (!modifierIds.has(modifierId)) {
        diagnostics.push(
          diagnostic(
            plan.id,
            "CAM_RIG_MODIFIER_MISSING",
            `Rig "${rig.id}" references missing modifier "${modifierId}".`,
            { rigId: rig.id },
          ),
        );
      }
    }
    for (const filterId of rig.filterIds ?? []) {
      if (!filterIds.has(filterId)) {
        diagnostics.push(
          diagnostic(
            plan.id,
            "CAM_RIG_FILTER_MISSING",
            `Rig "${rig.id}" references missing filter "${filterId}".`,
            { rigId: rig.id },
          ),
        );
      }
    }
    if (
      rig.composer.minScale !== undefined &&
      rig.composer.maxScale !== undefined &&
      rig.composer.minScale > rig.composer.maxScale
    ) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_COMPOSER_SCALE_RANGE_INVALID",
          `Rig "${rig.id}" minScale exceeds maxScale.`,
          { outputId: rig.outputId, rigId: rig.id },
        ),
      );
    }
    if (rig.bakedTrajectory) {
      const seenFrames = new Set<number>();
      for (const keyframe of rig.bakedTrajectory.keyframes) {
        if (seenFrames.has(keyframe.frame)) {
          diagnostics.push(
            diagnostic(
              plan.id,
              "CAM_TRAJECTORY_FRAME_DUPLICATE",
              `Rig "${rig.id}" has duplicate trajectory frame ${keyframe.frame}.`,
              { outputId: rig.outputId, rigId: rig.id, frame: keyframe.frame },
            ),
          );
        }
        seenFrames.add(keyframe.frame);
        if (keyframe.frame >= plan.durationInFrames) {
          diagnostics.push(
            diagnostic(
              plan.id,
              "CAM_TRAJECTORY_FRAME_OUT_OF_RANGE",
              `Rig "${rig.id}" trajectory frame ${keyframe.frame} is outside the plan.`,
              { outputId: rig.outputId, rigId: rig.id, frame: keyframe.frame },
            ),
          );
        }
      }
    }
  }

  for (const lens of plan.lenses) {
    diagnostics.push(...validateLens(plan.id, lens, registries));
  }

  for (const modifier of plan.modifiers) {
    const model = registries.modifiers.get(
      modifier.modelId,
      modifier.modelVersion,
    );
    if (!model) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_MODIFIER_MODEL_MISSING",
          `Modifier model "${modifier.modelId}@${modifier.modelVersion}" is not registered.`,
          { modifierId: modifier.id },
        ),
      );
      continue;
    }
    for (const message of model.validate(modifier.parameters)) {
      diagnostics.push(
        diagnostic(plan.id, "CAM_MODIFIER_PARAMETERS_INVALID", message, {
          modifierId: modifier.id,
        }),
      );
    }
  }

  for (const filter of plan.filters) {
    diagnostics.push(...validateFilter(plan.id, filter, registries));
  }

  for (const shot of plan.shots) {
    if (shot.missingSubjectPolicy.type === "use-explicit") {
      diagnostics.push(
        ...validateSubjectGroups(plan.id, shot.missingSubjectPolicy.fallback, {
          outputId: shot.outputId,
          shotId: shot.id,
        }),
      );
    }
    const rig = rigsById.get(shot.rigId);
    if (
      !Number.isInteger(shot.startFrame) ||
      !Number.isInteger(shot.endFrame) ||
      shot.startFrame < 0 ||
      shot.endFrame <= shot.startFrame ||
      shot.endFrame > plan.durationInFrames
    ) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_SHOT_INTERVAL_INVALID",
          `Shot "${shot.id}" has an invalid interval.`,
          {
            outputId: shot.outputId,
            shotId: shot.id,
          },
        ),
      );
    }
    if (!rig) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_SHOT_RIG_MISSING",
          `Shot "${shot.id}" references missing rig "${shot.rigId}".`,
          {
            outputId: shot.outputId,
            shotId: shot.id,
            rigId: shot.rigId,
          },
        ),
      );
    } else if (rig.outputId !== shot.outputId) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_SHOT_OUTPUT_MISMATCH",
          `Shot "${shot.id}" and rig "${rig.id}" target different outputs.`,
          {
            outputId: shot.outputId,
            shotId: shot.id,
            rigId: rig.id,
          },
        ),
      );
    }
    const blendDuration = shot.blendIn?.durationFrames ?? 0;
    if (blendDuration > shot.endFrame - shot.startFrame) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_SHOT_BLEND_EXCEEDS_INTERVAL",
          `Shot "${shot.id}" blend-in exceeds the shot interval.`,
          { outputId: shot.outputId, shotId: shot.id, rigId: shot.rigId },
        ),
      );
    }
  }

  for (const output of plan.outputs) {
    const shots = plan.shots.filter((shot) => shot.outputId === output.id);
    for (let leftIndex = 0; leftIndex < shots.length; leftIndex += 1) {
      for (
        let rightIndex = leftIndex + 1;
        rightIndex < shots.length;
        rightIndex += 1
      ) {
        const left = shots[leftIndex];
        const right = shots[rightIndex];
        if (left.priority === right.priority && intervalsOverlap(left, right)) {
          diagnostics.push(
            diagnostic(
              plan.id,
              "CAM_SHOT_OVERLAP_AMBIGUOUS",
              `Shots "${left.id}" and "${right.id}" overlap at equal priority.`,
              { outputId: output.id, shotId: right.id },
            ),
          );
        }
      }
    }
    if (output.coveragePolicy === "require-shots") {
      for (const gap of outputCoverageGaps(plan, output.id)) {
        diagnostics.push(
          diagnostic(
            plan.id,
            "CAM_OUTPUT_COVERAGE_GAP",
            `Output "${output.id}" has no authored shot in [${gap.startFrame}, ${gap.endFrame}).`,
            { outputId: output.id, frame: gap.startFrame },
          ),
        );
      }
    }
  }

  if (diagnostics.some((entry) => entry.severity === "error")) {
    throw new CameraPreparationError(diagnostics);
  }

  const outputIndexById = indexById(plan.outputs);
  const rigIndexById = indexById(plan.rigs);
  const lensIndexById = indexById(plan.lenses);
  const modifierIndexById = indexById(plan.modifiers);
  const filterIndexById = indexById(plan.filters);
  const shotSegmentsByOutput = buildShotSegments(plan);
  const coverageByOutput = Object.fromEntries(
    plan.outputs.map((output) => [
      output.id,
      {
        policy: output.coveragePolicy,
        gaps: outputCoverageGaps(plan, output.id),
      },
    ]),
  );
  const projectionBackendRequirement = ((): "composited" | "texture" => {
    const reachableRigIds = new Set([
      ...plan.outputs.map((output) => output.defaultRigId),
      ...plan.shots.map((shot) => shot.rigId),
    ]);
    const reachableRigs = plan.rigs.filter((rig) =>
      reachableRigIds.has(rig.id),
    );
    if (reachableRigs.some((rig) => rig.motion?.type === "whip")) {
      return "texture";
    }
    const reachableLensIds = new Set(
      reachableRigs.flatMap((rig) => (rig.lensId ? [rig.lensId] : [])),
    );
    for (const lens of plan.lenses.filter((entry) =>
      reachableLensIds.has(entry.id),
    )) {
      const model = registries.lenses.get(lens.modelId, lens.modelVersion);
      if (model?.projectionBackendRequirement === "texture") {
        return "texture";
      }
    }
    const reachableModifierIds = new Set(
      reachableRigs.flatMap((rig) => rig.modifierIds ?? []),
    );
    for (const modifier of plan.modifiers.filter((entry) =>
      reachableModifierIds.has(entry.id),
    )) {
      const model = registries.modifiers.get(
        modifier.modelId,
        modifier.modelVersion,
      );
      if (model?.projectionBackendRequirement === "texture") {
        return "texture";
      }
    }
    const reachableFilterIds = new Set(
      reachableRigs.flatMap((rig) => rig.filterIds ?? []),
    );
    for (const filter of plan.filters.filter((entry) =>
      reachableFilterIds.has(entry.id),
    )) {
      const model = registries.filters.get(filter.modelId, filter.modelVersion);
      if (model?.projectionBackendRequirement === "texture") {
        return "texture";
      }
    }
    return "composited";
  })();
  const signature = hashString(stableSerialize(plan));
  return {
    version: 2,
    plan,
    outputIndexById,
    rigIndexById,
    lensIndexById,
    modifierIndexById,
    filterIndexById,
    shotSegmentsByOutput,
    coverageByOutput,
    projectionBackendRequirement,
    signature,
    diagnostics,
  };
}

export function getRigById(
  program: PreparedCameraProgram,
  rigId: string,
): CameraRigIR | undefined {
  return getIndexedDefinition(program.plan.rigs, program.rigIndexById, rigId);
}

export function getOutputById(
  program: PreparedCameraProgram,
  outputId: string,
): CameraOutputIR | undefined {
  return getIndexedDefinition(
    program.plan.outputs,
    program.outputIndexById,
    outputId,
  );
}

export function getLensById(
  program: PreparedCameraProgram,
  lensId: string,
): CameraLensIR | undefined {
  return getIndexedDefinition(
    program.plan.lenses,
    program.lensIndexById,
    lensId,
  );
}

export function getModifierById(
  program: PreparedCameraProgram,
  modifierId: string,
): CameraModifierIR | undefined {
  return getIndexedDefinition(
    program.plan.modifiers,
    program.modifierIndexById,
    modifierId,
  );
}

export function getFilterById(
  program: PreparedCameraProgram,
  filterId: string,
): CameraFilterIR | undefined {
  return getIndexedDefinition(
    program.plan.filters,
    program.filterIndexById,
    filterId,
  );
}
