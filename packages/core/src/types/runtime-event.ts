/**
 * RuntimeEvent - The Enterprise-Grade Event System
 *
 * ALL plugin-specific data goes in the `payload` field.
 * This prevents the "from/text location mismatch" bugs forever.
 *
 * @see docs/FUCKING_MESS.md Section 4
 */

// =============================================================================
// EVENT KINDS & BASE TYPES
// =============================================================================

/**
 * All supported event kinds in the enterprise system.
 * This includes both the core kinds and legacy/V2 kinds for compatibility.
 */
export type RuntimeEventKind =
  | "APP"
  | "DEVICE"
  | "CAMERA"
  | "AUDIO"
  | "KEYBOARD"
  // Extended kinds for full compatibility
  | "OS"
  | "TOUCH"
  | "CALL"
  | "TRANSITION"
  | "HIGHLIGHT"
  // V2 Native ops (from @tokovo/ir)
  | "MessageReceived"
  | "MessageSent"
  | "TypingStarted"
  | "TypingEnded"
  | "KeyboardType"
  | "KeyboardInput"
  | "AppOpened"
  | "DeviceUnlocked"
  | "ConversationOpened"
  | "ScreenNavigated"
  | "CameraZoom"
  | "CameraShake"
  | "POVSwitch"
  | "SplitPOV"
  | "AnchorFocus"
  | "AnchorTrack";

/**
 * Event trace for debugging - links back to DSL source
 */
export interface EventTrace {
  file?: string;
  line?: number;
  beat?: string;
  sceneOpIndex?: number;
  episodeId?: string;
}

/**
 * Semantic signal for DirectorLite
 */
export interface EventSignal {
  type: string; // "NewMessage", "TypingStarted", etc.
  mood?: string; // "romantic", "tense", "chaotic", etc.
  intensity?: number; // 0-1, importance level
  pacing?: "slow" | "normal" | "fast";
}

/**
 * Base event interface - all events extend this
 */
export interface BaseRuntimeEvent {
  at: number;
  kind: RuntimeEventKind;
  _trace?: EventTrace;
  _signal?: EventSignal;
  silent?: boolean;
  trace?: any;
}

// =============================================================================
// APP EVENT
// =============================================================================

/**
 * App event - ALL plugin-specific data in payload
 */
export interface AppRuntimeEvent<
  AppId extends string = string,
  Type extends string = string,
  Payload = unknown,
> extends BaseRuntimeEvent {
  kind: "APP";
  appId: AppId;
  type: Type;
  deviceId?: string;
  payload: Payload;
}

// =============================================================================
// DEVICE EVENT
// =============================================================================

export type DeviceEventType =
  | "LOCK"
  | "UNLOCK"
  | "OPEN_APP"
  | "CLOSE_APP"
  | "GO_HOME"
  | "SHOW_NOTIFICATION"
  | "DISMISS_NOTIFICATION"
  | "TAP_NOTIFICATION"
  | "UPDATE_NOTIFICATION"
  | "SWIPE_NOTIFICATION"
  | "REPLY_NOTIFICATION"
  | "TOGGLE_NOTIFICATION_PANEL"
  | "CLEAR_ALL_NOTIFICATIONS"
  | "SET_DYNAMIC_ISLAND"
  | "SET_BADGE"
  | "INCOMING_CALL"
  | "CALL_ANSWERED"
  | "CALL_ENDED"
  | "START_BACKGROUND_APP"
  | "STOP_BACKGROUND_APP";

export interface DeviceEventPayload {
  appId?: string;
}

export interface NotificationPayload {
  id: string;
  appId: string;
  title: string;
  body: string;
  threadKey?: string;
  priority?: "HIGH" | "DEFAULT" | "LOW";
  icon?: string;
  actions?: Array<{ label: string; action: string }>;
}

export interface DeviceRuntimeEvent<
  Type extends DeviceEventType = DeviceEventType,
  Payload = unknown,
> extends BaseRuntimeEvent {
  kind: "DEVICE";
  deviceId: string;
  type: Type;
  payload?: Payload;
}

// =============================================================================
// CAMERA EVENT
// =============================================================================

export type CameraEventType =
  | "ZOOM"
  | "PAN"
  | "SHAKE"
  | "FOCUS"
  | "CUT"
  | "RESET"
  | "ANCHOR_FOCUS"
  | "ANCHOR_TRACK"
  | "SET_LAYOUT"
  | "SET_VIEW"
  | "LAYOUT"
  | "HOLD";

export interface CameraZoomPayload {
  scale: number;
  originX?: number;
  originY?: number;
  duration: number;
  easing?: string;
}

export interface CameraPanPayload {
  translateX: number;
  translateY: number;
  relative?: boolean;
  duration: number;
  easing?: string;
}

export interface CameraShakePayload {
  intensity: number;
  frequency?: number;
  duration: number;
  decay?: number;
}

export interface CameraFocusPayload {
  anchorId: string;
  scale?: number;
  duration?: number;
  easing?: string;
}

export interface CameraRuntimeEvent<
  Type extends CameraEventType = CameraEventType,
  Payload = unknown,
> extends BaseRuntimeEvent {
  kind: "CAMERA";
  type: Type;
  deviceId?: string;
  payload: Payload;
}

// =============================================================================
// AUDIO EVENT
// =============================================================================

export type AudioEventType =
  | "PLAY_ONE_SHOT"
  | "START_LOOP"
  | "STOP"
  | "DUCK"
  | "CROSSFADE"
  | "PLAY_SOUND"
  | "STOP_SOUND"
  | "FADE_VOLUME"
  | "BACKGROUND_MUSIC";

export interface AudioPlayPayload {
  soundId: string;
  instanceId?: string;
  volume?: number;
  bus?: "voice" | "sfx" | "ui" | "music";
  deviceId?: string;
}

export interface AudioStopPayload {
  instanceId: string;
}

export interface AudioDuckPayload {
  target: "music" | "sfx" | "ui";
  amount: number;
  duration: number;
}

export interface AudioRuntimeEvent<
  Type extends AudioEventType = AudioEventType,
  Payload = unknown,
> extends BaseRuntimeEvent {
  kind: "AUDIO";
  type: Type;
  payload: Payload;
}

// =============================================================================
// KEYBOARD EVENT
// =============================================================================

export type KeyboardEventType =
  | "SHOW"
  | "HIDE"
  | "KEY_DOWN"
  | "KEY_UP"
  | "TYPE_CHAR"
  | "BACKSPACE"
  | "SET_TEXT"
  | "CLEAR";

export interface KeyboardPayload {
  key?: string;
  char?: string;
  text?: string;
  layout?: string;
}

export interface KeyboardRuntimeEvent<
  Type extends KeyboardEventType = KeyboardEventType,
  Payload = KeyboardPayload,
> extends BaseRuntimeEvent {
  kind: "KEYBOARD";
  deviceId: string;
  type: Type;
  payload?: Payload;
}

// =============================================================================
// OS EVENT
// =============================================================================

export type OSEventType =
  | "SET_TIME"
  | "SET_BATTERY"
  | "DRAIN_BATTERY"
  | "SET_NETWORK"
  | "SET_DND"
  | "SET_LOW_POWER"
  | "SET_AIRPLANE";

export interface OSRuntimeEvent extends BaseRuntimeEvent {
  kind: "OS";
  type: OSEventType;
  deviceId?: string;
  time?: number;
  level?: number;
  charging?: boolean;
  rate?: number;
  network?: string;
  strength?: number;
  enabled?: boolean;
}

// =============================================================================
// TOUCH EVENT
// =============================================================================

export type TouchEventType = "TAP" | "LONG_PRESS" | "DRAG" | "SCROLL";

export interface TouchRuntimeEvent extends BaseRuntimeEvent {
  kind: "TOUCH";
  type: TouchEventType;
  deviceId?: string;
  x?: number;
  y?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  duration?: number;
  velocity?: number;
}

// =============================================================================
// CALL EVENT
// =============================================================================

export type CallEventType =
  | "INCOMING"
  | "ANSWER"
  | "DECLINE"
  | "END"
  | "TOGGLE_MUTE"
  | "TOGGLE_SPEAKER"
  | "TOGGLE_HOLD";

export interface CallRuntimeEvent extends BaseRuntimeEvent {
  kind: "CALL";
  type: CallEventType;
  deviceId?: string;
  callerId?: string;
  callerName?: string;
  callerAvatar?: string;
  isVideo?: boolean;
}

// =============================================================================
// TRANSITION EVENT
// =============================================================================

export interface TransitionRuntimeEvent extends BaseRuntimeEvent {
  kind: "TRANSITION";
  type: string;
  from: string;
  to: string;
  duration: number;
  easing?: string;
}

// =============================================================================
// HIGHLIGHT EVENT
// =============================================================================

export interface HighlightRuntimeEvent extends BaseRuntimeEvent {
  kind: "HIGHLIGHT";
  type: "MESSAGE" | "ELEMENT" | "CLEAR";
  messageId?: string;
  conversationId?: string;
  selector?: string;
  targetId?: string;
  style?: string;
  duration?: number;
  color?: string;
}

// =============================================================================
// V2 NATIVE OPS (from @tokovo/ir)
// =============================================================================

import type { TrackEvent } from "@tokovo/ir";

export type V2NativeOp = TrackEvent & { at: number };

// =============================================================================
// UNION TYPE
// =============================================================================

export type RuntimeEvent =
  | AppRuntimeEvent
  | DeviceRuntimeEvent
  | CameraRuntimeEvent
  | AudioRuntimeEvent
  | KeyboardRuntimeEvent
  | OSRuntimeEvent
  | TouchRuntimeEvent
  | CallRuntimeEvent
  | TransitionRuntimeEvent
  | HighlightRuntimeEvent
  | V2NativeOp;

// =============================================================================
// TYPE AUGMENTATION (Plugins extend this)
// =============================================================================

/**
 * Plugins use module augmentation to declare their payloads:
 *
 * declare module "@tokovo/core" {
 *   interface AppEventPayloads {
 *     app_whatsapp: {
 *       MESSAGE_RECEIVED: { from: string; text: string; conversationId: string };
 *       TYPING_START: { conversationId: string; from: string };
 *     };
 *   }
 * }
 */
export interface AppEventPayloads {
  // Plugins extend this via module augmentation
}

// =============================================================================
// TYPE HELPERS
// =============================================================================

/**
 * Get strongly-typed app event for a specific app and type
 */
export type TypedAppEvent<
  AppId extends keyof AppEventPayloads,
  Type extends keyof AppEventPayloads[AppId],
> = AppRuntimeEvent<
  AppId & string,
  Type & string,
  AppEventPayloads[AppId][Type]
>;

/**
 * Check if event is an app event for specific app
 */
export function isRuntimeAppEvent<A extends string>(
  event: RuntimeEvent,
  appId: A,
): event is AppRuntimeEvent<A> {
  return event.kind === "APP" && (event as AppRuntimeEvent).appId === appId;
}

/**
 * Check if event is an app event with specific type
 */
export function isRuntimeAppEventType<A extends string, T extends string>(
  event: RuntimeEvent,
  appId: A,
  type: T,
): event is AppRuntimeEvent<A, T> {
  return (
    event.kind === "APP" &&
    (event as AppRuntimeEvent).appId === appId &&
    (event as AppRuntimeEvent).type === type
  );
}

/**
 * Check if event is a device event
 */
export function isRuntimeDeviceEvent(
  event: RuntimeEvent,
): event is DeviceRuntimeEvent {
  return event.kind === "DEVICE";
}

/**
 * Check if event is a camera event
 */
export function isRuntimeCameraEvent(
  event: RuntimeEvent,
): event is CameraRuntimeEvent {
  return event.kind === "CAMERA";
}

/**
 * Check if event is an audio event
 */
export function isRuntimeAudioEvent(
  event: RuntimeEvent,
): event is AudioRuntimeEvent {
  return event.kind === "AUDIO";
}

/**
 * Check if event is a keyboard event
 */
export function isRuntimeKeyboardEvent(
  event: RuntimeEvent,
): event is KeyboardRuntimeEvent {
  return event.kind === "KEYBOARD";
}
