import type { TrackEvent } from "@tokovo/ir";
import type { KeyboardLayout } from "../types/layouts";
import type { KeyboardPayloads } from "../ir/payloads";
import type { SpeedPreset } from "../config/speeds";
import type { KeyboardTrackEvent } from "../ir/track-event";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class KeyboardPointBuilder {
    constructor(
        private _frame: number,
        private _deviceId: string,
        private _events: KeyboardTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    private emit<T extends keyof KeyboardPayloads>(
        type: T,
        payload: KeyboardPayloads[T]
    ): void {
        this._events.push({
            kind: "APP",
            appId: "keyboard",
            type,
            payload,
            at: this._frame,
            deviceId: this._deviceId,
            _declarationOrder: this._getOrder(),
        } as KeyboardTrackEvent);
    }

    show(opts?: { layout?: KeyboardLayout; animated?: boolean }): void {
        this.emit("SHOW", {
            layout: opts?.layout ?? "qwerty",
            animated: opts?.animated ?? true,
        });
    }

    hide(opts?: { animated?: boolean }): void {
        this.emit("HIDE", {
            animated: opts?.animated ?? true,
        });
    }

    press(key: string): void {
        this.emit("KEY_DOWN", { key });
    }

    keyDown(key: string): void {
        this.emit("KEY_DOWN", { key });
    }

    keyUp(key: string): void {
        this.emit("KEY_UP", { key });
    }

    backspace(count: number = 1): void {
        this.emit("BACKSPACE", { count });
    }

    switchLayout(layout: KeyboardLayout): void {
        this.emit("SWITCH_LAYOUT", { layout });
    }

    clear(): void {
        this.emit("CLEAR", {});
    }

    setText(text: string): void {
        this.emit("SET_TEXT", { text });
    }

    moveCursor(position: number): void {
        this.emit("CURSOR_MOVE", { position });
    }

    selectRange(start: number, end: number): void {
        this.emit("SELECT_RANGE", { start, end });
    }

    acceptSuggestion(index: 0 | 1 | 2): void {
        this.emit("ACCEPT_SUGGESTION", { index });
    }

    paste(text: string): void {
        this.emit("PASTE", { text });
    }
}

// =============================================================================
// SPAN BUILDER (span)
// =============================================================================

export class KeyboardSpanBuilder {
    constructor(
        private _startFrame: number,
        private _endFrame: number,
        private _deviceId: string,
        private _events: KeyboardTrackEvent[],
        private _getOrder: GetDeclarationOrder
    ) { }

    private emit<T extends keyof KeyboardPayloads>(
        type: T,
        payload: KeyboardPayloads[T]
    ): void {
        this._events.push({
            kind: "APP",
            appId: "keyboard",
            type,
            payload,
            at: this._startFrame,
            duration: this._endFrame - this._startFrame,
            deviceId: this._deviceId,
            _declarationOrder: this._getOrder(),
        } as KeyboardTrackEvent);
    }

    type(text: string, opts?: {
        speed?: number | SpeedPreset;
        variation?: boolean;
        mistakes?: boolean;
        autocorrect?: boolean;
    }): void {
        this.emit("TYPE", {
            text,
            speed: opts?.speed ?? "normal",
            variation: opts?.variation ?? true,
            mistakes: opts?.mistakes ?? false,
            autocorrect: opts?.autocorrect ?? true,
        });
    }
}

// =============================================================================
// TRACK BUILDER
// =============================================================================

export class KeyboardTrackBuilder {
    _events: KeyboardTrackEvent[] = [];

    constructor(
        private _fps: number,
        private _deviceId: string,
        private _getOrder: GetDeclarationOrder
    ) { }

    /**
     * Set current time for next event.
     */
    at(time: string | number): KeyboardPointBuilder {
        const frame = this.parseTime(time);
        return new KeyboardPointBuilder(
            frame,
            this._deviceId,
            this._events,
            this._getOrder
        );
    }

    /**
     * Set a time span for events that have duration.
     */
    span(start: string | number, end: string | number): KeyboardSpanBuilder {
        const startFrame = this.parseTime(start);
        const endFrame = this.parseTime(end);
        return new KeyboardSpanBuilder(
            startFrame,
            endFrame,
            this._deviceId,
            this._events,
            this._getOrder
        );
    }

    private parseTime(time: string | number): number {
        if (typeof time === "number") return Math.round(time);
        const trimmed = time.trim();
        if (trimmed.endsWith("ms")) {
            return Math.round((parseFloat(trimmed.slice(0, -2)) / 1000) * this._fps);
        }
        if (trimmed.endsWith("s")) {
            return Math.round(parseFloat(trimmed.slice(0, -1)) * this._fps);
        }
        return Math.round(parseFloat(trimmed));
    }
}
