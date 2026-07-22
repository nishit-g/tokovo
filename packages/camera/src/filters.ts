import { numberParameter, rejectUnknownParameters, requireRange } from "./parameters.js";
import type { CameraFilterModel, CameraProjectionPass } from "./types.js";

export class CameraFilterRegistry {
  readonly #models = new Map<string, CameraFilterModel>();

  register(model: CameraFilterModel): void {
    const key = `${model.id}@${model.version}`;
    if (this.#models.has(key)) {
      throw new Error(`Camera filter model "${key}" is already registered.`);
    }
    this.#models.set(key, model);
  }

  get(id: string, version: number): CameraFilterModel | undefined {
    return this.#models.get(`${id}@${version}`);
  }

  list(): readonly string[] {
    return [...this.#models.keys()].sort();
  }
}

const colorGrade: CameraFilterModel = {
  id: "color-grade",
  version: 1,
  projectionBackendRequirement: "composited",
  validate: (parameters) => [
    ...rejectUnknownParameters(parameters, [
      "brightness",
      "contrast",
      "saturation",
      "gamma",
      "temperature",
      "tint",
    ]),
    ...requireRange(parameters, "brightness", -0.3, 0.3),
    ...requireRange(parameters, "contrast", 0.5, 1.8),
    ...requireRange(parameters, "saturation", 0, 2.5),
    ...requireRange(parameters, "gamma", 0.5, 2),
    ...requireRange(parameters, "temperature", -1, 1),
    ...requireRange(parameters, "tint", -1, 1),
  ],
  evaluate: ({ parameters }): readonly CameraProjectionPass[] => [
    {
      kind: "color-grade",
      brightness: numberParameter(parameters, "brightness", 0),
      contrast: numberParameter(parameters, "contrast", 1),
      saturation: numberParameter(parameters, "saturation", 1),
      gamma: numberParameter(parameters, "gamma", 1),
      temperature: numberParameter(parameters, "temperature", 0),
      tint: numberParameter(parameters, "tint", 0),
    },
  ],
};

export function createBuiltinCameraFilterRegistry(): CameraFilterRegistry {
  const registry = new CameraFilterRegistry();
  registry.register(colorGrade);
  return registry;
}
