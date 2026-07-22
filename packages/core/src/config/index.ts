import { z } from "zod";

// Validation schema for config - prevents invalid values that cause runtime errors
const TokovoConfigSchema = z.object({
  timing: z.object({
    defaultTransitionDuration: z.number().int().min(1),
  }),
  animation: z.object({
    defaultDuration: z.number().int().min(1),
    easing: z.object({
      default: z.string(),
      spring: z.string(),
      smooth: z.string(),
    }),
  }),
  rendering: z.object({
    defaultFps: z.number().int().min(1).max(120),
    maxEventsPerFrame: z.number().int().min(1),
    cacheKeyframeInterval: z.number().int().min(1),
  }),
  audio: z.object({
    defaultVolume: z.number().min(0).max(1),
    duckedVolume: z.number().min(0).max(1),
    fadeOutDuration: z.number().int().min(0),
  }),
  debug: z.object({
    logEvents: z.boolean(),
    logPerformance: z.boolean(),
    showBoundingBoxes: z.boolean(),
  }),
});

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      const child = (value as Record<string, unknown>)[key];
      if (child && typeof child === "object" && !Object.isFrozen(child)) {
        deepFreeze(child);
      }
    }
  }
  return value;
}

export const TokovoConfig = deepFreeze({
  timing: {
    defaultTransitionDuration: 30,
  },

  animation: {
    defaultDuration: 300,
    easing: {
      default: "ease-out",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  rendering: {
    defaultFps: 30,
    maxEventsPerFrame: 1000,
    cacheKeyframeInterval: 30,
  },

  audio: {
    defaultVolume: 1.0,
    duckedVolume: 0.3,
    fadeOutDuration: 500,
  },

  debug: {
    logEvents: false,
    logPerformance: false,
    showBoundingBoxes: false,
  },
} as const);

export type TokovoConfigType = typeof TokovoConfig;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function deepMerge<T extends object>(base: T, override: DeepPartial<T>): T {
  const result = { ...base };

  for (const key in override) {
    const overrideValue = override[key];
    const baseValue = base[key];

    if (
      overrideValue !== undefined &&
      typeof overrideValue === "object" &&
      !Array.isArray(overrideValue) &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        baseValue as object,
        overrideValue as DeepPartial<typeof baseValue>,
      );
    } else if (overrideValue !== undefined) {
      (result as Record<string, unknown>)[key] = overrideValue;
    }
  }

  return result;
}

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[],
  ) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

export function createConfig(
  overrides: DeepPartial<TokovoConfigType> = {},
): TokovoConfigType {
  const merged = deepMerge(TokovoConfig, overrides);

  const result = TokovoConfigSchema.safeParse(merged);
  if (!result.success) {
    throw new ConfigValidationError(
      `Invalid config: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
      result.error.issues,
    );
  }

  return deepFreeze(merged);
}

export function getTimingConfig(config: TokovoConfigType = TokovoConfig) {
  return config.timing;
}

export function getAnimationConfig(config: TokovoConfigType = TokovoConfig) {
  return config.animation;
}

export function getRenderingConfig(config: TokovoConfigType = TokovoConfig) {
  return config.rendering;
}

export function getAudioConfig(config: TokovoConfigType = TokovoConfig) {
  return config.audio;
}

export function isDebugEnabled(
  config: TokovoConfigType = TokovoConfig,
  feature: keyof typeof TokovoConfig.debug,
): boolean {
  return config.debug[feature];
}
