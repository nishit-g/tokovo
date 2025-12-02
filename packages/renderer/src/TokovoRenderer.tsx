import React from "react";
import { WorldState } from "@tokovo/core";
import { DeviceProfile } from "@tokovo/devices";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";

export const TokovoRenderer: React.FC<{ world: WorldState; deviceId: string; deviceProfile: DeviceProfile; t?: number }> = ({ world, deviceId, deviceProfile, t = 0 }) => {
    const deviceState = world.devices[deviceId];
    if (!deviceState) {
        return <div style={{ color: "red" }}>Device {deviceId} not found</div>;
    }

    const activeAppId = deviceState.foregroundAppId;
    const AppView = activeAppId ? AppRegistry.getView(activeAppId) : null;

    return (
        <DeviceFrame profile={deviceProfile}>
            {AppView ? <AppView world={world} t={t} /> : <div style={{ backgroundColor: "black", height: "100%" }} />}
        </DeviceFrame>
    );
};
