import React from "react";
import { CallState } from "@tokovo/core";

// ============================================================================
// CALL CONTROL ICONS (SVG)
// ============================================================================

const MuteIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <path d="M1 14.75a6.75 6.75 0 0 1 6.75-6.75h8.5A6.75 6.75 0 0 1 23 14.75v6.5a.75.75 0 0 1-.75.75h-8.5v-3.5a1.75 1.75 0 0 0-3.5 0v3.5h-8.5a.75.75 0 0 1-.75-.75v-6.5zM12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    </svg>
);

const SpeakerIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="white" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="2" fill="none" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" strokeWidth="2" fill="none" />
    </svg>
);

const KeypadIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
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

const VideoIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <path d="M23 7l-7 5 7 5V7zM16 5H2a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z" />
    </svg>
);

const AddCallIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="white">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
);

// ============================================================================
// CONTROL BUTTON COMPONENT
// ============================================================================

interface ControlButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    size?: "small" | "large";
    variant?: "default" | "destructive";
}

const ControlButton: React.FC<ControlButtonProps> = ({
    icon,
    label,
    isActive = false,
    size = "small",
    variant = "default"
}) => {
    const buttonSize = size === "large" ? 210 : 150;

    let bgColor = "rgba(255, 255, 255, 0.2)";
    if (isActive) bgColor = "white";
    if (variant === "destructive") bgColor = "#FF3B30";

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18
        }}>
            <div style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: "50%",
                backgroundColor: bgColor,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{ color: isActive ? "#000" : "#fff" }}>
                    {icon}
                </div>
            </div>
            <span style={{
                fontSize: 33,
                color: "white",
                opacity: 0.9
            }}>
                {label}
            </span>
        </div>
    );
};

// ============================================================================
// CALL TIMER
// ============================================================================

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
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
    );
};

// ============================================================================
// CALL OVERLAY COMPONENT
// ============================================================================

interface CallOverlayProps {
    call: CallState;
    currentTime: number;
    variant?: "ios" | "android";
}

export const CallOverlay: React.FC<CallOverlayProps> = ({
    call,
    currentTime,
    variant: _variant = "ios"
}) => {
    if (call.status === "ended") return null;

    const isIncoming = call.status === "incoming";
    const isActive = call.status === "active";

    // Pulse animation for incoming call avatar
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
            padding: "180px 45px 120px",
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
                    width: isActive ? 270 : 360,
                    height: isActive ? 270 : 360,
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
                    fontSize: isActive ? 90 : 120,
                    color: "white",
                    fontWeight: "300",
                    transform: `scale(${avatarScale})`,
                    boxShadow: isIncoming ? "0 0 60px rgba(50, 215, 75, 0.3)" : "none"
                }}>
                    {!call.callerAvatar && call.callerName.charAt(0).toUpperCase()}
                </div>

                {/* Caller Name */}
                <div style={{
                    fontSize: isActive ? 60 : 78,
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
                    {isActive && call.answeredAt && (
                        <CallTimer startedAt={call.answeredAt} currentTime={currentTime} />
                    )}
                </div>
            </div>

            {/* Bottom Section: Controls */}
            {isIncoming ? (
                // Incoming Call: Accept/Decline
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 180,
                    width: "100%"
                }}>
                    <ControlButton
                        icon={<PhoneIcon />}
                        label="Decline"
                        variant="destructive"
                        size="large"
                    />
                    <ControlButton
                        icon={call.isVideo ? <VideoIcon /> : <PhoneIcon />}
                        label="Accept"
                        size="large"
                    />
                </div>
            ) : (
                // Active Call: Control Grid + End Button
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 60,
                    width: "100%"
                }}>
                    {/* Control Grid (2 rows x 3 columns) */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "45px 60px",
                        width: "100%",
                        maxWidth: 600,
                        justifyItems: "center"
                    }}>
                        <ControlButton icon={<MuteIcon />} label="mute" isActive={call.isMuted} />
                        <ControlButton icon={<KeypadIcon />} label="keypad" />
                        <ControlButton icon={<SpeakerIcon />} label="speaker" isActive={call.isSpeakerOn} />
                        <ControlButton icon={<AddCallIcon />} label="add call" />
                        <ControlButton icon={<VideoIcon />} label="FaceTime" />
                        <div style={{ width: 150 }} /> {/* Spacer */}
                    </div>

                    {/* End Call Button */}
                    <ControlButton
                        icon={<PhoneIcon />}
                        label="End"
                        variant="destructive"
                        size="large"
                    />
                </div>
            )}
        </div>
    );
};
