/**
 * Incoming Call Banner Widget
 * 
 * Notification-style banner for incoming calls (overlay mode).
 */

import React from "react";
import { WidgetProps, CallState } from "@tokovo/core";
import { AcceptButton, DeclineButton } from "../components/shared/ActionButtons";

/**
 * IncomingCallBanner - Notification banner for incoming calls
 * 
 * Used when displayMode is "overlay" instead of "fullscreen".
 */
export const IncomingCallBanner: React.FC<WidgetProps> = ({
    appState,
    platform = "ios",
}) => {
    const call = appState as CallState;

    if (!call || call.status !== "incoming") return null;

    return (
        <div
            style={{
                width: "100%",
                padding: 16,
                backgroundColor: platform === "ios"
                    ? "rgba(28, 28, 30, 0.95)"
                    : "rgba(30, 30, 30, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: platform === "ios" ? 24 : 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
        >
            {/* Avatar */}
            <div
                style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    backgroundColor: "#4a90d9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {call.callerAvatar ? (
                    <img
                        src={call.callerAvatar}
                        alt={call.callerName}
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <span style={{ color: "#fff", fontSize: 22 }}>
                        {call.callerName?.[0] || "?"}
                    </span>
                )}
            </div>

            {/* Caller info */}
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#fff",
                        fontFamily: platform === "ios"
                            ? "SF Pro Display, -apple-system, sans-serif"
                            : "Roboto, sans-serif",
                    }}
                >
                    {call.callerName}
                </div>
                <div
                    style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.6)",
                        marginTop: 2,
                    }}
                >
                    {call.isVideo ? "Video Call" : "Incoming Call"}
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12 }}>
                <DeclineButton size={44} compact />
                <AcceptButton size={44} isVideo={call.isVideo} compact />
            </div>
        </div>
    );
};
