/**
 * Anchor Registry - App-specific anchor providers
 * 
 * Apps register their anchor providers here. The camera system
 * uses these to resolve semantic anchor names to actual rects.
 * 
 * @module device-camera/anchors/registry
 */

import {
    AnchorProvider,
    AnchorSnapshot,
    AnchorFraming,
    EMPTY_SNAPSHOT,
    DEFAULT_FRAMING,
} from "./types";

// =============================================================================
// REGISTRY STATE
// =============================================================================

/** Map of appId → AnchorProvider */
const providerRegistry = new Map<string, AnchorProvider>();

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Register an anchor provider for an app.
 * 
 * @example
 * ```typescript
 * registerAnchorProvider({
 *     appId: "app_whatsapp",
 *     framing: {
 *         lastMessage: { anchorPoint: { x: 0.5, y: 0.5 }, targetFill: 0.6 },
 *         inputArea: { anchorPoint: { x: 0.5, y: 0.8 }, targetFill: 0.9 },
 *     },
 *     getAnchors(world, layout, deviceId) {
 *         // Extract rects from layout
 *         return { anchors: {...}, deviceId, appId: "app_whatsapp" };
 *     }
 * });
 * ```
 */
export function registerAnchorProvider(provider: AnchorProvider): void {
    providerRegistry.set(provider.appId, provider);
}

/**
 * Get anchor provider for an app.
 */
export function getAnchorProvider(appId: string): AnchorProvider | undefined {
    return providerRegistry.get(appId);
}

/**
 * Check if an anchor provider is registered for an app.
 */
export function hasAnchorProvider(appId: string): boolean {
    return providerRegistry.has(appId);
}

/**
 * Get anchors for an app using its registered provider.
 */
export function getAnchorsForApp(
    appId: string,
    world: unknown,
    layout: unknown,
    deviceId: string
): AnchorSnapshot {
    const provider = providerRegistry.get(appId);
    if (!provider) {
        return EMPTY_SNAPSHOT;
    }
    return provider.getAnchors(world, layout, deviceId);
}

/**
 * Get framing configuration for a specific anchor in an app.
 */
export function getAnchorFraming(
    appId: string,
    anchorName: string
): AnchorFraming {
    const provider = providerRegistry.get(appId);
    if (!provider?.framing[anchorName]) {
        return DEFAULT_FRAMING;
    }
    return provider.framing[anchorName];
}

/**
 * Get all registered app IDs.
 */
export function getRegisteredAppIds(): string[] {
    return Array.from(providerRegistry.keys());
}

/**
 * Clear all registered providers (for testing).
 */
export function clearAnchorProviders(): void {
    providerRegistry.clear();
}

/**
 * Get the count of registered providers.
 */
export function getProviderCount(): number {
    return providerRegistry.size;
}
