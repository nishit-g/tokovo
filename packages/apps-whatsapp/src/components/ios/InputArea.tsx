import React from "react";
import { getTheme } from "./theme";
import { PlusCircleIcon, CameraFillIcon, MicrophoneFillIcon } from "./Icons";

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
        <div style={{
            backgroundColor: "#F6F6F6", // Or #FFFFFF depending on exact version
            borderTop: "1px solid rgba(0,0,0,0.1)",
            padding: `10px 16px ${paddingBottom}px 16px`,
            display: "flex",
            alignItems: "center",
            gap: 12, // Standard gap
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backdropFilter: "blur(20px)", // Glassmorphism
        }}>
            {/* Plus Button */}
            <div style={{ paddingBottom: 6 }}>
                <PlusCircleIcon color={theme.colors.primary} />
            </div>

            {/* Input Field */}
            <div style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 20, // Rounded pill
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "8px 12px",
                minHeight: 36,
                display: "flex",
                alignItems: "center"
            }}>
                <span style={{
                    fontSize: 16,
                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                    color: "#000",
                    lineHeight: "20px"
                }}>
                    {text}
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
                {!hasContent && (
                    <span style={{
                        fontSize: 16,
                        color: "#C7C7CC",
                        position: "absolute",
                        pointerEvents: "none"
                    }}>
                        Message
                    </span>
                )}
            </div>

            {/* Right Icons: Camera if empty, Mic if typing (or both in some versions) */}
            {hasContent ? (
                // Send button implies Mic usually transforms or just send icon
                <div style={{ paddingBottom: 6 }}>
                    {/* Using Mic for now as visual placeholder, strictly speaking it changes to Send */}
                    <MicrophoneFillIcon color={theme.colors.primary} />
                </div>
            ) : (
                <div style={{ display: "flex", gap: 16, paddingBottom: 6 }}>
                    <CameraFillIcon color={theme.colors.primary} />
                    <MicrophoneFillIcon color={theme.colors.primary} />
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
