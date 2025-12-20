/**
 * WhatsApp Bubble Tail
 * 
 * Authentic WhatsApp iOS bubble tail SVG.
 * The tail is a curved triangle that appears at the top of the first message.
 */

import React from "react";

interface BubbleTailProps {
    isMe: boolean;
    color: string;
}

/**
 * Authentic WhatsApp iOS bubble tail
 */
export const BubbleTail: React.FC<BubbleTailProps> = ({ isMe, color }) => {
    if (isMe) {
        // Right-side tail (my messages)
        return (
            <svg
                width="24"
                height="30"
                viewBox="0 0 8 10"
                style={{
                    position: "absolute",
                    top: 0,
                    right: -8,
                }}
            >
                <path
                    d="M0 0 C4 0 8 4 8 10 L0 10 Z"
                    fill={color}
                />
            </svg>
        );
    } else {
        // Left-side tail (other's messages)
        return (
            <svg
                width="24"
                height="30"
                viewBox="0 0 8 10"
                style={{
                    position: "absolute",
                    top: 0,
                    left: -8,
                    transform: "scaleX(-1)",
                }}
            >
                <path
                    d="M0 0 C4 0 8 4 8 10 L0 10 Z"
                    fill={color}
                />
            </svg>
        );
    }
};

export default BubbleTail;
