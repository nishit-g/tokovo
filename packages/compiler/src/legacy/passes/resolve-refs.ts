/**
 * Resolve Refs Pass
 * 
 * Assigns deterministic message IDs to all message operations.
 * Ensures referential integrity for read/delete operations.
 */

import { SceneOp, ConcurrentOp, SendMessageOp, ReceiveMessageOp, ReadMessageOp, DeleteMessageOp } from "@tokovo/ir";
import { CompilerContext } from "../context";

/**
 * Internal representation with resolved IDs.
 * Extends SceneOp with optional resolved message ID.
 */
export type ResolvedOp = SceneOp & {
    _resolvedMessageId?: string;
};

/**
 * Resolve message references in scene operations.
 * Assigns stable IDs and validates refs exist.
 */
export function resolveRefs(
    ops: SceneOp[],
    ctx: CompilerContext,
    deviceId: string,
    conversationId: string
): ResolvedOp[] {
    return ops.map((op, index) => resolveOp(op, ctx, deviceId, conversationId, index));
}

function resolveOp(
    op: SceneOp,
    ctx: CompilerContext,
    deviceId: string,
    conversationId: string,
    index: number
): ResolvedOp {
    switch (op.kind) {
        case "SendMessage":
        case "ReceiveMessage": {
            // Generate and register message ID
            const realId = ctx.generateMessageId(deviceId, conversationId);
            // Use index-based ref ID for mapping
            const refId = `ref_${deviceId}_${conversationId}_${index}`;
            ctx.registerMessageId(refId, realId);

            return {
                ...op,
                _resolvedMessageId: realId,
            };
        }

        case "ReadMessage":
        case "DeleteMessage": {
            // Resolve the message reference
            const refId = op.ref.id;
            const realId = ctx.resolveMessageId(refId) ?? op.ref.id;

            return {
                ...op,
                ref: {
                    ...op.ref,
                    id: realId,
                },
            };
        }

        case "Concurrent": {
            // Recursively resolve tracks
            return {
                ...op,
                tracks: op.tracks.map(track =>
                    resolveRefs(track, ctx, deviceId, conversationId)
                ),
            };
        }

        default:
            return op;
    }
}
