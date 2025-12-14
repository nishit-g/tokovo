import React from "react";
import { DeviceOSState } from "@tokovo/core";

/**
 * StatusBar - Authentic iOS/Android status bar
 * 
 * Reads from DeviceOSState for:
 * - Time (formatted from clock timestamp)
 * - Battery percentage and charging state
 * - Network type and signal strength
 * - DND mode (moon icon)
 */

// =============================================================================
// ICONS
// =============================================================================

// iOS Signal Bars (4 bars, varying heights based on strength)
const SignalBarsIcon: React.FC<{ color?: string; strength?: number }> = ({
    color = "currentColor",
    strength = 4 // 0-4
}) => (
    <svg width="51" height="33" viewBox="0 0 17 11" fill={color}>
        <rect x="0" y="8" width="3" height="3" rx="0.5" opacity={strength >= 1 ? 1 : 0.3} />
        <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.5" opacity={strength >= 2 ? 1 : 0.3} />
        <rect x="9" y="3" width="3" height="8" rx="0.5" opacity={strength >= 3 ? 1 : 0.3} />
        <rect x="13.5" y="0" width="3" height="11" rx="0.5" opacity={strength >= 4 ? 1 : 0.3} />
    </svg>
);

// iOS WiFi Icon (3 arcs based on strength)
const WifiIcon: React.FC<{ color?: string; strength?: number }> = ({
    color = "currentColor",
    strength = 3 // 0-3
}) => (
    <svg width="48" height="36" viewBox="0 0 16 12" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <path d="M1 4C4 1 12 1 15 4" opacity={strength >= 3 ? 1 : 0.3} />
        <path d="M3.5 6.5C5.5 4.5 10.5 4.5 12.5 6.5" opacity={strength >= 2 ? 1 : 0.3} />
        <path d="M6 9C7 8 9 8 10 9" opacity={strength >= 1 ? 1 : 0.3} />
        <circle cx="8" cy="11" r="1" fill={color} stroke="none" />
    </svg>
);

// iOS Battery Icon
const BatteryIcon: React.FC<{ color?: string; percentage?: number; charging?: boolean }> = ({
    color = "currentColor",
    percentage = 100,
    charging = false
}) => (
    <svg width="75" height="36" viewBox="0 0 25 12" fill="none">
        {/* Battery body */}
        <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={color} strokeWidth="1" />
        {/* Battery fill */}
        <rect
            x="2"
            y="2"
            width={Math.max(0, (percentage / 100) * 18)}
            height="8"
            rx="1"
            fill={percentage > 20 ? (charging ? "#34C759" : color) : "#FF3B30"}
        />
        {/* Battery cap */}
        <path d="M23 4V8C24 8 25 7 25 6C25 5 24 4 23 4Z" fill={color} opacity="0.4" />
        {/* Charging bolt */}
        {charging && (
            <path d="M11 2L8 6H11L10 10L13 6H10L11 2Z" fill="white" />
        )}
    </svg>
);

// Network type label for cellular
const NetworkTypeLabel: React.FC<{ network: string; color: string }> = ({ network, color }) => {
    const label = network === "wifi" ? null : network.toUpperCase();
    if (!label) return null;
    return (
        <span style={{
            fontSize: 36,
            fontWeight: 600,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            marginRight: 6,
            color,
        }}>
            {label}
        </span>
    );
};

// DND Moon Icon
const DNDIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill={color}>
        <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.09 20.89 10.65C20.16 12.36 18.46 13.52 16.5 13.52C13.74 13.52 11.5 11.28 11.5 8.52C11.5 6.56 12.66 4.86 14.37 4.13C13.93 4.05 13.47 4 13 4C12.34 4 12 3.66 12 3Z" />
    </svg>
);

// =============================================================================
// PROPS
// =============================================================================

interface StatusBarProps {
    /** Device OS state (preferred - reads time, battery, network from here) */
    os?: DeviceOSState;
    /** Fallback: manual time string */
    time?: string;
    /** Fallback: manual battery percentage */
    batteryPercentage?: number;
    /** Platform variant */
    variant?: "ios" | "android";
    /** Theme */
    theme?: "light" | "dark";
    /** Notification icons (Android left side) */
    notificationIcons?: Array<{ appId: string; count: number; icon?: string }>;
}

// =============================================================================
// HELPERS
// =============================================================================

/** Format timestamp to HH:MM */
function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    });
}

// =============================================================================
// NOTIFICATION ICON
// =============================================================================

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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const StatusBar: React.FC<StatusBarProps> = ({
    os,
    time = "9:41",
    batteryPercentage = 100,
    variant = "ios",
    theme = "light",
    notificationIcons = [],
}) => {
    // Read from device.os if available, otherwise use props
    const displayTime = os ? formatTime(os.clock) : time;
    const displayBattery = os ? os.battery : batteryPercentage;
    const isCharging = os?.charging ?? false;
    const network = os?.network ?? "wifi";
    const wifiStrength = os?.wifiStrength ?? 3;
    const cellStrength = os?.cellStrength ?? 4;
    const isDND = os?.dnd ?? false;

    const isAndroid = variant === "android";
    const textColor = theme === "dark" ? "white" : "black";

    // Android Status Bar
    if (isAndroid) {
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
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span>{displayTime}</span>
                    {notificationIcons.slice(0, 5).map((n, i) => (
                        <NotificationIcon key={i} icon={n.icon} count={n.count} />
                    ))}
                    {notificationIcons.length > 5 && (
                        <span style={{ fontSize: 28 }}>•</span>
                    )}
                </div>
                <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                    {isDND && <DNDIcon color="white" />}
                    {network !== "wifi" && <NetworkTypeLabel network={network} color="white" />}
                    <SignalBarsIcon color="white" strength={cellStrength} />
                    {network === "wifi" && <WifiIcon color="white" strength={wifiStrength} />}
                    <BatteryIcon color="white" percentage={displayBattery} charging={isCharging} />
                </div>
            </div>
        );
    }

    // iOS Status Bar
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

/**
 * iOS Status Bar specifically styled for dark backgrounds
 */
export const DarkStatusBar: React.FC<{ os?: DeviceOSState; time?: string; batteryPercentage?: number }> = ({
    os,
    time = "9:41",
    batteryPercentage = 100
}) => (
    <StatusBar os={os} time={time} theme="dark" batteryPercentage={batteryPercentage} />
);

/**
 * iOS Status Bar specifically styled for light backgrounds
 */
export const LightStatusBar: React.FC<{ os?: DeviceOSState; time?: string; batteryPercentage?: number }> = ({
    os,
    time = "9:41",
    batteryPercentage = 100
}) => (
    <StatusBar os={os} time={time} theme="light" batteryPercentage={batteryPercentage} />
);
