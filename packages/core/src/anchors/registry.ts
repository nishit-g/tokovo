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
import type { AnchorProvider as AnchorProviderFunc, AnchorMap, Rect } from "../types/anchor";
import type { WorldState } from "../types";
export type { AnchorProviderFunc, AnchorMap, Rect };

// =============================================================================
// LEGACY FUNCTION-BASED API (kept for backward compatibility)
// =============================================================================

const globalFuncRegistry: Map<string, AnchorProviderFunc> = new Map();

/**
 * Register anchors from a plugin (function-based API).
 * @deprecated Use registerAnchorProvider() instead
 */
export function registerAnchors(pluginId: string, anchors: AnchorMap): void {
    for (const [anchorId, provider] of Object.entries(anchors)) {
        const fullId = `${pluginId}:${anchorId}`;
        globalFuncRegistry.set(fullId, provider);
        // Also register short form for convenience
        globalFuncRegistry.set(anchorId, provider);
    }
}

/**
 * Get all registered anchors (function-based).
 * @deprecated
 */
export function getRegisteredAnchors(): Map<string, AnchorProviderFunc> {
    return new Map(globalFuncRegistry);
}

/**
 * Clear all registered anchors (for testing).
 */
export function clearAnchors(): void {
    globalFuncRegistry.clear();
    clearAnchorProviders();
}

// =============================================================================
// ANCHOR RESOLUTION (function-based)
// =============================================================================

/**
 * Resolve an anchor ID to a Rect.
 */
export function resolveAnchor(
    anchorId: string,
    world: WorldState,
    deviceId: string
): Rect | null {
    // Try exact match first
    const exactProvider = globalFuncRegistry.get(anchorId);
    if (exactProvider) {
        return exactProvider(world, deviceId);
    }

    // Try wildcard patterns (e.g., "message:msg_001" matches "message:*")
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

/**
 * Check if an anchor is registered.
 */
export function hasAnchor(anchorId: string): boolean {
    if (globalFuncRegistry.has(anchorId)) return true;

    // Check wildcard patterns
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
    /**
     * Register an anchor provider for an app.
     * Delegates to device-camera's registry.
     */
    register(provider: AnchorProvider): void {
        registerAnchorProvider(provider);
        console.log(`[AnchorRegistry] Registered provider for: ${provider.appId}`);
    }

    /**
     * Get anchor provider for an app.
     */
    get(appId: string): AnchorProvider | undefined {
        return getAnchorProvider(appId);
    }

    /**
     * Get all registered app IDs.
     */
    getRegisteredApps(): string[] {
        return getRegisteredAppIds();
    }

    /**
     * Get framing configuration for a specific anchor.
     */
    getFraming(appId: string, anchorId: string): AnchorFraming | undefined {
        const framing = getAnchorFraming(appId, anchorId);
        // Return undefined if it's the default framing
        if (framing && framing.anchorPoint.x === 0.5 && framing.anchorPoint.y === 0.5) {
            return framing;
        }
        return framing;
    }

    /**
     * Check if a provider exists for an app.
     */
    has(appId: string): boolean {
        return !!getAnchorProvider(appId);
    }

    /**
     * Clear all providers (for testing).
     */
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
