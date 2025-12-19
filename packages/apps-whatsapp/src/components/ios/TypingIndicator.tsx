import React from "react";
import { getTheme } from "./theme";

export const TypingIndicator: React.FC = () => {
    const theme = getTheme("ios");

    // Dot animation style
    const dotStyle = {
        width: 7,
        height: 7,
        borderRadius: "50%",
        backgroundColor: "#B6B6BB", // iOS gray color for dots
        animation: "typingBounce 1.4s infinite ease-in-out both",
        margin: "0 1.5px" // tight spacing
    };

    return (
        <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            padding: "10px 18px", // Matches message bubble padding
            backgroundColor: theme.colors.bubbleOtherBg, // Theme background
            borderRadius: 18,
            borderBottomLeftRadius: 4, // Tail anchor
            width: "fit-content",
            boxShadow: "0 1px 1px rgba(0,0,0,0.05)",
            height: 36,
            marginLeft: 6 // Align with other messages
        }}>

            {/* Dots Container */}
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ ...dotStyle, animationDelay: "0s" }} />
                <div style={{ ...dotStyle, animationDelay: "0.2s" }} />
                <div style={{ ...dotStyle, animationDelay: "0.4s" }} />
            </div>

            {/* CSS Animation Keyframes */}
            <style>{`
                @keyframes typingBounce {
                    0%, 80%, 100% { 
                        transform: scale(0.6); 
                        opacity: 0.4;
                    }
                    40% { 
                        transform: scale(1.0); 
                        opacity: 1;
                    }
                }
            `}</style>
            {/* Tail SVG - Authentic left-side tail */}
            <svg
                width="12" height="20"
                viewBox="0 0 12 20"
                style={{
                    position: "absolute",
                    left: -6,
                    bottom: 0,
                    fill: theme.colors.bubbleOtherBg,
                    transform: "scaleX(-1)", // Flip for left side
                    zIndex: -1
                }}
            >
                <path d="M0 0 C0 0 5 0 8 5 C11 10 9 15 9 15 L0 15 Z" />
            </svg>
        </div>
    );
};
