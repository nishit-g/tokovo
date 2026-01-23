/**
 * OS Event Factories
 * 
 * Low-level event creators for device OS state changes.
 * Controls clock, battery, network, DND mode.
 */

import { TimelineEvent, NetworkType } from "@tokovo/core";


/**
 * OS event factories
 */
export const os = {
    /**
     * Set device time (Unix timestamp ms)
     */
    setTime: (at: number, time: number, deviceId?: string): TimelineEvent => ({
        at,
        kind: "OS",
        type: "SET_TIME",
        deviceId,
        time,
    } as TimelineEvent),

    /**
     * Set battery level (0-100)
     */
    setBattery: (at: number, level: number, charging = false, deviceId?: string): TimelineEvent => ({
        at,
        kind: "OS",
        type: "SET_BATTERY",
        deviceId,
        level,
        charging,
    } as TimelineEvent),

    /**
     * Drain battery at rate per second
     */
    drainBattery: (at: number, rate: number, deviceId?: string): TimelineEvent => ({
        at,
        kind: "OS",
        type: "DRAIN_BATTERY",
        deviceId,
        rate,
    } as TimelineEvent),

    /**
     * Set network type and optional strength
     */
    setNetwork: (at: number, network: NetworkType, strength?: number, deviceId?: string): TimelineEvent => ({
        at,
        kind: "OS",
        type: "SET_NETWORK",
        deviceId,
        network,
        strength,
    } as TimelineEvent),

    /**
     * Toggle Do Not Disturb mode
     */
    setDND: (at: number, enabled: boolean, deviceId?: string): TimelineEvent => ({
        at,
        kind: "OS",
        type: "SET_DND",
        deviceId,
        enabled,
    } as TimelineEvent),

    /**
     * Toggle Low Power mode
     */
    setLowPower: (at: number, enabled: boolean, deviceId?: string): TimelineEvent => ({
        at,
        kind: "OS",
        type: "SET_LOW_POWER",
        deviceId,
        enabled,
    } as TimelineEvent),

    /**
     * Toggle Airplane mode (disables network)
     */
    setAirplane: (at: number, enabled: boolean, deviceId?: string): TimelineEvent => ({
        at,
        kind: "OS",
        type: "SET_AIRPLANE",
        deviceId,
        enabled,
    } as TimelineEvent),
};
