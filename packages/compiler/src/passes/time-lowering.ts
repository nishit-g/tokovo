/**
 * Time Lowering Pass
 * 
 * Converts Scene IR operations to Timeline IR operations.
 * - Resolves DurationExpr to frames
 * - Assigns `at` frame numbers
 * - Handles concurrent track compilation
 */

import {
    SceneOp,
    parseDuration,
    TimelineOp,
    TypingStartedOp,
    TypingEndedOp,
    MessageReceivedOp,
    MessageSentOp,
    MessageReadOp,
    MessageDeletedOp,
    Trace,
} from "@tokovo/ir";
import { CompilerContext, Cursor } from "../context";
import { ResolvedOp } from "./resolve-refs";
import { ensureConversationOpened } from "./virtual-device";

/**
 * Lower scene operations to timeline operations.
 */
export function lowerToTimeline(
    ops: SceneOp[],
    ctx: CompilerContext,
    cursor: Cursor,
    deviceId: string,
    appId: string,
    conversationId: string,
    beat: string,
    trackId: string = "main"
): TimelineOp[] {
    const timeline: TimelineOp[] = [];

    for (let i = 0; i < ops.length; i++) {
        const op = ops[i] as ResolvedOp;
        const trace: Trace = ctx.createTrace({
            deviceId,
            beat,
            trackId,
            sceneOpIndex: i,
        });

        const lowered = lowerOp(op, ctx, cursor, deviceId, appId, conversationId, trace);
        timeline.push(...lowered);
    }

    return timeline;
}

function lowerOp(
    op: ResolvedOp,
    ctx: CompilerContext,
    cursor: Cursor,
    deviceId: string,
    appId: string,
    conversationId: string,
    trace: Trace
): TimelineOp[] {
    const events: TimelineOp[] = [];
    const at = cursor.current;

    switch (op.kind) {
        case "Wait": {
            const frames = parseDuration(op.duration, ctx.config.fps);
            cursor.advance(frames);
            // Wait produces no events, just advances cursor
            return [];
        }

        case "TypingStart": {
            // Ensure conversation is open
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: TypingStartedOp = {
                at,
                kind: "TypingStarted",
                deviceId,
                appId,
                conversationId,
                actor: op.actor,
                trace,
            };
            events.push(event);
            return events;
        }

        case "TypingEnd": {
            const event: TypingEndedOp = {
                at,
                kind: "TypingEnded",
                deviceId,
                appId,
                conversationId,
                actor: op.actor,
                trace,
            };
            events.push(event);
            return events;
        }

        case "ReceiveMessage": {
            // Ensure conversation is open
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageReceivedOp = {
                at,
                kind: "MessageReceived",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: op._resolvedMessageId ?? `msg_${at}`,
                    text: op.text,
                    from: op.actor,
                    type: op.meta?.type ?? "text",
                },
                trace,
            };
            events.push(event);
            return events;
        }

        case "SendMessage": {
            // Ensure conversation is open
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            // Filter out "system" type since you can't send system messages
            const msgType = op.meta?.type;
            const sentType = msgType === "system" ? "text" : (msgType ?? "text");

            const event: MessageSentOp = {
                at,
                kind: "MessageSent",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: op._resolvedMessageId ?? `msg_${at}`,
                    text: op.text,
                    type: sentType as "text" | "image" | "voice",
                },
                trace,
            };
            events.push(event);
            return events;
        }

        case "ReadMessage": {
            const event: MessageReadOp = {
                at,
                kind: "MessageRead",
                deviceId,
                appId,
                conversationId: op.ref.conversationId,
                messageId: op.ref.id,
                trace,
            };
            events.push(event);
            return events;
        }

        case "DeleteMessage": {
            const event: MessageDeletedOp = {
                at,
                kind: "MessageDeleted",
                deviceId,
                appId,
                conversationId: op.ref.conversationId,
                messageId: op.ref.id,
                trace,
            };
            events.push(event);
            return events;
        }

        case "Concurrent": {
            // Fork cursor for each track
            const trackCursors: Cursor[] = [];
            const trackTimelines: TimelineOp[][] = [];

            for (let t = 0; t < op.tracks.length; t++) {
                const trackOps = op.tracks[t];
                const trackCursor = cursor.fork();
                const trackId = `track_${t}`;

                const trackTimeline = lowerToTimeline(
                    trackOps,
                    ctx,
                    trackCursor,
                    deviceId,
                    appId,
                    conversationId,
                    trace.beat,
                    trackId
                );

                trackCursors.push(trackCursor);
                trackTimelines.push(trackTimeline);
            }

            // Merge all track timelines
            for (const tl of trackTimelines) {
                events.push(...tl);
            }

            // Join cursors at max position
            const joined = Cursor.join(trackCursors);
            cursor.advance(joined.current - cursor.current);

            return events;
        }

        default:
            return [];
    }
}
