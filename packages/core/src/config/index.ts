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

export function configureEngine(
  overrides: DeepPartial<TokovoConfigType>,
): void {
  currentConfig = deepMerge(TokovoConfig, overrides);
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
