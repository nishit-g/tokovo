/**
 * DateSeparator Component
 * 
 * Displays date headers in the conversation (Today, Yesterday, etc.)
 * Authentic WhatsApp iOS/Android style.
 */

import React from "react";
import { Platform } from "@tokovo/core";
import { whatsappColors, typography } from "./theme";

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
                style={{
                    backgroundColor: whatsappColors.surfaceGlass,
                    padding: "6px 18px",
                    borderRadius: 16,
                    border: `0.5px solid ${whatsappColors.separatorLight}`,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                }}>
                <span style={{
                    fontSize: typography.caption.fontSize,
                    fontWeight: 600,
                    color: whatsappColors.textSecondary,
                    fontFamily: "inherit",
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                }}>
                    {text}
                </span>
            </div>
        </div>
    );
};

export default DateSeparator;
