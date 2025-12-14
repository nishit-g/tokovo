/**
 * DirectorLite Types
 *
 * Minimal types for the camera director system.
 * No framework, no configurability - just what ships.
 */

// =============================================================================
// LAYOUT
// =============================================================================

export interface LayoutRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

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

export interface DerivedCameraEffect {
    type: "PushIn" | "ZoomToRect" | "PullBack" | "MicroShake";
    category: EffectCategory;
    priority: number;
    progress: number;
    // Framing effects
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


