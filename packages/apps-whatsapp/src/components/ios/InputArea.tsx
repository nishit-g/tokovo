import React from "react";
import { Plus, Camera, Mic, Send } from "lucide-react";
import { getTheme } from "./theme";

// Logical height for Input Area
// ~48-50px for the input field itself
// Total bar height depending on content, usually ~60-80px + safe area

export const InputArea: React.FC<{
    text?: string;
    showCursor?: boolean;
    safeAreaBottom?: number;
}> = ({ text = "", showCursor = false, safeAreaBottom = 34 }) => {
    const theme = getTheme("ios");

    const hasContent = text.length > 0;

    // Standard iOS bottom padding (home indicator) is 34px
    const paddingBottom = Math.max(safeAreaBottom, 20);

    return (
        <div
            data-anchor="input"
            style={{
                backgroundColor: "#F6F6F6", // Or #FFFFFF depending on exact version
                borderTop: "1px solid var(--app-wa-separator)",
                padding: `10px 16px ${paddingBottom}px 16px`,
                display: "flex",
                alignItems: "center",
                gap: 12, // Standard gap
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backdropFilter: "blur(20px)", // Glassmorphism
            }}
        >
            {/* Plus Button (Blue SVG) */}
            <div style={{ paddingBottom: 6, cursor: "pointer" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 12H19" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* Input Field */}
            <div
                data-anchor="typing"
                style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    border: "1px solid rgba(0,0,0,0.1)", // Subtle border
                    padding: "6px 12px 6px 8px", // Left padding smaller for sticker icon
                    minHeight: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                }}
            >
                {/* Sticker Icon inside Input */}
                <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18.5 18.5L22 22" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#8E8E93" strokeWidth="1.5" />
                        <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M9 10L9.01 10" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" />
                        <path d="M15 10L15.01 10" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <span style={{
                    fontSize: 16,
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                    color: hasContent ? "#000" : "#C7C7CC", // Logic handled here
                    lineHeight: "20px",
                    flex: 1
                }}>
                    {hasContent ? text : "Message"}
                    {showCursor && (
                        <span style={{
                            display: "inline-block",
                            width: 2,
                            height: 18,
                            backgroundColor: theme.colors.primary,
                            marginLeft: 1,
                            verticalAlign: "middle",
                            animation: "blink 1s step-end infinite"
                        }} />
                    )}
                </span>
            </div>

            {/* Right Icons: Camera and Mic */}
            {hasContent ? (
                // Send button 
                <div style={{ paddingBottom: 6, cursor: "pointer" }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        backgroundColor: theme.colors.primary,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Send size={18} color="#FFF" fill="#FFF" style={{ marginLeft: 2 }} />
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", gap: 20, paddingBottom: 6, alignItems: "center" }}>
                    <Camera size={26} color={theme.colors.primary} strokeWidth={1.5} />
                    <Mic size={24} color={theme.colors.primary} strokeWidth={1.5} />
                </div>
            )}

            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};
