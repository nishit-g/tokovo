/**
 * iOS Active Call Screen (Production Quality)
 * 
 * Clean iOS 17 in-call design.
 * Designed at 393px logical width (1x design scale).
 */

import React from "react";
import { CallState, AppViewProps } from "@tokovo/core";

interface ActiveCallIOSProps extends Partial<AppViewProps> {
    call: CallState;
}

// =============================================================================
// ICONS
// =============================================================================

const MuteIcon = ({ active }: { active?: boolean }) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill={active ? "#000" : "#fff"}>
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
);

const KeypadIcon = () => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="#fff">
        <circle cx="6" cy="6" r="1.8" />
        <circle cx="12" cy="6" r="1.8" />
        <circle cx="18" cy="6" r="1.8" />
        <circle cx="6" cy="12" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="18" cy="12" r="1.8" />
        <circle cx="6" cy="18" r="1.8" />
        <circle cx="12" cy="18" r="1.8" />
        <circle cx="18" cy="18" r="1.8" />
    </svg>
);

const SpeakerIcon = ({ active }: { active?: boolean }) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill={active ? "#000" : "#fff"}>
        <path d="M3 9v6h4l5 5V4L7 9H3z" />
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
);

const EndCallIcon = () => (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="#fff" style={{ transform: "rotate(135deg)" }}>
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
);

// =============================================================================
// CONTROL BUTTON
// =============================================================================

const ControlButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
}> = ({ icon, label, isActive = false }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
    }}>
        <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: isActive ? "#fff" : "rgba(255, 255, 255, 0.15)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            {icon}
        </div>
        <span style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            fontWeight: 500,
        }}>
            {label}
        </span>
    </div>
);

// =============================================================================
// CALL TIMER
// =============================================================================

const CallTimer: React.FC<{ startedAt?: number; currentFrame: number; fps?: number }> = ({
    startedAt,
    currentFrame,
    fps = 30,
}) => {
    if (startedAt === undefined) {
        return <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Connecting...</span>;
    }

    const elapsedFrames = Math.max(0, currentFrame - startedAt);
    const elapsedSeconds = Math.floor(elapsedFrames / fps);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return (
        <span style={{
            fontSize: 15,
            fontVariantNumeric: "tabular-nums",
            color: "rgba(255, 255, 255, 0.5)",
            fontWeight: 400,
        }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ActiveCallIOS: React.FC<ActiveCallIOSProps> = ({ call, t = 0 }) => {
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
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            }}
        >
            {/* === TOP: Avatar + Name + Timer === */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 40,
                gap: 12,
            }}>
                {/* Avatar */}
                <div style={{
                    width: 90,
                    height: 90,
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
                    fontSize: 36,
                    color: "white",
                    fontWeight: 300,
                }}>
                    {!call.callerAvatar && initial}
                </div>

                {/* Name */}
                <div style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "white",
                }}>
                    {call.callerName}
                </div>

                {/* Timer */}
                <CallTimer startedAt={call.answeredAt} currentFrame={t} />
            </div>

            {/* === BOTTOM: Controls === */}
            <div style={{
                padding: "0 40px 50px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 40,
            }}>
                {/* Control Row */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 50,
                }}>
                    <ControlButton
                        icon={<MuteIcon active={call.isMuted} />}
                        label="mute"
                        isActive={call.isMuted}
                    />
                    <ControlButton
                        icon={<KeypadIcon />}
                        label="keypad"
                    />
                    <ControlButton
                        icon={<SpeakerIcon active={call.isSpeakerOn} />}
                        label="speaker"
                        isActive={call.isSpeakerOn}
                    />
                </div>

                {/* End Call Button */}
                <div style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    backgroundColor: "#FF3B30",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 20px rgba(255, 59, 48, 0.4)",
                }}>
                    <EndCallIcon />
                </div>
            </div>
        </div>
    );
};
