/**
 * Type Guards - Type-safe event discrimination
 * 
 * These guards eliminate the need for `as any` casts when handling events.
 * Each guard narrows the TimelineEvent type to a specific variant.
 */

import { TimelineEvent } from "../types";

// =============================================================================
// DEVICE EVENT GUARDS
// =============================================================================

export function isDeviceEvent(e: TimelineEvent): e is TimelineEvent & { kind: "DEVICE" } {
    return e.kind === "DEVICE";
}

export function isLockEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "LOCK";
    deviceId: string;
} {
    return e.kind === "DEVICE" && e.type === "LOCK";
}

export function isUnlockEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "UNLOCK";
    deviceId: string;
} {
    return e.kind === "DEVICE" && e.type === "UNLOCK";
}

export function isOpenAppEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "OPEN_APP";
    deviceId: string;
    appId: string;
} {
    return e.kind === "DEVICE" && e.type === "OPEN_APP";
}

export function isShowNotificationEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "SHOW_NOTIFICATION";
    deviceId: string;
    appId: string;
    title: string;
    body: string;
    mode?: "lockscreen" | "headsup" | "both";
    icon?: string;
} {
    return e.kind === "DEVICE" && e.type === "SHOW_NOTIFICATION";
}

export function isIncomingCallEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "DEVICE";
    type: "INCOMING_CALL";
    deviceId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;
} {
    return e.kind === "DEVICE" && e.type === "INCOMING_CALL";
}

// =============================================================================
// APP EVENT GUARDS
// =============================================================================

export function isAppEvent(e: TimelineEvent): e is TimelineEvent & { kind: "APP" } {
    return e.kind === "APP";
}

/** Message payload type for type safety */
export interface MessagePayload {
    id: string;
    type?: "text" | "image" | "voice" | "system";
    text?: string;
    status?: "sending" | "sent" | "delivered" | "read";
    timestamp?: string;
}

export function isMessageReceivedEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "MESSAGE_RECEIVED";
    appId: string;
    conversationId: string;
    from: string;
    text?: string;
    message?: MessagePayload;
} {
    return e.kind === "APP" && e.type === "MESSAGE_RECEIVED";
}

export function isTypingStartEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "TYPING_START";
    appId: string;
    conversationId: string;
    from: string;
} {
    return e.kind === "APP" && e.type === "TYPING_START";
}

export function isTypingEndEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "TYPING_END";
    appId: string;
    conversationId: string;
    from: string;
} {
    return e.kind === "APP" && e.type === "TYPING_END";
}

export function isTypingEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "TYPING_START" | "TYPING_END";
    appId: string;
    conversationId: string;
    from: string;
} {
    return e.kind === "APP" && (e.type === "TYPING_START" || e.type === "TYPING_END");
}

export function isMessageReadEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "MESSAGE_READ";
    appId: string;
    conversationId: string;
    messageId: string;
} {
    return e.kind === "APP" && e.type === "MESSAGE_READ";
}

export function isVoiceMessageReceivedEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "VOICE_MESSAGE_RECEIVED";
    appId: string;
    conversationId: string;
    from: string;
    duration: number;
} {
    return e.kind === "APP" && e.type === "VOICE_MESSAGE_RECEIVED";
}

export function isGroupMemberAddedEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "GROUP_MEMBER_ADDED";
    appId: string;
    conversationId: string;
    memberId: string;
    memberName: string;
    addedBy: string;
} {
    return e.kind === "APP" && e.type === "GROUP_MEMBER_ADDED";
}

export function isGroupMemberRemovedEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "APP";
    type: "GROUP_MEMBER_REMOVED";
    appId: string;
    conversationId: string;
    memberId: string;
    memberName: string;
    removedBy: string;
} {
    return e.kind === "APP" && e.type === "GROUP_MEMBER_REMOVED";
}

// =============================================================================
// CAMERA EVENT GUARDS
// =============================================================================

export function isCameraEvent(e: TimelineEvent): e is TimelineEvent & { kind: "CAMERA" } {
    return e.kind === "CAMERA";
}

export function isZoomEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "CAMERA";
    type: "ZOOM";
    scale: number;
    originX?: number;
    originY?: number;
    duration: number;
    deviceId?: string;
} {
    return e.kind === "CAMERA" && e.type === "ZOOM";
}

export function isPanEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "CAMERA";
    type: "PAN";
    translateX: number;
    translateY: number;
    duration: number;
    deviceId?: string;
} {
    return e.kind === "CAMERA" && e.type === "PAN";
}

export function isShakeEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "CAMERA";
    type: "SHAKE";
    intensity: number;
    frequency: number;
    duration: number;
    deviceId?: string;
} {
    return e.kind === "CAMERA" && e.type === "SHAKE";
}

export function isLayoutEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "CAMERA";
    type: "LAYOUT";
    mode: string;
    primaryDeviceId: string;
    secondaryDeviceId?: string;
} {
    return e.kind === "CAMERA" && e.type === "LAYOUT";
}

// =============================================================================
// AUDIO EVENT GUARDS
// =============================================================================

export function isAudioEvent(e: TimelineEvent): e is TimelineEvent & { kind: "AUDIO" } {
    return e.kind === "AUDIO";
}

export function isPlaySoundEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "AUDIO";
    type: "PLAY_SOUND";
    soundId: string;
    instanceId?: string;
    volume?: number;
    loop?: boolean;
    deviceId?: string;
} {
    return e.kind === "AUDIO" && e.type === "PLAY_SOUND";
}

export function isBackgroundMusicEvent(e: TimelineEvent): e is TimelineEvent & {
    kind: "AUDIO";
    type: "BACKGROUND_MUSIC";
    soundId: string;
    volume?: number;
    loop?: boolean;
} {
    return e.kind === "AUDIO" && e.type === "BACKGROUND_MUSIC";
}

// =============================================================================
// UTILITY GUARDS
// =============================================================================

/**
 * Check if event belongs to a specific app
 */
export function isEventForApp(e: TimelineEvent, appId: string): boolean {
    return e.kind === "APP" && (e as any).appId === appId;
}

/**
 * Check if event belongs to a specific device
 */
export function isEventForDevice(e: TimelineEvent, deviceId: string): boolean {
    if (e.kind === "DEVICE") {
        return (e as any).deviceId === deviceId;
    }
    if (e.kind === "CAMERA" || e.kind === "AUDIO") {
        return (e as any).deviceId === deviceId || !(e as any).deviceId;
    }
    return true; // APP events apply to all
}
