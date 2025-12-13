import React from "react";

/**
 * WhatsApp iOS Typing Indicator
 * Three bouncing grey dots in a white bubble that matches the incoming message style
 */
export const TypingBubble: React.FC = () => {
    return (
        <div style={{
            backgroundColor: "#FFFFFF",
            padding: "27px 36px",
            borderRadius: 24,
            borderTopLeftRadius: 6,
            alignSelf: "flex-start",
            width: "fit-content",
            boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
            display: "flex",
            alignItems: "center",
            gap: 15,
            height: 72
        }}>
            <Dot delay={0} />
            <Dot delay={0.15} />
            <Dot delay={0.3} />
            <style>{`
                @keyframes whatsappTyping {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.4;
                    }
                    30% {
                        transform: translateY(-9px);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

const Dot: React.FC<{ delay: number }> = ({ delay }) => (
    <div style={{
        width: 24,
        height: 24,
        backgroundColor: "#8696A0",
        borderRadius: "50%",
        animation: `whatsappTyping 1.2s infinite ease-in-out`,
        animationDelay: `${delay}s`
    }} />
);
