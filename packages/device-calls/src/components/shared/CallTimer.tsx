/**
 * Shared Components - Call Timer
 * 
 * Displays call duration in MM:SS format.
 */

import React from "react";

interface CallTimerProps {
    startedAt?: number;
    currentFrame: number;
    fps?: number;
}

/**
 * CallTimer - Displays elapsed call time
 */
export const CallTimer: React.FC<CallTimerProps> = ({
    startedAt,
    currentFrame,
    fps = 30
}) => {
    if (startedAt === undefined) {
        return <span style={{ color: "rgba(255,255,255,0.7)" }}>Connecting...</span>;
    }

    const elapsedFrames = Math.max(0, currentFrame - startedAt);
    const elapsedSeconds = Math.floor(elapsedFrames / fps);

    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return (
        <span
            style={{
                fontFamily: "SF Pro Display, -apple-system, sans-serif",
                fontSize: 18,
                fontVariantNumeric: "tabular-nums",
                color: "rgba(255, 255, 255, 0.7)",
            }}
        >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
    );
};
