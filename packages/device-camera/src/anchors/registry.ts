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

// Re-export all anchor registry functions from core
export {
  registerAnchorProvider,
  unregisterAnchorProvider,
  getAnchorProvider,
  hasAnchorProvider,
  getRegisteredAppIds,
  getProviderCount,
  getAnchorsForApp,
  getAnchorFraming,
  clearAnchorProviders,
  AnchorRegistry,
} from "@tokovo/core";

// Re-export types
export type {
  AnchorProvider,
  AnchorSnapshot,
  AnchorFraming,
  Rect,
} from "@tokovo/core";

export { DEFAULT_FRAMING, EMPTY_SNAPSHOT } from "@tokovo/core";
