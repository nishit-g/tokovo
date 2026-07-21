import type { JsonObject, JsonValue } from "@tokovo/ir";
import type { CameraLensModel, CameraProjectionPass } from "./types.js";
import { CameraModifierRegistry, createBuiltinCameraModifierRegistry } from "./modifiers.js";

function numberParameter(parameters: JsonObject, key: string, fallback: number): number {
  const value = parameters[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringParameter<T extends string>(
  parameters: JsonObject,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = parameters[key];
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function tupleParameter(
  value: JsonValue | undefined,
  fallback: readonly [number, number],
): readonly [number, number] {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    Number.isFinite(value[0]) &&
    typeof value[1] === "number" &&
    Number.isFinite(value[1])
  ) {
    return [value[0], value[1]];
  }
  return fallback;
}

function requireRange(
  parameters: JsonObject,
  key: string,
  minimum: number,
  maximum: number,
): string[] {
  const value = parameters[key];
  if (value === undefined) return [];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return [`${key} must be a finite number`];
  }
  return value < minimum || value > maximum
    ? [`${key} must be between ${minimum} and ${maximum}`]
    : [];
}

function rejectUnknownParameters(parameters: JsonObject, allowed: readonly string[]): string[] {
  const known = new Set(allowed);
  return Object.keys(parameters)
    .filter((key) => !known.has(key))
    .sort()
    .map((key) => `unknown parameter "${key}"`);
}

function requireTuple2(
  parameters: JsonObject,
  key: string,
  minimum?: number,
  maximum?: number,
): string[] {
  const value = parameters[key];
  if (value === undefined) return [];
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    value.some((entry) => typeof entry !== "number" || !Number.isFinite(entry))
  ) {
    return [`${key} must be a tuple of two finite numbers`];
  }
  if (
    minimum !== undefined &&
    maximum !== undefined &&
    value.some((entry) => (entry as number) < minimum || (entry as number) > maximum)
  ) {
    return [`${key} entries must be between ${minimum} and ${maximum}`];
  }
  return [];
}

function requireEnum(parameters: JsonObject, key: string, allowed: readonly string[]): string[] {
  const value = parameters[key];
  if (value === undefined) return [];
  return typeof value === "string" && allowed.includes(value)
    ? []
    : [`${key} must be one of ${allowed.join(", ")}`];
}

export class CameraLensRegistry {
  readonly #models = new Map<string, CameraLensModel>();

  register(model: CameraLensModel): void {
    const key = `${model.id}@${model.version}`;
    if (this.#models.has(key)) {
      throw new Error(`Camera lens model "${key}" is already registered.`);
    }
    this.#models.set(key, model);
  }

  get(id: string, version: number): CameraLensModel | undefined {
    return this.#models.get(`${id}@${version}`);
  }

  has(id: string, version: number): boolean {
    return this.#models.has(`${id}@${version}`);
  }

  list(): readonly string[] {
    return [...this.#models.keys()].sort();
  }
}

export interface CameraRegistries {
  lenses: CameraLensRegistry;
  modifiers: CameraModifierRegistry;
}

const wideAngleBarrel: CameraLensModel = {
  id: "wide-angle-barrel",
  version: 1,
  projectionBackendRequirement: "texture",
  validate: (parameters) => [
    ...rejectUnknownParameters(parameters, ["center", "strength", "radius", "cropCompensation"]),
    ...requireTuple2(parameters, "center", 0, 1),
    ...requireRange(parameters, "strength", 0, 1),
    ...requireRange(parameters, "radius", 0.1, 2),
    ...requireRange(parameters, "cropCompensation", 1, 2),
  ],
  evaluate: ({ parameters }): readonly CameraProjectionPass[] => [
    {
      kind: "radial-warp",
      model: "barrel",
      center: tupleParameter(parameters.center, [0.5, 0.5]),
      strength: numberParameter(parameters, "strength", 0.16),
      radius: numberParameter(parameters, "radius", 1),
      cropCompensation: numberParameter(parameters, "cropCompensation", 1.06),
    },
  ],
};

const fisheye: CameraLensModel = {
  id: "fisheye",
  version: 1,
  projectionBackendRequirement: "texture",
  validate: (parameters) => [
    ...rejectUnknownParameters(parameters, ["center", "strength", "radius", "cropCompensation"]),
    ...requireTuple2(parameters, "center", 0, 1),
    ...requireRange(parameters, "strength", 0, 1),
    ...requireRange(parameters, "radius", 0.1, 2),
    ...requireRange(parameters, "cropCompensation", 1, 2.5),
  ],
  evaluate: ({ parameters }): readonly CameraProjectionPass[] => [
    {
      kind: "fisheye-warp",
      center: tupleParameter(parameters.center, [0.5, 0.5]),
      strength: numberParameter(parameters, "strength", 0.24),
      radius: numberParameter(parameters, "radius", 1),
      cropCompensation: numberParameter(parameters, "cropCompensation", 1.1),
    },
  ],
};

const perspectiveTilt: CameraLensModel = {
  id: "perspective-tilt",
  version: 1,
  projectionBackendRequirement: "composited",
  validate: (parameters) => [
    ...rejectUnknownParameters(parameters, [
      "tiltXDeg",
      "tiltYDeg",
      "perspectivePx",
      "cropCompensation",
    ]),
    ...requireRange(parameters, "tiltXDeg", -45, 45),
    ...requireRange(parameters, "tiltYDeg", -45, 45),
    ...requireRange(parameters, "perspectivePx", 100, 5000),
    ...requireRange(parameters, "cropCompensation", 1, 2),
  ],
  evaluate: ({ parameters }): readonly CameraProjectionPass[] => [
    {
      kind: "projective-warp",
      tiltXDeg: numberParameter(parameters, "tiltXDeg", 8),
      tiltYDeg: numberParameter(parameters, "tiltYDeg", 0),
      perspectivePx: numberParameter(parameters, "perspectivePx", 1200),
      cropCompensation: numberParameter(parameters, "cropCompensation", 1.04),
    },
  ],
};

const anamorphicEdgeStretch: CameraLensModel = {
  id: "anamorphic-edge-stretch",
  version: 1,
  projectionBackendRequirement: "texture",
  validate: (parameters) => [
    ...rejectUnknownParameters(parameters, ["axis", "strength", "edgeStart", "cropCompensation"]),
    ...requireEnum(parameters, "axis", ["horizontal", "vertical"]),
    ...requireRange(parameters, "strength", 0, 1),
    ...requireRange(parameters, "edgeStart", 0, 1),
    ...requireRange(parameters, "cropCompensation", 1, 2),
  ],
  evaluate: ({ parameters }): readonly CameraProjectionPass[] => [
    {
      kind: "anamorphic-edge-stretch",
      axis: stringParameter(parameters, "axis", ["horizontal", "vertical"] as const, "horizontal"),
      strength: numberParameter(parameters, "strength", 0.14),
      edgeStart: numberParameter(parameters, "edgeStart", 0.68),
      cropCompensation: numberParameter(parameters, "cropCompensation", 1.04),
    },
  ],
};

const directionalSmear: CameraLensModel = {
  id: "directional-smear",
  version: 1,
  projectionBackendRequirement: "texture",
  validate: (parameters) => [
    ...rejectUnknownParameters(parameters, ["direction", "spreadPx", "samples", "decay"]),
    ...requireTuple2(parameters, "direction", -1, 1),
    ...requireRange(parameters, "spreadPx", 0, 240),
    ...requireRange(parameters, "samples", 2, 32),
    ...requireRange(parameters, "decay", 0, 1),
    ...(typeof parameters.samples === "number" && !Number.isInteger(parameters.samples)
      ? ["samples must be an integer"]
      : []),
    ...(Array.isArray(parameters.direction) &&
    parameters.direction.length === 2 &&
    parameters.direction[0] === 0 &&
    parameters.direction[1] === 0
      ? ["direction must not be the zero vector"]
      : []),
  ],
  evaluate: ({ parameters }): readonly CameraProjectionPass[] => [
    {
      kind: "directional-smear",
      direction: tupleParameter(parameters.direction, [1, 0]),
      spreadPx: numberParameter(parameters, "spreadPx", 36),
      samples: Math.round(numberParameter(parameters, "samples", 8)),
      decay: numberParameter(parameters, "decay", 0.72),
    },
  ],
};

export function createBuiltinCameraLensRegistry(): CameraLensRegistry {
  const registry = new CameraLensRegistry();
  registry.register(wideAngleBarrel);
  registry.register(fisheye);
  registry.register(perspectiveTilt);
  registry.register(anamorphicEdgeStretch);
  registry.register(directionalSmear);
  return registry;
}

export function createBuiltinCameraRegistries(): CameraRegistries {
  return {
    lenses: createBuiltinCameraLensRegistry(),
    modifiers: createBuiltinCameraModifierRegistry(),
  };
}
