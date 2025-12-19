/**
 * OS Track Builder - Device state control
 *
 * Controls device-level state like time, battery,
 * network, notifications, and DND mode.
 */

import type { OSTrackEvent } from "@tokovo/ir";
import { parseTimeToFrames } from "../../utils/time";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export type NetworkType = "wifi" | "5G" | "4G" | "3G" | "none";

export interface OSStateOptions {
    time?: Date | number;
    battery?: number;
    charging?: boolean;
    network?: NetworkType;
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
    private readonly frame: number;
    private readonly fps: number;
    private readonly events: OSTrackEvent[];
    private readonly getOrder: GetDeclarationOrder;

    constructor(
        frame: number,
        fps: number,
        events: OSTrackEvent[],
        getOrder: GetDeclarationOrder
    ) {
        this.frame = frame;
        this.fps = fps;
        this.events = events;
        this.getOrder = getOrder;
    }

    /**
     * Set full OS state.
     */
    set(options: OSStateOptions): void {
        const time = options.time instanceof Date
            ? options.time.getTime()
            : options.time;

        const event: OSTrackEvent = {
            at: this.frame,
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
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Set device time.
     */
    time(date: Date | number): void {
        const time = date instanceof Date ? date.getTime() : date;
        const event: OSTrackEvent = {
            at: this.frame,
            kind: "OS",
            type: "SET_TIME",
            payload: { time },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Set battery level.
     */
    battery(level: number, options: BatteryOptions = {}): void {
        const event: OSTrackEvent = {
            at: this.frame,
            kind: "OS",
            type: "SET_BATTERY",
            payload: {
                level,
                charging: options.charging,
            },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Set network status.
     */
    network(type: NetworkType, options: NetworkOptions = {}): void {
        const event: OSTrackEvent = {
            at: this.frame,
            kind: "OS",
            type: "SET_NETWORK",
            payload: {
                type,
                strength: options.strength,
            },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Set Do Not Disturb mode.
     */
    dnd(enabled: boolean): void {
        const event: OSTrackEvent = {
            at: this.frame,
            kind: "OS",
            type: "SET_DND",
            payload: { enabled },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Show a notification.
     */
    notification(options: NotificationOptions): void {
        const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const event: OSTrackEvent = {
            at: this.frame,
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
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Dismiss a notification.
     */
    dismissNotification(id: string): void {
        const event: OSTrackEvent = {
            at: this.frame,
            kind: "OS",
            type: "NOTIFICATION_DISMISS",
            payload: { id },
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    /**
     * Dismiss all notifications.
     */
    dismissAllNotifications(): void {
        const event: OSTrackEvent = {
            at: this.frame,
            kind: "OS",
            type: "NOTIFICATION_DISMISS_ALL",
            payload: {},
            _declarationOrder: this.getOrder(),
        };
        this.events.push(event);
    }

    // =========================================================================
    // DEVICE NAVIGATION (Inter-App)
    // =========================================================================

    /**
     * Open an app (switch to foreground).
     * Emits DEVICE:OPEN_APP → sets device.foregroundAppId
     */
    openApp(appId: string): void {
        // DEVICE events are handled by core navigation.ts
        this.events.push({
            at: this.frame,
            kind: "DEVICE" as any,  // Cross-kind event
            type: "OPEN_APP",
            payload: { appId },
            _declarationOrder: this.getOrder(),
        } as any);
    }

    /**
     * Close the current app (return to launcher).
     * Emits DEVICE:CLOSE_APP
     */
    closeApp(): void {
        this.events.push({
            at: this.frame,
            kind: "DEVICE" as any,
            type: "CLOSE_APP",
            payload: {},
            _declarationOrder: this.getOrder(),
        } as any);
    }

    /**
     * Go to home screen.
     * Emits DEVICE:GO_HOME
     */
    goHome(): void {
        this.events.push({
            at: this.frame,
            kind: "DEVICE" as any,
            type: "GO_HOME",
            payload: {},
            _declarationOrder: this.getOrder(),
        } as any);
    }

    /**
     * Lock the device.
     * Emits DEVICE:LOCK
     */
    lock(): void {
        this.events.push({
            at: this.frame,
            kind: "DEVICE" as any,
            type: "LOCK",
            payload: {},
            _declarationOrder: this.getOrder(),
        } as any);
    }

    /**
     * Unlock the device.
     * Emits DEVICE:UNLOCK
     */
    unlock(): void {
        this.events.push({
            at: this.frame,
            kind: "DEVICE" as any,
            type: "UNLOCK",
            payload: {},
            _declarationOrder: this.getOrder(),
        } as any);
    }
}

// =============================================================================
// OS TRACK BUILDER
// =============================================================================

export class OSTrackBuilder {
    readonly _events: OSTrackEvent[] = [];
    private readonly fps: number;
    private readonly getOrder: GetDeclarationOrder;

    constructor(fps: number, getOrder: GetDeclarationOrder) {
        this.fps = fps;
        this.getOrder = getOrder;
    }

    /**
     * Create a point (instant) operation at a specific time.
     */
    at(time: string | number): OSPointBuilder {
        const frame = parseTimeToFrames(time, this.fps);
        return new OSPointBuilder(frame, this.fps, this._events, this.getOrder);
    }
}
