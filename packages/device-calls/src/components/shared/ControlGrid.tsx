/**
 * Shared Components - Control Grid
 * 
 * 3x2 grid of call controls (Mute, Keypad, Speaker, etc.)
 */

import React from "react";
import { CallState } from "@tokovo/core";

interface ControlGridProps {
    call: CallState;
    platform?: "ios" | "android";
}

interface ControlButtonProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    destructive?: boolean;
    onClick?: () => void;
}

const ControlButton: React.FC<ControlButtonProps> = ({
    icon,
    label,
    active = false,
    destructive = false,
}) => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
        }}
    >
        <div
            style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                backgroundColor: destructive
                    ? "#ff3b30"
                    : active
                        ? "#fff"
                        : "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <span style={{ fontSize: 28, color: active ? "#000" : "#fff" }}>
                {icon}
            </span>
        </div>
        <span
            style={{
                fontSize: 13,
                color: "#fff",
            }}
        >
            {label}
        </span>
    </div>
);

/**
 * ControlGrid - Call control buttons
 */
export const ControlGrid: React.FC<ControlGridProps> = ({ call }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 30,
                padding: 20,
            }}
        >
            <ControlButton icon="🔇" label="mute" active={call.isMuted} />
            <ControlButton icon="⌨️" label="keypad" />
            <ControlButton icon="🔊" label="speaker" active={call.isSpeakerOn} />
            <ControlButton icon="➕" label="add call" />
            <ControlButton icon={call.isVideo ? "📹" : "🎥"} label="FaceTime" />
            <ControlButton icon="👤" label="contacts" />
        </div>
    );
};
