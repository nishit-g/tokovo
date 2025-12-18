/**
 * Device IR Event Types
 * 
 * Typed events for device state changes.
 */

// =============================================================================
// EVENT TYPES
// =============================================================================

export type DeviceEventType =
    // Lock/Unlock
    | "LOCK"
    | "UNLOCK"
    // App Management
    | "OPEN_APP"
    | "CLOSE_APP"
    | "GO_HOME"
    // Badge
    | "SET_BADGE"
    // OS State
    | "SET_BATTERY"
    | "SET_NETWORK"
    | "SET_DND"
    // Dynamic Island
    | "SET_DYNAMIC_ISLAND"
    // Call
    | "INCOMING_CALL"
    | "CALL_ANSWERED"
    | "CALL_ENDED"
    // Background Apps
    | "START_BACKGROUND_APP"
    | "STOP_BACKGROUND_APP";

// =============================================================================
// EVENT INTERFACE
// =============================================================================

export interface DeviceTrackEvent {
    kind: "DEVICE";
    deviceId: string;
    type: DeviceEventType;
    at: number;
    _declarationOrder: number;
    [key: string]: any;
}

// =============================================================================
// TYPE GUARD
// =============================================================================

const DEVICE_EVENT_TYPES = new Set<string>([
    "LOCK", "UNLOCK",
    "OPEN_APP", "CLOSE_APP", "GO_HOME",
    "SET_BADGE",
    "SET_BATTERY", "SET_NETWORK", "SET_DND",
    "SET_DYNAMIC_ISLAND",
    "INCOMING_CALL", "CALL_ANSWERED", "CALL_ENDED",
    "START_BACKGROUND_APP", "STOP_BACKGROUND_APP",
]);

export function isDeviceEvent(event: any): event is DeviceTrackEvent {
    return event?.kind === "DEVICE" && DEVICE_EVENT_TYPES.has(event?.type);
}
