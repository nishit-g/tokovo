/**
 * Anchor Registry - Global registry for semantic anchors
 * 
 * @description Plugins register their anchors here. The camera system
 * uses the registry to resolve anchor IDs to Rects.
 * 
 * @see docs-v2/DSL_REVAMP.md#anchors-system
 */

import type { AnchorProvider, AnchorRegistry, Rect } from "../types/anchor";
import type { WorldState } from "../types";

// =============================================================================
// GLOBAL REGISTRY
// =============================================================================

const globalRegistry: Map<string, AnchorProvider> = new Map();

/**
 * Register anchors from a plugin.
 */
export function registerAnchors(pluginId: string, anchors: AnchorRegistry): void {
    for (const [anchorId, provider] of Object.entries(anchors)) {
        const fullId = `${pluginId}:${anchorId}`;
        globalRegistry.set(fullId, provider);
        // Also register short form for convenience
        globalRegistry.set(anchorId, provider);
    }
}

/**
 * Get all registered anchors.
 */
export function getRegisteredAnchors(): Map<string, AnchorProvider> {
    return new Map(globalRegistry);
}

/**
 * Clear all registered anchors (for testing).
 */
export function clearAnchors(): void {
    globalRegistry.clear();
}

// =============================================================================
// ANCHOR RESOLUTION
// =============================================================================

/**
 * Resolve an anchor ID to a Rect.
 * 
 * Supports:
 * - Exact match: "lastMessage"
 * - Plugin-qualified: "app_whatsapp:lastMessage"
 * - Wildcard patterns: "message:msg_001" matches "message:*"
 */
export function resolveAnchor(
    anchorId: string,
    world: WorldState,
    deviceId: string
): Rect | null {
    // Try exact match first
    const exactProvider = globalRegistry.get(anchorId);
    if (exactProvider) {
        return exactProvider(world, deviceId);
    }

    // Try wildcard patterns (e.g., "message:msg_001" matches "message:*")
    for (const [pattern, provider] of globalRegistry.entries()) {
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
    if (globalRegistry.has(anchorId)) return true;

    // Check wildcard patterns
    for (const pattern of globalRegistry.keys()) {
        if (pattern.endsWith(":*")) {
            const prefix = pattern.slice(0, -2);
            if (anchorId.startsWith(prefix + ":")) {
                return true;
            }
        }
    }

    return false;
}
