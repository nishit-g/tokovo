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
  AnchorProvider,
  AnchorRegistryClass,
  AnchorSnapshot,
  AnchorFraming,
  AnchorProviderContext,
  Rect,
} from "@tokovo/core";

// Re-export registry class/factory from core
import { createAnchorRegistry, DeviceAnchorProvider } from "@tokovo/core";
export { createAnchorRegistry };
export type { AnchorRegistryClass };

// Re-export types
export type { AnchorProvider, AnchorSnapshot, AnchorFraming, Rect } from "@tokovo/core";

export { DEFAULT_FRAMING, EMPTY_SNAPSHOT } from "@tokovo/core";

const defaultRegistry = createAnchorRegistry();
// Official device-owned anchors must always be present (device/app/keyboard/...).
defaultRegistry.register(DeviceAnchorProvider);

export function registerAnchorProvider(provider: AnchorProvider): void {
  defaultRegistry.register(provider);
}

export function unregisterAnchorProvider(appId: string): boolean {
  return defaultRegistry.unregister(appId);
}

export function getAnchorProvider(appId: string): AnchorProvider | undefined {
  return defaultRegistry.get(appId);
}

export function hasAnchorProvider(appId: string): boolean {
  return defaultRegistry.has(appId);
}

export function getRegisteredAppIds(): string[] {
  return defaultRegistry.getRegisteredApps();
}

export function getProviderCount(): number {
  return defaultRegistry.getProviderCount();
}

export function clearAnchorProviders(): void {
  defaultRegistry.clear();
  // Re-register device-owned anchors after clear (tests rely on clear()).
  defaultRegistry.register(DeviceAnchorProvider);
}

type WorldState = import("@tokovo/core").WorldState;

export function getAnchorsForApp(
  appId: string,
  world: WorldState,
  layout: unknown,
  deviceId: string,
  context?: AnchorProviderContext,
): AnchorSnapshot;
export function getAnchorsForApp(
  registry: AnchorRegistryClass,
  appId: string,
  world: WorldState,
  layout: unknown,
  deviceId: string,
  context?: AnchorProviderContext,
): AnchorSnapshot;
export function getAnchorsForApp(
  registryOrAppId: AnchorRegistryClass | string,
  appIdOrWorld: string | WorldState,
  worldOrLayout: WorldState | unknown,
  layoutOrDeviceId: unknown,
  deviceIdOrContext?: string | AnchorProviderContext,
  context?: AnchorProviderContext,
): AnchorSnapshot {
  if (typeof registryOrAppId === "string") {
    return defaultRegistry.getAnchorsForApp(
      registryOrAppId,
      appIdOrWorld as WorldState,
      worldOrLayout,
      layoutOrDeviceId as string,
      deviceIdOrContext as AnchorProviderContext | undefined,
    );
  }

  return registryOrAppId.getAnchorsForApp(
    appIdOrWorld as string,
    worldOrLayout as WorldState,
    layoutOrDeviceId,
    deviceIdOrContext as string,
    context,
  );
}

export function getAnchorFraming(
  appId: string,
  anchorId: string,
): AnchorFraming;
export function getAnchorFraming(
  registry: AnchorRegistryClass,
  appId: string,
  anchorId: string,
): AnchorFraming;
export function getAnchorFraming(
  registryOrAppId: AnchorRegistryClass | string,
  appIdOrAnchorId: string,
  anchorId?: string,
): AnchorFraming {
  if (typeof registryOrAppId === "string") {
    return defaultRegistry.getFraming(registryOrAppId, appIdOrAnchorId);
  }
  return registryOrAppId.getFraming(appIdOrAnchorId, anchorId ?? "");
}

export function resolveAnchor(
  anchorId: string,
  world: WorldState,
  deviceId: string,
): Rect | null {
  return defaultRegistry.resolveAnchor(anchorId, world, deviceId);
}

export function hasAnchor(anchorId: string): boolean {
  return defaultRegistry.hasAnchor(anchorId);
}
