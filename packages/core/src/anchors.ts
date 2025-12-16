/**
 * Semantic Anchor System
 *
 * Core types for the Semantic Anchor-Driven Camera System.
 *
 * ARCHITECTURE:
 * - Apps expose WHAT can be focused (anchors)
 * - Director decides WHEN to focus (signals → intents)
 * - Presets define HOW it looks (scale, easing, shake)
 * - Camera math executes (pure transforms)
 *
 * RULES:
 * - Anchors are in device-viewport space
 * - No timestamp — anchors are "what exists right now given (world, layout)"
 * - SemanticAnchorId is extensible for plugins
 * - Hysteresis: 3 frames stability required before switching
 */

import { WorldState } from "./types";
import { LayoutRect } from "./types";

// Re-export LayoutRect for convenience
// LayoutRect is imported from types.ts

// =============================================================================
// ANCHOR IDS
// =============================================================================

/**
 * Core semantic anchors — type-safe, always available
 */
export type CoreSemanticAnchorId =
    | "lastMessage"
    | "typingIndicator"
    | "inputArea"
    | "device"; // Always available fallback

/**
 * Extensible anchor ID — plugins can add custom anchors as strings
 *
 * Pattern: Core anchors are type-safe, extensions are strings.
 * This avoids core churn when adding new app-specific anchors.
 */
export type SemanticAnchorId = CoreSemanticAnchorId | (string & {});

// =============================================================================
// APP-SPECIFIC ANCHOR TYPES (for type-safety in known apps)
// =============================================================================

/** WhatsApp-specific anchors */
export type WhatsAppAnchorId =
    | CoreSemanticAnchorId
    | "reactionBubble"
    | "voiceNote"
    | "imagePreview";

/** Phone app anchors */
export type PhoneAnchorId =
    | CoreSemanticAnchorId
    | "callPoster"
    | "acceptButton"
    | "declineButton"
    | "callTimer"
    | "muteButton";

/** Notification anchors */
export type NotificationAnchorId =
    | CoreSemanticAnchorId
    | "headsUpNotification"
    | "dynamicIsland"
    | "notificationStack";

/** Twitter/X anchors */
export type TwitterAnchorId =
    | CoreSemanticAnchorId
    | "focusedTweet"
    | "replyBox"
    | "profileCard"
    | "likeButton";

// =============================================================================
// ANCHOR SNAPSHOT
// =============================================================================

/**
 * Snapshot of available anchors at the current moment.
 *
 * IMPORTANT: No timestamp! Anchors are computed from (world, layout) and
 * represent "what exists right now". The camera evaluation owns frame time.
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
 *
 * Apps are the ONLY source of truth for what can be focused.
 * Camera never understands UI semantics — just rectangles.
 *
 * @example
 * ```typescript
 * const WhatsAppAnchorProvider: AnchorProvider = {
 *   appId: "app_whatsapp",
 *   getAnchors(world, layout) {
 *     return {
 *       anchors: { lastMessage: rect, typingIndicator: rect },
 *       deviceId: "phone",
 *       appId: "app_whatsapp"
 *     };
 *   }
 * };
 * ```
 */
export interface AnchorProvider {
    /** App ID this provider handles */
    appId: string;

    /**
     * Extract anchors from current world/layout state.
     *
     * @param world - Current world state
     * @param layout - Computed layout state
     * @param deviceId - Device being rendered
     * @returns Snapshot of available anchors
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
 * Apps self-register their providers at module load time.
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

    /** Check if a provider exists */
    has(appId: string): boolean {
        return this.providers.has(appId);
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

/**
 * Number of frames an anchor must be stable before switching to it.
 * Prevents camera jitter from volatile anchors (typing dots, reactions).
 */
export const ANCHOR_STABILITY_FRAMES = 3;

/**
 * State for tracking anchor stability.
 * Used by intent resolution to implement hysteresis.
 */
export interface AnchorStabilityState {
    /** Currently focused anchor (after hysteresis) */
    currentAnchor: SemanticAnchorId | null;

    /** Candidate anchor being evaluated */
    candidateAnchor: SemanticAnchorId | null;

    /** How many frames candidate has been stable */
    stableFrames: number;

    /** Frame when we last switched targets */
    lastSwitchFrame: number;
}

/** Default stability state */
export const DEFAULT_ANCHOR_STABILITY: AnchorStabilityState = {
    currentAnchor: null,
    candidateAnchor: null,
    stableFrames: 0,
    lastSwitchFrame: 0,
};

// =============================================================================
// FALLBACK CHAINS
// =============================================================================

/**
 * Fallback chains for anchor resolution.
 * If primary anchor is missing, try next in chain until found.
 * "device" is always the final fallback (full device frame).
 */
export const FALLBACK_CHAINS: Partial<
    Record<SemanticAnchorId, SemanticAnchorId[]>
> = {
    // Chat anchors
    typingIndicator: ["inputArea", "lastMessage", "device"],
    lastMessage: ["inputArea", "device"],
    reactionBubble: ["lastMessage", "device"],
    inputArea: ["lastMessage", "device"],

    // Notification anchors
    headsUpNotification: ["dynamicIsland", "device"],
    dynamicIsland: ["device"],

    // Call anchors
    callPoster: ["device"],
    acceptButton: ["callPoster", "device"],
    declineButton: ["callPoster", "device"],

    // Feed anchors
    focusedTweet: ["device"],
    replyBox: ["focusedTweet", "device"],
};

/**
 * Resolve an anchor with fallback chain.
 *
 * @param targetAnchor - Primary anchor to find
 * @param anchors - Available anchors
 * @returns Resolved anchor ID and rect, or null if all fallbacks exhausted
 */
export function resolveAnchorWithFallback(
    targetAnchor: SemanticAnchorId,
    anchors: AnchorSnapshot["anchors"]
): { anchor: SemanticAnchorId; rect: LayoutRect } | null {
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
