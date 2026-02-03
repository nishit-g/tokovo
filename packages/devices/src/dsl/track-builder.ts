/**
 * Device TrackBuilder - DSL for OS-level events
 * 
 * Fluent API for device state changes (lock, unlock, open app, etc.)
 * 
 * @example
 * ```typescript
 * const device = new DeviceTrackBuilder(30, "phone", getOrder);
 * 
 * device.at("2s").lock();
 * device.at("5s").unlock();
 * device.at("10s").openApp("app_whatsapp");
 * device.at("30s").incomingCall({ callerId: "123", callerName: "Mom" });
 * ```
 */

import type { DeviceTrackEvent, DeviceEventType } from "../ir/device-event";

// =============================================================================
// TYPES
// =============================================================================

type GetOrder = () => number;

interface IncomingCallPayload extends Record<string, unknown> {
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideo?: boolean;
}

interface BackgroundAppPayload extends Record<string, unknown> {
    appId: string;
    indicator: "music" | "navigation" | "recording" | "call";
    label?: string;
}

// =============================================================================
// POINT BUILDER
// =============================================================================

export class DevicePointBuilder {
    constructor(
        private _frame: number,
        private _deviceId: string,
        private _events: DeviceTrackEvent[],
        private _getOrder: GetOrder
    ) { }

    private emit(
        type: DeviceEventType,
        payload: Record<string, unknown> = {},
    ): this {
        this._events.push({
            kind: "DEVICE",
            deviceId: this._deviceId,
            type,
            ...payload,
            at: this._frame,
            _declarationOrder: this._getOrder(),
        });
        return this;
    }

    // =========================================================================
    // LOCK / UNLOCK
    // =========================================================================

    /** Lock the device */
    lock(): this {
        return this.emit("LOCK");
    }

    /** Unlock the device */
    unlock(): this {
        return this.emit("UNLOCK");
    }

    // =========================================================================
    // APP MANAGEMENT
    // =========================================================================

    /** Open an app */
    openApp(appId: string): this {
        return this.emit("OPEN_APP", { appId });
    }

    /** Close the current app */
    closeApp(): this {
        return this.emit("CLOSE_APP");
    }

    /** Go to home screen */
    goHome(): this {
        return this.emit("GO_HOME");
    }

    // =========================================================================
    // BADGE
    // =========================================================================

    /** Set app badge count */
    setBadge(appId: string, count: number): this {
        return this.emit("SET_BADGE", { appId, count });
    }

    // =========================================================================
    // OS STATE
    // =========================================================================

    /** Set battery level */
    setBattery(percent: number, charging?: boolean): this {
        return this.emit("SET_BATTERY", { percent, charging });
    }

    /** Set network type and strength */
    setNetwork(type: "wifi" | "5g" | "lte" | "4g" | "3g", strength?: number): this {
        return this.emit("SET_NETWORK", { network: type, strength });
    }

    /** Set Do Not Disturb mode */
    setDND(enabled: boolean): this {
        return this.emit("SET_DND", { dnd: enabled });
    }

    // =========================================================================
    // DYNAMIC ISLAND
    // =========================================================================

    /** Set Dynamic Island state */
    setDynamicIsland(opts: { visible: boolean; mode?: "idle" | "minimal" | "compact" | "expanded" }): this {
        return this.emit("SET_DYNAMIC_ISLAND", opts);
    }

    // =========================================================================
    // CALL
    // =========================================================================

    /** Incoming call */
    incomingCall(opts: IncomingCallPayload): this {
        return this.emit("INCOMING_CALL", opts);
    }

    /** Answer the call */
    answerCall(): this {
        return this.emit("CALL_ANSWERED");
    }

    /** End the call */
    endCall(): this {
        return this.emit("CALL_ENDED");
    }

    // =========================================================================
    // BACKGROUND APPS
    // =========================================================================

    /** Start a background app (music, navigation, etc.) */
    startBackgroundApp(opts: BackgroundAppPayload): this {
        return this.emit("START_BACKGROUND_APP", opts);
    }

    /** Stop a background app */
    stopBackgroundApp(appId: string): this {
        return this.emit("STOP_BACKGROUND_APP", { appId });
    }
}

// =============================================================================
// TRACK BUILDER
// =============================================================================

export class DeviceTrackBuilder {
    _events: DeviceTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _deviceId: string,
        private _getOrder: GetOrder
    ) { }

    /**
     * Navigate to a point in time
     * @param time Time as "2s", "500ms", or frame number
     */
    at(time: string | number): DevicePointBuilder {
        const frame = this.parseTime(time);
        return new DevicePointBuilder(
            frame,
            this._deviceId,
            this._events,
            this._getOrder
        );
    }

    private parseTime(time: string | number): number {
        if (typeof time === "number") return Math.round(time);
        const t = time.trim();
        if (t.endsWith("ms")) return Math.round((parseFloat(t) / 1000) * this._fps);
        if (t.endsWith("s")) return Math.round(parseFloat(t) * this._fps);
        return Math.round(parseFloat(t));
    }
}
