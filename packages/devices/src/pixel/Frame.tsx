import React from "react";
import { PixelProfile } from "./profile";

export const PixelFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            flexDirection: "column"
        }}>
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
                zIndex: 1000
            }} />

            {/* Screen Content */}
            <div style={{
                flex: 1,
                backgroundColor: "#121212", // Dark mode default for Android
                display: "flex",
                flexDirection: "column",
                position: "relative",
                color: "white"
            }}>
                {/* Pass variant="android" to StatusBar if it was imported/used here. 
                    Since StatusBar isn't imported in the original file, I assume it's rendered by the Renderer or needs to be added here.
                    However, looking at the architecture, DeviceFrame usually renders the StatusBar. 
                    Let's check packages/renderer/src/DeviceFrame.tsx to see where StatusBar is rendered.
                    Wait, I should probably just update the style here for now and let the renderer handle the status bar prop if it's passed down.
                    But the plan said "Pass variant='android' to StatusBar". 
                    If StatusBar is not in this file, I can't pass it here.
                    Let me check DeviceFrame.tsx first.
                */}
                {children}
            </div>
        </div>
    );
};
