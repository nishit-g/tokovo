/**
 * iOS 17+ Contact Poster
 * 
 * Full-screen poster image with depth effect name and bottom action buttons.
 * Includes fade-in and pulse animations.
 */

import React from "react";
import { CallState } from "@tokovo/core";
import { AcceptButton, DeclineButton } from "../shared/ActionButtons";

interface ContactPosterProps {
    call: CallState;
    profile?: any;
    currentFrame?: number;
}

/**
 * ContactPoster - iOS 17+ incoming call screen
 * 
 * Features:
 * - Full-screen poster image background
 * - Caller name with depth effect at top
 * - Bottom action buttons (no slider)
 * - Fade-in animation
 */
export const ContactPoster: React.FC<ContactPosterProps> = ({ call, currentFrame = 0 }) => {
    // Animation: fade in over first 15 frames
    const fadeIn = Math.min(1, currentFrame / 15);

    // Animation: gentle pulse for buttons
    const pulse = 1 + 0.02 * Math.sin(currentFrame * 0.15);

    // Animation: name glow pulse
    const glowOpacity = 0.3 + 0.2 * Math.sin(currentFrame * 0.1);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                backgroundColor: "#000",
                overflow: "hidden",
                opacity: fadeIn,
            }}
        >
            {/* Full-screen poster image */}
            <img
                src={call.callerMetadata?.posterImage}
                alt={call.callerName}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />

            {/* Gradient overlay */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    pointerEvents: "none",
                }}
            />

            {/* Top area - Status label */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: 50,
                }}
            >
                <span
                    style={{
                        fontSize: 18,
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: "SF Pro Text, -apple-system, sans-serif",
                    }}
                >
                    {call.isVideo ? "FaceTime Video" : "incoming call..."}
                </span>
            </div>

            {/* Caller name - depth effect style with glow */}
            <div
                style={{
                    position: "absolute",
                    top: 140,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        fontSize: 72,
                        fontWeight: 300,
                        color: "#fff",
                        fontFamily:
                            call.callerMetadata?.posterNameFont ||
                            "SF Pro Display, -apple-system, sans-serif",
                        textShadow: `0 0 30px rgba(255,255,255,${glowOpacity}), 0 2px 10px rgba(0,0,0,0.5)`,
                    }}
                >
                    {call.callerName}
                </div>
            </div>

            {/* Bottom action buttons with pulse */}
            <div
                style={{
                    position: "absolute",
                    bottom: 100,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: 100,
                    transform: `scale(${pulse})`,
                }}
            >
                <DeclineButton size={80} />
                <AcceptButton size={80} isVideo={call.isVideo} />
            </div>
        </div>
    );
};
