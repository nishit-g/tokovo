/**
 * Anchor Provider Registry
 *
 * Central registry for all anchor providers.
 * Renderer registers only OS-level providers. App-specific providers must be
 * provided by their app plugins.
 */

import type {
    AnchorSnapshot,
    AnchorRegistryClass,
    AnchorProviderContext,
} from "@tokovo/core";
import type { WorldState } from "@tokovo/core";

import { NotificationAnchorProvider } from "./notification.js";

export function registerBuiltInAnchorProviders(
    registry: AnchorRegistryClass,
): void {
    // Renderer only provides OS-level anchor providers.
    // App-specific anchor providers must come from the app plugins.
    registry.register(NotificationAnchorProvider);
}

// Best-in-class naming: make it hard to accidentally re-add app providers here.
export const registerOSAnchorProviders = registerBuiltInAnchorProviders;

export const rendererOsAnchorsRuntimeEntry = {
    id: "@tokovo/renderer/os-anchor-providers",
    scope: "renderer" as const,
    register(input: { tokovoRegistries: { plugins: { anchors: AnchorRegistryClass } } }): void {
        registerOSAnchorProviders(input.tokovoRegistries.plugins.anchors);
    },
};

export const tokovoRuntimeManifest = [rendererOsAnchorsRuntimeEntry] as const;

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
