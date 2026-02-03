/**
 * Enterprise Camera Director - Core Type Definitions
 *
 * Event-driven camera system for world simulation.
 * Supports auto-choreography, custom behaviors, and manual overrides.
 */

export type CameraEventType =
  | "MESSAGE_RECEIVED"
  | "MESSAGE_SENT"
  | "TYPING_START"
  | "TYPING_END"
  | "NOTIFICATION_SHOWN"
  | "NOTIFICATION_DISMISSED"
  | "CALL_INCOMING"
  | "CALL_ANSWERED"
  | "CALL_ENDED"
  | "APP_SWITCHED"
  | "CUSTOM";

export type CameraEventPriority = "low" | "normal" | "high" | "urgent";

export interface CameraEvent {
  readonly id: string;
  readonly type: CameraEventType;
  readonly timestamp: number;
  readonly priority: CameraEventPriority;
  readonly payload: CameraEventPayload;
  readonly metadata?: Record<string, unknown>;
}

export type CameraEventPayload =
  | MessageEventPayload
  | NotificationEventPayload
  | TypingEventPayload
  | CallEventPayload
  | CustomEventPayload;

export interface MessageEventPayload {
  readonly from: string;
  readonly text: string;
  readonly order: number;
  readonly anchor: string;
  readonly isKeyMessage?: boolean;
}

export interface NotificationEventPayload {
  readonly app: string;
  readonly title: string;
  readonly body: string;
  readonly anchor: string;
  readonly duration?: number;
}

export interface TypingEventPayload {
  readonly actor: string;
  readonly anchor: string;
}

export interface CallEventPayload {
  readonly caller: string;
  readonly anchor: string;
}

export interface CustomEventPayload {
  readonly anchor?: string;
  readonly data?: Record<string, unknown>;
}

export type CameraEffectType =
  | "focus"
  | "zoom"
  | "pan"
  | "animate"
  | "shake"
  | "reset"
  | "dolly"
  | "kenBurns"
  | "punchZoom"
  | "dutchTilt"
  | "flash"
  | "whipPan"
  | "track";

export interface CameraEffect {
  readonly type: CameraEffectType;
  readonly timestamp: number;
  readonly duration?: number;
  readonly params: CameraEffectParams;
  readonly priority?: number;
}

export type CameraEffectParams =
  | FocusParams
  | ZoomParams
  | PanParams
  | AnimateParams
  | ShakeParams
  | ResetParams
  | DollyParams
  | KenBurnsParams
  | PunchZoomParams
  | DutchTiltParams
  | FlashParams
  | WhipPanParams
  | TrackParams;

export interface FocusParams {
  readonly anchor: string;
  readonly scale?: number;
  readonly duration?: number;
  readonly easing?: string;
}

export interface ZoomParams {
  readonly scale: number;
  readonly duration?: number;
  readonly easing?: string;
}

export interface PanParams {
  readonly x?: number;
  readonly y?: number;
  readonly duration?: number;
  readonly easing?: string;
}

export interface AnimateParams {
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  readonly rotation?: number;
  readonly duration?: number;
  readonly easing?: string;
}

export interface ShakeParams {
  readonly intensityX: number;
  readonly intensityY: number;
  readonly frequency: number;
  readonly decay: number;
  readonly duration: number;
}

export interface ResetParams {
  readonly duration?: number;
  readonly easing?: string;
}

export interface DollyParams {
  readonly startScale: number;
  readonly endScale: number;
  readonly startTranslateY: number;
  readonly endTranslateY: number;
  readonly duration: number;
  readonly easing?: string;
}

export interface KenBurnsParams {
  readonly startScale: number;
  readonly endScale: number;
  readonly startOriginX: number;
  readonly startOriginY: number;
  readonly endOriginX: number;
  readonly endOriginY: number;
  readonly duration: number;
  readonly easing?: string;
}

export interface PunchZoomParams {
  readonly intensity: number;
  readonly direction: "in" | "out";
  readonly duration?: number;
}

export interface DutchTiltParams {
  readonly angle: number;
  readonly duration?: number;
  readonly easing?: string;
}

export interface FlashParams {
  readonly color?: string;
  readonly intensity: number;
  readonly duration: number;
}

export interface WhipPanParams {
  readonly direction: "left" | "right" | "up" | "down";
  readonly blur: number;
  readonly duration?: number;
}

export interface TrackParams {
  readonly anchor: string;
  readonly scale?: number;
  readonly smoothing?: number;
}

export interface CameraContext {
  readonly allEvents: readonly CameraEvent[];
  readonly fps: number;

  isBurstContinuation(event: CameraEvent): boolean;
  isTurnStart(event: CameraEvent): boolean;
  getBurstIndex(event: CameraEvent): number;
  getPreviousEvent(
    event: CameraEvent,
    type?: CameraEventType,
  ): CameraEvent | null;
  getNextEvent(event: CameraEvent, type?: CameraEventType): CameraEvent | null;
  getEventsBetween(start: number, end: number): readonly CameraEvent[];
  getConversationRhythm(): "fast" | "medium" | "slow";
  getSender(event: CameraEvent): string | null;
  getTimeSincePrevious(event: CameraEvent): number;
  getTimeUntilNext(event: CameraEvent): number;
}

export type BehaviorFunction = (
  event: CameraEvent,
  context: CameraContext,
) => CameraEffect | CameraEffect[] | null;

export type BehaviorPreset =
  | "fluid-tennis-casual"
  | "fluid-tennis-energetic"
  | "fluid-tennis-dramatic"
  | "interrupt-focus"
  | "interrupt-glance"
  | "drift-anticipation"
  | "track-input"
  | "fullscreen-takeover"
  | "static"
  | string;

export interface BehaviorConfig {
  readonly [eventType: string]: BehaviorPreset | BehaviorFunction;
}

export interface CameraDirectorOptions {
  readonly behaviors?: BehaviorConfig;
  readonly fps?: number;
  readonly debug?: boolean;
}

export interface CameraDirectorResult {
  readonly effects: readonly CameraEffect[];
  readonly eventCount: number;
  readonly behaviorStats: Map<string, number>;
}

export interface OverrideFunction {
  (): CameraEffect | CameraEffect[] | null;
}
