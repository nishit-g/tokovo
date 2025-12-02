import React from "react";

export const StatusBar: React.FC<{ time?: string }> = ({ time = "9:41" }) => {
    return (
        <div style={{
            width: "100%",
            height: 60, // Approximate status bar height
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 30px",
            boxSizing: "border-box",
            fontSize: 24,
            fontWeight: "bold",
            color: "black",
            position: "absolute",
            top: 15,
            left: 0,
            zIndex: 20
        }}>
            <div>{time}</div>
            <div style={{ display: "flex", gap: 10 }}>
                {/* Icons placeholders */}
                <span>📶</span>
                <span>Wi-Fi</span>
                <span>🔋</span>
            </div>
        </div>
    );
};
