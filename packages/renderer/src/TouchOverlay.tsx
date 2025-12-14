/**
 * TouchOverlay - Visual feedback for touch gestures
 *
 * Renders semi-transparent circles at touch points that fade out.
 * This creates the "screen recording" feel where you see fingers tapping.
 */

import React from "react";
import { interpolate } from "remotion";
import { TouchState } from "@tokovo/core";

interface TouchOverlayProps {
    /** Active touch points */
    touches: TouchState[];
    /** Current frame */
    t: number;
}

/**
 * Single touch indicator
 */
const TouchIndicator: React.FC<{
    touch: TouchState;
    t: number;
}> = ({ touch, t }) => {
    const age = t - touch.startedAt;

    // Fade out over 15 frames
    const opacity = interpolate(age, [0, 15], [0.5, 0], {
        extrapolateRight: "clamp",
    });

    // Scale in then out
    const scale = interpolate(age, [0, 3, 15], [0.5, 1, 0.8], {
        extrapolateRight: "clamp",
    });

    if (opacity <= 0) return null;

    // For drag, show line from start to end
    if (touch.type === "drag" && touch.endX !== undefined && touch.endY !== undefined) {
        const progress = interpolate(age, [0, 30], [0, 1], {
            extrapolateRight: "clamp",
        });
        const currentX = touch.x + (touch.endX - touch.x) * progress;
        const currentY = touch.y + (touch.endY - touch.y) * progress;

        return (
            <>
                {/* Start point */}
                <div
                    style={{
                        position: "absolute",
                        left: touch.x - 30,
                        top: touch.y - 30,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "rgba(128, 128, 128, 0.3)",
                        border: "2px solid rgba(128, 128, 128, 0.5)",
                        opacity: opacity * 0.5,
                        transform: `scale(${scale * 0.8})`,
                        pointerEvents: "none",
                    }}
                />
                {/* Current position */}
                <div
                    style={{
                        position: "absolute",
                        left: currentX - 30,
                        top: currentY - 30,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "rgba(128, 128, 128, 0.4)",
                        opacity,
                        transform: `scale(${scale})`,
                        pointerEvents: "none",
                    }}
                />
            </>
        );
    }

    // Size based on touch type
    const size = touch.type === "long_press" ? 80 : 60;

    return (
        <div
            style={{
                position: "absolute",
                left: touch.x - size / 2,
                top: touch.y - size / 2,
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: "rgba(128, 128, 128, 0.4)",
                border: touch.type === "long_press" ? "2px solid rgba(255, 255, 255, 0.5)" : "none",
                opacity,
                transform: `scale(${scale})`,
                pointerEvents: "none",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            }}
        />
    );
};

/**
 * TouchOverlay component - render above device content
 */
export const TouchOverlay: React.FC<TouchOverlayProps> = ({ touches, t }) => {
    if (!touches || touches.length === 0) return null;

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                zIndex: 9999,
            }}
        >
            {touches.map((touch) => (
                <TouchIndicator key={touch.id} touch={touch} t={t} />
            ))}
        </div>
    );
};

export default TouchOverlay;
