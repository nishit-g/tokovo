import type {
  CameraFilterIR,
  CameraLensIR,
  CameraPlanIR,
  CameraRigIR,
  CameraShotIR,
} from "@tokovo/ir";
import { CameraPlanSchema } from "@tokovo/ir";
import type { CameraRegistries } from "./lenses.js";
import type { CameraDiagnostic, PreparedCameraProgram } from "./types.js";

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
  if (value === null || typeof value === "string" || typeof value === "boolean") {
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

function duplicateIds<T extends { id: string }>(items: readonly T[]): readonly string[] {
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
      ),
    ];
  }
  return model
    .validate(filter.parameters)
    .map((message) => diagnostic(planId, "CAM_FILTER_PARAMETERS_INVALID", message));
}

function sortPlan(plan: CameraPlanIR): CameraPlanIR {
  return {
    ...plan,
    outputs: [...plan.outputs].sort((a, b) => a.id.localeCompare(b.id)),
    rigs: [...plan.rigs].sort((a, b) => a.id.localeCompare(b.id)),
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
      diagnostic(plan.id, "CAM_PLAN_FPS_INVALID", "CameraPlan fps must be positive."),
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

  const categories: ReadonlyArray<readonly [string, readonly { id: string }[]]> = [
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
        diagnostic(plan.id, "CAM_ID_DUPLICATE", `Duplicate ${category} id "${id}".`),
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
      output.clipRadiusPx > Math.min(output.viewport.width, output.viewport.height) / 2
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
  }

  for (const rig of plan.rigs) {
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
  }

  for (const lens of plan.lenses) {
    diagnostics.push(...validateLens(plan.id, lens, registries));
  }

  for (const modifier of plan.modifiers) {
    const model = registries.modifiers.get(modifier.modelId, modifier.modelVersion);
    if (!model) {
      diagnostics.push(
        diagnostic(
          plan.id,
          "CAM_MODIFIER_MODEL_MISSING",
          `Modifier model "${modifier.modelId}@${modifier.modelVersion}" is not registered.`,
        ),
      );
      continue;
    }
    for (const message of model.validate(modifier.parameters)) {
      diagnostics.push(diagnostic(plan.id, "CAM_MODIFIER_PARAMETERS_INVALID", message));
    }
  }

  for (const filter of plan.filters) {
    diagnostics.push(...validateFilter(plan.id, filter, registries));
  }

  for (const shot of plan.shots) {
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
      for (let rightIndex = leftIndex + 1; rightIndex < shots.length; rightIndex += 1) {
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
  }

  if (diagnostics.some((entry) => entry.severity === "error")) {
    throw new CameraPreparationError(diagnostics);
  }

  const shotsByOutput = Object.fromEntries(
    plan.outputs.map((output) => [
      output.id,
      plan.shots.filter((shot) => shot.outputId === output.id),
    ]),
  );
  const projectionBackendRequirement = ((): "composited" | "texture" => {
    const reachableRigIds = new Set([
      ...plan.outputs.map((output) => output.defaultRigId),
      ...plan.shots.map((shot) => shot.rigId),
    ]);
    const reachableRigs = plan.rigs.filter((rig) => reachableRigIds.has(rig.id));
    if (reachableRigs.some((rig) => rig.motion?.type === "whip")) {
      return "texture";
    }
    const reachableLensIds = new Set(
      reachableRigs.flatMap((rig) => (rig.lensId ? [rig.lensId] : [])),
    );
    for (const lens of plan.lenses.filter((entry) => reachableLensIds.has(entry.id))) {
      const model = registries.lenses.get(lens.modelId, lens.modelVersion);
      if (model?.projectionBackendRequirement === "texture") {
        return "texture";
      }
    }
    const reachableModifierIds = new Set(reachableRigs.flatMap((rig) => rig.modifierIds ?? []));
    for (const modifier of plan.modifiers.filter((entry) => reachableModifierIds.has(entry.id))) {
      const model = registries.modifiers.get(modifier.modelId, modifier.modelVersion);
      if (model?.projectionBackendRequirement === "texture") {
        return "texture";
      }
    }
    const reachableFilterIds = new Set(reachableRigs.flatMap((rig) => rig.filterIds ?? []));
    for (const filter of plan.filters.filter((entry) => reachableFilterIds.has(entry.id))) {
      const model = registries.filters.get(filter.modelId, filter.modelVersion);
      if (model?.projectionBackendRequirement === "texture") {
        return "texture";
      }
    }
    return "composited";
  })();
  const signature = hashString(stableSerialize(plan));
  return {
    version: 1,
    plan,
    shotsByOutput,
    projectionBackendRequirement,
    signature,
    diagnostics,
  };
}

export function getRigById(program: PreparedCameraProgram, rigId: string): CameraRigIR | undefined {
  return program.plan.rigs.find((rig) => rig.id === rigId);
}
