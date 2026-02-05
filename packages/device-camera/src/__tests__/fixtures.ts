import type { CameraState, ZoomEffect } from "../types/index.js";

export function createDefaultCameraState(): CameraState {
  return {
    baseView: "APP_VIEW",
    appId: "test_app",
    activeDeviceId: "device_1",
    layout: { mode: "SINGLE", primaryDeviceId: "device_1" },
    activeEffects: [],
    transform: {
      scale: 1,
      translateX: 0,
      translateY: 0,
      originX: 0.5,
      originY: 0.5,
      rotation: 0,
      shakeX: 0,
      shakeY: 0,
    },
    deviceTransforms: {},
  };
}

export function createZoomEffect(overrides?: Partial<ZoomEffect>): ZoomEffect {
  return {
    type: "zoom",
    id: "test-zoom",
    targetScale: 1.5,
    startFrame: 0,
    endFrame: 30,
    easing: "ease-in-out",
    ...overrides,
  };
}
