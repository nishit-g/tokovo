import React from "react";
import { DeviceProfile, iPhone16Frame, StatusBar } from "@tokovo/devices";

export const DeviceFrame: React.FC<{ profile: DeviceProfile; children: React.ReactNode }> = ({ profile, children }) => {
    // Strategy pattern: Select frame component based on profile ID
    // In a full implementation, this might be a registry lookup
    const FrameComponent = profile.id === "iphone16" ? iPhone16Frame : React.Fragment;

    return (
        <FrameComponent>
            <StatusBar time="10:41" />
            {children}
        </FrameComponent>
    );
};
