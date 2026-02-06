
import React from "react";
import { PixelProfile } from "./profile.js";

export const PixelFrame: React.FC<{ children: React.ReactNode; statusBar?: React.ReactNode }> = ({ children, statusBar }) => {
    const { width, height } = PixelProfile.dimensions;

    return (
        <div style={{
            width,
            height,
            backgroundColor: "black",
            borderRadius: 60, // Less rounded than iPhone
            boxShadow: "0 0 0 15px #3a3a3a, 0 0 0 18px #000", // Thinner borders
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        }}>
            {/* Status Bar Area */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 100,
                zIndex: 1000,
                pointerEvents: "none",
                padding: "30px 40px 0 40px"
            }}>
                {statusBar}
            </div>

            {/* Camera Hole Punch */}
            <div style={{
                position: "absolute",
                top: 36, // 12 * 3
                left: "50%",
                transform: "translateX(-50%)",
                width: 36, // 12 * 3
                height: 36, // 12 * 3
                backgroundColor: "black",
                borderRadius: "50%",
                zIndex: 1001
            }} />

            {/* Screen Content */}
            <div style={{
                flex: 1,
                backgroundColor: "#121212", // Dark mode default for Android
                display: "flex",
                flexDirection: "column",
                position: "relative",
                color: "white",
                // Strict clipping
                overflow: "hidden",
                borderRadius: 60, // Match outer
                clipPath: "inset(0px round 60px)",
                transform: "translateZ(0)",
                willChange: "transform",
            }}>

                {children}
            </div>
        </div>
    );
};
