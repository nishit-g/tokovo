import React from "react";
import { DeviceProfile, iPhone16Frame, StatusBar } from "@tokovo/devices";

export const DeviceFrame: React.FC<{ profile: DeviceProfile; isLocked?: boolean; children: React.ReactNode }> = ({ profile, isLocked, children }) => {
    // Strategy pattern: Select frame component based on profile ID
    // In a full implementation, this might be a registry lookup
    const FrameComponent = profile.id === "iphone16" ? iPhone16Frame : React.Fragment;

    return (
        <FrameComponent>
            <StatusBar time="10:41" />
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
                    <div style={{ fontSize: 48, fontWeight: "bold" }}>Locked</div>
                </div>
            )}
        </FrameComponent>
    );
};
