/**
 * Instagram Lowering Handler
 * 
 * Transforms DSL track events into runtime events.
 * Most events pass through directly since the reducer handles them.
 */

import type { InstagramTrackEvent } from "../ir/track-event";

// =============================================================================
// LOWERING HANDLER
// =============================================================================

export interface LoweringContext {
    fps: number;
}

export function lowerInstagramEvent(
    event: InstagramTrackEvent,
    _ctx: LoweringContext
): RuntimeInstagramEvent[] {
    // Instagram events pass through directly
    // The reducer handles all event types
    const { payload, ...rest } = event;
    return [{
        kind: "APP",
        appId: "app_instagram",
        type: event.type,
        ...payload,
        at: event.at,
        deviceId: event.deviceId,
    }];
}

// =============================================================================
// TYPES
// =============================================================================

interface RuntimeInstagramEvent {
    kind: "APP";
    appId: "app_instagram";
    type: string;
    at: number;
    deviceId: string;
    [key: string]: unknown;
}

// =============================================================================
// EXPORT
// =============================================================================

export const instagramV2Lowering = {
    eventKinds: ["APP"],
    targets: ["app_instagram"],
    lower: lowerInstagramEvent,
};
