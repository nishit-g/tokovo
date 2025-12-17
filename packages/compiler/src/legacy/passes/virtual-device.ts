/**
 * Virtual Device State Pass
 * 
 * Tracks virtual device state and auto-inserts:
 * - DeviceUnlocked before any action
 * - AppOpened before chat operations
 * - ConversationOpened before message operations
 * 
 * This ensures the episode JSON has all required glue events.
 */

import { TimelineOp, DeviceUnlockedOp, AppOpenedOp, ConversationOpenedOp, Trace } from "@tokovo/ir";
import { CompilerContext } from "../context";

/**
 * Check if device needs unlock and insert event.
 */
export function ensureUnlocked(
    ctx: CompilerContext,
    deviceId: string,
    at: number,
    trace: Trace
): TimelineOp[] {
    const state = ctx.getDeviceState(deviceId);

    if (state.isLocked) {
        ctx.updateDeviceState(deviceId, { isLocked: false });

        const op: DeviceUnlockedOp = {
            at,
            kind: "DeviceUnlocked",
            deviceId,
            trace,
        };
        return [op];
    }

    return [];
}

/**
 * Check if app needs to be opened and insert event.
 */
export function ensureAppOpened(
    ctx: CompilerContext,
    deviceId: string,
    appId: string,
    at: number,
    trace: Trace
): TimelineOp[] {
    const state = ctx.getDeviceState(deviceId);
    const events: TimelineOp[] = [];

    // First ensure unlocked
    events.push(...ensureUnlocked(ctx, deviceId, at, trace));

    if (state.foregroundAppId !== appId) {
        ctx.updateDeviceState(deviceId, { foregroundAppId: appId });

        const op: AppOpenedOp = {
            at,
            kind: "AppOpened",
            deviceId,
            appId,
            trace,
        };
        events.push(op);
    }

    return events;
}

/**
 * Check if conversation needs to be opened and insert event.
 */
export function ensureConversationOpened(
    ctx: CompilerContext,
    deviceId: string,
    appId: string,
    conversationId: string,
    at: number,
    trace: Trace
): TimelineOp[] {
    const state = ctx.getDeviceState(deviceId);
    const events: TimelineOp[] = [];

    // First ensure app is open
    events.push(...ensureAppOpened(ctx, deviceId, appId, at, trace));

    if (state.activeConversationId !== conversationId) {
        ctx.updateDeviceState(deviceId, { activeConversationId: conversationId });

        const op: ConversationOpenedOp = {
            at,
            kind: "ConversationOpened",
            deviceId,
            appId,
            conversationId,
            trace,
        };
        events.push(op);
    }

    return events;
}
