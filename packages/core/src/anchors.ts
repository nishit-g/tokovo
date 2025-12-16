/**
 * Semantic Anchor System
 *
 * Core types for the Semantic Anchor-Driven Camera System.
 *
 * ARCHITECTURE:
 * - Apps expose WHAT can be focused (anchors) and HOW they should be framed.
 * - Director decides WHEN to focus (signals → intents).
 * - Camera math executes (pure transforms).
 *
 * RULES:
 * - Anchors are in device-viewport space
 * - No timestamp — anchors are "what exists right now given (world, layout)"
 * - SemanticAnchorId is purely string-based (open for extension)
 */

import { WorldState } from "./types";
import { LayoutRect } from "./types";

// =============================================================================
// ANCHOR IDENTIFIERS
// =============================================================================

/**
 * Core semantic anchors — always available fallback.
 */
export type CoreSemanticAnchorId = "device";

/**
 * Semantic Anchor ID - Open string type.
 * Apps define their own IDs (e.g. "lastMessage", "callPoster").
 */
export type SemanticAnchorId = CoreSemanticAnchorId | (string & {});

// =============================================================================
// ANCHOR FRAMING (Configuration)
// =============================================================================

/**
 * Framing instruction for how to position anchor in frame.
 * Defined by the App that owns the anchor.
 */
export interface AnchorFraming {
    /** Anchor point within frame: normalized 0-1 (x, y) */
    anchorPoint: { x: number; y: number };

    /** Padding around anchor in pixels */
    paddingPx?: number;

    /** Target fill: how much of frame the anchor should occupy (0-1) */
    targetFill?: number;
}

// =============================================================================
// ANCHOR SNAPSHOT (Runtime State)
// =============================================================================

/**
 * Snapshot of available anchors at the current moment.
 */
export interface AnchorSnapshot {
    /** Available anchors mapped to their rects */
    anchors: Partial<Record<SemanticAnchorId, LayoutRect & { metadata?: { sticky?: boolean } }>>;

    /** Device this snapshot belongs to */
    deviceId: string;

    /** App providing these anchors */
    appId: string;
}

// =============================================================================
// ANCHOR PROVIDER INTERFACE
// =============================================================================

/**
 * Interface that apps implement to expose semantic anchors.
 */
export interface AnchorProvider {
    /** App ID this provider handles */
    appId: string;

    /** 
     * Static framing configuration for this app's anchors.
     * The camera engine uses this to decide how to frame the rects.
     */
    framing: Record<SemanticAnchorId, AnchorFraming>;

    /**
     * Extract anchors from current world/layout state.
     */
    getAnchors(
        world: WorldState,
        layout: unknown, // LayoutState from renderer
        deviceId: string
    ): AnchorSnapshot;
}

// =============================================================================
// ANCHOR REGISTRY
// =============================================================================

/**
 * Registry of anchor providers by app ID.
 */
export class AnchorRegistryClass {
    private providers = new Map<string, AnchorProvider>();

    /** Register an anchor provider for an app */
    register(provider: AnchorProvider): void {
        this.providers.set(provider.appId, provider);
    }

    /** Get provider for an app ID */
    get(appId: string): AnchorProvider | undefined {
        return this.providers.get(appId);
    }

    /** Get framing config for a specific anchor across all providers */
    getFraming(appId: string, anchorId: SemanticAnchorId): AnchorFraming | undefined {
        const provider = this.providers.get(appId);
        return provider?.framing[anchorId];
    }

    /** Get all registered app IDs */
    getRegisteredApps(): string[] {
        return Array.from(this.providers.keys());
    }
}

/** Global anchor registry */
export const AnchorRegistry = new AnchorRegistryClass();

// =============================================================================
// HYSTERESIS (Anchor Stability)
// =============================================================================

export const ANCHOR_STABILITY_FRAMES = 3;

export interface AnchorStabilityState {
    currentAnchor: SemanticAnchorId | null;
    candidateAnchor: SemanticAnchorId | null;
    stableFrames: number;
    lastSwitchFrame: number;
}

export const DEFAULT_ANCHOR_STABILITY: AnchorStabilityState = {
    currentAnchor: null,
    candidateAnchor: null,
    stableFrames: 0,
    lastSwitchFrame: 0,
};

// =============================================================================
// FALLBACK CHAINS (Deprecated/Legacy support if needed, but intended to be removed)
// =============================================================================

/**
 * Fallback chains for anchor resolution.
 * If primary anchor is missing, try next in chain until found.
 * "device" is always the final fallback (full device frame).
 */
export const FALLBACK_CHAINS: Partial<
    Record<SemanticAnchorId, SemanticAnchorId[]>
> = {
    // We keep this temporarily generic or empty, as apps should handle their own fallback logic internally
    // or we move this to the app providers too.
    // For now, retaining core logic to avoid breaking everything.
};

export function resolveAnchorWithFallback(
    targetAnchor: SemanticAnchorId,
    anchors: AnchorSnapshot["anchors"]
): { anchor: SemanticAnchorId; rect: LayoutRect & { metadata?: { sticky?: boolean } } } | null {
    // Try primary anchor first
    if (anchors[targetAnchor]) {
        return { anchor: targetAnchor, rect: anchors[targetAnchor]! };
    }

    // Try fallback chain
    const chain = FALLBACK_CHAINS[targetAnchor];
    if (chain) {
        for (const fallback of chain) {
            if (anchors[fallback]) {
                return { anchor: fallback, rect: anchors[fallback]! };
            }
        }
    }

    // Final fallback: device
    if (anchors.device) {
        return { anchor: "device", rect: anchors.device };
    }

    return null;
}
