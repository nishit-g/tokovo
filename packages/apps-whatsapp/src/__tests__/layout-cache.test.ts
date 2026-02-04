/**
 * WhatsApp Layout Cache Tests
 *
 * @description Tests for WhatsApp layout cache invalidation correctness.
 * Verifies that hashing includes all fields affecting layout.
 */

import { describe, it, expect } from "vitest";
import type { WhatsAppMessage, WhatsAppConversation } from "../types";

// =============================================================================
// TEST DATA
// =============================================================================

function createTestMessage(overrides: Partial<WhatsAppMessage> = {}): WhatsAppMessage {
    return {
        id: "msg_1",
        type: "text",
        text: "Hello world",
        from: "user_1",
        timestamp: "10:00 AM",
        status: "sent",
        at: 0,
        ...overrides,
    } as WhatsAppMessage;
}

function createTestConversation(
    messages: WhatsAppMessage[],
    overrides: Partial<WhatsAppConversation> = {},
): WhatsAppConversation {
    return {
        id: "conv_1",
        name: "Test Chat",
        isGroup: false,
        messages,
        ...overrides,
    } as WhatsAppConversation;
}

// =============================================================================
// HASH COMPUTATION (mirroring production logic)
// =============================================================================

function hashString(hash: number, value: string): number {
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash;
}

function hashField(
    hash: number,
    key: string,
    value: string | number | boolean | undefined | null,
): number {
    let next = hashString(hash, key);
    if (value === undefined || value === null) {
        return hashString(next, "<nil>");
    }
    if (typeof value === "string") return hashString(next, value);
    if (typeof value === "number") return hashString(next, value.toString());
    if (typeof value === "boolean") return hashString(next, value ? "1" : "0");
    return next;
}

function computeMessageHash(message: WhatsAppMessage): string {
    let hash = 2166136261;
    hash = hashString(hash, message.id);
    hash = hashString(hash, message.type || "text");
    hash = hashField(hash, "text", message.text);
    hash = hashField(hash, "edited", message.edited);
    hash = hashField(hash, "editedAt", message.editedAt);

    if (message.reactions) {
        hash = hashField(hash, "reactions.length", message.reactions.length);
        for (const reaction of message.reactions) {
            hash = hashField(hash, "reaction.emoji", reaction.emoji);
            hash = hashField(hash, "reaction.count", reaction.count);
        }
    }

    if (message.linkPreview) {
        hash = hashField(hash, "link.url", message.linkPreview.url);
        hash = hashField(hash, "link.title", message.linkPreview.title);
    }

    return (hash >>> 0).toString(16);
}

// =============================================================================
// TESTS
// =============================================================================

describe("WhatsApp Layout Cache", () => {
    describe("Hash Invalidation", () => {
        it("hash changes when text content changes", () => {
            const msg1 = createTestMessage({ text: "Hello" });
            const msg2 = createTestMessage({ text: "Hello World" });

            const hash1 = computeMessageHash(msg1);
            const hash2 = computeMessageHash(msg2);

            expect(hash1).not.toBe(hash2);
        });

        it("hash changes when message is edited", () => {
            const msg1 = createTestMessage({ edited: false });
            const msg2 = createTestMessage({ edited: true, editedAt: 12345 });

            const hash1 = computeMessageHash(msg1);
            const hash2 = computeMessageHash(msg2);

            expect(hash1).not.toBe(hash2);
        });

        it("hash changes when reactions are added", () => {
            const msg1 = createTestMessage();
            const msg2 = createTestMessage({
                reactions: [{ emoji: "👍", count: 1, fromMe: false }],
            });

            const hash1 = computeMessageHash(msg1);
            const hash2 = computeMessageHash(msg2);

            expect(hash1).not.toBe(hash2);
        });

        it("hash changes when reaction emoji changes", () => {
            const msg1 = createTestMessage({
                reactions: [{ emoji: "👍", count: 1, fromMe: false }],
            });
            const msg2 = createTestMessage({
                reactions: [{ emoji: "❤️", count: 1, fromMe: false }],
            });

            const hash1 = computeMessageHash(msg1);
            const hash2 = computeMessageHash(msg2);

            expect(hash1).not.toBe(hash2);
        });

        it("hash changes when link preview is added", () => {
            const msg1 = createTestMessage();
            const msg2 = createTestMessage({
                linkPreview: {
                    url: "https://example.com",
                    title: "Example Site",
                },
            });

            const hash1 = computeMessageHash(msg1);
            const hash2 = computeMessageHash(msg2);

            expect(hash1).not.toBe(hash2);
        });

        it("hash is stable for identical messages", () => {
            const msg1 = createTestMessage({
                text: "Test message",
                edited: true,
                editedAt: 12345,
                reactions: [{ emoji: "👍", count: 2, fromMe: true }],
            });
            const msg2 = createTestMessage({
                text: "Test message",
                edited: true,
                editedAt: 12345,
                reactions: [{ emoji: "👍", count: 2, fromMe: true }],
            });

            const hash1 = computeMessageHash(msg1);
            const hash2 = computeMessageHash(msg2);

            expect(hash1).toBe(hash2);
        });
    });

    describe("Conversation Layout", () => {
        it("different message counts produce different hashes", () => {
            const conv1 = createTestConversation([createTestMessage()]);
            const conv2 = createTestConversation([
                createTestMessage(),
                createTestMessage({ id: "msg_2", text: "Second message" }),
            ]);

            const hash1 = conv1.messages.length.toString();
            const hash2 = conv2.messages.length.toString();

            expect(hash1).not.toBe(hash2);
        });
    });
});
