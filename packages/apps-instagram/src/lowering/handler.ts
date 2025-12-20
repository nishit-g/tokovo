/**
 * Instagram Lowering Handler
 * 
 * Transforms DSL track events into runtime events.
 * Events pass through with payload kept intact for reducer.
 */

import type { InstagramTrackEvent } from "../ir/track-event";

// =============================================================================
// LOWERING HANDLER
// =============================================================================

export interface LoweringContext {
    fps: number;
    pluginLowerers?: Map<string, any>; // Match the main context interface
}

/**
 * Lower Instagram track events to runtime events.
 * The payload is kept intact - reducer accesses event.payload.x
 */
export function lowerInstagramEvent(
    event: InstagramTrackEvent,
    _ctx: LoweringContext
): RuntimeInstagramEvent[] {
    // Pass through event with payload intact (not spread)
    return [{
        kind: "APP" as const,
        appId: "app_instagram" as const,
        type: event.type,
        at: event.at,
        deviceId: event.deviceId,
        payload: event.payload, // Keep payload wrapped!
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
    payload: Record<string, unknown>;
}

// =============================================================================
// EXPORT
// =============================================================================

export const instagramV2Lowering = {
    eventKinds: ["APP"],
    targets: ["app_instagram"],
    lower: lowerInstagramEvent,
};
