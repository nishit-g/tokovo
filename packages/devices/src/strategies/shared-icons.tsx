/**
 * Shared Icons for StatusBar Strategies
 * 
 * Common icon components and utilities used by iOS and Android strategies.
 */

import React from "react";

// =============================================================================
// SIGNAL BARS
// =============================================================================

export const SignalBarsIcon: React.FC<{ color?: string; strength?: number }> = ({
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

// =============================================================================
// WIFI
// =============================================================================

export const WifiIcon: React.FC<{ color?: string; strength?: number }> = ({
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

// =============================================================================
// BATTERY
// =============================================================================

export const BatteryIcon: React.FC<{ color?: string; percentage?: number; charging?: boolean }> = ({
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

// =============================================================================
// NETWORK TYPE LABEL
// =============================================================================

export const NetworkTypeLabel: React.FC<{ network: string; color: string }> = ({ network, color }) => {
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

// =============================================================================
// DND MOON
// =============================================================================

export const DNDIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill={color}>
        <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.09 20.89 10.65C20.16 12.36 18.46 13.52 16.5 13.52C13.74 13.52 11.5 11.28 11.5 8.52C11.5 6.56 12.66 4.86 14.37 4.13C13.93 4.05 13.47 4 13 4C12.34 4 12 3.66 12 3Z" />
    </svg>
);

// =============================================================================
// UTILITIES
// =============================================================================

/** Format timestamp to HH:MM */
export function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    });
}
