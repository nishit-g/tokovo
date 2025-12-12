import React from "react";
import { CallState } from "@tokovo/core";

/**
 * Call Action Button (Accept/Decline)
 */
const CallButton: React.FC<{
    type: "accept" | "decline";
    isVideo?: boolean;
}> = ({ type, isVideo }) => {
    const isAccept = type === "accept";

    return (
        <div style={{
            width: 210,
            height: 210,
            borderRadius: "50%",
            backgroundColor: isAccept ? "#32D74B" : "#FF3B30",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 12
        }}>
            {/* Icon */}
            <svg width="72" height="72" viewBox="0 0 24 24" fill="white">
                {isAccept ? (
                    isVideo ? (
                        // Video camera icon
                        <path d="M23 7l-7 5 7 5V7zM16 5H2a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z" />
                    ) : (
                        // Phone icon
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    )
                ) : (
                    // Decline phone icon (rotated)
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" transform="rotate(135, 12, 12)" />
                )}
            </svg>
        </div>
    );
};

/**
 * Active Call Timer
 */
const CallTimer: React.FC<{ startedAt: number; currentTime: number; fps?: number }> = ({
    startedAt,
    currentTime,
    fps = 30
}) => {
    const elapsedFrames = currentTime - startedAt;
    const elapsedSeconds = Math.floor(elapsedFrames / fps);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return (
        <div style={{
            fontSize: 48,
            color: "rgba(255, 255, 255, 0.9)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            fontVariantNumeric: "tabular-nums"
        }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
    );
};

interface CallOverlayProps {
    call: CallState;
    currentTime: number;
    variant?: "ios" | "android";
}

/**
 * Call Overlay
 * Displays full-screen call UI for incoming/active calls
 * Supports iOS and Android variants, voice and video calls
 */
export const CallOverlay: React.FC<CallOverlayProps> = ({
    call,
    currentTime,
    variant = "ios"
}) => {
    // Don't render if call is ended
    if (call.status === "ended") {
        return null;
    }

    const isIncoming = call.status === "incoming";
    const isActive = call.status === "active";
    const isAndroid = variant === "android";

    // Calculate pulse animation for incoming call
    const pulsePhase = Math.sin((currentTime * 0.1) % (Math.PI * 2));
    const avatarScale = isIncoming ? 1 + (pulsePhase * 0.03) : 1;

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: call.isVideo
                ? "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)"
                : "linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "180px 60px 120px",
            zIndex: 500,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        }}>
            {/* Top Section: Avatar & Name */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 30
            }}>
                {/* Avatar */}
                <div style={{
                    width: 360,
                    height: 360,
                    borderRadius: "50%",
                    backgroundColor: "#8E8E93",
                    backgroundImage: call.callerAvatar ? `url(${call.callerAvatar})` :
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 120,
                    color: "white",
                    fontWeight: "300",
                    transform: `scale(${avatarScale})`,
                    transition: "transform 0.3s ease-out",
                    boxShadow: isIncoming ? "0 0 60px rgba(50, 215, 75, 0.3)" : "none"
                }}>
                    {!call.callerAvatar && call.callerName.charAt(0).toUpperCase()}
                </div>

                {/* Caller Name */}
                <div style={{
                    fontSize: 78,
                    fontWeight: "300",
                    color: "white",
                    textAlign: "center"
                }}>
                    {call.callerName}
                </div>

                {/* Call Status */}
                <div style={{
                    fontSize: 42,
                    color: "rgba(255, 255, 255, 0.6)"
                }}>
                    {isIncoming && (call.isVideo ? "FaceTime Video..." : "Incoming call...")}
                    {isActive && call.startedAt && (
                        <CallTimer startedAt={call.startedAt} currentTime={currentTime} />
                    )}
                </div>
            </div>

            {/* Bottom Section: Action Buttons */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: isIncoming ? 180 : 0,
                width: "100%"
            }}>
                {isIncoming && (
                    <>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                            <CallButton type="decline" />
                            <span style={{ fontSize: 36, color: "white" }}>Decline</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                            <CallButton type="accept" isVideo={call.isVideo} />
                            <span style={{ fontSize: 36, color: "white" }}>Accept</span>
                        </div>
                    </>
                )}

                {isActive && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                        <CallButton type="decline" />
                        <span style={{ fontSize: 36, color: "white" }}>End</span>
                    </div>
                )}
            </div>
        </div>
    );
};
