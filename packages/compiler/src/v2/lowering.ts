/**
 * Track Lowering - Convert TrackEvent to RuntimeEvent
 *
 * @description Transforms v2 track-based events to runtime event format.
 * APP events are delegated to plugins - compiler is app-agnostic.
 *
 * @see docs-v2/DSL_REVAMP.md#compilation
 */

import type {
  TrackEvent,
  TrackEpisodeIR,
  CameraTrackEvent,
  AudioTrackEvent,
  OSTrackEvent,
  MarkerTrackEvent,
  CallTrackEvent,
  DeviceTrackEvent,
  VoiceTrackEvent,
} from "@tokovo/ir";
import {
  isCameraEvent,
  isAudioEvent,
  isOSEvent,
  isMarkerEvent,
  isCallEvent,
  isDeviceEvent,
  isVoiceEvent,
} from "@tokovo/ir";
import type {
  AudioCrossfadeEvent,
  AudioFadeOutEvent,
  AudioPlayEvent,
  AudioRuntimeEvent,
  AudioStopAllEvent,
  AudioStopEvent,
  CallRuntimeEvent,
  DeviceRuntimeEvent,
  OSRuntimeEvent,
  RuntimeEvent,
  TokovoPlugin,
  VoiceRuntimeEvent,
  VoicePlaySegmentEvent,
  VoiceStopEvent,
} from "@tokovo/core";
import { cameraV2Lowering } from "@tokovo/device-camera";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Plugin lowering interface - plugins implement this to lower their events.
 */
export interface PluginLowering {
  appId: string;
  lower(event: TrackEvent, ctx: LoweringContext): RuntimeEvent[];
}

/**
 * Lowering context with registered plugin lowerers.
 */
export interface LoweringContext {
  pluginLowerers: Map<string, PluginLowering>;
  fps: number;
}

// =============================================================================
// PLUGIN-AGNOSTIC LOWERING
// =============================================================================

/**
 * Lower a single TrackEvent to RuntimeEvent(s).
 * APP events are delegated to the appropriate plugin.
 */
export function lowerTrackEvent(
  event: TrackEvent,
  ctx: LoweringContext,
): RuntimeEvent[] {
  if (isCameraEvent(event)) {
    return cameraV2Lowering(event, { fps: ctx.fps }) as RuntimeEvent[];
  }
  if (isAudioEvent(event)) {
    return lowerAudioEvent(event);
  }
  if (isVoiceEvent(event)) {
    return lowerVoiceEvent(event, ctx);
  }
  if (isOSEvent(event)) {
    return lowerOSEvent(event);
  }
  if (isMarkerEvent(event)) {
    return lowerMarkerEvent(event);
  }
  if (isDeviceEvent(event)) {
    return lowerDeviceEvent(event);
  }
  if (isCallEvent(event)) {
    return lowerCallEvent(event);
  }
  return lowerAppEvent(event, ctx);
}
/**
 * Lower APP events by delegating to the appropriate plugin.
 * Plugins MUST implement v2Lowering - no fallback.
 */
function lowerAppEvent(
  event: TrackEvent,
  ctx: LoweringContext,
): RuntimeEvent[] {
  const appId = (event as { appId?: string }).appId;
  if (!appId) {
    throw new Error(
      `APP event missing appId at frame ${(event as { at?: number }).at ?? "unknown"}`,
    );
  }

  const pluginLowerer = ctx.pluginLowerers.get(appId);
  if (pluginLowerer) {
    return pluginLowerer.lower(event, ctx);
  }

  throw new Error(`No plugin lowerer registered for appId: ${appId}`);
}

// Camera lowering is now delegated to @tokovo/device-camera
// See: cameraV2Lowering imported at top of file

/**
 * Lower audio events.
 */
function lowerAudioEvent(event: AudioTrackEvent): AudioRuntimeEvent[] {
  const base = { at: event.at, kind: "AUDIO" as const };

  switch (event.type) {
    case "BGM_START":
      return [
        {
          ...base,
          type: "PLAY",
          soundId: event.payload.soundId,
          volume: event.payload.volume,
          fadeIn: event.payload.fadeIn,
          loop: true,
          bus: "music",
        } satisfies AudioPlayEvent,
      ];

    case "BGM_END":
      return [
        {
          ...base,
          type: "FADE_OUT",
          duration: event.payload.fadeOut ?? 30,
        } satisfies AudioFadeOutEvent,
      ];

    case "PLAY":
      return [
        {
          ...base,
          type: "PLAY",
          soundId: event.payload.soundId,
          volume: event.payload.volume,
          loop: event.payload.loop,
        } satisfies AudioPlayEvent,
      ];

    case "STOP":
      return [
        {
          ...base,
          type: "STOP",
          soundId: event.payload.soundId,
        } satisfies AudioStopEvent,
      ];

    case "CROSSFADE":
      return [
        {
          ...base,
          type: "CROSSFADE",
          duration: event.payload.duration,
          soundId: event.payload.soundId,
          volume: event.payload.volume,
        } satisfies AudioCrossfadeEvent,
      ];

    case "FADE_OUT":
      return [
        {
          ...base,
          type: "FADE_OUT",
          duration: event.payload.duration,
        } satisfies AudioFadeOutEvent,
      ];

    case "STOP_ALL":
      return [{ ...base, type: "STOP_ALL" } satisfies AudioStopAllEvent];

    default:
      return [];
  }
}

function lowerVoiceEvent(
  event: VoiceTrackEvent,
  ctx: LoweringContext,
): VoiceRuntimeEvent[] {
  const base = {
    at: event.at,
    kind: "VOICE" as const,
    deviceId: event.deviceId,
  };

  switch (event.type) {
    case "PLAY_SEGMENT": {
      const events: VoiceRuntimeEvent[] = [
        {
          ...base,
          type: "PLAY_SEGMENT",
          segmentId: event.payload.segmentId,
          audioPath: event.payload.audioPath,
          startMs: event.payload.startMs,
          endMs: event.payload.endMs,
          volume: event.payload.volume,
          speed: event.payload.speed,
          speaker: event.payload.speaker,
          text: event.payload.text,
        } satisfies VoicePlaySegmentEvent,
      ];

      const durationMs = event.payload.endMs - event.payload.startMs;
      if (durationMs > 0) {
        const durationFrames = Math.ceil((durationMs / 1000) * ctx.fps);
        const stopFrame = event.at + durationFrames;
        events.push({
          at: stopFrame,
          kind: "VOICE" as const,
          deviceId: event.deviceId,
          type: "STOP_VOICE",
          targetSegmentId: event.payload.segmentId,
        } satisfies VoiceStopEvent);
      }

      return events;
    }

    case "STOP_VOICE":
      return [{ ...base, type: "STOP_VOICE" } satisfies VoiceStopEvent];

    default:
      return [];
  }
}

/**
 * Lower OS events.
 */
function lowerOSEvent(event: OSTrackEvent): OSRuntimeEvent[] {
  const base = { at: event.at, kind: "OS" as const, deviceId: event.deviceId };

  switch (event.type) {
    case "SET_TIME":
      return [{ ...base, type: "SET_TIME", time: event.payload.time }];

    case "SET_BATTERY":
      return [
        {
          ...base,
          type: "SET_BATTERY",
          level: event.payload.level,
          charging: event.payload.charging,
        },
      ];

    case "SET_NETWORK":
      return [
        {
          ...base,
          type: "SET_NETWORK",
          network: event.payload.type,
          strength: event.payload.strength,
        },
      ];

    case "SET_DND":
      return [{ ...base, type: "SET_DND", enabled: event.payload.enabled }];

    case "SET_STATE":
      return [{ ...base, type: "SET_TIME", ...event.payload }];

    default:
      return [];
  }
}

/**
 * Lower marker events (debugging only).
 */
function lowerMarkerEvent(_event: MarkerTrackEvent): RuntimeEvent[] {
  return [];
}

/**
 * Lower CALL events (phone calls).
 * These come from CallTrackBuilder DSL.
 */
function lowerCallEvent(event: TrackEvent): CallRuntimeEvent[] {
  const e = event as TrackEvent & {
    type: string;
    deviceId?: string;
    callerId?: string;
    callerName?: string;
    callerAvatar?: string;
    isVideo?: boolean;
  };

  return [
    {
      at: e.at,
      kind: "CALL",
      type: e.type as CallRuntimeEvent["type"],
      deviceId: e.deviceId,
      callerId: e.callerId,
      callerName: e.callerName,
      callerAvatar: e.callerAvatar,
      isVideo: e.isVideo,
    },
  ];
}

interface ExtendedDeviceEvent {
  at: number;
  kind: "DEVICE";
  deviceId: string;
  type: string;
  id?: string;
  appId?: string;
  title?: string;
  body?: string;
  mode?: string;
  priority?: string;
  icon?: string;
  preview?: string;
  actions?: unknown[];
  groupKey?: string;
  threadId?: string;
  direction?: string;
  action?: string;
  actionId?: string;
  content?: unknown;
  open?: boolean;
  text?: string;
  all?: boolean;
}

function lowerDeviceEvent(event: TrackEvent): RuntimeEvent[] {
  const e = event as TrackEvent & Record<string, unknown>;
  const p = (e.payload ?? {}) as Record<string, unknown>;
  const base = {
    at: e.at as number,
    kind: "DEVICE" as const,
    deviceId: (e.deviceId as string) ?? "device_1",
    silent: (e.silent as boolean | undefined) === true ? true : undefined,
  };

  const type = e.type as string;

  switch (type) {
    case "LOCK":
      return [{ ...base, type: "LOCK", payload: {} } as DeviceRuntimeEvent];

    case "UNLOCK":
      return [{ ...base, type: "UNLOCK", payload: {} } as DeviceRuntimeEvent];

    case "OPEN_APP":
      return [
        {
          ...base,
          type: "OPEN_APP",
          payload: {
            appId: (p.appId ?? e.appId) as string,
            transition: (p.transition ?? e.transition) as unknown,
          },
        } as DeviceRuntimeEvent,
      ];

    case "CLOSE_APP":
      return [{ ...base, type: "CLOSE_APP", payload: {} } as DeviceRuntimeEvent];

    case "GO_HOME":
      return [
        {
          ...base,
          type: "GO_HOME",
          payload: {
            transition: (p.transition ?? e.transition) as unknown,
          },
        } as DeviceRuntimeEvent,
      ];

    case "SET_BADGE":
      return [
        {
          ...base,
          type: "SET_BADGE",
          payload: {
            appId: (p.appId ?? e.appId) as string,
            count: Number(p.count ?? e.count ?? 0),
          },
        } as DeviceRuntimeEvent,
      ];

    case "SET_BATTERY":
      return [
        {
          ...base,
          type: "SET_BATTERY",
          payload: {
            percent: Number(p.percent ?? p.level ?? e.percent ?? e.level ?? 100),
            charging: Boolean(p.charging ?? e.charging ?? false),
          },
        } as unknown as DeviceRuntimeEvent,
      ];

    case "SET_NETWORK":
      return [
        {
          ...base,
          type: "SET_NETWORK",
          payload: {
            network: (p.network ?? p.type ?? e.network ?? e.type) as string,
            strength: Number(p.strength ?? e.strength ?? 4),
          },
        } as unknown as DeviceRuntimeEvent,
      ];

    case "SET_DND":
      return [
        {
          ...base,
          type: "SET_DND",
          payload: { dnd: Boolean(p.dnd ?? p.enabled ?? e.dnd ?? e.enabled ?? false) },
        } as unknown as DeviceRuntimeEvent,
      ];

    case "SET_DYNAMIC_ISLAND":
      return [
        {
          ...base,
          type: "SET_DYNAMIC_ISLAND",
          payload: {
            visible: Boolean(p.visible ?? e.visible ?? false),
            mode: (p.mode ?? e.mode ?? "idle") as string,
          },
        } as DeviceRuntimeEvent,
      ];

    case "SET_SCREEN_RECORDING":
      return [
        {
          ...base,
          type: "SET_SCREEN_RECORDING",
          payload: {
            enabled: Boolean(p.enabled ?? e.enabled ?? false),
            mode: (p.mode ?? e.mode) as "minimal" | "compact" | undefined,
          },
        } as DeviceRuntimeEvent,
      ];

    case "INCOMING_CALL":
      return [
        {
          ...base,
          type: "INCOMING_CALL",
          payload: {
            callerId: (p.callerId ?? e.callerId) as string,
            callerName: (p.callerName ?? e.callerName) as string | undefined,
            callerAvatar: (p.callerAvatar ?? e.callerAvatar) as string | undefined,
            isVideo: Boolean(p.isVideo ?? e.isVideo ?? false),
          },
        } as DeviceRuntimeEvent,
      ];

    case "CALL_ANSWERED":
      return [
        {
          ...base,
          type: "CALL_ANSWERED",
          payload: {},
        } as DeviceRuntimeEvent,
      ];

    case "CALL_ENDED":
      return [
        {
          ...base,
          type: "CALL_ENDED",
          payload: {},
        } as DeviceRuntimeEvent,
      ];

    case "START_BACKGROUND_APP":
      return [
        {
          ...base,
          type: "START_BACKGROUND_APP",
          payload: {
            appId: (p.appId ?? e.appId) as string,
            indicator: (p.indicator ?? e.indicator) as string | undefined,
            label: (p.label ?? e.label) as string | undefined,
          },
        } as DeviceRuntimeEvent,
      ];

    case "STOP_BACKGROUND_APP":
      return [
        {
          ...base,
          type: "STOP_BACKGROUND_APP",
          payload: {
            appId: (p.appId ?? e.appId) as string,
          },
        } as DeviceRuntimeEvent,
      ];

    case "NOTIFICATION_SHOW": {
      // Map IR uppercase priorities to runtime lowercase
      const irPriority = (p.priority ?? e.priority) as string | undefined;
      const priority = irPriority ? irPriority.toLowerCase() : "default";
      return [
        {
          ...base,
          type: "SHOW_NOTIFICATION",
          payload: {
            kind: "show",
            id: p.id ?? e.id,
            appId: p.appId ?? e.appId,
            title: p.title ?? e.title,
            body: p.body ?? e.body,
            priority,
            icon: p.icon ?? e.icon,
            mode: (p.mode ?? e.mode ?? "headsup") as string,
          },
        } as DeviceRuntimeEvent,
      ];
    }

    case "NOTIFICATION_DISMISS":
      return [
        {
          ...base,
          type: "DISMISS_NOTIFICATION",
          payload: { kind: "dismiss", id: (p.id ?? e.id) as string },
        } as DeviceRuntimeEvent,
      ];

    case "NOTIFICATION_TAP":
      return [
        {
          ...base,
          type: "TAP_NOTIFICATION",
          payload: { kind: "tap", id: (p.id ?? e.id) as string },
        } as DeviceRuntimeEvent,
      ];

    case "NOTIFICATION_SWIPE":
      return [
        {
          ...base,
          type: "SWIPE_NOTIFICATION",
          payload: {
            kind: "swipe",
            id: (p.id ?? e.id) as string,
            direction: (p.direction ?? e.direction) as string,
          },
        } as DeviceRuntimeEvent,
      ];

    case "NOTIFICATION_DYNAMIC_ISLAND":
      return [
        {
          ...base,
          type: "SET_DYNAMIC_ISLAND",
          payload: {
            kind: "dynamicIsland",
            visible: true,
            mode: (p.mode ?? e.mode) as string,
          },
        } as DeviceRuntimeEvent,
      ];

    case "NOTIFICATION_OPEN_PANEL":
      return [
        {
          ...base,
          type: "TOGGLE_NOTIFICATION_PANEL",
        } as DeviceRuntimeEvent,
      ];

    case "NOTIFICATION_CLOSE_PANEL":
      return [
        {
          ...base,
          type: "TOGGLE_NOTIFICATION_PANEL",
        } as DeviceRuntimeEvent,
      ];

    case "NOTIFICATION_CLEAR_ALL":
      return [
        {
          ...base,
          type: "CLEAR_ALL_NOTIFICATIONS",
          payload: { kind: "clearAll" },
        } as DeviceRuntimeEvent,
      ];

    case "NOTIFICATION_REPLY":
      return [
        {
          ...base,
          type: "REPLY_NOTIFICATION",
          payload: {
            kind: "reply",
            id: (p.id ?? e.id) as string,
            text: (p.text ?? e.text) as string,
          },
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_SHOW":
      return [
        {
          ...base,
          type: "KEYBOARD_SHOW",
          payload: { returnKeyType: (p.returnKeyType ?? e.returnKeyType) as string | undefined },
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_HIDE":
      return [
        {
          ...base,
          type: "KEYBOARD_HIDE",
          payload: {},
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_KEY_PRESS":
      return [
        {
          ...base,
          type: "KEYBOARD_KEY_PRESS",
          payload: {
            key: (p.key ?? e.key) as string,
            duration: (p.duration ?? e.duration) as number | undefined,
          },
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_TYPE":
      return [
        {
          ...base,
          type: "KEYBOARD_TYPE",
          payload: {
            text: (p.text ?? e.text) as string,
            speed: (p.speed ?? e.speed) as string | undefined,
          },
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_CLEAR":
      return [
        {
          ...base,
          type: "KEYBOARD_CLEAR",
          payload: {},
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_SET_SUGGESTIONS":
      return [
        {
          ...base,
          type: "KEYBOARD_SET_SUGGESTIONS",
          payload: { suggestions: (p.suggestions ?? e.suggestions) as string[] },
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_TAP_SUGGESTION":
      return [
        {
          ...base,
          type: "KEYBOARD_TAP_SUGGESTION",
          payload: { index: Number(p.index ?? e.index ?? 0) },
        } as DeviceRuntimeEvent,
      ];

    default:
      throw new Error(`Unknown DEVICE event type: ${type}`);
  }
}

// =============================================================================
// MAIN LOWERING FUNCTION
// =============================================================================

/**
 * Lower all track events to runtime events.
 */
export function lowerTrackEvents(
  events: TrackEvent[],
  ctx: LoweringContext,
): RuntimeEvent[] {
  const runtimeEvents: RuntimeEvent[] = [];
  for (const event of events) {
    runtimeEvents.push(...lowerTrackEvent(event, ctx));
  }
  return runtimeEvents.sort((a, b) => a.at - b.at);
}

/**
 * Create lowering context from plugins.
 * Plugins with a `v2Lowering` property will be used for APP event delegation.
 */
export function createLoweringContext(
  plugins: TokovoPlugin[],
  fps: number = 30,
): LoweringContext {
  const pluginLowerers = new Map<string, PluginLowering>();

  for (const plugin of plugins) {
    // Check if plugin has V2 lowering capability
    const pluginWithV2Lowering = plugin as TokovoPlugin & {
      v2Lowering?: {
        lower: (event: TrackEvent, ctx: LoweringContext) => RuntimeEvent[];
      };
    };

    if (pluginWithV2Lowering.v2Lowering) {
      pluginLowerers.set(plugin.id, {
        appId: plugin.id,
        lower: pluginWithV2Lowering.v2Lowering.lower,
      });
    }
  }

  return { pluginLowerers, fps };
}

/**
 * Lower a full TrackEpisodeIR to runtime events.
 */
export function lowerEpisode(
  ir: TrackEpisodeIR,
  plugins: TokovoPlugin[],
): RuntimeEvent[] {
  const ctx = createLoweringContext(plugins, ir.fps);
  return lowerTrackEvents(ir.events, ctx);
}
