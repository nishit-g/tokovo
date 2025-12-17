/**
 * Android WhatsApp Typing Indicator Component
 * 
 * Material Design inspired typing indicator with Android-specific styling.
 */

import React from "react";

export interface TypingIndicatorProps {
    isTyping: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
    isTyping,
}) => {
    if (!isTyping) return null;

    return (
        <div style={{
            display: "flex",
            justifyContent: "flex-start",
            padding: "4px 8px",
        }}>
            <div style={{
                backgroundColor: "#202C33",
                borderRadius: 8,
                borderTopLeftRadius: 0,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 4,
            }}>
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#8696A0",
                            animation: `typing ${0.6}s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default TypingIndicator;
