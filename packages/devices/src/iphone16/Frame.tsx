import React from "react";
import { iPhone16Profile } from "./profile";

export const iPhone16Frame: React.FC<{ children: React.ReactNode; statusBar?: React.ReactNode }> = ({ children, statusBar }) => {
    const { width, height } = iPhone16Profile.dimensions;

    return (
        <div style={{
            width,
            height,
            backgroundColor: "black",
            borderRadius: 165, // Scaled radius (55 * 3)
            boxShadow: "0 0 0 30px #3a3a3a, 0 0 0 36px #000", // Scaled borders
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
        }}>
            {/* Dynamic Island Area */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 150, // Enough space for status bar
                zIndex: 1000,
                pointerEvents: "none",
                display: "flex",
                justifyContent: "space-between",
                padding: "40px 60px 0 60px"
            }}>
                {/* Status Bar Content (Time, Battery, etc.) */}
                {statusBar}
            </div>

            {/* Dynamic Island Cutout */}
            <div style={{
                position: "absolute",
                top: 33, // 11 * 3
                left: "50%",
                transform: "translateX(-50%)",
                width: 378, // 126 * 3
                height: 111, // 37 * 3
                backgroundColor: "black",
                borderRadius: 60, // 20 * 3
                zIndex: 1001
            }} />

            {/* Screen Content */}
            <div style={{
                flex: 1,
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                position: "relative"
            }}>
                {children}
            </div>
        </div>
    );
};
