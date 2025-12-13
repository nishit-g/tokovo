/**
 * Trace Model
 * 
 * Every operation carries trace metadata for debugging,
 * golden tests, and AI explainability.
 * 
 * RULE: Every Timeline IR op and every runtime event must preserve Trace.
 */

/**
 * Canonical trace for any operation in the system.
 * This is the DEBUG SPINE of Tokovo.
 */
export interface Trace {
    /** Episode identifier */
    episodeId: string;

    /** Device this operation targets */
    deviceId: string;

    /** Beat name (semantic grouping) */
    beat: string;

    /** Track ID for concurrent operations */
    trackId: string;

    /** Index within the scene ops array */
    sceneOpIndex: number;

    /** Optional source location for debugging */
    source?: {
        file?: string;
        line?: number;
    };
}

/**
 * Create a default trace (for internal use)
 */
export function createTrace(partial: Partial<Trace>): Trace {
    return {
        episodeId: partial.episodeId ?? "",
        deviceId: partial.deviceId ?? "",
        beat: partial.beat ?? "",
        trackId: partial.trackId ?? "main",
        sceneOpIndex: partial.sceneOpIndex ?? 0,
        source: partial.source,
    };
}
