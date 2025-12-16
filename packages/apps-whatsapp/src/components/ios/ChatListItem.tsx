import React from "react";
import { DoubleCheckIcon } from "./Icons";
import { UI_CONSTANTS } from "../../config/layout-config";

interface ChatListItemProps {
    id: string;
    name: string;
    avatarUrl?: string;
    lastMessage?: string;
    timestamp?: string;
    unreadCount?: number;
    status?: "sent" | "delivered" | "read";
    isGroup?: boolean; // For future group icon support
    isTyping?: boolean; // For "Typing..." state
    isLast?: boolean; // To hide separator on last item
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
    name,
    avatarUrl,
    lastMessage,
    timestamp,
    unreadCount = 0,
    status,
    isTyping,
    isLast
}) => {
    return (
        <div style={{
            display: "flex",
            backgroundColor: "white",
            cursor: "pointer",
            height: 76,
            alignItems: "center",
        }}>
            {/* Avatar (Left, Fixed) */}
            <div style={{
                width: 76,
                height: 76,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}>
                <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "#E0E0E0",
                    overflow: "hidden",
                }}>
                    {avatarUrl ? (
                        <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ccc", color: "white", fontSize: 24 }}>
                            {name.charAt(0)}
                        </div>
                    )}
                </div>
            </div>

            {/* Content (Right, with Separator) */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                paddingRight: 16, // Right Margin
                borderBottom: isLast ? "none" : "0.5px solid #C6C6C8", // Separator
                minWidth: 0
            }}>
                {/* Top Row: Name and Time */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, alignItems: "baseline" }}>
                    <div style={{
                        fontWeight: "600",
                        fontSize: 17,
                        color: "#000",
                        letterSpacing: "-0.24px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginRight: 8
                    }}>
                        {name}
                    </div>
                    <div style={{
                        fontSize: 14,
                        color: unreadCount > 0 ? "#007AFF" : "#8E8E93",
                        flexShrink: 0
                    }}>
                        {timestamp}
                    </div>
                </div>

                {/* Bottom Row: Message and Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{
                        fontSize: 15,
                        color: "#8E8E93",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        maxWidth: "90%",
                        letterSpacing: "-0.24px"
                    }}>
                        {isTyping ? (
                            <span style={{ color: "#007AFF" }}>typing...</span>
                        ) : (
                            <>
                                {status && !unreadCount && (
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        <DoubleCheckIcon read={status === "read"} size={16} />
                                    </span>
                                )}
                                <span>{lastMessage}</span>
                            </>
                        )}
                    </div>

                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <div style={{
                            backgroundColor: "#007AFF",
                            color: "white",
                            borderRadius: "50%",
                            minWidth: 20,
                            height: 20,
                            padding: "0 5px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: "600",
                            lineHeight: 1
                        }}>
                            {unreadCount}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
