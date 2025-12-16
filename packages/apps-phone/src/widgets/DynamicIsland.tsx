/**
 * Phone Dynamic Island Widget
 * 
 * Shows active call status.
 */

import React from "react";
import { WidgetComponent } from "@tokovo/core";
import { PhoneTheme } from "../theme";

export const DynamicIslandCall: WidgetComponent = ({ appState, currentFrame, expansionMode }) => {
    // Determine active call duration (mock or from state)
    // appState might be undefined if accessing from background, 
    // but WidgetRegistry logic usually passes relevant state.
    // However, phoneReducer puts state on `device.call`, NOT `world.appState`.
    // Wait, Phone App stores state on `device.call`!
    // The `WidgetProps` pass `appState` which is `world.appState['app_phone']`.
    // Phone App doesn't USE `world.appState`! It uses `device.call`.
    // This is a legacy quirk of the Phone app being "System Level".

    // For now, render a generic "Active Call" indicator.
    // In V3 we should move `device.call` to `appState.phone`.

    return (
        <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            color: "#fff",
            fontFamily: PhoneTheme.typography.fontFamily
        }}>
            {/* Left: Duration */}
            <div style={{
                color: PhoneTheme.colors.accept,
                fontSize: 14,
                fontWeight: 600
            }}>
                00:24
            </div>

            {/* Right: Waveform (Animated) */}
            <div style={{ display: "flex", gap: 3, alignItems: "center", height: 12 }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                        width: 3,
                        height: 4 + (Math.sin(currentFrame * 0.2 + i) * 6),
                        backgroundColor: PhoneTheme.colors.accept,
                        borderRadius: 2
                    }} />
                ))}
            </div>
        </div>
    );
};
