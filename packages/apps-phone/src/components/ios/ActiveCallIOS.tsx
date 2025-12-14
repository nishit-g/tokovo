/**
 * iOS Active Call Screen
 * 
 * In-call screen with timer and control grid.
 */

import React from "react";
import { CallState, AppViewProps } from "@tokovo/core";
import { CallTimer } from "../shared/CallTimer";
import { ControlGrid } from "../shared/ControlGrid";
import { DeclineButton } from "../shared/ActionButtons";

interface ActiveCallIOSProps extends Partial<AppViewProps> {
    call: CallState;
}

/**
 * ActiveCallIOS - iOS in-call screen
 * 
 * Features:
 * - Caller name and timer at top
 * - Control grid (mute, keypad, speaker, etc.)
 * - Red end call button at bottom
 */
export const ActiveCallIOS: React.FC<ActiveCallIOSProps> = ({ call, t = 0 }) => {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 120,
            }}
        >
            {/* Caller info */}
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
                        fontSize: 36,
                        fontWeight: 500,
                        color: "#fff",
                        fontFamily: "SF Pro Display, -apple-system, sans-serif",
                    }}
                >
                    {call.callerName}
                </div>
                <CallTimer startedAt={call.answeredAt} currentFrame={t} />
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Control grid */}
            <ControlGrid call={call} platform="ios" />

            {/* End call button */}
            <div style={{ marginTop: 40, marginBottom: 80 }}>
                <DeclineButton size={80} />
            </div>
        </div>
    );
};
