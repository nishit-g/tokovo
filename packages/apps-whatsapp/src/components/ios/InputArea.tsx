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
                backgroundColor: "#FFFFFF", // Explicit White as requested
                borderTop: "1px solid var(--app-wa-separator)",
                padding: `6px 16px ${paddingBottom}px 10px`, // Tighter vertical padding
                display: "flex",
                alignItems: "flex-end", // Align to bottom for multiline growth
                gap: 12,
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                minHeight: 50
            }}
        >
            {/* Plus Button (Blue SVG) - Bottom aligned */}
            <div style={{ paddingBottom: 8, cursor: "pointer" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 12H19" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* Input Pill */}
            <div
                data-anchor="typing"
                style={{
                    flex: 1,
                    backgroundColor: "#F2F2F7", // System Gray 6
                    borderRadius: 18,
                    border: "1px solid rgba(0,0,0,0.05)",
                    padding: "4px 4px 4px 12px", // Right padding is small to fit sticker
                    minHeight: 34,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 5 // Lift slightly
                }}
            >
                <div style={{ flex: 1, padding: "5px 0" }}>
                    <span style={{
                        fontSize: 16,
                        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                        color: hasContent ? "#000" : "#C7C7CC",
                        lineHeight: "20px",
                        display: "block"
                    }}>
                        {hasContent ? text : ""}
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
                        {!hasContent && !showCursor && "Message"}
                    </span>
                </div>

                {/* Sticker Icon (Right Side inside Input) */}
                <div style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 30,
                    width: 30,
                    marginRight: 2
                }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        {/* Folded corner page/sticker icon */}
                        <path d="M19 19L22 22" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#8E8E93" strokeWidth="1.5" />
                        <path d="M9 10L9.01 10" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" />
                        <path d="M15 10L15.01 10" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            {/* Right Icons: Camera and Mic */}
            {hasContent ? (
                // Send button 
                <div style={{ paddingBottom: 6, cursor: "pointer" }}>
                    <div style={{
                        width: 34,
                        height: 34,
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
                <div style={{ display: "flex", gap: 16, paddingBottom: 8, alignItems: "center" }}>
                    {/* Camera */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {/* Mic */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 1C11.2044 1 10.4413 1.31607 9.87868 1.87868C9.31607 2.44129 9 3.20435 9 4V10C9 10.7956 9.31607 11.5587 9.87868 12.1213C10.4413 12.6839 11.2044 13 12 13C12.7956 13 13.5587 12.6839 14.1213 12.1213C14.6839 11.5587 15 10.7956 15 10V4C15 3.20435 14.6839 2.44129 14.1213 1.87868C13.5587 1.31607 12.7956 1 12 1Z" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12V10" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 19V23" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 23H16" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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
