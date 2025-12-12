/**
 * WhatsApp Header Component
 * 
 * Authentic iOS WhatsApp navigation bar with configurable contact info.
 */

import React from "react";
import { Platform, getAppConfig, getTokens } from "@tokovo/core";
import { ChevronLeftIcon, VideoCallIcon, PhoneCallIcon } from "./icons";

export interface HeaderProps {
    contactName: string;
    avatarUrl?: string;
    status?: string;
    platform?: Platform;
}

export const Header: React.FC<HeaderProps> = ({
    contactName,
    avatarUrl,
    status = "online",
    platform = "ios"
}) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    return (
        <div style={{
            height: config.headerHeight,
            backgroundColor: config.headerBg,
            display: "flex",
            alignItems: "center",
            padding: `0 ${config.bubbleMarginHorizontal}px`,
            marginTop: config.statusBarHeight,
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            zIndex: 10,
            fontFamily: tokens.fontFamily
        }}>
            {/* Back button with unread count */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <ChevronLeftIcon />
                <span style={{
                    fontSize: config.headerTitleSize,
                    color: platform === "ios" ? "#007AFF" : "#FFFFFF",
                    fontWeight: "400"
                }}>
                    4
                </span>
            </div>

            {/* Avatar + Name + Status (centered group) */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: -60
            }}>
                {/* Avatar */}
                <div style={{
                    width: config.avatarSize,
                    height: config.avatarSize,
                    borderRadius: "50%",
                    background: avatarUrl
                        ? `url(${avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    marginRight: config.avatarMargin,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: config.avatarSize * 0.4,
                    fontWeight: "600"
                }}>
                    {!avatarUrl && contactName.charAt(0).toUpperCase()}
                </div>

                {/* Name & Status */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <span style={{
                        fontSize: config.headerTitleSize,
                        fontWeight: "600",
                        color: platform === "ios" ? "#000000" : "#FFFFFF",
                        letterSpacing: -0.5
                    }}>
                        {contactName}
                    </span>
                    <span style={{
                        fontSize: config.headerSubtitleSize,
                        color: platform === "ios" ? "#8E8E93" : "rgba(255,255,255,0.7)"
                    }}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Action icons */}
            <div style={{ display: "flex", gap: config.headerIconGap, alignItems: "center" }}>
                <VideoCallIcon />
                <PhoneCallIcon />
            </div>
        </div>
    );
};
