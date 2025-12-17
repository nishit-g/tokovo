/**
 * OS Handler - Processes OS events
 * 
 * @description Handles device OS state: time, battery, network, DND.
 */

import type { WorldState } from "../../types";
import type { OSEvent, HandlerContext } from "./types";

// Default OS state
const DEFAULT_OS_STATE = {
    clock: Date.now(),
    battery: 85,
    charging: false,
    network: "wifi" as const,
    wifiStrength: 3,
    cellStrength: 4,
    dnd: false,
    lowPowerMode: false,
    airplaneMode: false,
    notifications: [],
    notificationHistory: [],
};

/**
 * Process OS event and update device OS state
 */
export function processOSEvent(
    draft: WorldState,
    event: OSEvent,
    _ctx: HandlerContext
): void {
    const e = event as any;
    // OS events target a specific device or all devices
    const deviceId = e.deviceId || Object.keys(draft.devices)[0];
    const device = draft.devices[deviceId];
    if (!device) return;

    // Initialize OS state if needed
    if (!device.os) {
        device.os = { ...DEFAULT_OS_STATE };
    }

    switch (event.type) {
        case "SET_TIME":
            device.os.clock = e.time ?? Date.now();
            break;

        case "SET_BATTERY":
            device.os.battery = Math.max(0, Math.min(100, e.level ?? 100));
            if (e.charging !== undefined) {
                device.os.charging = e.charging;
            }
            break;

        case "DRAIN_BATTERY":
            // Rate is % per second at 30fps
            const drain = (e.rate ?? 0) / 30;
            device.os.battery = Math.max(0, device.os.battery - drain);
            break;

        case "SET_NETWORK":
            device.os.network = (e.network ?? "wifi") as any;
            if (e.strength !== undefined) {
                if (e.network === "wifi") {
                    device.os.wifiStrength = e.strength;
                } else {
                    device.os.cellStrength = e.strength;
                }
            }
            break;

        case "SET_DND":
            device.os.dnd = e.enabled ?? false;
            break;

        case "SET_LOW_POWER":
            device.os.lowPowerMode = e.enabled ?? false;
            break;
    }
}
