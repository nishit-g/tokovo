import React from "react";
import { WorldState } from "@tokovo/core";
import { DeviceProfile } from "@tokovo/devices";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";

export const TokovoRenderer: React.FC<{ world: WorldState; deviceProfile: DeviceProfile }> = ({ world, deviceProfile }) => {
    const activeAppId = world.devices[deviceProfile.id]?.foregroundAppId;
    const AppView = activeAppId ? AppRegistry.getView(activeAppId) : null;

    return (
        <DeviceFrame profile={deviceProfile}>
            {AppView ? <AppView world={world} /> : <div style={{ backgroundColor: "black", height: "100%" }} />}
        </DeviceFrame>
    );
};
