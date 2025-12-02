import { produce } from "immer";
import { TimelineEvent, DeviceState } from "@tokovo/core";
import { ReducerRegistry } from "@tokovo/core";

export function deviceReducer(devices: Record<string, DeviceState>, event: TimelineEvent): Record<string, DeviceState> {
    return produce(devices, draft => {
        if (event.kind !== "DEVICE") return;

        const device = draft[event.deviceId];
        if (!device) return; // Or initialize?

        switch (event.type) {
            case "LOCK":
                device.isLocked = true;
                break;
            case "UNLOCK":
                device.isLocked = false;
                break;
            case "OPEN_APP":
                device.foregroundAppId = event.appId;
                break;
            case "CLOSE_APP":
                device.foregroundAppId = undefined;
                break;
        }
    });
}

// Register itself
ReducerRegistry.registerDeviceReducer(deviceReducer);
