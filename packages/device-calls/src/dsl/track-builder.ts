/**
 * Call TrackBuilder - DSL for call events
 * 
 * Fluent API for call state changes.
 * 
 * @example
 * ```typescript
 * const call = new CallTrackBuilder(30, "phone", getOrder);
 * 
 * call.at("2s").incoming({ callerId: "123", callerName: "Mom" });
 * call.at("5s").answer();
 * call.at("30s").toggleMute();
 * call.at("60s").end();
 * ```
 */

import type { CallTrackEvent } from "../ir/call-event";
import type { CallEventType } from "../types";
import type { IncomingCallPayload, AnswerCallPayload, EndCallPayload } from "../types/payloads";

// =============================================================================
// TYPES
// =============================================================================

type GetOrder = () => number;

// =============================================================================
// POINT BUILDER
// =============================================================================

export class CallPointBuilder {
    constructor(
        private _frame: number,
        private _deviceId: string,
        private _events: CallTrackEvent[],
        private _getOrder: GetOrder
    ) { }

    private emit(type: CallEventType, payload: Record<string, any> = {}): this {
        this._events.push({
            kind: "CALL",
            deviceId: this._deviceId,
            type,
            ...payload,
            at: this._frame,
            _declarationOrder: this._getOrder(),
        });
        return this;
    }

    // =========================================================================
    // CALL FLOW
    // =========================================================================

    /**
     * Incoming call
     */
    incoming(opts: IncomingCallPayload): this {
        return this.emit("INCOMING", {
            callerId: opts.callerId,
            callerName: opts.callerName,
            callerAvatar: opts.callerAvatar,
            isVideo: opts.isVideo ?? false,
            callType: opts.callType ?? "voice",
            displayMode: opts.displayMode ?? "fullscreen",
            callerMetadata: opts.callerMetadata,
        });
    }

    /**
     * Answer the call
     */
    answer(opts?: AnswerCallPayload): this {
        return this.emit("ANSWER", opts || {});
    }

    /**
     * Decline the call
     */
    decline(): this {
        return this.emit("DECLINE");
    }

    /**
     * End the call
     */
    end(opts?: EndCallPayload): this {
        return this.emit("END", opts || {});
    }

    // =========================================================================
    // CALL CONTROLS
    // =========================================================================

    /**
     * Toggle mute
     */
    toggleMute(): this {
        return this.emit("TOGGLE_MUTE");
    }

    /**
     * Toggle speaker
     */
    toggleSpeaker(): this {
        return this.emit("TOGGLE_SPEAKER");
    }

    /**
     * Toggle hold
     */
    toggleHold(): this {
        return this.emit("TOGGLE_HOLD");
    }

    // =========================================================================
    // ALIASES
    // =========================================================================

    /** Alias for toggleMute */
    mute(): this { return this.toggleMute(); }

    /** Alias for toggleSpeaker */
    speaker(): this { return this.toggleSpeaker(); }

    /** Alias for toggleHold */
    hold(): this { return this.toggleHold(); }
}

// =============================================================================
// TRACK BUILDER
// =============================================================================

export class CallTrackBuilder {
    _events: CallTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _deviceId: string,
        private _getOrder: GetOrder
    ) { }

    /**
     * Navigate to a point in time
     * @param time Time as "2s", "500ms", or frame number
     */
    at(time: string | number): CallPointBuilder {
        const frame = this.parseTime(time);
        return new CallPointBuilder(
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
