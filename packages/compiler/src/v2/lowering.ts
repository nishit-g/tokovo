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
} from "@tokovo/ir";
import {
  isCameraEvent,
  isAudioEvent,
  isOSEvent,
  isMarkerEvent,
  isCallEvent,
  isDeviceEvent,
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
} from "@tokovo/core";
import { createScopedLogger } from "@tokovo/core";
import { cameraV2Lowering } from "@tokovo/device-camera";

const log = createScopedLogger("compiler");

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
    log.warn("APP event missing appId", { event });
    return [];
  }

  const pluginLowerer = ctx.pluginLowerers.get(appId);
  if (pluginLowerer) {
    return pluginLowerer.lower(event, ctx);
  }

  log.warn(`No plugin lowerer registered for appId: ${appId}. Event dropped.`);
  return [];
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
  };

  const type = e.type as string;

  switch (type) {
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
          payload: { returnKeyType: e.returnKeyType },
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
          payload: { key: e.key, duration: e.duration },
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_TYPE":
      return [
        {
          ...base,
          type: "KEYBOARD_TYPE",
          payload: { text: e.text, speed: e.speed },
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
          payload: { suggestions: e.suggestions },
        } as DeviceRuntimeEvent,
      ];

    case "KEYBOARD_TAP_SUGGESTION":
      return [
        {
          ...base,
          type: "KEYBOARD_TAP_SUGGESTION",
          payload: { index: e.index },
        } as DeviceRuntimeEvent,
      ];

    default:
      log.warn(`Unknown DEVICE event type: ${type}`);
      return [];
      return [];
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
