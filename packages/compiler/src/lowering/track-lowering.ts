/**
 * Track Lowering - Convert TrackEvent to RuntimeEvent
 * 
 * @description Transforms the v2 track-based events to the runtime event format.
 * This is the bridge between the new DSL and the existing engine.
 * 
 * @see docs-v2/DSL_REVAMP.md#compilation
 */

import type {
    TrackEvent,
    TrackEpisodeIR,
    WhatsAppTrackEvent,
    CameraTrackEvent,
    AudioTrackEvent,
    OSTrackEvent,
    MarkerTrackEvent,
} from "@tokovo/ir";
import type { RuntimeEvent, AppRuntimeEvent } from "@tokovo/core";

// =============================================================================
// LOWERING FUNCTIONS
// =============================================================================

/**
 * Lower a single TrackEvent to RuntimeEvent(s).
 * Some events (spans) may produce multiple RuntimeEvents.
 */
export function lowerTrackEvent(event: TrackEvent): RuntimeEvent[] {
    switch (event.kind) {
        case "APP":
            return lowerAppEvent(event as WhatsAppTrackEvent);
        case "CAMERA":
            return lowerCameraEvent(event as CameraTrackEvent);
        case "AUDIO":
            return lowerAudioEvent(event as AudioTrackEvent);
        case "OS":
            return lowerOSEvent(event as OSTrackEvent);
        case "MARKER":
            return lowerMarkerEvent(event as MarkerTrackEvent);
        default:
            console.warn(`Unknown track event kind:`, (event as any).kind);
            return [];
    }
}

/**
 * Lower WhatsApp app events.
 */
function lowerAppEvent(event: WhatsAppTrackEvent): RuntimeEvent[] {
    const base = {
        at: event.at,
        kind: "APP" as const,
        appId: event.appId,
        deviceId: event.deviceId,
    };

    switch (event.type) {
        case "MESSAGE_RECEIVED":
            // Reducer expects type: MESSAGE_RECEIVED and reads appEvent.text, appEvent.from, appEvent.conversationId
            return [{
                ...base,
                type: "MESSAGE_RECEIVED",
                conversationId: event.payload.conversationId,
                from: event.payload.from,
                text: event.payload.text,
            } as any];

        case "MESSAGE_SENT":
            // Reducer expects type: MESSAGE_SENT 
            return [{
                ...base,
                type: "MESSAGE_SENT",
                conversationId: event.payload.conversationId,
                text: event.payload.text,
            } as any];

        case "TYPING_START":
            // Reducer uses appEvent.from for typing indicators
            return [{
                ...base,
                type: "TYPING_START",
                conversationId: event.payload.conversationId,
                from: event.payload.actor,  // Reducer reads appEvent.from
            } as any];

        case "TYPING_END":
            return [{
                ...base,
                type: "TYPING_END",
                conversationId: event.payload.conversationId,
                from: event.payload.actor,
            } as any];

        case "IMAGE_RECEIVED":
            return [{
                ...base,
                type: "RECEIVE_IMAGE",
                payload: {
                    conversationId: event.payload.conversationId,
                    from: event.payload.from,
                    url: event.payload.url,
                    caption: event.payload.caption,
                    height: event.payload.height,
                },
            } as AppRuntimeEvent];

        case "REACT":
            return [{
                ...base,
                type: "REACT",
                payload: {
                    messageRef: event.payload.messageRef,
                    emoji: event.payload.emoji,
                },
            } as AppRuntimeEvent];

        case "READ":
            return [{
                ...base,
                type: "READ_MESSAGES",
                payload: {
                    conversationId: event.payload.conversationId,
                },
            } as AppRuntimeEvent];

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
            return [{
                ...base,
                type: "SET_VIEW",
                payload: event.payload,
            } as any];

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
                payload: {
                    easing: event.payload.easing,
                },
            } as any];

        // End events are handled by duration, not separate events
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
    const base = {
        at: event.at,
        kind: "AUDIO" as const,
    };

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
                payload: {
                    duration: event.payload.fadeOut ?? 30,
                },
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
                payload: {
                    soundId: event.payload.soundId,
                },
            } as any];

        case "CROSSFADE":
            return [{
                ...base,
                type: "CROSSFADE",
                duration: event.payload.duration,
                payload: {
                    soundId: event.payload.soundId,
                    volume: event.payload.volume,
                },
            } as any];

        case "FADE_OUT":
            return [{
                ...base,
                type: "FADE_OUT",
                payload: {
                    duration: event.payload.duration,
                },
            } as any];

        case "STOP_ALL":
            return [{
                ...base,
                type: "STOP_ALL",
                payload: {},
            } as any];

        default:
            return [];
    }
}

/**
 * Lower OS events.
 */
function lowerOSEvent(event: OSTrackEvent): RuntimeEvent[] {
    const base = {
        at: event.at,
        kind: "OS" as const,
        deviceId: event.deviceId,
    };

    switch (event.type) {
        case "SET_STATE":
        case "SET_TIME":
        case "SET_BATTERY":
        case "SET_NETWORK":
        case "SET_DND":
            return [{
                ...base,
                type: "SET_STATE",
                payload: event.payload,
            } as any];

        case "NOTIFICATION_SHOW":
            return [{
                ...base,
                type: "SHOW_NOTIFICATION",
                payload: event.payload,
            } as any];

        case "NOTIFICATION_DISMISS":
            return [{
                ...base,
                type: "DISMISS_NOTIFICATION",
                payload: event.payload,
            } as any];

        case "NOTIFICATION_DISMISS_ALL":
            return [{
                ...base,
                type: "DISMISS_ALL_NOTIFICATIONS",
                payload: {},
            } as any];

        default:
            return [];
    }
}

/**
 * Lower marker events (for debugging, not processed by engine).
 */
function lowerMarkerEvent(event: MarkerTrackEvent): RuntimeEvent[] {
    // Markers are for debugging/tooling, not runtime
    // We could emit them as special events for dev tools
    return [];
}

// =============================================================================
// MAIN LOWERING FUNCTION
// =============================================================================

/**
 * Lower all track events to runtime events.
 */
export function lowerTrackEvents(events: TrackEvent[]): RuntimeEvent[] {
    const runtimeEvents: RuntimeEvent[] = [];

    for (const event of events) {
        const lowered = lowerTrackEvent(event);
        runtimeEvents.push(...lowered);
    }

    // Sort by frame (already sorted by declaration order in TrackEpisodeIR)
    return runtimeEvents.sort((a, b) => a.at - b.at);
}

/**
 * Lower a full TrackEpisodeIR to runtime events.
 */
export function lowerEpisode(ir: TrackEpisodeIR): RuntimeEvent[] {
    return lowerTrackEvents(ir.events);
}
