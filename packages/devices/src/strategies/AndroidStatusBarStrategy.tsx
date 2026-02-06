/**
 * Android StatusBar Strategy
 * 
 * Material Design-style status bar with Roboto fonts.
 */

import React from "react";
import type { StatusBarStrategyProps } from "../registries/index.js";
import {
    SignalBarsIcon,
    WifiIcon,
    BatteryIcon,
    DNDIcon,
    NetworkTypeLabel,
    formatTime,
} from "./shared-icons.js";

// Notification icon for Android left side
const NotificationIcon: React.FC<{ icon?: string; count: number }> = ({ icon, count }) => (
    <div style={{ position: "relative" }}>
        <span style={{ fontSize: 28 }}>{icon || "📱"}</span>
        {count > 1 && (
            <div style={{
                position: "absolute",
                top: -6,
                right: -8,
                background: "#ff3b30",
                borderRadius: 10,
                padding: "2px 6px",
                fontSize: 18,
                fontWeight: 600,
                color: "white",
                minWidth: 12,
                textAlign: "center",
            }}>
                {count > 9 ? "9+" : count}
            </div>
        )}
    </div>
);

export const AndroidStatusBarStrategy: React.FC<StatusBarStrategyProps> = ({
    os,
    time = "9:41",
    batteryPercentage = 100,
    notificationIcons = [],
}) => {
    // Read from device.os if available
    const displayTime = os ? formatTime(os.clock) : time;
    const displayBattery = os?.battery ?? batteryPercentage;
    const isCharging = os?.charging ?? false;
    const network = os?.network ?? "wifi";
    const wifiStrength = os?.wifiStrength ?? 3;
    const cellStrength = os?.cellStrength ?? 4;
    const isDND = os?.dnd ?? false;

    return (
        <div style={{
            width: "100%",
            height: 90,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 45px",
            boxSizing: "border-box",
            fontSize: 36,
            fontWeight: "500",
            color: "white",
            position: "absolute",
            top: 15,
            left: 0,
            zIndex: 20,
            fontFamily: "Roboto, sans-serif"
        }}>
            {/* Left side - Time and notification icons */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span>{displayTime}</span>
                {notificationIcons.slice(0, 5).map((n, i) => (
                    <NotificationIcon key={i} icon={n.icon} count={n.count} />
                ))}
                {notificationIcons.length > 5 && (
                    <span style={{ fontSize: 28 }}>•</span>
                )}
            </div>

            {/* Right side - Status icons */}
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                {isDND && <DNDIcon color="white" />}
                {network !== "wifi" && <NetworkTypeLabel network={network} color="white" />}
                <SignalBarsIcon color="white" strength={cellStrength} />
                {network === "wifi" && <WifiIcon color="white" strength={wifiStrength} />}
                <BatteryIcon color="white" percentage={displayBattery} charging={isCharging} />
            </div>
        </div>
    );
};
