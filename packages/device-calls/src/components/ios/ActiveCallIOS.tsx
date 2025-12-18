/**
 * iOS Active Call Screen
 * 
 * In-call screen with timer and control grid.
 * Sizes are scaled for device frame (1290x2796 iPhone 16 Pro).
 */

import React from "react";
import { CallState, AppViewProps } from "@tokovo/core";

interface ActiveCallIOSProps extends Partial<AppViewProps> {
    call: CallState;
}

// SVG Icons (sized for device frame)
const MuteIcon = ({ active }: { active?: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={active ? "#000" : "#fff"}>
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
);

const KeypadIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="#fff">
        <circle cx="6" cy="6" r="2" />
        <circle cx="12" cy="6" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18" cy="12" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="12" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
    </svg>
);

const SpeakerIcon = ({ active }: { active?: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={active ? "#000" : "#fff"}>
        <path d="M3 9v6h4l5 5V4L7 9H3z" />
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="#fff">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
);

// Control Button
const ControlButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    variant?: "default" | "destructive";
    size?: number;
}> = ({ icon, label, isActive = false, variant = "default", size = 150 }) => {
    let bgColor = "rgba(255, 255, 255, 0.2)";
    if (isActive) bgColor = "white";
    if (variant === "destructive") bgColor = "#FF3B30";

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
        }}>
            <div style={{
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: bgColor,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                {icon}
            </div>
            <span style={{
                fontSize: 33,
                color: "#fff",
                opacity: 0.9,
                fontFamily: "SF Pro Text, -apple-system, sans-serif",
            }}>
                {label}
            </span>
        </div>
    );
};

// Call Timer
const CallTimer: React.FC<{ startedAt?: number; currentFrame: number; fps?: number }> = ({
    startedAt,
    currentFrame,
    fps = 30,
}) => {
    if (startedAt === undefined) {
        return <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 42 }}>Connecting...</span>;
    }

    const elapsedFrames = Math.max(0, currentFrame - startedAt);
    const elapsedSeconds = Math.floor(elapsedFrames / fps);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return (
        <span style={{
            fontSize: 42,
            fontVariantNumeric: "tabular-nums",
            color: "rgba(255, 255, 255, 0.6)",
            fontFamily: "SF Pro Display, -apple-system, sans-serif",
        }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
    );
};

/**
 * ActiveCallIOS - iOS in-call screen (properly sized for device frame)
 */
export const ActiveCallIOS: React.FC<ActiveCallIOSProps> = ({ call, t = 0 }) => {
    // Pulse animation for avatar
    const pulsePhase = Math.sin((t * 0.1) % (Math.PI * 2));
    const avatarScale = 1 + (pulsePhase * 0.02);

    return (
        <div
            style={{
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
                padding: "180px 45px 120px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            }}
        >
            {/* Top Section: Avatar & Name */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 30,
            }}>
                {/* Avatar */}
                <div style={{
                    width: 270,
                    height: 270,
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
                    fontSize: 90,
                    color: "white",
                    fontWeight: "300",
                    transform: `scale(${avatarScale})`,
                }}>
                    {!call.callerAvatar && call.callerName.charAt(0).toUpperCase()}
                </div>

                {/* Caller Name */}
                <div style={{
                    fontSize: 60,
                    fontWeight: "300",
                    color: "white",
                    textAlign: "center",
                }}>
                    {call.callerName}
                </div>

                {/* Timer */}
                <CallTimer startedAt={call.answeredAt} currentFrame={t} />
            </div>

            {/* Control Grid */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 60,
                width: "100%",
            }}>
                {/* 2x3 Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "45px 60px",
                    width: "100%",
                    maxWidth: 600,
                    justifyItems: "center",
                }}>
                    <ControlButton icon={<MuteIcon active={call.isMuted} />} label="mute" isActive={call.isMuted} />
                    <ControlButton icon={<KeypadIcon />} label="keypad" />
                    <ControlButton icon={<SpeakerIcon active={call.isSpeakerOn} />} label="speaker" isActive={call.isSpeakerOn} />
                    <ControlButton icon={<PhoneIcon />} label="add call" />
                    <ControlButton icon={<PhoneIcon />} label="FaceTime" />
                    <ControlButton icon={<PhoneIcon />} label="contacts" />
                </div>

                {/* End Call Button */}
                <ControlButton
                    icon={<PhoneIcon />}
                    label="End"
                    variant="destructive"
                    size={210}
                />
            </div>
        </div>
    );
};
