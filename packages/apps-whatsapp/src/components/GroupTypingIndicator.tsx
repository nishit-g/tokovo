/**
 * WhatsApp Group Typing Indicator
 * 
 * Shows multi-person typing status in group chats:
 * - "Alice is typing..."
 * - "Alice and Bob are typing..."
 * - "Alice and 2 others are typing..."
 * 
 * Includes animated typing dots.
 */

import React from "react";
import { whatsappColors, spacing, typography } from "./theme";

export interface TypingMember {
    id: string;
    name: string;
}

export interface GroupTypingIndicatorProps {
    typingMembers: TypingMember[];
}

/**
 * Animated typing dot component.
 */
const TypingDot: React.FC<{ delay: number }> = ({ delay: _delay }) => (
    <div
        style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: whatsappColors.textSecondary,
            // Note: In Remotion, we'd use interpolate for animation
            // For static rendering, we just show the dot
            opacity: 0.7,
        }}
    />
);

/**
 * Format typing text based on number of people typing.
 */
function getTypingText(typingMembers: TypingMember[]): string {
    const names = typingMembers.map(m => m.name);

    if (names.length === 0) {
        return "";
    }

    if (names.length === 1) {
        return `${names[0]} is typing...`;
    }

    if (names.length === 2) {
        return `${names[0]} and ${names[1]} are typing...`;
    }

    return `${names[0]} and ${names.length - 1} others are typing...`;
}

export const GroupTypingIndicator: React.FC<GroupTypingIndicatorProps> = ({
    typingMembers,
}) => {
    if (typingMembers.length === 0) return null;

    const typingText = getTypingText(typingMembers);

    return (
        <div style={{
            padding: `8px ${spacing.pagePaddingX}px`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "transparent",
        }}>
            {/* Typing Dots Container */}
            <div style={{
                display: "flex",
                gap: 3,
                padding: "6px 10px",
                backgroundColor: whatsappColors.bgSecondary,
                borderRadius: 12,
            }}>
                <TypingDot delay={0} />
                <TypingDot delay={0.15} />
                <TypingDot delay={0.3} />
            </div>

            {/* Typing Text */}
            <span style={{
                fontSize: typography.caption.fontSize,
                color: whatsappColors.textSecondary,
                fontStyle: "italic",
            }}>
                {typingText}
            </span>
        </div>
    );
};

/**
 * Simple single-person typing indicator.
 * Use this for DM chats or when you don't need multi-person support.
 */
export const SimpleTypingIndicator: React.FC<{ isTyping: boolean }> = ({
    isTyping,
}) => {
    if (!isTyping) return null;

    return (
        <div style={{
            padding: `8px ${spacing.pagePaddingX}px`,
            display: "flex",
            alignItems: "center",
        }}>
            <div style={{
                display: "flex",
                gap: 3,
                padding: "8px 12px",
                backgroundColor: whatsappColors.bgSecondary,
                borderRadius: 16,
            }}>
                <TypingDot delay={0} />
                <TypingDot delay={0.15} />
                <TypingDot delay={0.3} />
            </div>
        </div>
    );
};

export default GroupTypingIndicator;
