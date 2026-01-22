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
} from "@tokovo/ir";
import type { RuntimeEvent, TokovoPlugin } from "@tokovo/core";
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
  // Cast to handle extended kinds like CALL that aren't in TrackEvent union
  const kind = event.kind as string;

  switch (kind) {
    case "CAMERA":
      return cameraV2Lowering(
        event as unknown as Parameters<typeof cameraV2Lowering>[0],
        { fps: ctx.fps },
      ) as unknown as RuntimeEvent[];
    case "AUDIO":
      return lowerAudioEvent(event as AudioTrackEvent);
    case "OS":
      return lowerOSEvent(event as OSTrackEvent);
    case "MARKER":
      return lowerMarkerEvent(event as MarkerTrackEvent);
    case "DEVICE":
      return lowerDeviceEvent(event);
    case "CALL":
      return lowerCallEvent(event);
    default:
      return lowerAppEvent(event, ctx);
  }
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
    console.warn(`[lowering] APP event missing appId:`, event);
    return [];
  }

  // Plugin lowerer is required - no fallback
  const pluginLowerer = ctx.pluginLowerers.get(appId);
  if (pluginLowerer) {
    return pluginLowerer.lower(event, ctx);
  }

  console.warn(
    `[lowering] No plugin lowerer registered for appId: ${appId}. Event dropped.`,
  );
  return [];
}

// Camera lowering is now delegated to @tokovo/device-camera
// See: cameraV2Lowering imported at top of file

/**
 * Lower audio events.
 */
function lowerAudioEvent(event: AudioTrackEvent): RuntimeEvent[] {
  const base = { at: event.at, kind: "AUDIO" as const };

  switch (event.type) {
    case "BGM_START":
      return [
        {
          ...base,
          type: "PLAY",
          payload: {
            soundId: event.payload.soundId,
            volume: event.payload.volume,
            fadeIn: event.payload.fadeIn,
            loop: true,
          },
        } as any,
      ];

    case "BGM_END":
      return [
        {
          ...base,
          type: "FADE_OUT",
          payload: { duration: event.payload.fadeOut ?? 30 },
        } as any,
      ];

    case "PLAY":
      return [
        {
          ...base,
          type: "PLAY",
          payload: {
            soundId: event.payload.soundId,
            volume: event.payload.volume,
            loop: event.payload.loop,
          },
        } as any,
      ];

    case "STOP":
      return [
        {
          ...base,
          type: "STOP",
          payload: { soundId: event.payload.soundId },
        } as any,
      ];

    case "CROSSFADE":
      return [
        {
          ...base,
          type: "CROSSFADE",
          duration: event.payload.duration,
          payload: {
            soundId: event.payload.soundId,
            volume: event.payload.volume,
          },
        } as any,
      ];

    case "FADE_OUT":
      return [
        {
          ...base,
          type: "FADE_OUT",
          payload: { duration: event.payload.duration },
        } as any,
      ];

    case "STOP_ALL":
      return [{ ...base, type: "STOP_ALL", payload: {} } as any];

    default:
      return [];
  }
}

/**
 * Lower OS events.
 */
function lowerOSEvent(event: OSTrackEvent): RuntimeEvent[] {
  const base = { at: event.at, kind: "OS" as const, deviceId: event.deviceId };

  switch (event.type) {
    case "SET_STATE":
    case "SET_TIME":
    case "SET_BATTERY":
    case "SET_NETWORK":
    case "SET_DND":
      return [{ ...base, type: "SET_STATE", payload: event.payload } as any];

    case "NOTIFICATION_SHOW":
      return [
        { ...base, type: "SHOW_NOTIFICATION", payload: event.payload } as any,
      ];

    case "NOTIFICATION_DISMISS":
      return [
        {
          ...base,
          type: "DISMISS_NOTIFICATION",
          payload: event.payload,
        } as any,
      ];

    case "NOTIFICATION_DISMISS_ALL":
      return [
        { ...base, type: "DISMISS_ALL_NOTIFICATIONS", payload: {} } as any,
      ];

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
function lowerCallEvent(event: TrackEvent): RuntimeEvent[] {
  const e = event as any;

  console.log("[lowerCallEvent] 📞 Lowering CALL event:", e.type, "at", e.at);

  // CALL events are passed through 1:1 with kind: "CALL"
  const { _declarationOrder, ...rest } = e;
  const result = [
    {
      ...rest,
      at: e.at,
      kind: "CALL" as const,
      deviceId: e.deviceId,
      type: e.type,
    },
  ];

  console.log("[lowerCallEvent] 📤 Output:", result);
  return result as any[];
}

/**
 * Lower DEVICE events (notifications, dynamic island, etc.)
 * These come from NotificationTrackBuilder and similar device-level DSLs.
 */
function lowerDeviceEvent(event: TrackEvent): RuntimeEvent[] {
  const e = event as any;
  const base = {
    at: e.at,
    kind: "DEVICE" as const,
    deviceId: e.deviceId,
  };

  switch (e.type) {
    // Notification events
    case "NOTIFICATION_SHOW":
      return [
        {
          ...base,
          type: "SHOW_NOTIFICATION",
          id: e.id,
          appId: e.appId,
          title: e.title,
          body: e.body,
          mode: e.mode,
          priority: e.priority,
          icon: e.icon,
          preview: e.preview,
          actions: e.actions,
          groupKey: e.groupKey,
          threadId: e.threadId,
        } as any,
      ];

    case "NOTIFICATION_DISMISS":
      return [
        {
          ...base,
          type: "DISMISS_NOTIFICATION",
          id: e.id,
          groupKey: e.groupKey,
          all: e.all,
        } as any,
      ];

    case "NOTIFICATION_TAP":
      return [
        {
          ...base,
          type: "TAP_NOTIFICATION",
          id: e.id,
          actionId: e.actionId,
        } as any,
      ];

    case "NOTIFICATION_SWIPE":
      return [
        {
          ...base,
          type: "SWIPE_NOTIFICATION",
          id: e.id,
          direction: e.direction,
          action: e.action,
        } as any,
      ];

    case "NOTIFICATION_DYNAMIC_ISLAND":
      return [
        {
          ...base,
          type: "SET_DYNAMIC_ISLAND",
          mode: e.mode,
          appId: e.appId,
          content: e.content,
        } as any,
      ];

    case "NOTIFICATION_OPEN_PANEL":
      return [
        {
          ...base,
          type: "TOGGLE_NOTIFICATION_PANEL",
          open: true,
        } as any,
      ];

    case "NOTIFICATION_CLOSE_PANEL":
      return [
        {
          ...base,
          type: "TOGGLE_NOTIFICATION_PANEL",
          open: false,
        } as any,
      ];

    case "NOTIFICATION_CLEAR_ALL":
      return [
        {
          ...base,
          type: "CLEAR_ALL_NOTIFICATIONS",
        } as any,
      ];

    case "NOTIFICATION_REPLY":
      return [
        {
          ...base,
          type: "REPLY_NOTIFICATION",
          id: e.id,
          text: e.text,
        } as any,
      ];

    default:
      console.warn(`[lowering] Unknown DEVICE event type: ${e.type}`);
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
