/**
 * Anchor Registry - Global registry for semantic anchors
 * 
 * @description Plugins register their anchors here. The camera system
 * uses the registry to resolve anchor IDs to Rects.
 * 
 * @see docs-v2/DSL_REVAMP.md#anchors-system
 */

import type { AnchorProvider as AnchorProviderFunc, AnchorMap, Rect } from "../types/anchor";
import type { WorldState } from "../types";

// =============================================================================
// TYPES FOR CLASS-BASED API (used by renderer)
// =============================================================================

export interface AnchorFraming {
    anchorPoint: { x: number; y: number };
    paddingPx?: number;
    targetFill?: number;
}

export interface AnchorSnapshot {
    anchors: Record<string, { x: number; y: number; width: number; height: number }>;
    deviceId: string;
    appId: string;
}

export interface AnchorProvider {
    appId: string;
    framing: Record<string, AnchorFraming>;
    getAnchors(world: WorldState, layout: unknown, deviceId: string): AnchorSnapshot;
}

// =============================================================================
// GLOBAL REGISTRY
// =============================================================================

const globalProviderRegistry: Map<string, AnchorProvider> = new Map();
const globalFuncRegistry: Map<string, AnchorProviderFunc> = new Map();

/**
 * Register anchors from a plugin (function-based API).
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
 */
export function getRegisteredAnchors(): Map<string, AnchorProviderFunc> {
    return new Map(globalFuncRegistry);
}

/**
 * Clear all registered anchors (for testing).
 */
export function clearAnchors(): void {
    globalProviderRegistry.clear();
    globalFuncRegistry.clear();
}

// =============================================================================
// ANCHOR RESOLUTION
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
// CLASS-BASED REGISTRY (for renderer compatibility)
// =============================================================================

class AnchorRegistryClass {
    register(provider: AnchorProvider): void {
        globalProviderRegistry.set(provider.appId, provider);
        console.log(`[AnchorRegistry] Registered provider for: ${provider.appId}`);
    }

    get(appId: string): AnchorProvider | undefined {
        return globalProviderRegistry.get(appId);
    }

    getRegisteredApps(): string[] {
        return Array.from(globalProviderRegistry.keys());
    }

    getFraming(appId: string, anchorId: string): AnchorFraming | undefined {
        const provider = globalProviderRegistry.get(appId);
        return provider?.framing[anchorId];
    }

    has(appId: string): boolean {
        return globalProviderRegistry.has(appId);
    }

    clear(): void {
        globalProviderRegistry.clear();
    }
}

export const AnchorRegistry = new AnchorRegistryClass();

