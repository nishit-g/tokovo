/**
 * Anchor Provider Registry
 *
 * Central registry for all anchor providers.
 * Providers self-register at module load time.
 */

import {
    AnchorProvider,
    AnchorSnapshot,
    AnchorRegistry,
} from "@tokovo/core";
import type { WorldState } from "@tokovo/core";

import { WhatsAppAnchorProvider } from "./whatsapp";
import { PhoneAnchorProvider } from "./phone";
import { NotificationAnchorProvider } from "./notification";

// =============================================================================
// AUTO-REGISTER PROVIDERS
// =============================================================================

/**
 * Register all built-in anchor providers.
 * Call this once at app startup.
 */
export function registerBuiltInAnchorProviders(): void {
    AnchorRegistry.register(WhatsAppAnchorProvider);
    AnchorRegistry.register(PhoneAnchorProvider);
    AnchorRegistry.register(NotificationAnchorProvider);
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
    appId: string,
    world: WorldState,
    layout: unknown,
    deviceId: string
): AnchorSnapshot | null {
    const provider = AnchorRegistry.get(appId);
    if (!provider) return null;
    return provider.getAnchors(world, layout, deviceId);
}

/**
 * Get all anchors across all registered providers.
 * Useful for multi-app scenarios.
 */
export function getAllAnchors(
    world: WorldState,
    layout: unknown,
    deviceId: string
): Map<string, AnchorSnapshot> {
    const results = new Map<string, AnchorSnapshot>();

    for (const appId of AnchorRegistry.getRegisteredApps()) {
        const provider = AnchorRegistry.get(appId);
        if (provider) {
            results.set(appId, provider.getAnchors(world, layout, deviceId));
        }
    }

    return results;
}
