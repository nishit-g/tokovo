/**
 * Anchor Registry Facade
 *
 * Delegates all operations to @tokovo/device-camera.
 * Backward compatible - apps can still use AnchorRegistry.register()
 *
 * @see docs-v2/DSL_REVAMP.md#anchors-system
 */

import {
  registerAnchorProvider,
  unregisterAnchorProvider,
  getAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  getRegisteredAppIds,
  clearAnchorProviders,
  type AnchorProvider,
  type AnchorSnapshot,
  type AnchorFraming,
} from "@tokovo/device-camera";

export type { AnchorProvider, AnchorSnapshot, AnchorFraming };

import type { Rect } from "../types/anchor";
import type { WorldState } from "../types";
export type { Rect };

export function clearAnchors(): void {
  clearAnchorProviders();
}

export function resolveAnchor(
  anchorId: string,
  world: WorldState,
  deviceId: string,
): Rect | null {
  const appId = extractAppIdFromAnchor(anchorId);
  if (!appId) return null;

  const provider = getAnchorProvider(appId);
  if (!provider) return null;

  const device = world.devices[deviceId];
  if (!device) return null;

  const snapshot = provider.getAnchors(world, device, deviceId);
  return snapshot?.anchors?.[anchorId] || null;
}

function extractAppIdFromAnchor(anchorId: string): string | null {
  const parts = anchorId.split(":");
  if (parts.length >= 1 && parts[0].startsWith("app_")) {
    return parts[0];
  }
  return null;
}

export function hasAnchor(anchorId: string): boolean {
  const appId = extractAppIdFromAnchor(anchorId);
  if (!appId) return false;
  return !!getAnchorProvider(appId);
}

class AnchorRegistryFacade {
  register(provider: AnchorProvider): void {
    registerAnchorProvider(provider);
  }

  get(appId: string): AnchorProvider | undefined {
    return getAnchorProvider(appId);
  }

  getRegisteredApps(): string[] {
    return getRegisteredAppIds();
  }

  getFraming(appId: string, anchorId: string): AnchorFraming | undefined {
    return getAnchorFraming(appId, anchorId);
  }

  has(appId: string): boolean {
    return !!getAnchorProvider(appId);
  }

  unregister(appId: string): boolean {
    return unregisterAnchorProvider(appId);
  }

  clear(): void {
    clearAnchorProviders();
  }
}

export const AnchorRegistry = new AnchorRegistryFacade();

export {
  registerAnchorProvider,
  unregisterAnchorProvider,
  getAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  getRegisteredAppIds,
  clearAnchorProviders,
};
