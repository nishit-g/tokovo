/**
 * Adapter Interface
 * 
 * Adapters translate Timeline IR → Runtime Events.
 * Each adapter is responsible for a specific app/platform.
 */

import { TimelineOp, Trace } from "@tokovo/ir";

/**
 * Runtime event that the Tokovo engine can execute.
 * This matches the existing TimelineEvent structure in @tokovo/core.
 */
export interface RuntimeEvent {
    at: number;
    kind: "DEVICE" | "APP" | "CAMERA" | "AUDIO";
    type: string;
    deviceId?: string;
    appId?: string;
    [key: string]: unknown;

    /** Preserved trace for debugging */
    _trace?: Trace;
}

/**
 * Adapter context provides environment info.
 */
export interface AdapterContext {
    fps: number;
    episodeId: string;
}

/**
 * App adapter interface.
 */
export interface AppAdapter {
    /** App ID this adapter handles */
    readonly appId: string;

    /** Check if this adapter can handle the operation */
    supports(op: TimelineOp): boolean;

    /** Transform Timeline IR op to runtime events */
    lower(op: TimelineOp, ctx: AdapterContext): RuntimeEvent[];
}
