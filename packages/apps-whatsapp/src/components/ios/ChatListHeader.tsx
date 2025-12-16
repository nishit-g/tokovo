import React from "react";
import { CameraFillIcon, NewChatIcon, SearchIcon, FilterIcon } from "./Icons";
import { getTheme } from "./theme";

export const ChatListHeader: React.FC<{
    safeAreaTop?: number;
}> = ({ safeAreaTop = 47 }) => {
    const theme = getTheme("ios");

    return (
        <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.92)", // Translucent
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
            position: "sticky",
            top: 0,
            borderBottom: "0.5px solid rgba(0,0,0,0.15)"
        }}>
            {/* Top Bar: Edit & Actions */}
            <div style={{
                paddingTop: safeAreaTop,
                paddingLeft: 20,
                paddingRight: 20,
                height: 44 + safeAreaTop, // Standard nav bar height + safe area
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxSizing: 'border-box'
            }}>
                {/* Edit Button */}
                <div style={{
                    color: theme.colors.primary,
                    fontSize: 17,
                    fontWeight: "400",
                    cursor: "pointer"
                }}>
                    Edit
                </div>

                {/* Right Actions */}
                <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                    <div style={{ cursor: "pointer" }}>
                        <CameraFillIcon color={theme.colors.primary} />
                    </div>
                    <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.05)", // Subtle background for plus
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                    }}>
                        <NewChatIcon color={theme.colors.primary} />
                    </div>
                </div>
            </div>

            {/* Large Title */}
            <div style={{
                padding: "8px 20px 12px 20px",
                fontSize: 34,
                fontWeight: "bold",
                color: "#000",
                display: "flex",
                alignItems: "center"
            }}>
                Chats
            </div>

            {/* Search Bar */}
            <div style={{ padding: "0 20px 12px 20px" }}>
                <div style={{
                    backgroundColor: "rgba(118, 118, 128, 0.12)",
                    borderRadius: 10,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px"
                }}>
                    <SearchIcon color="#8E8E93" />
                    <input
                        type="text"
                        placeholder="Search"
                        style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 17,
                            marginLeft: 6,
                            color: "#000",
                            outline: "none",
                            width: "100%",
                            flex: 1
                        }}
                    />
                </div>
            </div>

            {/* Filter Tabs (Chips) */}
            <div style={{
                padding: "0 20px 12px 20px",
                display: "flex",
                gap: 8,
            }}>
                {["All", "Unread", "Groups"].map((filter, index) => (
                    <div key={filter} style={{
                        padding: "6px 14px",
                        backgroundColor: index === 0 ? "rgba(118, 118, 128, 0.12)" : "transparent",
                        borderRadius: 16,
                        fontSize: 15,
                        fontWeight: index === 0 ? "600" : "400",
                        color: index === 0 ? "#006ee6" : "#8E8E93", // Active green/blue tint? iOS Whatsapp uses Green for active chip text actually, or default grey bg
                        cursor: "pointer",
                        // WhatsApp style: selected is slightly darker grey bg with green text, unselected is plain text? 
                        // Actually WA iOS: "All", "Unread", "Groups" are chips. Active (All) is usually default. 
                        // Let's stick to a clean look: Selected = Grey BG + Green/Blue Text. Unselected = Grey Text.
                    }}>
                        {filter}
                    </div>
                ))}
            </div>
        </div>
    );
};
