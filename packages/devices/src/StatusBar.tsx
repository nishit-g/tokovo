import React from "react";

/**
 * Authentic iOS Status Bar Component
 * Pixel-perfect SVG icons for signal, WiFi, and battery
 */

// iOS Signal Bars (4 bars, varying heights)
const SignalBarsIcon: React.FC<{ color?: string }> = ({ color = "currentColor" }) => (
    <svg width="51" height="33" viewBox="0 0 17 11" fill={color}>
        <rect x="0" y="8" width="3" height="3" rx="0.5" />
        <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.5" />
        <rect x="9" y="3" width="3" height="8" rx="0.5" />
        <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
    </svg>
);

// iOS WiFi Icon (3 arcs)
const WifiIcon: React.FC<{ color?: string }> = ({ color = "currentColor" }) => (
    <svg width="48" height="36" viewBox="0 0 16 12" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <path d="M1 4C4 1 12 1 15 4" />
        <path d="M3.5 6.5C5.5 4.5 10.5 4.5 12.5 6.5" />
        <path d="M6 9C7 8 9 8 10 9" />
        <circle cx="8" cy="11" r="1" fill={color} stroke="none" />
    </svg>
);

// iOS Battery Icon
const BatteryIcon: React.FC<{ color?: string; percentage?: number }> = ({ color = "currentColor", percentage = 100 }) => (
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
            fill={percentage > 20 ? color : "#FF3B30"}
        />
        {/* Battery cap */}
        <path d="M23 4V8C24 8 25 7 25 6C25 5 24 4 23 4Z" fill={color} opacity="0.4" />
    </svg>
);

interface StatusBarProps {
    time?: string;
    variant?: "ios" | "android";
    theme?: "light" | "dark";
    batteryPercentage?: number;
    notificationIcons?: Array<{ appId: string; count: number; icon?: string }>;
}

// Notification icon component
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

export const StatusBar: React.FC<StatusBarProps> = ({
    time = "9:41",
    variant = "ios",
    theme = "light",
    batteryPercentage = 100,
    notificationIcons = [],
}) => {
    const isAndroid = variant === "android";
    const textColor = theme === "dark" ? "white" : "black";

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
                    <span>{time}</span>
                    {/* Notification icons (Android shows them on left) */}
                    {notificationIcons.slice(0, 5).map((n, i) => (
                        <NotificationIcon key={i} icon={n.icon} count={n.count} />
                    ))}
                    {notificationIcons.length > 5 && (
                        <span style={{ fontSize: 28 }}>•</span>
                    )}
                </div>
                <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                    <SignalBarsIcon color="white" />
                    <WifiIcon color="white" />
                    <BatteryIcon color="white" percentage={batteryPercentage} />
                </div>
            </div>
        );
    }

    // iOS Status Bar
    return (
        <div style={{
            width: "100%",
            height: 132, // 44pt * 3
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
                {time}
            </div>

            {/* Right side - Status icons */}
            <div style={{
                display: "flex",
                gap: 15,
                alignItems: "center",
                marginTop: 6
            }}>
                <SignalBarsIcon color={textColor} />
                <WifiIcon color={textColor} />
                <BatteryIcon color={textColor} percentage={batteryPercentage} />
            </div>
        </div>
    );
};

/**
 * iOS Status Bar specifically styled for dark backgrounds (Instagram, etc.)
 */
export const DarkStatusBar: React.FC<{ time?: string; batteryPercentage?: number }> = ({
    time = "9:41",
    batteryPercentage = 100
}) => (
    <StatusBar time={time} theme="dark" batteryPercentage={batteryPercentage} />
);

/**
 * iOS Status Bar specifically styled for light backgrounds (WhatsApp, etc.)
 */
export const LightStatusBar: React.FC<{ time?: string; batteryPercentage?: number }> = ({
    time = "9:41",
    batteryPercentage = 100
}) => (
    <StatusBar time={time} theme="light" batteryPercentage={batteryPercentage} />
);
