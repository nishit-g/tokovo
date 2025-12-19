/**
 * WhatsApp Header Component
 * 
 * Authentic iOS WhatsApp navigation bar.
 * Design:
 * [Back] [Avatar] [Name/Status] ......... [Video] [Phone]
 */

import React from "react";
import { ChevronLeft, Video, Phone } from "lucide-react";
import { LAYOUT_CONSTANTS, UI_CONSTANTS } from "../config/layout-config";

export interface HeaderProps {
    contactName: string;
    avatarUrl?: string;
    status?: string;
}

export const Header: React.FC<HeaderProps> = ({
    contactName,
    avatarUrl,
    status = "online"
}) => {
    // Icons configuration
    const iconColor = "var(--wa-color-primary)";
    const iconProps = { size: 27, strokeWidth: 1.5, color: iconColor }; // Thin iOS style stroke

    return (
        <div
            // Header Anchor
            data-anchor-id="header"
            style={{
                height: "var(--wa-header-height)",
                backgroundColor: "var(--wa-bg-header)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "center",
                padding: "0 8px 0 8px", // iOS has minimal padding, buttons hug edges
                marginTop: "var(--wa-status-bar-height)", // Spacing for dynamic island/status bar
                borderBottom: "0.5px solid var(--wa-separator)",
                zIndex: 100,
                position: "relative",
                fontFamily: "var(--wa-ios-font)"
            }}
        >
            {/* Left Group: Back + Unread Count */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 70, // Hit target area
                    cursor: "pointer",
                    color: "var(--wa-color-primary)"
                }}
            >
                <ChevronLeft size={33} strokeWidth={2} style={{ marginLeft: -6 }} />
                <span style={{
                    fontSize: 27, // ~17px visual
                    fontWeight: 400,
                    marginLeft: -2,
                    display: "flex",
                    alignItems: "center",
                    paddingBottom: 2 // visual adjustment
                }}>
                    99
                </span>
            </div>

            {/* Center Group: Avatar + Info (Tappable Profile Area) */}
            <div
                data-anchor-id="profile"
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start", // iOS aligns left next to back button
                    marginLeft: 0,
                    cursor: "pointer",
                    overflow: "hidden"
                }}
            >
                {/* Avatar */}
                <div style={{
                    width: UI_CONSTANTS.HEADER_AVATAR_SIZE,
                    height: UI_CONSTANTS.HEADER_AVATAR_SIZE,
                    borderRadius: "50%",
                    background: avatarUrl
                        ? `url(${avatarUrl}) center/cover`
                        : "linear-gradient(135deg, #8E8E93 0%, #B0B0B5 100%)", // Default gray fallback
                    marginRight: UI_CONSTANTS.HEADER_AVATAR_MARGIN_RIGHT,
                    flexShrink: 0,
                    border: "0.5px solid rgba(0,0,0,0.1)" // Subtle border
                }} />

                {/* Name & Status */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    overflow: "hidden"
                }}>
                    <span style={{
                        fontSize: 27, // ~16px visual
                        fontWeight: 600,
                        color: "var(--wa-text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.2
                    }}>
                        {contactName}
                    </span>
                    <span style={{
                        fontSize: 18, // ~12px visual
                        color: "var(--wa-text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.2,
                        marginTop: 1
                    }}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Right Group: Actions */}
            <div style={{
                display: "flex",
                gap: 24, // Wider spacing on iOS
                alignItems: "center",
                paddingRight: 8
            }}>
                <Video {...iconProps} />
                <Phone {...iconProps} size={24} /> {/* Phone icon is visually slightly smaller */}
            </div>
        </div>
    );
};
