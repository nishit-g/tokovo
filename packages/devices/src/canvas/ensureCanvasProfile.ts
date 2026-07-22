import type { DeviceRegistries } from "../registries/index.js";
import type { DeviceProfile } from "../types.js";
import { registerHardwareVisualIdentity } from "@tokovo/visual-system";
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
    display: {
      x: 0,
      y: 0,
      width: dim.width,
      height: dim.height,
      ppi: 1,
      cornerRadius: 0,
    },
    pointScale: 1,
    platformProfileId: "ios:liquid-glass@1",
    systemSurfaces: false,
    hardwareRegions: [],
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
  registerHardwareVisualIdentity(canvasProfileId, {
    platform: "ios",
    platformProfileId: "ios:liquid-glass@1",
    systemSurfaces: false,
  });

  if (!deviceRegistries.devices.has(canvasProfileId)) {
    const profile = createCanvasProfile(canvasProfileId, dim);
    deviceRegistries.devices.register(canvasProfileId, profile);
  }

  if (!deviceRegistries.frames.has(canvasProfileId)) {
    deviceRegistries.frames.register(canvasProfileId, CanvasFrame);
  }
}

export function resolveCanvasProfileId(dim: CanvasDimensions): string {
  return toCanvasProfileId(dim);
}
