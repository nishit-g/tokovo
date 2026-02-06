import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../types.js";
import {
  isDeviceEvent,
  isLockEvent,
  isUnlockEvent,
  isOpenAppEvent,
  isShowNotificationEvent,
  isIncomingCallEvent,
  isAppEvent,
  isMessageReceivedEvent,
  isTypingStartEvent,
  isTypingEndEvent,
  isTypingEvent,
  isMessageReadEvent,
  isVoiceMessageReceivedEvent,
  isGroupMemberAddedEvent,
  isGroupMemberRemovedEvent,
  isCameraEvent,
  isZoomEvent,
  isPanEvent,
  isShakeEvent,
  isLayoutEvent,
  isAudioEvent,
  isPlaySoundEvent,
  isBackgroundMusicEvent,
  isEventForApp,
  isEventForDevice,
} from "../utils/type-guards.js";

describe("type guards", () => {
  it("detects device events", () => {
    const lock = { kind: "DEVICE", type: "LOCK", deviceId: "d1" } as TimelineEvent;
    expect(isDeviceEvent(lock)).toBe(true);
    expect(isLockEvent(lock)).toBe(true);
    expect(isUnlockEvent(lock)).toBe(false);

    const open = { kind: "DEVICE", type: "OPEN_APP", deviceId: "d1", appId: "app" } as TimelineEvent;
    expect(isOpenAppEvent(open)).toBe(true);

    const notif = { kind: "DEVICE", type: "SHOW_NOTIFICATION", deviceId: "d1", appId: "app", title: "t", body: "b" } as TimelineEvent;
    expect(isShowNotificationEvent(notif)).toBe(true);

    const call = { kind: "DEVICE", type: "INCOMING_CALL", deviceId: "d1", callerId: "c", callerName: "Caller" } as TimelineEvent;
    expect(isIncomingCallEvent(call)).toBe(true);
  });

  it("detects app events", () => {
    const message = { kind: "APP", type: "MESSAGE_RECEIVED", appId: "app", conversationId: "c1", from: "me" } as TimelineEvent;
    expect(isAppEvent(message)).toBe(true);
    expect(isMessageReceivedEvent(message)).toBe(true);

    const typingStart = { kind: "APP", type: "TYPING_START", appId: "app", conversationId: "c1", from: "you" } as TimelineEvent;
    expect(isTypingStartEvent(typingStart)).toBe(true);
    expect(isTypingEvent(typingStart)).toBe(true);

    const typingEnd = { kind: "APP", type: "TYPING_END", appId: "app", conversationId: "c1", from: "you" } as TimelineEvent;
    expect(isTypingEndEvent(typingEnd)).toBe(true);
    expect(isTypingEvent(typingEnd)).toBe(true);

    const read = { kind: "APP", type: "MESSAGE_READ", appId: "app", conversationId: "c1", messageId: "m1" } as TimelineEvent;
    expect(isMessageReadEvent(read)).toBe(true);

    const voice = { kind: "APP", type: "VOICE_MESSAGE_RECEIVED", appId: "app", conversationId: "c1", from: "you", duration: 3 } as TimelineEvent;
    expect(isVoiceMessageReceivedEvent(voice)).toBe(true);

    const added = { kind: "APP", type: "GROUP_MEMBER_ADDED", appId: "app", conversationId: "c1", memberId: "m", memberName: "Name", addedBy: "me" } as TimelineEvent;
    expect(isGroupMemberAddedEvent(added)).toBe(true);

    const removed = { kind: "APP", type: "GROUP_MEMBER_REMOVED", appId: "app", conversationId: "c1", memberId: "m", memberName: "Name", removedBy: "me" } as TimelineEvent;
    expect(isGroupMemberRemovedEvent(removed)).toBe(true);
  });

  it("detects camera and audio events", () => {
    const zoom = { kind: "CAMERA", type: "ZOOM", scale: 1, duration: 10 } as TimelineEvent;
    expect(isCameraEvent(zoom)).toBe(true);
    expect(isZoomEvent(zoom)).toBe(true);

    const pan = { kind: "CAMERA", type: "PAN", translateX: 1, translateY: 1, duration: 10 } as TimelineEvent;
    expect(isPanEvent(pan)).toBe(true);

    const shake = { kind: "CAMERA", type: "SHAKE", intensity: 1, frequency: 1, duration: 5 } as TimelineEvent;
    expect(isShakeEvent(shake)).toBe(true);

    const layout = { kind: "CAMERA", type: "LAYOUT", mode: "SINGLE", primaryDeviceId: "d1" } as TimelineEvent;
    expect(isLayoutEvent(layout)).toBe(true);

    const audio = { kind: "AUDIO", type: "PLAY_SOUND", soundId: "ding" } as TimelineEvent;
    expect(isAudioEvent(audio)).toBe(true);
    expect(isPlaySoundEvent(audio)).toBe(true);

    const music = { kind: "AUDIO", type: "BACKGROUND_MUSIC", soundId: "song" } as TimelineEvent;
    expect(isBackgroundMusicEvent(music)).toBe(true);
  });

  it("checks event ownership", () => {
    const appEvent = { kind: "APP", appId: "app" } as TimelineEvent;
    expect(isEventForApp(appEvent, "app")).toBe(true);

    const deviceEvent = { kind: "DEVICE", deviceId: "phone" } as TimelineEvent;
    expect(isEventForDevice(deviceEvent, "phone")).toBe(true);

    const cameraEvent = { kind: "CAMERA", deviceId: "tablet" } as TimelineEvent;
    expect(isEventForDevice(cameraEvent, "tablet")).toBe(true);
    expect(isEventForDevice(cameraEvent, "phone")).toBe(false);

    const audioEvent = { kind: "AUDIO" } as TimelineEvent;
    expect(isEventForDevice(audioEvent, "phone")).toBe(true);

    const otherEvent = { kind: "APP" } as TimelineEvent;
    expect(isEventForDevice(otherEvent, "phone")).toBe(true);
  });
});
