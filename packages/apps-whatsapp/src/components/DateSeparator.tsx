/**
 * DateSeparator Component
 * 
 * Displays date headers in the conversation (Today, Yesterday, etc.)
 * Authentic WhatsApp iOS/Android style.
 */

import React from "react";
import { getAppConfig, Platform } from "@tokovo/core";

interface DateSeparatorProps {
    text: string;
    platform?: Platform;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({
    text = "Today",
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px 0",
        }}>
            <div style={{
                backgroundColor: "rgba(225, 245, 254, 0.92)",
                padding: "8px 24px",
                borderRadius: 16,
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}>
                <span style={{
                    fontSize: 26,
                    fontWeight: 500,
                    color: "#54656F",
                    fontFamily: config.fontFamily || "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
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
