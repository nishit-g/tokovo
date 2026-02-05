/**
 * Swipeable Message Wrapper - Swipe gestures for reply, delete, pin
 */

import React, { useState } from "react";
import { useIMessageTheme } from "../ui/ThemeContext";

interface SwipeableMessageProps {
    children: React.ReactNode;
    onSwipeReply?: () => void;
    onSwipeDelete?: () => void;
    messageId: string;
}

export const SwipeableMessage: React.FC<SwipeableMessageProps> = ({
    children,
    onSwipeReply,
    onSwipeDelete,
    messageId,
}) => {
    const theme = useIMessageTheme();
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isReplyHinted, setIsReplyHinted] = useState(false);

    const containerStyle: React.CSSProperties = {
        position: "relative",
        overflow: "hidden",
    };

    const contentStyle: React.CSSProperties = {
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? "transform 0.3s ease" : "none",
    };

    const replyIndicatorStyle: React.CSSProperties = {
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: 36,
        height: 36,
        borderRadius: "50%",
        backgroundColor: theme.colors.bubble.timestamp,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isReplyHinted ? 1 : 0,
        transition: "opacity 0.2s ease",
    };

    // Note: Actual swipe gesture handling would require touch event handlers
    // This is a visual representation for the episode rendering

    return (
        <div style={containerStyle}>
            <div style={replyIndicatorStyle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <path d="M10 9V4L3 11l7 7v-5c5 0 9 1 12 5-1-5-4-10-12-10z" />
                </svg>
            </div>
            <div style={contentStyle}>
                {children}
            </div>
        </div>
    );
};

export default SwipeableMessage;
