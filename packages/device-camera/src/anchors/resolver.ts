/**
 * Anchor Resolver - Resolves semantic anchors to rects with fallbacks
 * 
 * @module device-camera/anchors/resolver
 */

import { Rect, ResolvedAnchor, AnchorSnapshot, AnchorFraming } from "./types";
import { getAnchorFraming } from "./registry";

// =============================================================================
// FALLBACK CHAINS
// =============================================================================

/**
 * Fallback chains for common anchors.
 * If the primary anchor isn't found, try these in order.
 */
const FALLBACK_CHAINS: Record<string, string[]> = {
    lastMessage: ["lastMessage", "content", "app", "device"],
    inputArea: ["inputArea", "content", "app", "device"],
    typingIndicator: ["typingIndicator", "inputArea", "content", "app"],
    header: ["header", "app", "device"],
    content: ["content", "app", "device"],
    app: ["app", "device"],
    notification: ["notification", "header", "app"],
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Resolve an anchor name to a rect, with fallback handling.
 * 
 * @param anchorName - Semantic anchor name
 * @param anchors - Available anchors from snapshot
 * @param viewport - Viewport dimensions for device fallback
 * @returns ResolvedAnchor with rect and fallback info
 */
export function resolveAnchorWithFallback(
    anchorName: string,
    anchors: Record<string, Rect>,
    viewport?: { width: number; height: number }
): ResolvedAnchor {
    // Direct match
    if (anchors[anchorName]) {
        return {
            rect: anchors[anchorName],
            anchor: anchorName,
            isFallback: false,
        };
    }

    // Try fallback chain
    const chain = FALLBACK_CHAINS[anchorName] || [anchorName, "app", "device"];
    for (const fallback of chain) {
        if (anchors[fallback]) {
            return {
                rect: anchors[fallback],
                anchor: fallback,
                isFallback: true,
            };
        }
    }

    // Ultimate fallback: device rect or viewport
    if (viewport) {
        return {
            rect: { x: 0, y: 0, width: viewport.width, height: viewport.height },
            anchor: "device",
            isFallback: true,
        };
    }

    // Can't resolve - return center of unknown viewport
    return {
        rect: { x: 0, y: 0, width: 100, height: 100 },
        anchor: "unknown",
        isFallback: true,
    };
}

/**
 * Convert a resolved anchor rect to camera transform origin (0-1 normalized).
 * 
 * @param resolved - The resolved anchor
 * @param framing - Framing configuration
 * @param viewport - Viewport dimensions
 */
export function anchorToOrigin(
    resolved: ResolvedAnchor,
    framing: AnchorFraming,
    viewport: { width: number; height: number }
): { originX: number; originY: number } {
    const { rect } = resolved;
    const { anchorPoint } = framing;

    // Calculate point within rect based on anchor point
    const pointX = rect.x + rect.width * anchorPoint.x;
    const pointY = rect.y + rect.height * anchorPoint.y;

    // Normalize to viewport
    const originX = pointX / viewport.width;
    const originY = pointY / viewport.height;

    // Clamp to 0-1
    return {
        originX: Math.max(0, Math.min(1, originX)),
        originY: Math.max(0, Math.min(1, originY)),
    };
}

/**
 * Calculate scale needed to fill viewport to target fill percentage.
 */
export function calculateFillScale(
    rect: Rect,
    viewport: { width: number; height: number },
    targetFill: number = 0.6
): number {
    // How much of viewport does rect currently fill?
    const widthFill = rect.width / viewport.width;
    const heightFill = rect.height / viewport.height;
    const currentFill = Math.max(widthFill, heightFill);

    // Scale to achieve target fill
    if (currentFill < 0.01) return 1; // Avoid division by zero

    const scale = targetFill / currentFill;

    // Clamp to reasonable range
    return Math.max(1, Math.min(2.5, scale));
}

/**
 * Full anchor resolution: name → transform origin + suggested scale.
 */
export function resolveAnchorFully(
    anchorName: string,
    snapshot: AnchorSnapshot,
    appId: string,
    viewport: { width: number; height: number }
): {
    originX: number;
    originY: number;
    suggestedScale: number;
    isFallback: boolean;
    resolvedAnchor: string;
} {
    const resolved = resolveAnchorWithFallback(anchorName, snapshot.anchors, viewport);
    const framing = getAnchorFraming(appId, anchorName);
    const origin = anchorToOrigin(resolved, framing, viewport);
    const suggestedScale = calculateFillScale(resolved.rect, viewport, framing.targetFill);

    return {
        ...origin,
        suggestedScale,
        isFallback: resolved.isFallback,
        resolvedAnchor: resolved.anchor,
    };
}
