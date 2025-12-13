/**
 * iOS Status Bar Component
 * 
 * Pixel-perfect iOS 17+ status bar with:
 * - Dynamic Island (iPhone 14 Pro+) or notch
 * - Time, signal, WiFi, battery indicators
 * - Works without Remotion dependency
 */

import React from "react";

// =============================================================================
// STATUS BAR ICONS (Pixel-Perfect iOS 17 Style)
// =============================================================================

interface StatusBarIconsProps {
    signalStrength?: number;  // 0-4 bars
    wifiStrength?: number;    // 0-3 bars
    batteryPercent?: number;  // 0-100
    isCharging?: boolean;
    darkMode?: boolean;
}

// Cellular signal bars
const CellularIcon: React.FC<{ strength?: number; color?: string }> = ({
    strength = 4,
    color = "#000"
}) => (
    <svg width="51" height="36" viewBox="0 0 17 12" fill={color}>
        <rect x="0" y="8" width="3" height="4" rx="0.5" opacity={strength >= 1 ? 1 : 0.3} />
        <rect x="4" y="5" width="3" height="7" rx="0.5" opacity={strength >= 2 ? 1 : 0.3} />
        <rect x="8" y="2" width="3" height="10" rx="0.5" opacity={strength >= 3 ? 1 : 0.3} />
        <rect x="12" y="0" width="3" height="12" rx="0.5" opacity={strength >= 4 ? 1 : 0.3} />
    </svg>
);

// WiFi icon
const WifiIcon: React.FC<{ strength?: number; color?: string }> = ({
    strength = 3,
    color = "#000"
}) => (
    <svg width="48" height="36" viewBox="0 0 16 12" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M8 10.5a1 1 0 100-2 1 1 0 000 2z" fill={color} opacity={strength >= 1 ? 1 : 0.3} />
        <path d="M5.5 8c1.4-1.4 3.6-1.4 5 0" opacity={strength >= 2 ? 1 : 0.3} />
        <path d="M3 5.5c2.8-2.8 7.2-2.8 10 0" opacity={strength >= 3 ? 1 : 0.3} />
    </svg>
);

// Battery icon with percent
const BatteryIcon: React.FC<{
    percent?: number;
    isCharging?: boolean;
    color?: string
}> = ({
    percent = 100,
    isCharging = false,
    color = "#000"
}) => {
        const fillWidth = Math.max(0, Math.min(100, percent)) / 100 * 21;
        const fillColor = percent <= 20 ? "#FF3B30" : (isCharging ? "#30D158" : color);

        return (
            <svg width="75" height="36" viewBox="0 0 25 12" fill="none">
                {/* Battery body */}
                <rect x="0" y="0" width="22" height="12" rx="2.5" stroke={color} strokeWidth="1" />
                {/* Battery fill */}
                <rect x="1" y="1" width={fillWidth} height="10" rx="1.5" fill={fillColor} />
                {/* Battery cap */}
                <rect x="23" y="3.5" width="2" height="5" rx="0.5" fill={color} opacity="0.4" />
                {/* Charging bolt */}
                {isCharging && (
                    <path d="M12 2L9 6h3l-1 4 4-5h-3l1-3z" fill="#fff" />
                )}
            </svg>
        );
    };

// =============================================================================
// iOS STATUS BAR COMPONENT
// =============================================================================

export interface iOSStatusBarProps {
    time?: string;
    signalStrength?: number;
    wifiStrength?: number;
    batteryPercent?: number;
    isCharging?: boolean;
    carrier?: string;
    darkMode?: boolean;
    hasDynamicIsland?: boolean;  // iPhone 14 Pro+ style
}

export const iOSStatusBar: React.FC<iOSStatusBarProps> = ({
    time,
    signalStrength = 4,
    wifiStrength = 3,
    batteryPercent = 85,
    isCharging = false,
    carrier = "",
    darkMode = false,
    hasDynamicIsland = true,
}) => {
    // Default time
    const displayTime = time || "9:41";
    const color = darkMode ? "#FFFFFF" : "#000000";

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 144,  // iOS status bar height at 3x
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 54px",
            zIndex: 1000,
            backgroundColor: "transparent",
        }}>
            {/* Left section - Time (or Dynamic Island placeholder) */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
            }}>
                <span style={{
                    fontSize: 51,
                    fontWeight: 600,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    color,
                    letterSpacing: "-0.5px",
                }}>
                    {displayTime}
                </span>
            </div>

            {/* Center - Dynamic Island (iPhone 14 Pro+) */}
            {hasDynamicIsland && (
                <div style={{
                    width: 360,
                    height: 111,
                    backgroundColor: "#000000",
                    borderRadius: 60,
                    position: "absolute",
                    left: "50%",
                    top: 36,
                    transform: "translateX(-50%)",
                }} />
            )}

            {/* Right section - Icons */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 15,
            }}>
                <CellularIcon strength={signalStrength} color={color} />
                <WifiIcon strength={wifiStrength} color={color} />
                <BatteryIcon
                    percent={batteryPercent}
                    isCharging={isCharging}
                    color={color}
                />
            </div>
        </div>
    );
};

// =============================================================================
// AUTHENTIC WHATSAPP BUBBLE TAIL (SVG)
// =============================================================================

interface BubbleTailProps {
    isMe: boolean;
    color: string;
}

/**
 * Authentic WhatsApp iOS bubble tail
 * The tail is a curved triangle that appears at the top of the first message
 */
export const BubbleTail: React.FC<BubbleTailProps> = ({ isMe, color }) => {
    if (isMe) {
        // Right-side tail (my messages)
        return (
            <svg
                width="24"
                height="30"
                viewBox="0 0 8 10"
                style={{
                    position: "absolute",
                    top: 0,
                    right: -8,
                }}
            >
                <path
                    d="M0 0 C4 0 8 4 8 10 L0 10 Z"
                    fill={color}
                />
            </svg>
        );
    } else {
        // Left-side tail (other's messages)
        return (
            <svg
                width="24"
                height="30"
                viewBox="0 0 8 10"
                style={{
                    position: "absolute",
                    top: 0,
                    left: -8,
                    transform: "scaleX(-1)",
                }}
            >
                <path
                    d="M0 0 C4 0 8 4 8 10 L0 10 Z"
                    fill={color}
                />
            </svg>
        );
    }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default iOSStatusBar;
