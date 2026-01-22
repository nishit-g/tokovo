/**
 * Anchor Registry Facade
 *
 * Delegates all operations to @tokovo/device-camera.
 * Backward compatible - apps can still use AnchorRegistry.register()
 *
 * @see docs-v2/DSL_REVAMP.md#anchors-system
 */

// Import from device-camera (source of truth)
import {
  registerAnchorProvider,
  getAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  getRegisteredAppIds,
  clearAnchorProviders,
  type AnchorProvider,
  type AnchorSnapshot,
  type AnchorFraming,
} from "@tokovo/device-camera";

// Re-export types for convenience
export type { AnchorProvider, AnchorSnapshot, AnchorFraming };

// Legacy types (re-exported from types/anchor for backward compatibility)
import type {
  AnchorProvider as AnchorProviderFunc,
  AnchorMap,
  Rect,
} from "../types/anchor";
import type { WorldState } from "../types";
export type { AnchorProviderFunc, AnchorMap, Rect };

// =============================================================================
// FUNCTION-BASED API
// =============================================================================

const globalFuncRegistry: Map<string, AnchorProviderFunc> = new Map();

export function clearAnchors(): void {
  globalFuncRegistry.clear();
  clearAnchorProviders();
}

// =============================================================================
// ANCHOR RESOLUTION (function-based)
// =============================================================================

export function resolveAnchor(
  anchorId: string,
  world: WorldState,
  deviceId: string,
): Rect | null {
  const exactProvider = globalFuncRegistry.get(anchorId);
  if (exactProvider) {
    return exactProvider(world, deviceId);
  }

  for (const [pattern, provider] of globalFuncRegistry.entries()) {
    if (pattern.endsWith(":*")) {
      const prefix = pattern.slice(0, -2);
      if (anchorId.startsWith(prefix + ":")) {
        const param = anchorId.slice(prefix.length + 1);
        return provider(world, deviceId, param);
      }
    }
  }

  return null;
}

export function hasAnchor(anchorId: string): boolean {
  if (globalFuncRegistry.has(anchorId)) return true;

  for (const pattern of globalFuncRegistry.keys()) {
    if (pattern.endsWith(":*")) {
      const prefix = pattern.slice(0, -2);
      if (anchorId.startsWith(prefix + ":")) {
        return true;
      }
    }
  }

  return false;
}

// =============================================================================
// CLASS-BASED REGISTRY (Facade - delegates to device-camera)
// =============================================================================

class AnchorRegistryFacade {
  register(provider: AnchorProvider): void {
    registerAnchorProvider(provider);
    console.log(`[AnchorRegistry] Registered provider for: ${provider.appId}`);
  }

  get(appId: string): AnchorProvider | undefined {
    return getAnchorProvider(appId);
  }

  getRegisteredApps(): string[] {
    return getRegisteredAppIds();
  }

  getFraming(appId: string, anchorId: string): AnchorFraming | undefined {
    const framing = getAnchorFraming(appId, anchorId);
    if (
      framing &&
      framing.anchorPoint.x === 0.5 &&
      framing.anchorPoint.y === 0.5
    ) {
      return framing;
    }
    return framing;
  }

  has(appId: string): boolean {
    return !!getAnchorProvider(appId);
  }

  clear(): void {
    clearAnchorProviders();
  }
}

export const AnchorRegistry = new AnchorRegistryFacade();

// =============================================================================
// MODERN API EXPORTS (re-exported from device-camera)
// =============================================================================

export {
  registerAnchorProvider,
  getAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  getRegisteredAppIds,
  clearAnchorProviders,
};
