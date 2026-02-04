/**
 * Anchor Provider Registry
 *
 * Central registry for all anchor providers.
 * Providers self-register at module load time.
 */

import type {
    AnchorSnapshot,
    AnchorRegistryClass,
    AnchorProviderContext,
} from "@tokovo/core";
import type { WorldState } from "@tokovo/core";

import { NotificationAnchorProvider } from "./notification";

export function registerBuiltInAnchorProviders(
    registry: AnchorRegistryClass,
): void {
    // Apps self-register when imported
    // Only Notification provider is left here (for now)
    registry.register(NotificationAnchorProvider);
}

// =============================================================================
// ANCHOR EXTRACTION
// =============================================================================

/**
 * Get anchors for a specific app from the registry.
 *
 * @param appId - App to get anchors for
 * @param world - Current world state
 * @param layout - Computed layout
 * @param deviceId - Device ID
 * @returns Anchor snapshot or null if no provider registered
 */
export function getAnchorsForApp(
    registry: AnchorRegistryClass,
    appId: string,
    world: WorldState,
    layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
): AnchorSnapshot | null {
    const provider = registry.get(appId);
    if (!provider) return null;
    return provider.getAnchors(world, layout, deviceId, context);
}

/**
 * Get all anchors across all registered providers.
 * Useful for multi-app scenarios.
 */
export function getAllAnchors(
    registry: AnchorRegistryClass,
    world: WorldState,
    layout: unknown,
    deviceId: string,
    context?: AnchorProviderContext,
): Map<string, AnchorSnapshot> {
    const results = new Map<string, AnchorSnapshot>();

    for (const appId of registry.getRegisteredApps()) {
        const provider = registry.get(appId);
        if (provider) {
            results.set(appId, provider.getAnchors(world, layout, deviceId, context));
        }
    }

    return results;
}
