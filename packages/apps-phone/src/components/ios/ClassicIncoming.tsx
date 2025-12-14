/**
 * iOS 16 Classic Incoming Call
 * 
 * Blurred background with centered avatar and slide to answer.
 * Includes pulsing avatar and shimmer animations.
 */

import React from "react";
import { CallState } from "@tokovo/core";
import { AvatarRing } from "../shared/AvatarRing";
import { SlideToAnswer } from "./SlideToAnswer";

interface ClassicIncomingProps {
    call: CallState;
    currentFrame?: number;
}

/**
 * ClassicIncoming - iOS 15/16 style incoming call
 * 
 * Features:
 * - Dark blurred gradient background
 * - Centered circular avatar with pulsing rings
 * - Caller name and label
 * - Slide to answer slider at bottom
 */
export const ClassicIncoming: React.FC<ClassicIncomingProps> = ({ call, currentFrame = 0 }) => {
    // Animation: fade in
    const fadeIn = Math.min(1, currentFrame / 15);

    // Animation: pulsing rings
    const ringScale1 = 1 + 0.05 * Math.sin(currentFrame * 0.08);
    const ringScale2 = 1 + 0.05 * Math.sin(currentFrame * 0.08 + 1);
    const ringOpacity = 0.2 + 0.1 * Math.sin(currentFrame * 0.1);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 200,
                position: "relative",
                opacity: fadeIn,
            }}
        >
            {/* Blur overlay effect */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backdropFilter: "blur(30px)",
                    pointerEvents: "none",
                }}
            />

            {/* Pulsing rings behind avatar */}
            <div
                style={{
                    position: "absolute",
                    top: 160,
                    left: "50%",
                    transform: `translateX(-50%) scale(${ringScale1})`,
                    width: 280,
                    height: 280,
                    borderRadius: "50%",
                    border: `3px solid rgba(255, 255, 255, ${ringOpacity})`,
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: 145,
                    left: "50%",
                    transform: `translateX(-50%) scale(${ringScale2})`,
                    width: 310,
                    height: 310,
                    borderRadius: "50%",
                    border: `2px solid rgba(255, 255, 255, ${ringOpacity * 0.6})`,
                    pointerEvents: "none",
                }}
            />

            {/* Content */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                {/* Avatar with pulsing ring */}
                <AvatarRing
                    image={call.callerAvatar}
                    name={call.callerName}
                    size={200}
                />

                {/* Caller name */}
                <div
                    style={{
                        marginTop: 30,
                        fontSize: 42,
                        fontWeight: 400,
                        color: "#fff",
                        fontFamily: "SF Pro Display, -apple-system, sans-serif",
                    }}
                >
                    {call.callerName}
                </div>

                {/* Call type label */}
                <div
                    style={{
                        marginTop: 10,
                        fontSize: 24,
                        color: "rgba(255,255,255,0.7)",
                        fontFamily: "SF Pro Text, -apple-system, sans-serif",
                    }}
                >
                    {call.isVideo ? "FaceTime Video" : "incoming call"}
                </div>
            </div>

            {/* Slide to answer at bottom */}
            <div
                style={{
                    position: "absolute",
                    bottom: 100,
                    left: 40,
                    right: 40,
                }}
            >
                <SlideToAnswer currentFrame={currentFrame} />
            </div>
        </div>
    );
};
