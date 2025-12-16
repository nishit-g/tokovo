import React from "react";

export const TypingIndicator: React.FC = () => {
    return (
        <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            padding: "12px 14px",
            backgroundColor: "#FFFFFF",
            borderRadius: "18px",
            borderBottomLeftRadius: "4px", // Tail anchor
            width: "fit-content",
            boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
            height: 36,
            minWidth: 64,
            justifyContent: "center",
            gap: 4
        }}>
            {/* Tail */}
            <div style={{
                position: "absolute",
                left: -6,
                bottom: 0,
                width: 12,
                height: 20,
                backgroundColor: "#FFFFFF",
                borderBottomRightRadius: "60%",
                zIndex: -1,
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" // Simple tail approximation
            }} />
            <div style={{
                position: "absolute",
                left: -9,
                bottom: 0,
                width: 10,
                height: 10,
                backgroundColor: "transparent", // Corner cutout
                boxShadow: "5px 5px 0 2px #FFFFFF",
                borderBottomRightRadius: "50%",
                zIndex: -1
            }} />

            <div className="typing-dot" style={{ animationDelay: "0ms" }} />
            <div className="typing-dot" style={{ animationDelay: "150ms" }} />
            <div className="typing-dot" style={{ animationDelay: "300ms" }} />

            <style>{`
    .typing - dot {
    width: 7px;
    height: 7px;
    background - color: #B4B4B4;
    border - radius: 50 %;
    animation: whatsappTyping 1.4s infinite ease -in -out both;
}
@keyframes whatsappTyping {
    0 % { transform: scale(1); opacity: 0.5; }
    50 % { transform: scale(1.15); opacity: 0.9; }
    100 % { transform: scale(1); opacity: 0.5; }
}
`}</style>
        </div>
    );
};
