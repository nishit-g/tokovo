/**
 * Call Event Payloads
 * 
 * Typed payloads for call events.
 */

// =============================================================================
// INCOMING CALL
// =============================================================================

export interface IncomingCallPayload {
    /** Unique caller ID */
    callerId: string;
    /** Display name */
    callerName: string;
    /** Avatar URL */
    callerAvatar?: string;
    /** Is video call */
    isVideo?: boolean;
    /** Call type */
    callType?: "voice" | "video" | "facetime";
    /** Initial display mode */
    displayMode?: "fullscreen" | "banner";
    /** Additional metadata */
    callerMetadata?: Record<string, any>;
}

// =============================================================================
// OTHER PAYLOADS
// =============================================================================

export interface AnswerCallPayload {
    /** Switch to video on answer */
    asVideo?: boolean;
}

export interface EndCallPayload {
    /** Reason for ending */
    reason?: "user" | "remote" | "error";
}

// =============================================================================
// ALL PAYLOADS
// =============================================================================

export interface CallPayloads {
    INCOMING: IncomingCallPayload;
    ANSWER: AnswerCallPayload | undefined;
    DECLINE: undefined;
    END: EndCallPayload | undefined;
    TOGGLE_MUTE: undefined;
    TOGGLE_SPEAKER: undefined;
    TOGGLE_HOLD: undefined;
}
