import type { DeviceRegistries } from "../registries/index.js";
import type { DeviceProfile } from "../types.js";
import { CanvasFrame } from "./CanvasFrame.js";

export type CanvasDimensions = { width: number; height: number };

function toCanvasProfileId(dim: CanvasDimensions): string {
  return `canvas-${dim.width}x${dim.height}`;
}

function createCanvasProfile(id: string, dim: CanvasDimensions): DeviceProfile {
  return {
    id,
    name: `Canvas ${dim.width}x${dim.height}`,
    type: "desktop",
    platform: "ios",
    dimensions: { width: dim.width, height: dim.height },
    screen: {
      width: dim.width,
      height: dim.height,
      ppi: 1,
      cornerRadius: 0,
    },
    pixelDensity: 1,
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
    camera: {
      minZoom: 1.0,
      maxZoom: 2.5,
      panSpeed: "medium",
      followLag: "medium",
      snapThreshold: 8,
      safeAreaTop: 0,
      safeAreaBottom: 0,
      followLagFactor: 0.45,
      panSpeedMultiplier: 1.0,
    },
  };
}

/**
 * Ensure a canvas device profile (frameless) exists for the given profile id.
 * Id should typically be `canvas-${width}x${height}`.
 */
export function ensureCanvasProfile(
  deviceRegistries: DeviceRegistries,
  canvasProfileId: string,
  dim: CanvasDimensions,
): void {
  if (!deviceRegistries.devices.has(canvasProfileId)) {
    const profile = createCanvasProfile(canvasProfileId, dim);
    deviceRegistries.devices.register(canvasProfileId, profile);
  }

  if (!deviceRegistries.frames.has(canvasProfileId)) {
    deviceRegistries.frames.register(canvasProfileId, CanvasFrame);
  }

  if (!deviceRegistries.shells.has(canvasProfileId)) {
    deviceRegistries.shells.register({
      id: canvasProfileId,
      FrameComponent: CanvasFrame,
      // No system UI for canvas by default. Renderer will still provide a
      // StatusBar node, but CanvasFrame ignores it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      StatusBarComponent: (() => null) as any,
      cornerRadius: 0,
      hasDynamicIsland: false,
    });
  }
}

export function resolveCanvasProfileId(dim: CanvasDimensions): string {
  return toCanvasProfileId(dim);
}

