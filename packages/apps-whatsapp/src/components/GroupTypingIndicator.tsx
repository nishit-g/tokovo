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
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { useTheme } from "../theme/ThemeContext.js";

export interface TypingMember {
    id: string;
    name: string;
}

export interface GroupTypingIndicatorProps {
    typingMembers: TypingMember[];
}

/**
 * Animated typing dot component using Remotion interpolation.
 */
const TypingDot: React.FC<{ delay: number }> = ({ delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const cycleDuration = fps * 1.4;
    const cycleFrame = frame % cycleDuration;
    const delayFrames = delay * fps;
    const adjustedFrame =
        (cycleFrame - delayFrames + cycleDuration) % cycleDuration;

    const translateY = interpolate(
        adjustedFrame,
        [0, cycleDuration * 0.3, cycleDuration * 0.6, cycleDuration],
        [0, -6, 0, 0],
        { extrapolateRight: "clamp" },
    );

    return (
        <div
            style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#667781",
                transform: `translateY(${translateY}px)`,
            }}
        />
    );
};;

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
    const theme = useTheme();

    if (typingMembers.length === 0) return null;

    const typingText = getTypingText(typingMembers);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: 6,
        }}>
            {/* Typing Dots Container */}
            <div style={{
                display: "flex",
                gap: 3,
                padding: "10px 14px",
                backgroundColor: theme.colors.receivedBubble,
                borderRadius: 18,
                borderBottomLeftRadius: 4,
                boxShadow: "0 1px 1px rgba(0,0,0,0.05)",
            }}>
                <TypingDot delay={0} />
                <TypingDot delay={0.15} />
                <TypingDot delay={0.3} />
            </div>

            {/* Typing Text */}
            <span style={{
                fontSize: 13,
                color: theme.colors.timestamp,
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
    const theme = useTheme();

    if (!isTyping) return null;

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            marginLeft: 6,
        }}>
            <div style={{
                display: "flex",
                gap: 3,
                padding: "10px 14px",
                backgroundColor: theme.colors.receivedBubble,
                borderRadius: 18,
                borderBottomLeftRadius: 4,
                boxShadow: "0 1px 1px rgba(0,0,0,0.05)",
            }}>
                <TypingDot delay={0} />
                <TypingDot delay={0.15} />
                <TypingDot delay={0.3} />
            </div>
        </div>
    );
};

export default GroupTypingIndicator;
