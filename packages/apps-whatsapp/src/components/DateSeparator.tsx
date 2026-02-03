/**
 * DateSeparator Component
 * 
 * Displays date headers in the conversation (Today, Yesterday, etc.)
 * Authentic WhatsApp iOS/Android style.
 */

import React from "react";
import { Platform } from "@tokovo/core";

interface DateSeparatorProps {
    text: string;
    platform?: Platform;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({
    text = "Today",
    platform: _platform,
}) => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px 0",
        }}>
            <div
                className="wa-ios-blur"
                style={{
                    backgroundColor: "var(--wa-bg-header)", // Use header blur bg or specific pill bg
                    padding: "8px 24px",
                    borderRadius: 16,
                    boxShadow: "var(--wa-shadow-sm)",
                }}>
                <span style={{
                    fontSize: 26, // ~9px visual
                    fontWeight: 500,
                    color: "var(--wa-text-secondary)",
                    fontFamily: "var(--wa-ios-font)",
                    letterSpacing: 0.2,
                    textTransform: "uppercase",
                }}>
                    {text}
                </span>
            </div>
        </div>
    );
};

export default DateSeparator;
