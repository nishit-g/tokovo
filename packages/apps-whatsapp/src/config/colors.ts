/**
 * WhatsApp Group Sender Name Colors
 * 
 * Official WhatsApp colors for sender names in group chats.
 * Deterministically assigned based on sender ID hash for consistency.
 * 
 * These colors are designed for high contrast on both light and dark
 * message bubbles, matching WhatsApp's iOS implementation.
 */
export const GROUP_SENDER_COLORS = [
    "#00A884",  // WhatsApp teal (primary brand)
    "#53BDEB",  // Sky blue
    "#FF7E67",  // Coral
    "#FFD93D",  // Yellow
    "#6C63FF",  // Purple
    "#F06595",  // Pink
    "#20C997",  // Mint teal
    "#FFC078",  // Orange
] as const;

export type SenderColor = typeof GROUP_SENDER_COLORS[number];

/**
 * Number of available sender colors.
 * Used for modulo indexing in deterministic color assignment.
 */
export const SENDER_COLOR_COUNT = GROUP_SENDER_COLORS.length;
