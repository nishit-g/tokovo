import React from "react";

export const TypingBubble: React.FC = () => {
    return (
        <div style={{
            padding: "24px 36px",
            marginLeft: 48,
            marginBottom: 12,
            backgroundColor: "#FFFFFF",
            borderRadius: 48,
            borderTopLeftRadius: 12,
            alignSelf: "flex-start",
            width: "fit-content",
            boxShadow: "0 3px 3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 66 // Match line height of text
        }}>
            <Dot delay={0} />
            <Dot delay={0.2} />
            <Dot delay={0.4} />
        </div>
    );
};

const Dot: React.FC<{ delay: number }> = ({ delay }) => (
    <div style={{
        width: 18,
        height: 18,
        backgroundColor: "#B1B1B1",
        borderRadius: "50%",
        animation: `typingBounce 1.4s infinite ease-in-out both`,
        animationDelay: `${delay}s`
    }}>
        <style>{`
            @keyframes typingBounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
        `}</style>
    </div>
);
