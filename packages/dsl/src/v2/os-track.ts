/**
 * OS Track Builder - Device state control
 * 
 * @description Controls device-level state like time, battery,
 * network, notifications, DND mode.
 * 
 * @see docs-v2/DSL_REVAMP.md#os-track
 */

import { OSTrackEvent } from "@tokovo/ir";
import { parseTimeToFrames } from "./utils/time";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export interface OSStateOptions {
    time?: Date | number;
    battery?: number;
    charging?: boolean;
    network?: "wifi" | "5G" | "4G" | "3G" | "none";
    strength?: number;
    dnd?: boolean;
    lowPowerMode?: boolean;
}

export interface BatteryOptions {
    charging?: boolean;
}

export interface NetworkOptions {
    strength?: number;
}

export interface NotificationOptions {
    appId: string;
    title: string;
    body: string;
    icon?: string;
    mode?: "headsup" | "lockscreen" | "both";
}

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class OSPointBuilder {
    constructor(
        private _frame: number,
        private _fps: number,
        private _events: OSTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Set full OS state.
     */
    set(options: OSStateOptions): void {
        const time = options.time instanceof Date
            ? options.time.getTime()
            : options.time;

        this._events.push({
            at: this._frame,
            kind: "OS",
            type: "SET_STATE",
            payload: {
                time,
                battery: options.battery,
                charging: options.charging,
                network: options.network,
                strength: options.strength,
                dnd: options.dnd,
                lowPowerMode: options.lowPowerMode,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Set device time.
     */
    time(date: Date | number): void {
        const time = date instanceof Date ? date.getTime() : date;
        this._events.push({
            at: this._frame,
            kind: "OS",
            type: "SET_TIME",
            payload: { time },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Set battery level.
     */
    battery(level: number, options: BatteryOptions = {}): void {
        this._events.push({
            at: this._frame,
            kind: "OS",
            type: "SET_BATTERY",
            payload: {
                level,
                charging: options.charging,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Set network status.
     */
    network(type: "wifi" | "5G" | "4G" | "3G" | "none", options: NetworkOptions = {}): void {
        this._events.push({
            at: this._frame,
            kind: "OS",
            type: "SET_NETWORK",
            payload: {
                type,
                strength: options.strength,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Set Do Not Disturb mode.
     */
    dnd(enabled: boolean): void {
        this._events.push({
            at: this._frame,
            kind: "OS",
            type: "SET_DND",
            payload: { enabled },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Show a notification.
     */
    notification(options: NotificationOptions): void {
        const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        this._events.push({
            at: this._frame,
            kind: "OS",
            type: "NOTIFICATION_SHOW",
            payload: {
                id,
                appId: options.appId,
                title: options.title,
                body: options.body,
                icon: options.icon,
                mode: options.mode,
            },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Dismiss a notification.
     */
    dismissNotification(id: string): void {
        this._events.push({
            at: this._frame,
            kind: "OS",
            type: "NOTIFICATION_DISMISS",
            payload: { id },
            _declarationOrder: this._getOrder(),
        });
    }

    /**
     * Dismiss all notifications.
     */
    dismissAllNotifications(): void {
        this._events.push({
            at: this._frame,
            kind: "OS",
            type: "NOTIFICATION_DISMISS_ALL",
            payload: {},
            _declarationOrder: this._getOrder(),
        });
    }
}

// =============================================================================
// OS TRACK BUILDER
// =============================================================================

export class OSTrackBuilder {
    _events: OSTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Create a point (instant) operation at a specific time.
     */
    at(time: string | number): OSPointBuilder {
        const frame = parseTimeToFrames(time, this._fps);
        return new OSPointBuilder(frame, this._fps, this._events, this._getOrder);
    }
}
