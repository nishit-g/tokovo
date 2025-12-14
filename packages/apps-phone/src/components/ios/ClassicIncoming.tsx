/**
 * iOS 15/16 Classic Incoming Call
 * 
 * Blurred background with centered avatar and slide to answer.
 * Properly sized for device frame.
 */

import React from "react";
import { CallState } from "@tokovo/core";

interface ClassicIncomingProps {
    call: CallState;
    currentFrame?: number;
}

// Phone Icon
const PhoneIcon = ({ size = 72 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
);

/**
 * ClassicIncoming - iOS 15/16 style incoming call with slide to answer
 */
export const ClassicIncoming: React.FC<ClassicIncomingProps> = ({ call, currentFrame = 0 }) => {
    // Animations
    const fadeIn = Math.min(1, currentFrame / 15);
    const pulsePhase = Math.sin(currentFrame * 0.08);
    const ringScale1 = 1 + 0.08 * pulsePhase;
    const ringScale2 = 1 + 0.08 * Math.sin(currentFrame * 0.08 + 1);
    const ringOpacity = 0.25 + 0.15 * pulsePhase;
    const shimmerOpacity = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(currentFrame * 0.1));

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "200px 60px 180px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                opacity: fadeIn,
            }}
        >
            {/* Pulsing rings behind avatar */}
            <div
                style={{
                    position: "absolute",
                    top: 180,
                    left: "50%",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    border: `4px solid rgba(255, 255, 255, ${ringOpacity})`,
                    transform: `translateX(-50%) scale(${ringScale1})`,
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: 155,
                    left: "50%",
                    width: 450,
                    height: 450,
                    borderRadius: "50%",
                    border: `3px solid rgba(255, 255, 255, ${ringOpacity * 0.6})`,
                    transform: `translateX(-50%) scale(${ringScale2})`,
                    pointerEvents: "none",
                }}
            />

            {/* Top Content: Avatar + Name */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 40,
                zIndex: 1,
            }}>
                {/* Avatar */}
                <div style={{
                    width: 360,
                    height: 360,
                    borderRadius: "50%",
                    backgroundColor: "#8E8E93",
                    backgroundImage: call.callerAvatar
                        ? `url(${call.callerAvatar})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 120,
                    color: "white",
                    fontWeight: "300",
                    boxShadow: "0 0 80px rgba(50, 215, 75, 0.4)",
                }}>
                    {!call.callerAvatar && call.callerName.charAt(0).toUpperCase()}
                </div>

                {/* Caller Name */}
                <div style={{
                    fontSize: 78,
                    fontWeight: "300",
                    color: "#fff",
                    textAlign: "center",
                }}>
                    {call.callerName}
                </div>

                {/* Call Type Label */}
                <div style={{
                    fontSize: 42,
                    color: "rgba(255,255,255,0.6)",
                }}>
                    {call.isVideo ? "FaceTime Video..." : "Incoming call..."}
                </div>
            </div>

            {/* Slide to Answer */}
            <div style={{
                width: "100%",
                maxWidth: 900,
            }}>
                <div
                    style={{
                        width: "100%",
                        height: 180,
                        borderRadius: 90,
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(20px)",
                        display: "flex",
                        alignItems: "center",
                        padding: 12,
                        position: "relative",
                    }}
                >
                    {/* Green phone icon thumb */}
                    <div
                        style={{
                            width: 156,
                            height: 156,
                            borderRadius: "50%",
                            backgroundColor: "#34C759",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 40px rgba(52, 199, 89, 0.5)",
                        }}
                    >
                        <PhoneIcon size={72} />
                    </div>

                    {/* Shimmer text */}
                    <div
                        style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: 48,
                            fontWeight: 400,
                            color: "#fff",
                            opacity: shimmerOpacity,
                        }}
                    >
                        slide to answer
                    </div>

                    {/* Right arrows */}
                    <div
                        style={{
                            position: "absolute",
                            right: 48,
                            display: "flex",
                            gap: 12,
                            opacity: 0.5,
                        }}
                    >
                        <span style={{ color: "#fff", fontSize: 42 }}>›</span>
                        <span style={{ color: "#fff", fontSize: 42 }}>›</span>
                        <span style={{ color: "#fff", fontSize: 42 }}>›</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
