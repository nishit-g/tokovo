/**
 * Anchor Registry - Re-exports from @tokovo/core
 *
 * This module re-exports anchor functionality from @tokovo/core to ensure
 * there's a SINGLE source of truth for anchor providers.
 *
 * Previously, device-camera had its own Map instance, causing a "split brain"
 * where PluginManager registered providers in core but useCameraEngine read
 * from device-camera. This has been fixed by re-exporting from core.
 *
 * @module device-camera/anchors/registry
 */

import type {
  AnchorRegistryClass,
  AnchorSnapshot,
  AnchorFraming,
  AnchorProviderContext,
} from "@tokovo/core";

// Re-export registry class/factory from core
export { createAnchorRegistry } from "@tokovo/core";
export type { AnchorRegistryClass };

// Re-export types
export type { AnchorProvider, AnchorSnapshot, AnchorFraming, Rect } from "@tokovo/core";

export { DEFAULT_FRAMING, EMPTY_SNAPSHOT } from "@tokovo/core";

export function getAnchorsForApp(
  registry: AnchorRegistryClass,
  appId: string,
  world: import("@tokovo/core").WorldState,
  layout: unknown,
  deviceId: string,
  context?: AnchorProviderContext,
): AnchorSnapshot {
  return registry.getAnchorsForApp(appId, world, layout, deviceId, context);
}

export function getAnchorFraming(
  registry: AnchorRegistryClass,
  appId: string,
  anchorId: string,
): AnchorFraming {
  return registry.getFraming(appId, anchorId);
}
