/**
 * Time Lowering Pass
 * 
 * Converts Scene IR operations to Timeline IR operations.
 * - Resolves DurationExpr to frames
 * - Assigns `at` frame numbers
 * - Handles concurrent track compilation
 * - Implements auto-timing for natural message flow
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

// =============================================================================
// AUTO-TIMING CONFIGURATION
// =============================================================================

/**
 * Auto-timing defaults for natural message flow.
 * These values are configurable per operation via skipAutoTiming.
 */
const AUTO_TIMING = {
    /** Pause after sending a message (seconds) */
    SEND_DELAY: 0.5,
    /** Pause after receiving a message (seconds) */
    RECEIVE_DELAY: 0.8,
    /** Time to view an image (seconds) */
    IMAGE_VIEW_TIME: 1.5,
    /** Time to view a video (uses video duration) */
    VIDEO_VIEW_TIME_MULTIPLIER: 1.0,
    /** Time to view a GIF (seconds) */
    GIF_VIEW_TIME: 1.0,
    /** Voice note uses its duration */
    VOICE_VIEW_TIME_MULTIPLIER: 1.0,
};

/**
 * Calculate auto-timing frames based on operation type.
 */
function getAutoTiming(opKind: string, fps: number, duration?: number): number {
    switch (opKind) {
        case "SendMessage":
        case "SendImage":
        case "SendVideo":
        case "SendGif":
        case "SendVoice":
            return Math.round(AUTO_TIMING.SEND_DELAY * fps);
        case "ReceiveMessage":
            return Math.round(AUTO_TIMING.RECEIVE_DELAY * fps);
        case "ReceiveImage":
            return Math.round(AUTO_TIMING.IMAGE_VIEW_TIME * fps);
        case "ReceiveVideo":
            return Math.round((duration || 5) * AUTO_TIMING.VIDEO_VIEW_TIME_MULTIPLIER * fps);
        case "ReceiveGif":
            return Math.round(AUTO_TIMING.GIF_VIEW_TIME * fps);
        case "ReceiveVoice":
            return Math.round((duration || 5) * AUTO_TIMING.VOICE_VIEW_TIME_MULTIPLIER * fps);
        default:
            return 0;
    }
}

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

            // Auto-advance cursor
            cursor.advance(getAutoTiming("ReceiveMessage", ctx.config.fps));
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

            // Auto-advance cursor
            cursor.advance(getAutoTiming("SendMessage", ctx.config.fps));
            return events;
        }

        // =====================================================================
        // MEDIA MESSAGE OPERATIONS
        // =====================================================================

        case "SendImage": {
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageSentOp = {
                at,
                kind: "MessageSent",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: `img_${at}`,
                    type: "image",
                    imageUrl: op.imageUrl,
                    caption: op.caption,
                    height: op.height,
                },
                trace,
            };
            events.push(event);

            if (!op.skipAutoTiming) {
                cursor.advance(getAutoTiming("SendImage", ctx.config.fps));
            }
            return events;
        }

        case "ReceiveImage": {
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageReceivedOp = {
                at,
                kind: "MessageReceived",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: `img_${at}`,
                    from: op.actor,
                    type: "image",
                    imageUrl: op.imageUrl,
                    caption: op.caption,
                    height: op.height,
                },
                trace,
            };
            events.push(event);

            if (!op.skipAutoTiming) {
                cursor.advance(getAutoTiming("ReceiveImage", ctx.config.fps));
            }
            return events;
        }

        case "SendVideo": {
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageSentOp = {
                at,
                kind: "MessageSent",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: `vid_${at}`,
                    type: "video",
                    videoUrl: op.videoUrl,
                    thumbnailUrl: op.thumbnailUrl,
                    duration: op.duration,
                    caption: op.caption,
                    height: op.height,
                },
                trace,
            };
            events.push(event);

            if (!op.skipAutoTiming) {
                cursor.advance(getAutoTiming("SendVideo", ctx.config.fps, op.duration));
            }
            return events;
        }

        case "ReceiveVideo": {
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageReceivedOp = {
                at,
                kind: "MessageReceived",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: `vid_${at}`,
                    from: op.actor,
                    type: "video",
                    videoUrl: op.videoUrl,
                    thumbnailUrl: op.thumbnailUrl,
                    duration: op.duration,
                    caption: op.caption,
                    height: op.height,
                },
                trace,
            };
            events.push(event);

            if (!op.skipAutoTiming) {
                cursor.advance(getAutoTiming("ReceiveVideo", ctx.config.fps, op.duration));
            }
            return events;
        }

        case "SendGif": {
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageSentOp = {
                at,
                kind: "MessageSent",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: `gif_${at}`,
                    type: "gif",
                    gifUrl: op.gifUrl,
                    height: op.height,
                },
                trace,
            };
            events.push(event);

            if (!op.skipAutoTiming) {
                cursor.advance(getAutoTiming("SendGif", ctx.config.fps));
            }
            return events;
        }

        case "ReceiveGif": {
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageReceivedOp = {
                at,
                kind: "MessageReceived",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: `gif_${at}`,
                    from: op.actor,
                    type: "gif",
                    gifUrl: op.gifUrl,
                    height: op.height,
                },
                trace,
            };
            events.push(event);

            if (!op.skipAutoTiming) {
                cursor.advance(getAutoTiming("ReceiveGif", ctx.config.fps));
            }
            return events;
        }

        case "SendVoice": {
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageSentOp = {
                at,
                kind: "MessageSent",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: `voice_${at}`,
                    type: "voice",
                    duration: op.duration,
                },
                trace,
            };
            events.push(event);

            if (!op.skipAutoTiming) {
                cursor.advance(getAutoTiming("SendVoice", ctx.config.fps, op.duration));
            }
            return events;
        }

        case "ReceiveVoice": {
            events.push(...ensureConversationOpened(ctx, deviceId, appId, conversationId, at, trace));

            const event: MessageReceivedOp = {
                at,
                kind: "MessageReceived",
                deviceId,
                appId,
                conversationId,
                message: {
                    id: `voice_${at}`,
                    from: op.actor,
                    type: "voice",
                    duration: op.duration,
                },
                trace,
            };
            events.push(event);

            if (!op.skipAutoTiming) {
                cursor.advance(getAutoTiming("ReceiveVoice", ctx.config.fps, op.duration));
            }
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

