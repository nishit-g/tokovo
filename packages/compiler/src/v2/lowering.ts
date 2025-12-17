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

// =============================================================================
// TYPES
// =============================================================================

/**
 * Plugin lowering interface - plugins implement this to lower their events.
 */
export interface PluginLowering {
    appId: string;
    lower(event: TrackEvent): RuntimeEvent[];
}

/**
 * Lowering context with registered plugin lowerers.
 */
export interface LoweringContext {
    pluginLowerers: Map<string, PluginLowering>;
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
    ctx: LoweringContext
): RuntimeEvent[] {
    switch (event.kind) {
        case "CAMERA":
            return lowerCameraEvent(event as CameraTrackEvent);
        case "AUDIO":
            return lowerAudioEvent(event as AudioTrackEvent);
        case "OS":
            return lowerOSEvent(event as OSTrackEvent);
        case "MARKER":
            return lowerMarkerEvent(event as MarkerTrackEvent);
        default:
            // APP events - delegate to plugin
            return lowerAppEvent(event, ctx);
    }
}
/**
 * Lower APP events by delegating to the appropriate plugin.
 * Falls back to built-in WhatsApp lowering for backward compatibility.
 */
function lowerAppEvent(event: TrackEvent, ctx: LoweringContext): RuntimeEvent[] {
    const appId = (event as { appId?: string }).appId;
    if (!appId) {
        console.warn(`[lowering] APP event missing appId:`, event);
        return [];
    }

    // Try plugin lowerer first
    const pluginLowerer = ctx.pluginLowerers.get(appId);
    if (pluginLowerer) {
        return pluginLowerer.lower(event);
    }

    // Fallback: built-in WhatsApp lowering for backward compatibility
    if (appId === "app_whatsapp") {
        return lowerWhatsAppEvent(event);
    }

    console.warn(`[lowering] No plugin lowerer for appId: ${appId}`);
    return [];
}

/**
 * Built-in WhatsApp lowering (fallback until plugin adopts lowering interface).
 */
function lowerWhatsAppEvent(event: TrackEvent): RuntimeEvent[] {
    const e = event as any;
    const base = {
        at: e.at,
        kind: "APP" as const,
        appId: e.appId,
        deviceId: e.deviceId,
    };

    switch (e.type) {
        case "MESSAGE_RECEIVED":
            return [{
                ...base,
                type: "MESSAGE_RECEIVED",
                conversationId: e.payload.conversationId,
                from: e.payload.from,
                text: e.payload.text,
            } as any];

        case "MESSAGE_SENT":
            return [{
                ...base,
                type: "MESSAGE_SENT",
                conversationId: e.payload.conversationId,
                text: e.payload.text,
            } as any];

        case "TYPING_START":
            return [{
                ...base,
                type: "TYPING_START",
                conversationId: e.payload.conversationId,
                from: e.payload.actor,
            } as any];

        case "TYPING_END":
            return [{
                ...base,
                type: "TYPING_END",
                conversationId: e.payload.conversationId,
                from: e.payload.actor,
            } as any];

        case "IMAGE_RECEIVED":
            return [{
                ...base,
                type: "RECEIVE_IMAGE",
                payload: e.payload,
            } as any];

        case "REACT":
            return [{
                ...base,
                type: "REACT",
                payload: e.payload,
            } as any];

        case "READ":
            return [{
                ...base,
                type: "READ_MESSAGES",
                payload: { conversationId: e.payload.conversationId },
            } as any];

        default:
            return [];
    }
}

/**
 * Lower camera events.
 */
function lowerCameraEvent(event: CameraTrackEvent): RuntimeEvent[] {
    const base = {
        at: event.at,
        kind: "CAMERA" as const,
        deviceId: event.deviceId,
    };

    switch (event.type) {
        case "SET":
            return [{ ...base, type: "SET_VIEW", payload: event.payload } as any];

        case "ANIMATE_START":
            return [{
                ...base,
                type: "ZOOM",
                duration: event.duration ?? 30,
                payload: {
                    scale: event.payload.scale ?? 1,
                    translateX: event.payload.x ?? 0,
                    translateY: event.payload.y ?? 0,
                    easing: event.payload.easing,
                },
            } as any];

        case "FOCUS":
            return [{
                ...base,
                type: "ANCHOR_FOCUS",
                duration: event.duration ?? 30,
                anchor: event.payload.anchorId,
                payload: {
                    scale: event.payload.scale,
                    padding: event.payload.padding,
                    easing: event.payload.easing,
                },
            } as any];

        case "TRACK_START":
            return [{
                ...base,
                type: "ANCHOR_TRACK",
                duration: event.duration ?? 30,
                anchor: event.payload.anchorId,
                payload: {
                    scale: event.payload.scale,
                    lag: event.payload.lag,
                },
            } as any];

        case "SHAKE_START":
            return [{
                ...base,
                type: "SHAKE",
                duration: event.duration ?? 15,
                payload: {
                    intensity: Math.max(event.payload.intensityX, event.payload.intensityY),
                    frequency: event.payload.frequency ?? 15,
                    decay: event.payload.decay,
                },
            } as any];

        case "RESET":
            return [{
                ...base,
                type: "RESET",
                duration: event.duration ?? 30,
                payload: { easing: event.payload.easing },
            } as any];

        case "ANIMATE_END":
        case "TRACK_END":
        case "SHAKE_END":
            return [];

        default:
            return [];
    }
}

/**
 * Lower audio events.
 */
function lowerAudioEvent(event: AudioTrackEvent): RuntimeEvent[] {
    const base = { at: event.at, kind: "AUDIO" as const };

    switch (event.type) {
        case "BGM_START":
            return [{
                ...base,
                type: "PLAY",
                payload: {
                    soundId: event.payload.soundId,
                    volume: event.payload.volume,
                    fadeIn: event.payload.fadeIn,
                    loop: true,
                },
            } as any];

        case "BGM_END":
            return [{
                ...base,
                type: "FADE_OUT",
                payload: { duration: event.payload.fadeOut ?? 30 },
            } as any];

        case "PLAY":
            return [{
                ...base,
                type: "PLAY",
                payload: {
                    soundId: event.payload.soundId,
                    volume: event.payload.volume,
                    loop: event.payload.loop,
                },
            } as any];

        case "STOP":
            return [{
                ...base,
                type: "STOP",
                payload: { soundId: event.payload.soundId },
            } as any];

        case "CROSSFADE":
            return [{
                ...base,
                type: "CROSSFADE",
                duration: event.payload.duration,
                payload: { soundId: event.payload.soundId, volume: event.payload.volume },
            } as any];

        case "FADE_OUT":
            return [{
                ...base,
                type: "FADE_OUT",
                payload: { duration: event.payload.duration },
            } as any];

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
            return [{ ...base, type: "SHOW_NOTIFICATION", payload: event.payload } as any];

        case "NOTIFICATION_DISMISS":
            return [{ ...base, type: "DISMISS_NOTIFICATION", payload: event.payload } as any];

        case "NOTIFICATION_DISMISS_ALL":
            return [{ ...base, type: "DISMISS_ALL_NOTIFICATIONS", payload: {} } as any];

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

// =============================================================================
// MAIN LOWERING FUNCTION
// =============================================================================

/**
 * Lower all track events to runtime events.
 */
export function lowerTrackEvents(
    events: TrackEvent[],
    ctx: LoweringContext
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
export function createLoweringContext(plugins: TokovoPlugin[]): LoweringContext {
    const pluginLowerers = new Map<string, PluginLowering>();

    for (const plugin of plugins) {
        // Check if plugin has V2 lowering capability
        const pluginWithV2Lowering = plugin as TokovoPlugin & {
            v2Lowering?: { lower: (event: TrackEvent) => RuntimeEvent[] };
        };

        if (pluginWithV2Lowering.v2Lowering) {
            pluginLowerers.set(plugin.id, {
                appId: plugin.id,
                lower: pluginWithV2Lowering.v2Lowering.lower,
            });
        }
    }

    return { pluginLowerers };
}

/**
 * Lower a full TrackEpisodeIR to runtime events.
 */
export function lowerEpisode(
    ir: TrackEpisodeIR,
    plugins: TokovoPlugin[]
): RuntimeEvent[] {
    const ctx = createLoweringContext(plugins);
    return lowerTrackEvents(ir.events, ctx);
}
