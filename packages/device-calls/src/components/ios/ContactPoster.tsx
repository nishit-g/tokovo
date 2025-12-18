/**
 * iOS 17+ Contact Poster - Incoming Call
 * 
 * Full-screen poster image with depth effect name and bottom action buttons.
 * Properly sized for device frame (1290x2796 iPhone 16 Pro).
 */

import React from "react";
import { CallState } from "@tokovo/core";

interface ContactPosterProps {
    call: CallState;
    profile?: any;
    currentFrame?: number;
}

// Phone Icon
const PhoneIcon = ({ size = 72 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
);

// Action Button for incoming call
const ActionButton: React.FC<{
    variant: "accept" | "decline";
    isVideo?: boolean;
}> = ({ variant }) => {
    const bgColor = variant === "accept" ? "#34C759" : "#FF3B30";

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
        }}>
            <div style={{
                width: 210,
                height: 210,
                borderRadius: "50%",
                backgroundColor: bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 60px ${bgColor}40`,
            }}>
                <PhoneIcon size={90} />
            </div>
            <span style={{
                fontSize: 36,
                color: "#fff",
                fontFamily: "SF Pro Text, -apple-system, sans-serif",
            }}>
                {variant === "accept" ? "Accept" : "Decline"}
            </span>
        </div>
    );
};

/**
 * ContactPoster - iOS 17+ incoming call with full-screen poster
 */
export const ContactPoster: React.FC<ContactPosterProps> = ({ call, currentFrame = 0 }) => {
    // Calculate relative frame from when call started
    const relativeFrame = Math.max(0, currentFrame - (call.startedAt || 0));

    // Animations - start at 0.5 opacity, full opacity after 8 frames (quick fade)
    const fadeIn = Math.min(1, 0.5 + (relativeFrame / 16));
    const pulsePhase = Math.sin(relativeFrame * 0.1);
    const glowOpacity = 0.4 + 0.2 * pulsePhase;
    const buttonPulse = 1 + 0.03 * pulsePhase;

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#1a1a1a",
                overflow: "hidden",
                opacity: fadeIn,
            }}
        >
            {/* Full-screen poster image */}
            {call.callerMetadata?.posterImage && (
                <img
                    src={call.callerMetadata.posterImage}
                    alt={call.callerName}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            )}

            {/* Gradient overlay */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "60%",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
                    pointerEvents: "none",
                }}
            />

            {/* Status label at top */}
            <div
                style={{
                    position: "absolute",
                    top: 150,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                }}
            >
                <span
                    style={{
                        fontSize: 48,
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: "SF Pro Text, -apple-system, sans-serif",
                    }}
                >
                    {call.isVideo ? "FaceTime Video..." : "incoming call..."}
                </span>
            </div>

            {/* Caller name with glow */}
            <div
                style={{
                    position: "absolute",
                    top: 280,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        fontSize: 120,
                        fontWeight: 300,
                        color: "#fff",
                        fontFamily: call.callerMetadata?.posterNameFont || "SF Pro Display, -apple-system, sans-serif",
                        textShadow: `0 0 60px rgba(255,255,255,${glowOpacity}), 0 4px 20px rgba(0,0,0,0.5)`,
                    }}
                >
                    {call.callerName}
                </div>
            </div>

            {/* Bottom action buttons */}
            <div
                style={{
                    position: "absolute",
                    bottom: 200,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: 180,
                    transform: `scale(${buttonPulse})`,
                }}
            >
                <ActionButton variant="decline" />
                <ActionButton variant="accept" isVideo={call.isVideo} />
            </div>
        </div>
    );
};
