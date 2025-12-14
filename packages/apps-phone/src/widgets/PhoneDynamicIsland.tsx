/**
 * Phone Dynamic Island Widget
 * 
 * iOS Dynamic Island for active calls.
 */

import React from "react";
import { WidgetProps, CallState } from "@tokovo/core";
import { CallTimer } from "../components/shared/CallTimer";

/**
 * PhoneDynamicIsland - iOS Dynamic Island widget for active calls
 * 
 * Expansion modes:
 * - minimal: Just a pulsing green dot
 * - compact: Pill with avatar + timer
 * - expanded: Full controls
 */
export const PhoneDynamicIsland: React.FC<WidgetProps> = ({
    appState,
    expansionMode = "compact",
    currentFrame,
}) => {
    const call = appState as CallState;

    if (!call) return null;

    // Minimal mode - just a green dot
    if (expansionMode === "minimal") {
        return (
            <div
                style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "#34C759",
                }}
            />
        );
    }

    // Compact mode - pill with avatar and timer
    if (expansionMode === "compact") {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 16px",
                    backgroundColor: "#1c1c1e",
                    borderRadius: 30,
                }}
            >
                {/* Caller avatar */}
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: "#4a90d9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        color: "#fff",
                    }}
                >
                    {call.callerName?.[0] || "?"}
                </div>

                {/* Timer */}
                <div style={{ color: "#fff", fontSize: 16 }}>
                    <CallTimer startedAt={call.answeredAt} currentFrame={currentFrame} />
                </div>

                {/* Phone icon */}
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "#34C759",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                    }}
                >
                    📞
                </div>
            </div>
        );
    }

    // Expanded mode - full controls
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
                backgroundColor: "#1c1c1e",
                borderRadius: 40,
            }}
        >
            {/* Caller info */}
            <div
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "#4a90d9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: "#fff",
                }}
            >
                {call.callerName?.[0] || "?"}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>
                    {call.callerName}
                </div>
                <CallTimer startedAt={call.answeredAt} currentFrame={currentFrame} />
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 12 }}>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: call.isMuted ? "#fff" : "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    🔇
                </div>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#FF3B30",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    📵
                </div>
            </div>
        </div>
    );
};
