import React from "react";
import { DeviceProfile, iPhone16Frame, PixelFrame, StatusBar } from "@tokovo/devices";
import { iPhone16Profile, PixelProfile } from "@tokovo/devices"; // Import profiles to look them up

export const DeviceFrame: React.FC<{ profileId: string; isLocked?: boolean; notifications?: any[]; children: React.ReactNode; variant?: "ios" | "android" }> = ({ profileId, isLocked, notifications, children, variant }) => {
    // Strategy pattern: Select frame component based on profile ID
    const FrameComponent = profileId === "iphone16" ? iPhone16Frame :
        profileId === "pixel" ? PixelFrame : React.Fragment;

    // Determine props to pass to the FrameComponent
    const frameProps = {};
    if (profileId === "iphone16" || profileId === "pixel") {
        if (variant) {
            Object.assign(frameProps, { variant });
        }
    }

    return (
        <FrameComponent {...frameProps} statusBar={<StatusBar time="10:41" variant={variant} />}>
            {children}
            {isLocked && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.8)", // Dimmed lock screen
                    backdropFilter: "blur(20px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 300,
                    color: "white",
                    zIndex: 2000
                }}>
                    <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 60 }}>Locked</div>

                    {/* Notifications are now handled by NotificationOverlay via layout system */}
                    <div style={{ width: "90%", display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Placeholder for future lock screen widgets if needed */}
                    </div>
                </div>
            )}
        </FrameComponent>
    );
};
