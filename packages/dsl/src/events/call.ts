/**
 * Phone Call DSL Events
 * 
 * Event factories for phone call simulation.
 * Supports incoming, outgoing, answer, decline, end, and call controls.
 */

import type { CallType, CallDisplayMode, CallerMetadata } from "@tokovo/core";

// =============================================================================
// CALL EVENT TYPES
// =============================================================================

export interface CallIncomingEvent {
    at: number;
    kind: "CALL";
    type: "INCOMING";
    deviceId?: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;
    callType?: CallType;
    displayMode?: CallDisplayMode;
    callerMetadata?: CallerMetadata;
}

export interface CallAnswerEvent {
    at: number;
    kind: "CALL";
    type: "ANSWER";
    deviceId?: string;
}

export interface CallDeclineEvent {
    at: number;
    kind: "CALL";
    type: "DECLINE";
    deviceId?: string;
}

export interface CallEndEvent {
    at: number;
    kind: "CALL";
    type: "END";
    deviceId?: string;
}

export interface CallToggleMuteEvent {
    at: number;
    kind: "CALL";
    type: "TOGGLE_MUTE";
    deviceId?: string;
}

export interface CallToggleSpeakerEvent {
    at: number;
    kind: "CALL";
    type: "TOGGLE_SPEAKER";
    deviceId?: string;
}

export interface CallToggleHoldEvent {
    at: number;
    kind: "CALL";
    type: "TOGGLE_HOLD";
    deviceId?: string;
}

export type CallEvent =
    | CallIncomingEvent
    | CallAnswerEvent
    | CallDeclineEvent
    | CallEndEvent
    | CallToggleMuteEvent
    | CallToggleSpeakerEvent
    | CallToggleHoldEvent;

// =============================================================================
// CALL EVENT FACTORIES
// =============================================================================

export interface IncomingCallOptions {
    callerAvatar?: string;
    isVideo?: boolean;
    callType?: CallType;
    displayMode?: CallDisplayMode;
    posterImage?: string;
    posterNameFont?: string;
    deviceId?: string;
}

/**
 * Phone Call DSL - Event factories for phone call simulation
 */
export const call = {
    /**
     * Trigger an incoming phone call
     * 
     * @example
     * dsl.call.incoming(0, "alice", "Alice Smith", { displayMode: "fullscreen" })
     * dsl.call.incoming(0, "bob", "Bob", { displayMode: "overlay", posterImage: "/bob.jpg" })
     */
    incoming: (
        at: number,
        callerId: string,
        callerName: string,
        opts?: IncomingCallOptions
    ): CallIncomingEvent => ({
        at,
        kind: "CALL",
        type: "INCOMING",
        callerId,
        callerName,
        callerAvatar: opts?.callerAvatar,
        isVideo: opts?.isVideo ?? false,
        callType: opts?.callType ?? "voice",
        displayMode: opts?.displayMode ?? "fullscreen",
        deviceId: opts?.deviceId,
        callerMetadata: opts?.posterImage ? {
            posterImage: opts.posterImage,
            posterStyle: "modern",
            posterNameFont: opts.posterNameFont,
        } : undefined,
    }),

    /**
     * Answer an incoming call
     * 
     * @example
     * dsl.call.answer(100)
     */
    answer: (at: number, deviceId?: string): CallAnswerEvent => ({
        at,
        kind: "CALL",
        type: "ANSWER",
        deviceId,
    }),

    /**
     * Decline an incoming call
     * 
     * @example
     * dsl.call.decline(50)
     */
    decline: (at: number, deviceId?: string): CallDeclineEvent => ({
        at,
        kind: "CALL",
        type: "DECLINE",
        deviceId,
    }),

    /**
     * End an active call
     * 
     * @example
     * dsl.call.end(300)
     */
    end: (at: number, deviceId?: string): CallEndEvent => ({
        at,
        kind: "CALL",
        type: "END",
        deviceId,
    }),

    /**
     * Toggle mute on active call
     * 
     * @example
     * dsl.call.toggleMute(150)
     */
    toggleMute: (at: number, deviceId?: string): CallToggleMuteEvent => ({
        at,
        kind: "CALL",
        type: "TOGGLE_MUTE",
        deviceId,
    }),

    /**
     * Toggle speaker on active call
     * 
     * @example
     * dsl.call.toggleSpeaker(160)
     */
    toggleSpeaker: (at: number, deviceId?: string): CallToggleSpeakerEvent => ({
        at,
        kind: "CALL",
        type: "TOGGLE_SPEAKER",
        deviceId,
    }),

    /**
     * Toggle hold on active call
     * 
     * @example
     * dsl.call.toggleHold(200)
     */
    toggleHold: (at: number, deviceId?: string): CallToggleHoldEvent => ({
        at,
        kind: "CALL",
        type: "TOGGLE_HOLD",
        deviceId,
    }),
};
