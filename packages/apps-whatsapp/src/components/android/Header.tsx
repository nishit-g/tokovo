/**
 * Android WhatsApp Header Component
 * 
 * Material Design 3 inspired WhatsApp Android header.
 * Dark theme with teal accent.
 */

import React from "react";

export interface AndroidHeaderProps {
    contactName: string;
    avatarUrl?: string;
    status?: string;
    safeAreaTop?: number;
    onBack?: () => void;
}

export const Header: React.FC<AndroidHeaderProps> = ({
    contactName,
    avatarUrl,
    status = "online",
    safeAreaTop = 0,
    onBack
}) => {
    return (
        <div style={{
            height: 56 + safeAreaTop,
            paddingTop: safeAreaTop,
            backgroundColor: "#1F2C34",  // Dark teal
            display: "flex",
            alignItems: "center",
            padding: `${safeAreaTop}px 8px 0 8px`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}>
            {/* Back Arrow */}
            <div
                onClick={onBack}
                style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#AEBAC1" />
                </svg>
            </div>

            {/* Avatar */}
            <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: avatarUrl
                    ? `url(${avatarUrl}) center/cover`
                    : "linear-gradient(135deg, #00A884 0%, #128C7E 100%)",
                marginLeft: 4,
                marginRight: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 18,
                fontWeight: 600,
            }}>
                {!avatarUrl && contactName.charAt(0).toUpperCase()}
            </div>

            {/* Name & Status */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <span style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#E9EDEF",
                    fontFamily: "Roboto, sans-serif",
                }}>
                    {contactName}
                </span>
                <span style={{
                    fontSize: 13,
                    color: "#8696A0",
                    fontFamily: "Roboto, sans-serif",
                }}>
                    {status}
                </span>
            </div>

            {/* Action Icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Video Call */}
                <div style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="#AEBAC1" />
                    </svg>
                </div>

                {/* Voice Call */}
                <div style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="#AEBAC1" />
                    </svg>
                </div>

                {/* More */}
                <div style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="5" r="2" fill="#AEBAC1" />
                        <circle cx="12" cy="12" r="2" fill="#AEBAC1" />
                        <circle cx="12" cy="19" r="2" fill="#AEBAC1" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Header;
