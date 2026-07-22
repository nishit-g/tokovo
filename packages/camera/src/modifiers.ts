import type { JsonObject } from "@tokovo/ir";
import { numberParameter, rejectUnknownParameters, requireRange } from "./parameters.js";
import type {
  CameraModifierModel,
  CameraModifierResult,
  CameraPose2D,
  CameraProjectionPass,
} from "./types.js";

function continuousNoise(value: number, seed: number): number {
  return (
    Math.sin(value * 1.17 + seed * 0.013) * 0.58 +
    Math.sin(value * 2.31 + seed * 0.071 + 1.9) * 0.29 +
    Math.sin(value * 4.73 + seed * 0.037 + 4.1) * 0.13
  );
}

export class CameraModifierRegistry {
  readonly #models = new Map<string, CameraModifierModel>();

  register(model: CameraModifierModel): void {
    const key = `${model.id}@${model.version}`;
    if (this.#models.has(key)) {
      throw new Error(`Camera modifier model "${key}" is already registered.`);
    }
    this.#models.set(key, model);
  }

  get(id: string, version: number): CameraModifierModel | undefined {
    return this.#models.get(`${id}@${version}`);
  }

  list(): readonly string[] {
    return [...this.#models.keys()].sort();
  }
}

const lensBreathing: CameraModifierModel = {
  id: "lens-breathing",
  version: 1,
  projectionBackendRequirement: "composited",
  validate: (parameters) => [
    ...rejectUnknownParameters(parameters, ["amount", "periodFrames", "phase"]),
    ...requireRange(parameters, "amount", 0, 0.12),
    ...requireRange(parameters, "periodFrames", 2, 10000),
    ...requireRange(parameters, "phase", -Math.PI * 2, Math.PI * 2),
  ],
  evaluate: ({ frame, parameters, pose, projectionPasses }): CameraModifierResult => {
    const amount = numberParameter(parameters, "amount", 0.012);
    const periodFrames = numberParameter(parameters, "periodFrames", 180);
    const phase = numberParameter(parameters, "phase", 0);
    const scale =
      pose.scale * (1 + Math.sin((frame / periodFrames) * Math.PI * 2 + phase) * amount);
    return { pose: { ...pose, scale }, projectionPasses };
  },
};

const handheldDrift: CameraModifierModel = {
  id: "handheld-drift",
  version: 1,
  projectionBackendRequirement: "composited",
  validate: (parameters) => [
    ...rejectUnknownParameters(parameters, [
      "amplitudeX",
      "amplitudeY",
      "rotationDeg",
      "frequencyHz",
      "seed",
    ]),
    ...requireRange(parameters, "amplitudeX", 0, 80),
    ...requireRange(parameters, "amplitudeY", 0, 80),
    ...requireRange(parameters, "rotationDeg", 0, 8),
    ...requireRange(parameters, "frequencyHz", 0.01, 8),
    ...requireRange(parameters, "seed", 0, 2147483647),
  ],
  evaluate: ({ frame, fps, parameters, pose, projectionPasses }): CameraModifierResult => {
    const frequencyHz = numberParameter(parameters, "frequencyHz", 0.35);
    const time = (frame / fps) * frequencyHz * Math.PI * 2;
    const seed = numberParameter(parameters, "seed", 1);
    const amplitudeX = numberParameter(parameters, "amplitudeX", 3);
    const amplitudeY = numberParameter(parameters, "amplitudeY", 2);
    const rotationDeg = numberParameter(parameters, "rotationDeg", 0.18);
    return {
      pose: {
        ...pose,
        centerX: pose.centerX + continuousNoise(time, seed) * amplitudeX,
        centerY: pose.centerY + continuousNoise(time + 17.3, seed + 97) * amplitudeY,
        rotationDeg: pose.rotationDeg + continuousNoise(time + 31.7, seed + 211) * rotationDeg,
      },
      projectionPasses,
    };
  },
};

export function createBuiltinCameraModifierRegistry(): CameraModifierRegistry {
  const registry = new CameraModifierRegistry();
  registry.register(lensBreathing);
  registry.register(handheldDrift);
  return registry;
}

export function applyCameraModifiers(input: {
  frame: number;
  fps: number;
  pose: CameraPose2D;
  projectionPasses: readonly CameraProjectionPass[];
  modifiers: readonly {
    model: CameraModifierModel;
    parameters: JsonObject;
  }[];
}): CameraModifierResult {
  return input.modifiers.reduce<CameraModifierResult>(
    (result, modifier) =>
      modifier.model.evaluate({
        frame: input.frame,
        fps: input.fps,
        parameters: modifier.parameters,
        pose: result.pose,
        projectionPasses: result.projectionPasses,
      }),
    { pose: input.pose, projectionPasses: input.projectionPasses },
  );
}
