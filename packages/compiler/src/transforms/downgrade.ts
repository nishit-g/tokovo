/**
 * Compat Mode Downgrade Transforms
 *
 * Gracefully downgrades unsupported features instead of failing.
 *
 * EXAMPLE:
 * - Plugin doesn't support reactions → ignore AddReaction op
 * - Plugin doesn't support voice → convert to "[Voice message 0:15]"
 *
 * @module @tokovo/compiler/transforms/downgrade
 */

import type { AppCapability, PluginSchema } from "../validation/scene-validator";

// =============================================================================
// DOWNGRADE RESULT
// =============================================================================

export type DowngradeAction =
    | { action: "keep" }
    | { action: "remove"; reason: string }
    | { action: "replace"; replacement: DowngradedOp; reason: string };

export interface DowngradedOp {
    kind: string;
    [key: string]: unknown;
}

// =============================================================================
// OPERATION DOWNGRADE
// =============================================================================

/**
 * Attempt to downgrade an unsupported operation.
 *
 * @returns Action to take on the operation
 */
export function downgradeUnsupportedOp(
    op: { kind: string;[key: string]: unknown },
    schema: PluginSchema,
    capabilities: ReadonlyArray<AppCapability>
): DowngradeAction {
    const hasCapability = (cap: AppCapability) => capabilities.includes(cap);
    const supportsContent = (kind: string) => schema.contentKinds.includes(kind);

    switch (op.kind) {
        // ===================
        // MESSAGING DOWNGRADES
        // ===================

        case "AddReaction":
            if (!hasCapability("reactions")) {
                // Convert reaction to text message
                const emoji = op.emoji ?? "❤️";
                return {
                    action: "replace",
                    replacement: {
                        kind: "SendMessage",
                        text: `Reacted with ${emoji}`,
                    },
                    reason: "App doesn't support reactions, converted to text",
                };
            }
            return { action: "keep" };

        case "SendVoice":
        case "ReceiveVoice":
            if (!hasCapability("voice") || !supportsContent("voice")) {
                // Convert voice to text message
                const duration = (op.duration as number) ?? 0;
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
                return {
                    action: "replace",
                    replacement: {
                        kind: op.kind === "SendVoice" ? "SendMessage" : "ReceiveMessage",
                        text: `🎤 Voice message (${timeStr})`,
                    },
                    reason: "App doesn't support voice, converted to text placeholder",
                };
            }
            return { action: "keep" };

        case "SendVideo":
        case "ReceiveVideo":
            if (!hasCapability("video") || !supportsContent("video")) {
                const caption = (op.caption as string) ?? "";
                return {
                    action: "replace",
                    replacement: {
                        kind: op.kind === "SendVideo" ? "SendMessage" : "ReceiveMessage",
                        text: caption ? `📹 Video: ${caption}` : "📹 Video",
                    },
                    reason: "App doesn't support video, converted to text placeholder",
                };
            }
            return { action: "keep" };

        case "SendSticker":
            if (!hasCapability("stickers") || !supportsContent("sticker")) {
                return {
                    action: "replace",
                    replacement: {
                        kind: "SendMessage",
                        text: "🎨 Sticker",
                    },
                    reason: "App doesn't support stickers, converted to text placeholder",
                };
            }
            return { action: "keep" };

        case "SendLocation":
            if (!hasCapability("location") || !supportsContent("location")) {
                const name = (op.locationName as string) ?? "Location";
                return {
                    action: "replace",
                    replacement: {
                        kind: "SendMessage",
                        text: `📍 ${name}`,
                    },
                    reason: "App doesn't support location, converted to text placeholder",
                };
            }
            return { action: "keep" };

        case "SendContact":
            if (!hasCapability("contacts") || !supportsContent("contact")) {
                const name = (op.contactName as string) ?? "Contact";
                return {
                    action: "replace",
                    replacement: {
                        kind: "SendMessage",
                        text: `📇 ${name}`,
                    },
                    reason: "App doesn't support contacts, converted to text placeholder",
                };
            }
            return { action: "keep" };

        // ===================
        // READ RECEIPTS
        // ===================

        case "ReadMessage":
            if (!hasCapability("read_receipts")) {
                return {
                    action: "remove",
                    reason: "App doesn't support read receipts, operation ignored",
                };
            }
            return { action: "keep" };

        // ===================
        // TYPING
        // ===================

        case "Typing":
            if (!hasCapability("typing")) {
                return {
                    action: "remove",
                    reason: "App doesn't support typing indicators, operation ignored",
                };
            }
            return { action: "keep" };

        // ===================
        // FEED/STORIES
        // ===================

        case "PostTweet":
        case "ReceiveTweet":
        case "LikeTweet":
        case "RetweetTweet":
            if (!hasCapability("feed")) {
                return {
                    action: "remove",
                    reason: "App doesn't support feed, operation ignored",
                };
            }
            return { action: "keep" };

        case "AddStory":
        case "ViewStory":
            if (!hasCapability("stories")) {
                return {
                    action: "remove",
                    reason: "App doesn't support stories, operation ignored",
                };
            }
            return { action: "keep" };

        default:
            return { action: "keep" };
    }
}

// =============================================================================
// CONTENT DOWNGRADE
// =============================================================================

/**
 * Downgrade content kind to text if unsupported.
 */
export function downgradeContentKind(
    contentKind: string,
    schema: PluginSchema
): { kind: string; downgraded: boolean; placeholder?: string } {
    if (schema.contentKinds.includes(contentKind)) {
        return { kind: contentKind, downgraded: false };
    }

    // Map unsupported content to text placeholder
    const placeholders: Record<string, string> = {
        image: "📷 Image",
        video: "📹 Video",
        gif: "🎞️ GIF",
        voice: "🎤 Voice message",
        sticker: "🎨 Sticker",
        location: "📍 Location",
        contact: "📇 Contact",
        file: "📎 File",
        link: "🔗 Link",
    };

    return {
        kind: "text",
        downgraded: true,
        placeholder: placeholders[contentKind] ?? `[${contentKind}]`,
    };
}

// =============================================================================
// BATCH DOWNGRADE
// =============================================================================

/**
 * Process a list of operations with downgrade transforms.
 */
export function applyDowngrades(
    ops: Array<{ kind: string;[key: string]: unknown }>,
    schema: PluginSchema,
    capabilities: ReadonlyArray<AppCapability>
): { ops: Array<{ kind: string;[key: string]: unknown }>; log: string[] } {
    const result: Array<{ kind: string;[key: string]: unknown }> = [];
    const log: string[] = [];

    for (const op of ops) {
        const action = downgradeUnsupportedOp(op, schema, capabilities);

        switch (action.action) {
            case "keep":
                result.push(op);
                break;
            case "remove":
                log.push(`[DOWNGRADE] Removed ${op.kind}: ${action.reason}`);
                break;
            case "replace":
                result.push({ ...op, ...action.replacement });
                log.push(`[DOWNGRADE] Replaced ${op.kind} → ${action.replacement.kind}: ${action.reason}`);
                break;
        }
    }

    return { ops: result, log };
}
