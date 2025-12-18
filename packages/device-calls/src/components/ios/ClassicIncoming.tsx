/**
 * iOS Incoming Call (Production Quality)
 * 
 * Accurate iOS 17 style - only slide to answer bar.
 * Designed at 393px logical width (1x design scale).
 */

import React from "react";
import { CallState } from "@tokovo/core";

interface ClassicIncomingProps {
    call: CallState;
    currentFrame?: number;
}

// Phone Icon (filled, white)
const PhoneIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
);

/**
 * ClassicIncoming - iOS 17 style incoming call
 * 
 * Clean, minimal design with:
 * - Large centered avatar with subtle pulse
 * - Caller name + "iPhone" label
 * - Slide to answer bar at bottom
 */
export const ClassicIncoming: React.FC<ClassicIncomingProps> = ({ call, currentFrame = 0 }) => {
    // Animations
    const fadeIn = Math.min(1, currentFrame / 12);
    const pulsePhase = Math.sin(currentFrame * 0.08);
    const ringScale = 1 + 0.025 * pulsePhase;
    const ringOpacity = 0.4 + 0.2 * pulsePhase;
    const shimmerX = ((currentFrame * 2) % 300) - 50; // Shimmer moves right
    const arrowOpacity = [0.3, 0.5, 0.7].map((base, i) =>
        base + 0.2 * Math.sin(currentFrame * 0.12 + i * 0.5)
    );

    // Fallback initial
    const initial = call.callerName?.charAt(0)?.toUpperCase() || "?";

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "#000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
                opacity: fadeIn,
                overflow: "hidden",
            }}
        >
            {/* === TOP SECTION: Avatar + Name === */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 60,
                gap: 16,
            }}>
                {/* Avatar with pulsing ring */}
                <div style={{ position: "relative" }}>
                    {/* Outer pulse ring */}
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        border: `2px solid rgba(52, 199, 89, ${ringOpacity})`,
                        transform: `translate(-50%, -50%) scale(${ringScale})`,
                        pointerEvents: "none",
                    }} />

                    {/* Avatar */}
                    <div style={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        backgroundColor: "#3A3A3C",
                        backgroundImage: call.callerAvatar
                            ? `url(${call.callerAvatar})`
                            : "linear-gradient(135deg, #5856D6 0%, #AF52DE 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 48,
                        color: "white",
                        fontWeight: 300,
                    }}>
                        {!call.callerAvatar && initial}
                    </div>
                </div>

                {/* Caller Name */}
                <div style={{
                    fontSize: 32,
                    fontWeight: 600,
                    color: "#fff",
                    textAlign: "center",
                    letterSpacing: 0.3,
                }}>
                    {call.callerName}
                </div>

                {/* Call Type Label */}
                <div style={{
                    fontSize: 18,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 400,
                }}>
                    {call.isVideo ? "FaceTime Video" : "iPhone"}
                </div>
            </div>

            {/* === BOTTOM SECTION: Slide to Answer === */}
            <div style={{
                width: "100%",
                padding: "0 30px 50px",
            }}>
                {/* Slide Bar */}
                <div style={{
                    width: "100%",
                    height: 62,
                    borderRadius: 31,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    padding: 5,
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Shimmer effect */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: shimmerX,
                        width: 60,
                        height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                        pointerEvents: "none",
                    }} />

                    {/* Green phone thumb */}
                    <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        backgroundColor: "#30D158",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 12px rgba(48, 209, 88, 0.4)",
                        zIndex: 1,
                    }}>
                        <PhoneIcon size={26} />
                    </div>

                    {/* Text + arrows */}
                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                    }}>
                        <span style={{
                            fontSize: 17,
                            fontWeight: 500,
                            color: "rgba(255,255,255,0.8)",
                            letterSpacing: 0.2,
                        }}>
                            slide to answer
                        </span>

                        {/* Animated arrows */}
                        <div style={{ display: "flex", gap: 2, marginLeft: 4 }}>
                            {arrowOpacity.map((opacity, i) => (
                                <span key={i} style={{
                                    color: "#fff",
                                    fontSize: 16,
                                    opacity,
                                    fontWeight: 300,
                                }}>›</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
