/**
 * iOS Slide to Answer
 * 
 * The iconic iOS slider with shimmer animation.
 */

import React from "react";

interface SlideToAnswerProps {
    currentFrame?: number;
}

/**
 * SlideToAnswer - iOS slide to answer slider
 * 
 * Features:
 * - Pill-shaped track with glass effect
 * - Green phone icon thumb
 * - Shimmer animation text
 */
export const SlideToAnswer: React.FC<SlideToAnswerProps> = ({ currentFrame = 0 }) => {
    // Shimmer animation - text opacity pulses
    const shimmerOpacity = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(currentFrame * 0.1));

    return (
        <div
            style={{
                width: "100%",
                height: 80,
                borderRadius: 40,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "center",
                padding: 6,
                position: "relative",
            }}
        >
            {/* Thumb - green phone icon */}
            <div
                style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    backgroundColor: "#34C759",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    boxShadow: "0 4px 20px rgba(52, 199, 89, 0.4)",
                }}
            >
                📞
            </div>

            {/* Shimmer text */}
            <div
                style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 400,
                    color: "#fff",
                    opacity: shimmerOpacity,
                    fontFamily: "SF Pro Text, -apple-system, sans-serif",
                }}
            >
                slide to answer
            </div>

            {/* Right arrow indicators */}
            <div
                style={{
                    position: "absolute",
                    right: 20,
                    display: "flex",
                    gap: 4,
                    opacity: 0.5,
                }}
            >
                <span style={{ color: "#fff", fontSize: 18 }}>›</span>
                <span style={{ color: "#fff", fontSize: 18 }}>›</span>
                <span style={{ color: "#fff", fontSize: 18 }}>›</span>
            </div>
        </div>
    );
};
