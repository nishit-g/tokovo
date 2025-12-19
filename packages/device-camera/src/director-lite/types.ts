/**
 * DirectorLite Types
 * 
 * Types for the automatic camera system.
 * 
 * @module device-camera/director-lite
 */

// =============================================================================
// SIGNALS
// =============================================================================

export type DirectorSignalType =
    | "TypingStarted"
    | "TypingStopped"
    | "NewMessage"
    | "MessageRead"
    | "CallIncoming"
    | "CallConnected"
    | "CallEnded"
    | "NotificationShown";

export interface DirectorSignal {
    type: DirectorSignalType;
    at: number;
    deviceId: string;
    appId: string;
    conversationId?: string;
    messageId?: string;
}

// =============================================================================
// LAYOUT MODEL
// =============================================================================

export interface LayoutRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface DirectorLayoutModel {
    messageRects: Record<string, LayoutRect>;
    inputAreaRect?: LayoutRect;
    lastMessageRect?: LayoutRect;
    viewport: { width: number; height: number };
}

// =============================================================================
// EFFECTS
// =============================================================================

export interface DerivedCameraEffect {
    type: string;
    category: "framing" | "shake";
    priority: number;
    progress: number;
    target?: LayoutRect;
    anchor?: string;
    preset?: string;
    scale?: number;
    intensity?: number;
    seed?: number;
}

// =============================================================================
// OUTPUT
// =============================================================================

export interface DirectorDebug {
    signalsInWindow: number;
    matchedRules: number;
    winningFraming?: string;
    skippedCooldown?: number;
}

export interface DirectorOutput {
    effects: DerivedCameraEffect[];
    skipped?: string;
    debug?: DirectorDebug;
}
