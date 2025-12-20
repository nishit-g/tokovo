/**
 * iOS StatusBar Strategy
 * 
 * Authentic iOS-style status bar with SF Pro fonts.
 * Supports full theme customization.
 */

import React from "react";
import { resolveStatusBarTheme, STATUS_BAR_PRESETS } from "@tokovo/core";
import type { StatusBarStrategyProps } from "../registries";
import {
    SignalBarsIcon,
    WifiIcon,
    BatteryIcon,
    DNDIcon,
    NetworkTypeLabel,
    formatTime,
} from "./shared-icons";

/**
 * Resolve theme prop to actual colors.
 * Handles:
 * - "light" | "dark" → preset colors
 * - ResolvedStatusBarTheme → use directly
 */
function resolveThemeColors(theme: StatusBarStrategyProps["theme"]): { textColor: string; bgColor: string } {
    if (typeof theme === "string" || !theme) {
        const preset = STATUS_BAR_PRESETS[theme || "light"];
        return {
            textColor: preset.iconColor,
            bgColor: preset.backgroundColor,
        };
    }
    // Full theme object
    return {
        textColor: theme.iconColor,
        bgColor: theme.backgroundColor,
    };
}

export const IOSStatusBarStrategy: React.FC<StatusBarStrategyProps> = ({
    os,
    time = "9:41",
    theme = "light",
    batteryPercentage = 100,
}) => {
    // Read from device.os if available, otherwise use props
    const displayTime = os ? formatTime(os.clock) : time;
    const displayBattery = os?.battery ?? batteryPercentage;
    const isCharging = os?.charging ?? false;
    const network = os?.network ?? "wifi";
    const wifiStrength = os?.wifiStrength ?? 3;
    const cellStrength = os?.cellStrength ?? 4;
    const isDND = os?.dnd ?? false;

    // Resolve theme to actual colors
    const { textColor, bgColor } = resolveThemeColors(theme);

    return (
        <div style={{
            width: "100%",
            height: 132,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "45px 72px 0 72px",
            boxSizing: "border-box",
            color: textColor,
            backgroundColor: bgColor,
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 20
        }}>
            {/* Left side - Time */}
            <div style={{
                fontSize: 51,
                fontWeight: "600",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                letterSpacing: 0.5
            }}>
                {displayTime}
            </div>

            {/* Right side - Status icons */}
            <div style={{
                display: "flex",
                gap: 15,
                alignItems: "center",
                marginTop: 6
            }}>
                {isDND && <DNDIcon color={textColor} />}
                {network !== "wifi" && <NetworkTypeLabel network={network} color={textColor} />}
                <SignalBarsIcon color={textColor} strength={cellStrength} />
                {network === "wifi" && <WifiIcon color={textColor} strength={wifiStrength} />}
                <BatteryIcon color={textColor} percentage={displayBattery} charging={isCharging} />
            </div>
        </div>
    );
};
