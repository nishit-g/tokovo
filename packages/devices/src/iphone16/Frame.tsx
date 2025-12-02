import React from "react";

export const iPhone16Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{
            width: 1290,
            height: 2796,
            backgroundColor: "black",
            borderRadius: 160,
            padding: 30, // Bezel
            boxSizing: "border-box",
            position: "relative",
            boxShadow: "0 0 0 10px #333, 0 0 0 20px #111" // Outer frame simulation
        }}>
            {/* Screen Area */}
            <div style={{
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                borderRadius: 130,
                overflow: "hidden",
                position: "relative"
            }}>
                {children}
            </div>

            {/* Dynamic Island / Notch */}
            <div style={{
                position: "absolute",
                top: 60,
                left: "50%",
                transform: "translateX(-50%)",
                width: 370,
                height: 110,
                backgroundColor: "black",
                borderRadius: 60,
                zIndex: 100
            }} />
        </div>
    );
};
