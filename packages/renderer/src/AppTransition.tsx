import React from "react";

/**
 * AppTransition - Handles app open/close zoom animations
 * Creates an iOS-style scale & fade effect
 */

interface AppTransitionProps {
    children: React.ReactNode;
    isOpening: boolean;
    isClosing: boolean;
    progress: number; // 0 to 1
    originX?: number; // Icon position X (for zoom origin)
    originY?: number; // Icon position Y
}

export const AppTransition: React.FC<AppTransitionProps> = ({
    children,
    isOpening,
    isClosing,
    progress,
    originX = 0.5,
    originY = 0.5
}) => {
    // Easing function - Apple-style spring
    const easeOutSpring = (t: number) => {
        return 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 0.5);
    };

    // Calculate animation values
    let scale = 1;
    let opacity = 1;
    let borderRadius = 0;

    if (isOpening) {
        const easedProgress = easeOutSpring(progress);
        scale = 0.8 + 0.2 * easedProgress;
        opacity = easedProgress;
        borderRadius = 150 * (1 - easedProgress); // Starts rounded, ends square
    } else if (isClosing) {
        const easedProgress = easeOutSpring(1 - progress);
        scale = 0.8 + 0.2 * easedProgress;
        opacity = easedProgress;
        borderRadius = 150 * (1 - easedProgress);
    }

    return (
        <div style={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden"
        }}>
            <div style={{
                width: "100%",
                height: "100%",
                transform: `scale(${scale})`,
                transformOrigin: `${originX * 100}% ${originY * 100}%`,
                opacity,
                borderRadius,
                overflow: "hidden",
                transition: "none"
            }}>
                {children}
            </div>
        </div>
    );
};

/**
 * FaceIDAnimation - Face ID unlock animation
 */

interface FaceIDAnimationProps {
    phase: "scanning" | "success" | "failed" | "idle";
    progress: number; // 0 to 1 for animation
}

export const FaceIDAnimation: React.FC<FaceIDAnimationProps> = ({ phase, progress }) => {
    if (phase === "idle") return null;

    const isScanning = phase === "scanning";
    const isSuccess = phase === "success";

    // Scanning animation: lines moving
    const scanLineY = isScanning ? 50 + Math.sin(progress * Math.PI * 4) * 40 : 50;

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            pointerEvents: "none"
        }}>
            {/* Face ID icon */}
            <div style={{
                width: 180,
                height: 180,
                position: "relative"
            }}>
                {/* Corner brackets */}
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: "absolute" }}>
                    {/* Top-left corner */}
                    <path d="M10 50 L10 20 Q10 10 20 10 L50 10"
                        stroke={isSuccess ? "#34C759" : "white"}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Top-right corner */}
                    <path d="M130 10 L160 10 Q170 10 170 20 L170 50"
                        stroke={isSuccess ? "#34C759" : "white"}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Bottom-left corner */}
                    <path d="M10 130 L10 160 Q10 170 20 170 L50 170"
                        stroke={isSuccess ? "#34C759" : "white"}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Bottom-right corner */}
                    <path d="M130 170 L160 170 Q170 170 170 160 L170 130"
                        stroke={isSuccess ? "#34C759" : "white"}
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Scanning line */}
                    {isScanning && (
                        <line
                            x1="30" y1={scanLineY}
                            x2="150" y2={scanLineY}
                            stroke="rgba(255,255,255,0.6)"
                            strokeWidth="2"
                        />
                    )}

                    {/* Success checkmark */}
                    {isSuccess && (
                        <path
                            d="M55 90 L80 115 L125 65"
                            stroke="#34C759"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                strokeDasharray: 100,
                                strokeDashoffset: 100 - progress * 100
                            }}
                        />
                    )}
                </svg>
            </div>
        </div>
    );
};

/**
 * UnlockTransition - Complete unlock flow with Face ID + swipe
 */

interface UnlockTransitionProps {
    phase: "locked" | "face_id" | "unlocking" | "unlocked";
    progress: number;
    children: React.ReactNode;
}

export const UnlockTransition: React.FC<UnlockTransitionProps> = ({
    phase,
    progress,
    children
}) => {
    let contentTransform = "translateY(0)";
    let contentOpacity = 1;
    let faceIdPhase: FaceIDAnimationProps["phase"] = "idle";

    switch (phase) {
        case "locked":
            contentOpacity = 0;
            break;
        case "face_id":
            faceIdPhase = progress < 0.7 ? "scanning" : "success";
            contentOpacity = 0;
            break;
        case "unlocking":
            contentTransform = `translateY(${(1 - progress) * 100}%)`;
            contentOpacity = progress;
            break;
        case "unlocked":
            contentTransform = "translateY(0)";
            contentOpacity = 1;
            break;
    }

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <FaceIDAnimation
                phase={faceIdPhase}
                progress={faceIdPhase === "scanning" ? progress / 0.7 : (progress - 0.7) / 0.3}
            />
            <div style={{
                width: "100%",
                height: "100%",
                transform: contentTransform,
                opacity: contentOpacity,
                transition: "none"
            }}>
                {children}
            </div>
        </div>
    );
};
