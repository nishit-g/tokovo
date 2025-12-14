/**
 * Android Swipe Bubble
 * 
 * Swipe up to answer, swipe down to decline bubble.
 */

import React from "react";

interface SwipeBubbleProps {
    currentFrame?: number;
}

/**
 * SwipeBubble - Android swipe to answer/decline
 * 
 * Features:
 * - Pill-shaped bubble with phone icon
 * - Bobbing animation
 * - Up/down arrows indicating swipe direction
 */
export const SwipeBubble: React.FC<SwipeBubbleProps> = ({ currentFrame = 0 }) => {
    // Bobbing animation
    const translateY = 8 * Math.sin(currentFrame * 0.15);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
            }}
        >
            {/* Up arrow - answer */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <span style={{ color: "#4CAF50", fontSize: 24 }}>▲</span>
                <span
                    style={{
                        fontSize: 14,
                        color: "#4CAF50",
                        fontFamily: "Roboto, sans-serif",
                    }}
                >
                    Swipe up to answer
                </span>
            </div>

            {/* Bubble */}
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    transform: `translateY(${translateY}px)`,
                }}
            >
                <span style={{ fontSize: 36 }}>📞</span>
            </div>

            {/* Down arrow - decline */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <span
                    style={{
                        fontSize: 14,
                        color: "#f44336",
                        fontFamily: "Roboto, sans-serif",
                    }}
                >
                    Swipe down to decline
                </span>
                <span style={{ color: "#f44336", fontSize: 24 }}>▼</span>
            </div>
        </div>
    );
};
