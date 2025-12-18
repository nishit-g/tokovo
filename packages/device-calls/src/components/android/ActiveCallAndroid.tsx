/**
 * Android Active Call Screen
 */

import React from "react";
import { CallState, AppViewProps } from "@tokovo/core";
import { CallTimer } from "../shared/CallTimer";
import { ControlGrid } from "../shared/ControlGrid";
import { DeclineButton } from "../shared/ActionButtons";

interface ActiveCallAndroidProps extends Partial<AppViewProps> {
    call: CallState;
}

/**
 * ActiveCallAndroid - Android in-call screen
 * 
 * Features:
 * - Material Design styling
 * - Caller name and timer
 * - Control grid
 * - Red end call button
 */
export const ActiveCallAndroid: React.FC<ActiveCallAndroidProps> = ({ call, t = 0 }) => {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#121212",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 100,
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
                        fontSize: 32,
                        fontWeight: 400,
                        color: "#fff",
                        fontFamily: "Roboto, sans-serif",
                    }}
                >
                    {call.callerName}
                </div>
                <CallTimer startedAt={call.answeredAt} currentFrame={t} />
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Control grid */}
            <ControlGrid call={call} platform="android" />

            {/* End call button */}
            <div style={{ marginTop: 40, marginBottom: 60 }}>
                <DeclineButton size={70} />
            </div>
        </div>
    );
};
