/**
 * Type Guards - Type-safe event discrimination
 *
 * These guards eliminate the need for `as any` casts when handling events.
 * Each guard narrows the TimelineEvent type to a specific variant.
 */

import { TimelineEvent } from "../types.js";

// =============================================================================
// DEVICE EVENT GUARDS
// =============================================================================

export function isDeviceEvent(
  e: TimelineEvent,
): e is TimelineEvent & { kind: "DEVICE" } {
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

export function isAppEvent(
  e: TimelineEvent,
): e is TimelineEvent & { kind: "APP" } {
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
  return (
    e.kind === "APP" && (e.type === "TYPING_START" || e.type === "TYPING_END")
  );
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

export function isVoiceMessageReceivedEvent(
  e: TimelineEvent,
): e is TimelineEvent & {
  kind: "APP";
  type: "VOICE_MESSAGE_RECEIVED";
  appId: string;
  conversationId: string;
  from: string;
  duration: number;
} {
  return e.kind === "APP" && e.type === "VOICE_MESSAGE_RECEIVED";
}

export function isGroupMemberAddedEvent(
  e: TimelineEvent,
): e is TimelineEvent & {
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

export function isGroupMemberRemovedEvent(
  e: TimelineEvent,
): e is TimelineEvent & {
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
// AUDIO EVENT GUARDS
// =============================================================================

export function isAudioEvent(
  e: TimelineEvent,
): e is TimelineEvent & { kind: "AUDIO" } {
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

interface EventWithAppId {
  appId?: string;
}

interface EventWithDeviceId {
  deviceId?: string;
}

/**
 * Check if event belongs to a specific app
 */
export function isEventForApp(e: TimelineEvent, appId: string): boolean {
  return e.kind === "APP" && (e as EventWithAppId).appId === appId;
}

/**
 * Check if event belongs to a specific device
 */
export function isEventForDevice(e: TimelineEvent, deviceId: string): boolean {
  const eventWithDevice = e as EventWithDeviceId;
  if (e.kind === "DEVICE") {
    return eventWithDevice.deviceId === deviceId;
  }
  if (e.kind === "AUDIO") {
    return eventWithDevice.deviceId === deviceId || !eventWithDevice.deviceId;
  }
  return true;
}
