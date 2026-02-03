import { z } from "zod";

// Validation schema for config - prevents invalid values that cause runtime errors
const TokovoConfigSchema = z.object({
  timing: z.object({
    effectCleanupBuffer: z.number().int().min(1),
    defaultTransitionDuration: z.number().int().min(1),
    keyboardAnimationDuration: z.number().int().min(1),
  }),
  keyboard: z.object({
    ios: z.object({
      height: z.number().int().min(1),
      animationDuration: z.number().int().min(1),
    }),
    android: z.object({
      height: z.number().int().min(1),
      animationDuration: z.number().int().min(1),
    }),
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
  notifications: z.object({
    cleanupDelayFrames: z.number().int().min(0),
  }),
  camera: z.object({
    defaultZoom: z.number().min(0.1),
    minZoom: z.number().min(0.1),
    maxZoom: z.number().min(0.1),
    panSpeed: z.number().min(0),
    followLag: z.number().min(0).max(1),
  }),
  debug: z.object({
    logEvents: z.boolean(),
    logPerformance: z.boolean(),
    showBoundingBoxes: z.boolean(),
  }),
});

export const TokovoConfig = {
  timing: {
    effectCleanupBuffer: 30,
    defaultTransitionDuration: 30,
    keyboardAnimationDuration: 15,
  },

  keyboard: {
    ios: {
      height: 900,
      animationDuration: 250,
    },
    android: {
      height: 800,
      animationDuration: 200,
    },
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

  notifications: {
    cleanupDelayFrames: 45,
  },

  camera: {
    defaultZoom: 1.0,
    minZoom: 0.5,
    maxZoom: 2.0,
    panSpeed: 0.1,
    followLag: 0.85,
  },

  debug: {
    logEvents: false,
    logPerformance: false,
    showBoundingBoxes: false,
  },
} as const;

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

let currentConfig = { ...TokovoConfig };

export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[],
  ) {
    super(message);
    this.name = "ConfigValidationError";
  }
}

export function configureEngine(
  overrides: DeepPartial<TokovoConfigType>,
): void {
  const merged = deepMerge(TokovoConfig, overrides);

  const result = TokovoConfigSchema.safeParse(merged);
  if (!result.success) {
    throw new ConfigValidationError(
      `Invalid config: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
      result.error.issues,
    );
  }

  currentConfig = merged;
}

export function getConfig(): TokovoConfigType {
  return currentConfig;
}

export function resetConfig(): void {
  currentConfig = { ...TokovoConfig };
}

export function getTimingConfig() {
  return currentConfig.timing;
}

export function getKeyboardConfig(platform: "ios" | "android" = "ios") {
  return currentConfig.keyboard[platform];
}

export function getAnimationConfig() {
  return currentConfig.animation;
}

export function getRenderingConfig() {
  return currentConfig.rendering;
}

export function getAudioConfig() {
  return currentConfig.audio;
}

export function getNotificationsConfig() {
  return currentConfig.notifications;
}

export function getCameraConfig() {
  return currentConfig.camera;
}

export function isDebugEnabled(
  feature: keyof typeof TokovoConfig.debug,
): boolean {
  return currentConfig.debug[feature];
}

export function enableDebug(feature: keyof typeof TokovoConfig.debug): void {
  (currentConfig.debug as Record<string, boolean>)[feature] = true;
}

export function disableDebug(feature: keyof typeof TokovoConfig.debug): void {
  (currentConfig.debug as Record<string, boolean>)[feature] = false;
}
