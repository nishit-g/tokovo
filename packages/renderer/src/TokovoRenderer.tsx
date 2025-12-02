import React from "react";
import { WorldState } from "@tokovo/core";
import { DeviceProfile } from "@tokovo/devices";
import { DeviceFrame } from "./DeviceFrame";
import { AppRegistry } from "./registry";
import { computeLayout } from "./LayoutEngine";

export const TokovoRenderer: React.FC<{ world: WorldState; deviceId: string; deviceProfile: DeviceProfile; t: number }> = ({ world, deviceId, deviceProfile, t }) => {
    const deviceState = world.devices[deviceId];
    if (!deviceState) {
        return <div style={{ color: "red" }}>Device {deviceId} not found</div>;
    }

    const activeAppId = deviceState?.foregroundAppId;

    // Compute layout for the current frame
    const layout = computeLayout(world, t);

    let AppView = null;
    if (activeAppId) {
        AppView = AppRegistry.getView(activeAppId);
    }

    return (
        <DeviceFrame profile={deviceProfile} isLocked={deviceState?.isLocked} notifications={deviceState?.notifications}>
            {AppView && <AppView world={world} t={t} layout={layout} />}
        </DeviceFrame>
    );
};
