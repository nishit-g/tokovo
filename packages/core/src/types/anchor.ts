/**
 * Anchor Types - Types for the anchor system
 * 
 * @description Anchors allow camera to focus on semantic content (e.g., "lastMessage")
 * rather than pixel coordinates. Each plugin registers its own anchors.
 * 
 * @see docs-v2/DSL_REVAMP.md#anchors-system
 */

import type { WorldState } from "../types";

// =============================================================================
// RECT
// =============================================================================

/**
 * Bounding rectangle in device coordinates.
 */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// =============================================================================
// ANCHOR PROVIDER
// =============================================================================

/**
 * Function that resolves an anchor to a Rect at runtime.
 * 
 * @param world - Current world state
 * @param deviceId - Target device ID
 * @param param - Optional parameter (for wildcard anchors like "message:*")
 * @returns Bounding rect of the anchor, or null if not found
 */
export type AnchorProvider = (
    world: WorldState,
    deviceId: string,
    param?: string
) => Rect | null;

// =============================================================================
// ANCHOR REGISTRY
// =============================================================================

/**
 * Map of anchor IDs to their providers.
 * 
 * Supports wildcard patterns like "message:*" where * matches any suffix.
 */
export type AnchorRegistry = Record<string, AnchorProvider>;

// =============================================================================
// SEMANTIC ANCHOR IDS
// =============================================================================

/**
 * Common semantic anchor IDs provided by plugins.
 */
export type SemanticAnchorId =
    // WhatsApp
    | "lastMessage"
    | "inputArea"
    | "header"
    | "avatar"
    | `message:${string}`
    // Twitter
    | "lastTweet"
    | "compose"
    // Generic
    | "notification"
    | "keyboard";
