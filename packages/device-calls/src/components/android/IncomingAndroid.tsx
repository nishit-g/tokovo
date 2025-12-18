/**
 * Android Incoming Call - Material You Style
 * With animations
 */

import React from "react";
import { CallState } from "@tokovo/core";
import { AvatarRing } from "../shared/AvatarRing";
import { SwipeBubble } from "./SwipeBubble";

interface IncomingAndroidProps {
    call: CallState;
    profile?: any;
    currentFrame?: number;
}

/**
 * IncomingAndroid - Android Material You incoming call
 * 
 * Features:
 * - Solid color background extracted from avatar
 * - Centered avatar with ripple effect
 * - Swipe up/down bubble to answer/decline
 */
export const IncomingAndroid: React.FC<IncomingAndroidProps> = ({ call, currentFrame = 0 }) => {
    // Animation: fade in
    const fadeIn = Math.min(1, currentFrame / 15);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, #1a237e 0%, #0d47a1 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 180,
                position: "relative",
                opacity: fadeIn,
            }}
        >
            {/* Avatar */}
            <AvatarRing
                image={call.callerAvatar}
                name={call.callerName}
                size={180}
            />

            {/* Caller info */}
            <div
                style={{
                    marginTop: 40,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <div
                    style={{
                        fontSize: 36,
                        fontWeight: 400,
                        color: "#fff",
                        fontFamily: "Roboto, sans-serif",
                    }}
                >
                    {call.callerName}
                </div>
                <div
                    style={{
                        fontSize: 18,
                        color: "rgba(255,255,255,0.7)",
                        fontFamily: "Roboto, sans-serif",
                    }}
                >
                    {call.isVideo ? "Incoming video call" : "Incoming voice call"}
                </div>
            </div>

            {/* Swipe bubble at bottom */}
            <div
                style={{
                    position: "absolute",
                    bottom: 100,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <SwipeBubble currentFrame={currentFrame} />
            </div>
        </div>
    );
};
