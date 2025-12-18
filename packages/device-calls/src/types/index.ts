/**
 * Call State Types
 * 
 * Canonical types for call state management.
 */

// =============================================================================
// CALL STATE
// =============================================================================

export type CallStatus =
    | "idle"
    | "incoming"
    | "active"
    | "ended"
    | "declined"
    | "missed";

export type CallType = "voice" | "video" | "facetime";

export type CallDisplayMode = "fullscreen" | "pip" | "banner" | "dynamicIsland";

export interface CallState {
    status: CallStatus;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo: boolean;
    callType: CallType;
    displayMode: CallDisplayMode;
    callerMetadata?: Record<string, any>;

    // Timing
    startedAt?: number;
    answeredAt?: number;
    endedAt?: number;

    // Controls
    isMuted: boolean;
    isSpeakerOn: boolean;
    isOnHold: boolean;
}

// =============================================================================
// EVENT TYPES
// =============================================================================

export type CallEventType =
    | "INCOMING"
    | "ANSWER"
    | "DECLINE"
    | "END"
    | "TOGGLE_MUTE"
    | "TOGGLE_SPEAKER"
    | "TOGGLE_HOLD";

// =============================================================================
// DEFAULT STATE
// =============================================================================

export const DEFAULT_CALL_STATE: CallState | null = null;
