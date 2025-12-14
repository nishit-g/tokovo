/**
 * Shared Components - Action Buttons
 * 
 * Accept/Decline call buttons used in incoming call screens.
 */

import React from "react";

interface ActionButtonProps {
    variant: "accept" | "decline";
    isVideo?: boolean;
    size?: number;
    onClick?: () => void;
}

/**
 * ActionButton - Accept or Decline call button
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
    variant,
    isVideo = false,
    size = 70,
}) => {
    const isAccept = variant === "accept";

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: isAccept ? "#34C759" : "#FF3B30",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 20px ${isAccept ? "rgba(52, 199, 89, 0.4)" : "rgba(255, 59, 48, 0.4)"}`,
            }}
        >
            <span style={{ fontSize: size * 0.4, color: "#fff" }}>
                {isAccept ? (isVideo ? "📹" : "📞") : "📵"}
            </span>
        </div>
    );
};

/**
 * DeclineButton - Red decline button
 */
export const DeclineButton: React.FC<{ size?: number; compact?: boolean }> = ({
    size = 70,
    compact = false,
}) => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: compact ? 4 : 8,
        }}
    >
        <ActionButton variant="decline" size={size} />
        {!compact && (
            <span style={{ fontSize: 13, color: "#fff" }}>Decline</span>
        )}
    </div>
);

/**
 * AcceptButton - Green accept button
 */
export const AcceptButton: React.FC<{
    size?: number;
    isVideo?: boolean;
    compact?: boolean;
}> = ({ size = 70, isVideo = false, compact = false }) => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: compact ? 4 : 8,
        }}
    >
        <ActionButton variant="accept" isVideo={isVideo} size={size} />
        {!compact && (
            <span style={{ fontSize: 13, color: "#fff" }}>Accept</span>
        )}
    </div>
);
