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
  | "OS"
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

export interface OpenAppPayload {
  appId: string;
}

export interface SetBadgePayload {
  appId: string;
  count: number;
}

export interface SetDynamicIslandPayload {
  visible: boolean;
  mode?: "idle" | "minimal" | "compact" | "expanded";
}

export interface IncomingCallPayload {
  callerId: string;
  callerName?: string;
  callerAvatar?: string;
  isVideo?: boolean;
}

export interface BackgroundAppPayload {
  appId: string;
  indicator?: "music" | "call" | "recording" | "location";
  label?: string;
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

interface BaseDeviceRuntimeEvent<
  Type extends DeviceEventType = DeviceEventType,
  Payload = unknown,
> extends BaseRuntimeEvent {
  kind: "DEVICE";
  deviceId: string;
  type: Type;
  payload?: Payload;
}

export type OpenAppEvent = BaseDeviceRuntimeEvent<"OPEN_APP", OpenAppPayload>;
export type SetBadgeEvent = BaseDeviceRuntimeEvent<
  "SET_BADGE",
  SetBadgePayload
>;
export type SetDynamicIslandEvent = BaseDeviceRuntimeEvent<
  "SET_DYNAMIC_ISLAND",
  SetDynamicIslandPayload
>;
export type IncomingCallEvent = BaseDeviceRuntimeEvent<
  "INCOMING_CALL",
  IncomingCallPayload
>;
export type StartBackgroundAppEvent = BaseDeviceRuntimeEvent<
  "START_BACKGROUND_APP",
  BackgroundAppPayload
>;
export type StopBackgroundAppEvent = BaseDeviceRuntimeEvent<
  "STOP_BACKGROUND_APP",
  BackgroundAppPayload
>;
export type ShowNotificationEvent = BaseDeviceRuntimeEvent<
  "SHOW_NOTIFICATION",
  NotificationPayload
>;

export type LockEvent = BaseDeviceRuntimeEvent<"LOCK">;
export type UnlockEvent = BaseDeviceRuntimeEvent<"UNLOCK">;
export type CloseAppEvent = BaseDeviceRuntimeEvent<"CLOSE_APP">;
export type GoHomeEvent = BaseDeviceRuntimeEvent<"GO_HOME">;
export type CallAnsweredEvent = BaseDeviceRuntimeEvent<"CALL_ANSWERED">;
export type CallEndedEvent = BaseDeviceRuntimeEvent<"CALL_ENDED">;

export type DeviceRuntimeEvent =
  | LockEvent
  | UnlockEvent
  | OpenAppEvent
  | CloseAppEvent
  | GoHomeEvent
  | SetBadgeEvent
  | SetDynamicIslandEvent
  | IncomingCallEvent
  | CallAnsweredEvent
  | CallEndedEvent
  | StartBackgroundAppEvent
  | StopBackgroundAppEvent
  | ShowNotificationEvent
  | BaseDeviceRuntimeEvent<"DISMISS_NOTIFICATION">
  | BaseDeviceRuntimeEvent<"TAP_NOTIFICATION">
  | BaseDeviceRuntimeEvent<"UPDATE_NOTIFICATION">
  | BaseDeviceRuntimeEvent<"SWIPE_NOTIFICATION">
  | BaseDeviceRuntimeEvent<"REPLY_NOTIFICATION">
  | BaseDeviceRuntimeEvent<"TOGGLE_NOTIFICATION_PANEL">
  | BaseDeviceRuntimeEvent<"CLEAR_ALL_NOTIFICATIONS">;

// =============================================================================
// CAMERA EVENT (Flat structure - matches DSL factories and reducers)
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

interface BaseCameraRuntimeEvent extends BaseRuntimeEvent {
  kind: "CAMERA";
  type: CameraEventType;
  deviceId?: string;
}

export interface CameraZoomEvent extends BaseCameraRuntimeEvent {
  type: "ZOOM";
  scale: number;
  duration: number;
  originX?: number;
  originY?: number;
  easing?: string;
}

export interface CameraPanEvent extends BaseCameraRuntimeEvent {
  type: "PAN";
  translateX: number;
  translateY: number;
  duration: number;
  relative?: boolean;
  easing?: string;
}

export interface CameraShakeEvent extends BaseCameraRuntimeEvent {
  type: "SHAKE";
  intensity: number;
  duration: number;
  frequency?: number;
  decay?: number;
}

export interface CameraResetEvent extends BaseCameraRuntimeEvent {
  type: "RESET";
  duration: number;
  easing?: string;
}

export interface CameraHoldEvent extends BaseCameraRuntimeEvent {
  type: "HOLD";
  duration: number;
}

export interface CameraAnchorFocusEvent extends BaseCameraRuntimeEvent {
  type: "ANCHOR_FOCUS";
  anchor: string;
  preset?: string;
  shake?: number;
  duration: number;
  easing?: string;
}

export interface CameraAnchorTrackEvent extends BaseCameraRuntimeEvent {
  type: "ANCHOR_TRACK";
  anchor: string;
  duration: number;
  smoothing?: number;
  preset?: string;
  easing?: string;
  zoom?: number;
}

export interface CameraFocusEvent extends BaseCameraRuntimeEvent {
  type: "FOCUS";
  anchorId?: string;
  scale?: number;
  duration?: number;
  easing?: string;
}

export interface CameraCutEvent extends BaseCameraRuntimeEvent {
  type: "CUT";
}

export interface CameraSetLayoutEvent extends BaseCameraRuntimeEvent {
  type: "SET_LAYOUT";
  layout: string;
}

export interface CameraSetViewEvent extends BaseCameraRuntimeEvent {
  type: "SET_VIEW";
  view: string;
}

export interface CameraLayoutEvent extends BaseCameraRuntimeEvent {
  type: "LAYOUT";
  layout: string;
}

export type CameraRuntimeEvent =
  | CameraZoomEvent
  | CameraPanEvent
  | CameraShakeEvent
  | CameraResetEvent
  | CameraHoldEvent
  | CameraAnchorFocusEvent
  | CameraAnchorTrackEvent
  | CameraFocusEvent
  | CameraCutEvent
  | CameraSetLayoutEvent
  | CameraSetViewEvent
  | CameraLayoutEvent;

// =============================================================================
// AUDIO EVENT (Flat structure - matches lowering output)
// =============================================================================

export type AudioEventType =
  | "PLAY"
  | "STOP"
  | "FADE_OUT"
  | "CROSSFADE"
  | "STOP_ALL"
  | "PLAY_ONE_SHOT"
  | "START_LOOP"
  | "DUCK"
  | "PLAY_SOUND"
  | "STOP_SOUND"
  | "FADE_VOLUME"
  | "BACKGROUND_MUSIC";

interface BaseAudioRuntimeEvent extends BaseRuntimeEvent {
  kind: "AUDIO";
  type: AudioEventType;
}

export interface AudioPlayEvent extends BaseAudioRuntimeEvent {
  type: "PLAY";
  soundId: string;
  volume?: number;
  fadeIn?: number;
  loop?: boolean;
}

export interface AudioStopEvent extends BaseAudioRuntimeEvent {
  type: "STOP";
  soundId?: string;
}

export interface AudioFadeOutEvent extends BaseAudioRuntimeEvent {
  type: "FADE_OUT";
  duration: number;
}

export interface AudioCrossfadeEvent extends BaseAudioRuntimeEvent {
  type: "CROSSFADE";
  soundId: string;
  volume?: number;
  duration: number;
}

export interface AudioStopAllEvent extends BaseAudioRuntimeEvent {
  type: "STOP_ALL";
}

export type AudioRuntimeEvent =
  | AudioPlayEvent
  | AudioStopEvent
  | AudioFadeOutEvent
  | AudioCrossfadeEvent
  | AudioStopAllEvent
  | (BaseAudioRuntimeEvent & Record<string, unknown>);

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
