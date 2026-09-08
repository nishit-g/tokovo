/**
 * WhatsApp Color Utilities
 *
 * Deterministic color assignment for group chat sender names.
 * Uses djb2 hash algorithm for consistent color mapping.
 */

import { WHATSAPP_GROUP_SENDER_COLORS } from "../theme/index.js";

/**
 * djb2 hash algorithm - fast, deterministic string hash.
 * Same input always produces same output.
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
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
    return WHATSAPP_GROUP_SENDER_COLORS[0];
  }

  const hash = djb2Hash(senderId);
  const index = Math.abs(hash) % WHATSAPP_GROUP_SENDER_COLORS.length;
  return WHATSAPP_GROUP_SENDER_COLORS[index];
}

/**
 * Get color from member object.
 * Uses colorIndex if available, otherwise falls back to hash-based assignment.
 *
 * @param member - Group member object
 * @returns A color from GROUP_SENDER_COLORS palette
 */
export function getMemberColor(member?: {
  id: string;
  colorIndex?: number;
  accentColor?: string;
}): string {
  if (!member) return WHATSAPP_GROUP_SENDER_COLORS[0];

  if (member.accentColor) {
    return member.accentColor;
  }

  // If explicitly assigned colorIndex, use it
  if (member.colorIndex !== undefined) {
    return WHATSAPP_GROUP_SENDER_COLORS[
      member.colorIndex % WHATSAPP_GROUP_SENDER_COLORS.length
    ];
  }

  // Otherwise, compute from ID
  return getSenderColor(member.id);
}

/**
 * Choose a deterministic readable foreground for authored member accents.
 * Explicit authoring wins; hex accents otherwise use WCAG relative luminance.
 */
export function getMemberOnAccentColor(member?: {
  accentColor?: string;
  onAccentColor?: string;
}): string | undefined {
  if (!member?.accentColor) return undefined;
  if (member.onAccentColor) return member.onAccentColor;

  const normalized = member.accentColor.trim();
  const shortHex = /^#([\da-f])([\da-f])([\da-f])$/i.exec(normalized);
  const longHex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(normalized);
  const channels = shortHex
    ? shortHex.slice(1).map((channel) => Number.parseInt(`${channel}${channel}`, 16))
    : longHex
      ? longHex.slice(1).map((channel) => Number.parseInt(channel, 16))
      : undefined;

  if (!channels) return "#171C31";

  const linear = channels.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return luminance > 0.42 ? "#171C31" : "#FFF8EF";
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
  members?: Array<{ id: string; name: string }>,
): string {
  if (!senderId) return "Unknown";
  if (senderId === "me") return "You";
  if (senderId === "system") return "";

  const member = members?.find((m) => m.id === senderId);
  return member?.name || senderId;
}
