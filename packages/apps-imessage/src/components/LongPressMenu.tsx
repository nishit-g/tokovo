/**
 * Long Press Menu Component - Context menu with tapback picker
 */

import React from "react";
import { useIMessageTheme } from "../ui/ThemeContext";
import { iMessageSpacing } from "../config/tokens";
import type { IMessageTapbackType } from "../types";

interface LongPressMenuProps {
    isVisible: boolean;
    position?: { x: number; y: number };
    onTapback?: (type: IMessageTapbackType) => void;
    onReply?: () => void;
    onCopy?: () => void;
    onForward?: () => void;
    onDelete?: () => void;
}

const TAPBACK_ICONS: Record<IMessageTapbackType, string> = {
    heart: "❤️",
    thumbsUp: "👍",
    thumbsDown: "👎",
    haha: "😂",
    exclamation: "‼️",
    questionMark: "❓",
};

export const LongPressMenu: React.FC<LongPressMenuProps> = ({
    isVisible,
    position,
    onTapback,
    onReply,
    onCopy,
    onForward,
    onDelete,
}) => {
    const theme = useIMessageTheme();

    if (!isVisible) return null;

    const overlayStyle: React.CSSProperties = {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
    };

    const tapbackBarStyle: React.CSSProperties = {
        display: "flex",
        gap: 4,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 30,
        padding: "8px 12px",
        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.3)",
    };

    const tapbackButtonStyle: React.CSSProperties = {
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        cursor: "pointer",
        transition: "transform 0.15s ease, background 0.15s ease",
    };

    const menuStyle: React.CSSProperties = {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 14,
        overflow: "hidden",
        minWidth: 200,
        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.3)",
    };

    const menuItemStyle: React.CSSProperties = {
        padding: "14px 20px",
        fontSize: 17,
        color: "#000000",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
    };

    const menuItemDangerStyle: React.CSSProperties = {
        ...menuItemStyle,
        color: "#FF3B30",
        borderBottom: "none",
    };

    return (
        <div style={overlayStyle}>
            {/* Tapback picker */}
            <div style={tapbackBarStyle}>
                {(Object.entries(TAPBACK_ICONS) as [IMessageTapbackType, string][]).map(([type, icon]) => (
                    <div
                        key={type}
                        style={tapbackButtonStyle}
                        onClick={() => onTapback?.(type)}
                    >
                        {icon}
                    </div>
                ))}
            </div>

            {/* Action menu */}
            <div style={menuStyle}>
                <div style={menuItemStyle} onClick={onReply}>
                    <span>↩️</span> Reply
                </div>
                <div style={menuItemStyle} onClick={onCopy}>
                    <span>📋</span> Copy
                </div>
                <div style={menuItemStyle} onClick={onForward}>
                    <span>↗️</span> Forward
                </div>
                <div style={menuItemDangerStyle} onClick={onDelete}>
                    <span>🗑️</span> Delete
                </div>
            </div>
        </div>
    );
};

export default LongPressMenu;
