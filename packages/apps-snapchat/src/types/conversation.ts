/**
 * Snapchat Conversation Types
 */

import type { SnapchatMessage } from "./messages.js";

export interface SnapchatParticipant {
    id: string;
    name: string;
    avatar?: string;
    bitmoji?: string;
}

export interface SnapchatConversation {
    id: string;
    title?: string;
    avatar?: string;
    participants: SnapchatParticipant[];
    messages: SnapchatMessage[];
    typing: Record<string, boolean>;
    unreadCount: number;
    isGroup: boolean;
    /** Snap streak count (days) */
    streak?: number;
    /** Last snap sent/received timestamp */
    lastSnapAt?: number;
    /** Last message timestamp */
    lastMessageAt?: number;
}
