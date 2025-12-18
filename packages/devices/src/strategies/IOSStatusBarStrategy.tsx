/**
 * iOS StatusBar Strategy
 * 
 * Authentic iOS-style status bar with SF Pro fonts.
 */

import React from "react";
import type { StatusBarStrategyProps } from "../registries";
import {
    SignalBarsIcon,
    WifiIcon,
    BatteryIcon,
    DNDIcon,
    NetworkTypeLabel,
    formatTime,
} from "./shared-icons";

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

    const textColor = theme === "dark" ? "white" : "black";

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
