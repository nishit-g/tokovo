/**
 * DirectorLite Types
 *
 * Minimal types for the camera director system.
 * No framework, no configurability - just what ships.
 */

// =============================================================================
// LAYOUT
// =============================================================================

import type { LayoutRect } from "../types";
export type { LayoutRect };
// Trigger rebuild

export interface DirectorLayoutModel {
    deviceId: string;
    appId: string;
    conversationId?: string;
    messageRects: Record<string, LayoutRect>;
    inputAreaRect: LayoutRect; // Always available
    typingIndicatorRect?: LayoutRect; // Only when typing
    lastMessageRect?: LayoutRect;
}

// =============================================================================
// SIGNALS
// =============================================================================

export type SignalType =
    | "TypingStarted"
    | "TypingEnded"
    | "NewMessage"
    | "MessageRead"
    | "MessageDeleted"
    | "CallIncoming";

export interface DirectorSignal {
    type: SignalType;
    deviceId: string;
    appId: string;
    conversationId?: string;
    at: number;
    messageId?: string;
    from?: string;
}

// =============================================================================
// EFFECTS
// =============================================================================

export type EffectCategory = "framing" | "shake";

/**
 * Effect types:
 * - PushIn, ZoomToRect, PullBack: Legacy pixel-based (DEPRECATED)
 * - FocusAnchor: NEW semantic anchor-based (PREFERRED)
 * - MicroShake: Camera shake effect
 */
export interface DerivedCameraEffect {
    type: "PushIn" | "ZoomToRect" | "PullBack" | "MicroShake" | "FocusAnchor";
    category: EffectCategory;
    priority: number;
    progress: number;

    // === NEW: Anchor-based framing (PREFERRED) ===
    /** Semantic anchor to focus on */
    anchor?: string;  // SemanticAnchorId
    /** Shot preset (dramatic, subtle, snap, etc.) */
    preset?: string;  // ShotPresetId

    // === Legacy: Pixel-based framing (DEPRECATED) ===
    /** Direct rect target — prefer using `anchor` instead */
    target?: LayoutRect;
    scale?: number;

    // Shake effects
    intensity?: number;
    seed?: number;
}

// =============================================================================
// OUTPUT
// =============================================================================

export interface DirectorOutput {
    effects: DerivedCameraEffect[];
    debug?: DirectorDebug;
    skipped?: "manual-camera-active";
}

export interface DirectorDebug {
    signalsInWindow: number;
    matchedRules: number;
    winningFraming?: string;
    skippedCooldown: number;
}

// =============================================================================
// CAMERA INTENTS (re-exported from behavior-registry)
// =============================================================================

// CameraIntent and AppBehavior are defined in behavior-registry.ts
// to avoid circular dependencies and duplicate exports.
// Re-export for backwards compatibility:
export type { CameraIntent, AppBehavior } from "../behavior-registry";


