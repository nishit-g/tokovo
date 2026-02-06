/**
 * WhatsApp Color Utilities
 * 
 * Deterministic color assignment for group chat sender names.
 * Uses djb2 hash algorithm for consistent color mapping.
 */

import { GROUP_SENDER_COLORS, SENDER_COLOR_COUNT } from "./colors.js";

/**
 * djb2 hash algorithm - fast, deterministic string hash.
 * Same input always produces same output.
 */
function djb2Hash(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash;
}

/**
 * Get deterministic color for a sender in group chat.
 * 
 * Same sender ID will always receive the same color, ensuring
 * visual consistency across the conversation.
 * 
 * @param senderId - The sender's unique identifier
 * @returns A color from GROUP_SENDER_COLORS palette
 */
export function getSenderColor(senderId: string): string {
    // Handle special cases
    if (!senderId || senderId === "me" || senderId === "system") {
        return GROUP_SENDER_COLORS[0];
    }

    const hash = djb2Hash(senderId);
    const index = Math.abs(hash) % SENDER_COLOR_COUNT;
    return GROUP_SENDER_COLORS[index];
}

/**
 * Get color from member object.
 * Uses colorIndex if available, otherwise falls back to hash-based assignment.
 * 
 * @param member - Group member object
 * @returns A color from GROUP_SENDER_COLORS palette
 */
export function getMemberColor(member?: { id: string; colorIndex?: number }): string {
    if (!member) return GROUP_SENDER_COLORS[0];

    // If explicitly assigned colorIndex, use it
    if (member.colorIndex !== undefined) {
        return GROUP_SENDER_COLORS[member.colorIndex % SENDER_COLOR_COUNT];
    }

    // Otherwise, compute from ID
    return getSenderColor(member.id);
}

/**
 * Get member name from conversation members list.
 * 
 * @param senderId - The sender's ID
 * @param members - List of group members
 * @returns The member's display name, or the ID if not found
 */
export function getMemberName(
    senderId: string,
    members?: Array<{ id: string; name: string }>
): string {
    if (!senderId) return "Unknown";
    if (senderId === "me") return "You";
    if (senderId === "system") return "";

    const member = members?.find(m => m.id === senderId);
    return member?.name || senderId;
}
