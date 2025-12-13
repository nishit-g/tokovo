import React from "react";

/**
 * WhatsApp iOS Typing Indicator
 * Three bouncing grey dots - Remotion compatible (no CSS @keyframes)
 * Uses frame-based animation for proper rendering in video output
 * 
 * @param frame - Current frame from Remotion (passed in from renderer)
 * @param fps - Frames per second (default 30)
 */

export interface TypingBubbleProps {
    platform?: string;
    frame?: number;
    fps?: number;
}

export const TypingBubble: React.FC<TypingBubbleProps> = ({
    platform = "ios",
    frame = 0,
    fps = 30
}) => {
    return (
        <div style={{
            backgroundColor: "#FFFFFF",
            padding: "27px 36px",
            borderRadius: 24,
            borderTopLeftRadius: 6,
            alignSelf: "flex-start",
            width: "fit-content",
            boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
            display: "flex",
            alignItems: "center",
            gap: 15,
            height: 72
        }}>
            <TypingDot frame={frame} fps={fps} delayFrames={0} />
            <TypingDot frame={frame} fps={fps} delayFrames={5} />
            <TypingDot frame={frame} fps={fps} delayFrames={10} />
        </div>
    );
};

interface TypingDotProps {
    frame: number;
    fps: number;
    delayFrames: number;
}

/**
 * Simple interpolation function (avoiding remotion dependency)
 */
function interpolate(
    value: number,
    inputRange: number[],
    outputRange: number[],
): number {
    // Find the segment
    let i = 0;
    for (i = 0; i < inputRange.length - 1; i++) {
        if (value <= inputRange[i + 1]) break;
    }

    // Clamp to range
    if (value <= inputRange[0]) return outputRange[0];
    if (value >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];

    // Linear interpolation between points
    const inputStart = inputRange[i];
    const inputEnd = inputRange[i + 1];
    const outputStart = outputRange[i];
    const outputEnd = outputRange[i + 1];

    const t = (value - inputStart) / (inputEnd - inputStart);
    return outputStart + (outputEnd - outputStart) * t;
}

const TypingDot: React.FC<TypingDotProps> = ({ frame, fps, delayFrames }) => {
    // Animation cycle: 36 frames at 30fps = 1.2 seconds
    const cycleLength = Math.round(1.2 * fps);
    const adjustedFrame = (frame + delayFrames) % cycleLength;

    // Bounce animation: up for first quarter, down for second quarter
    const quarterCycle = cycleLength / 4;
    const translateY = interpolate(
        adjustedFrame,
        [0, quarterCycle, quarterCycle * 2, cycleLength],
        [0, -9, 0, 0]
    );

    // Opacity: brighten when bouncing up
    const opacity = interpolate(
        adjustedFrame,
        [0, quarterCycle, quarterCycle * 2, cycleLength],
        [0.4, 1, 0.4, 0.4]
    );

    return (
        <div style={{
            width: 24,
            height: 24,
            backgroundColor: "#8696A0",
            borderRadius: "50%",
            transform: `translateY(${translateY}px)`,
            opacity
        }} />
    );
};

export default TypingBubble;
