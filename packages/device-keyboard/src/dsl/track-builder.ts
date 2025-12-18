/**
 * Keyboard Track Builder
 * 
 * DSL for authoring keyboard interactions in episodes.
 * 
 * @example
 * ```typescript
 * episode("demo", { fps: 30, duration: "30s" })
 *     .track("keyboard",
 *         () => new KeyboardTrackBuilder(30, "phone", getOrder),
 *         kb => {
 *             kb.at("4s").show();
 *             kb.span("5s", "10s").type("Hello world!", { speed: "normal" });
 *             kb.at("12s").hide();
 *         }
 *     )
 * ```
 */

import type { KeyboardLayout } from "../types/layouts";
import type { KeyboardPayloads } from "../ir/payloads";
import type { SpeedPreset } from "../config/speeds";

// =============================================================================
// TRACK BUILDER
// =============================================================================

export class KeyboardTrackBuilder {
    private fps: number;
    private deviceId: string;
    private getOrder: () => number;
    private events: KeyboardTrackEvent[] = [];

    // Timing state
    private currentFrame: number = 0;
    private spanEnd: number | null = null;

    constructor(fps: number, deviceId: string, getOrder: () => number) {
        this.fps = fps;
        this.deviceId = deviceId;
        this.getOrder = getOrder;
    }

    // =========================================================================
    // TIMING METHODS
    // =========================================================================

    /**
     * Set current time for next event.
     * @param time - Time string (e.g., "5s") or frame number
     */
    at(time: string | number): this {
        this.currentFrame = this.parseTime(time);
        this.spanEnd = null;
        return this;
    }

    /**
     * Set a time span for events that have duration.
     * @param start - Start time
     * @param end - End time
     */
    span(start: string | number, end: string | number): this {
        this.currentFrame = this.parseTime(start);
        this.spanEnd = this.parseTime(end);
        return this;
    }

    // =========================================================================
    // VISIBILITY
    // =========================================================================

    /**
     * Show keyboard with optional layout.
     */
    show(opts?: { layout?: KeyboardLayout; animated?: boolean }): this {
        this.emit("SHOW", {
            layout: opts?.layout ?? "qwerty",
            animated: opts?.animated ?? true,
        });
        return this;
    }

    /**
     * Hide keyboard.
     */
    hide(opts?: { animated?: boolean }): this {
        this.emit("HIDE", {
            animated: opts?.animated ?? true,
        });
        return this;
    }

    // =========================================================================
    // TYPING
    // =========================================================================

    /**
     * Type text with speed control.
     * 
     * @param text - Text to type
     * @param opts - Typing options
     *   - speed: chars per minute or preset ("fast", "normal", "slow")
     *   - variation: add random delay variance (±20%)
     *   - mistakes: simulate typos
     */
    type(text: string, opts?: {
        speed?: number | SpeedPreset;
        variation?: boolean;
        mistakes?: boolean;
        autocorrect?: boolean;
    }): this {
        this.emit("TYPE", {
            text,
            speed: opts?.speed ?? "normal",
            variation: opts?.variation ?? true,
            mistakes: opts?.mistakes ?? false,
            autocorrect: opts?.autocorrect ?? true,
        });
        return this;
    }

    /**
     * Simulate a key press (keyDown + keyUp).
     */
    press(key: string): this {
        this.emit("KEY_DOWN", { key });
        // KEY_UP will be emitted by lowering after 3 frames
        return this;
    }

    /**
     * Key down event.
     */
    keyDown(key: string): this {
        this.emit("KEY_DOWN", { key });
        return this;
    }

    /**
     * Key up event.
     */
    keyUp(key: string): this {
        this.emit("KEY_UP", { key });
        return this;
    }

    /**
     * Delete characters (backspace).
     * @param count - Number of characters to delete
     */
    backspace(count: number = 1): this {
        this.emit("BACKSPACE", { count });
        return this;
    }

    // =========================================================================
    // LAYOUT
    // =========================================================================

    /**
     * Switch keyboard layout.
     */
    switchLayout(layout: KeyboardLayout): this {
        this.emit("SWITCH_LAYOUT", { layout });
        return this;
    }

    // =========================================================================
    // INPUT
    // =========================================================================

    /**
     * Clear all input text.
     */
    clear(): this {
        this.emit("CLEAR", {});
        return this;
    }

    /**
     * Set input text directly (without typing animation).
     */
    setText(text: string): this {
        this.emit("SET_TEXT", { text });
        return this;
    }

    /**
     * Move cursor to position.
     */
    moveCursor(position: number): this {
        this.emit("CURSOR_MOVE", { position });
        return this;
    }

    /**
     * Select text range.
     */
    selectRange(start: number, end: number): this {
        this.emit("SELECT_RANGE", { start, end });
        return this;
    }

    // =========================================================================
    // AUTOCOMPLETE
    // =========================================================================

    /**
     * Accept autocomplete suggestion.
     * @param index - Suggestion index (0, 1, or 2)
     */
    acceptSuggestion(index: 0 | 1 | 2): this {
        this.emit("ACCEPT_SUGGESTION", { index });
        return this;
    }

    // =========================================================================
    // CLIPBOARD
    // =========================================================================

    /**
     * Paste text from clipboard.
     */
    paste(text: string): this {
        this.emit("PASTE", { text });
        return this;
    }

    // =========================================================================
    // BUILD
    // =========================================================================

    /**
     * Get all generated events.
     */
    build(): KeyboardTrackEvent[] {
        return this.events;
    }

    // =========================================================================
    // INTERNAL
    // =========================================================================

    private emit<T extends keyof KeyboardPayloads>(
        type: T,
        payload: KeyboardPayloads[T]
    ): void {
        const event: KeyboardTrackEvent = {
            kind: "OS",
            target: "keyboard",
            type,
            payload,
            at: this.currentFrame,
            deviceId: this.deviceId,
            order: this.getOrder(),
            // Duration for span-based events
            ...(this.spanEnd !== null && {
                duration: this.spanEnd - this.currentFrame,
            }),
        } as KeyboardTrackEvent;

        this.events.push(event);
    }

    private parseTime(time: string | number): number {
        if (typeof time === "number") return time;

        // Parse time string (e.g., "5s", "2.5s", "1m30s")
        const match = time.match(/^(\d+(?:\.\d+)?)(ms|s|m)?$/);
        if (!match) {
            throw new Error(`Invalid time format: ${time}`);
        }

        const value = parseFloat(match[1]);
        const unit = match[2] || "s";

        switch (unit) {
            case "ms":
                return Math.round((value / 1000) * this.fps);
            case "s":
                return Math.round(value * this.fps);
            case "m":
                return Math.round(value * 60 * this.fps);
            default:
                return Math.round(value * this.fps);
        }
    }
}

// =============================================================================
// TYPES
// =============================================================================

interface KeyboardTrackEvent {
    kind: "OS";
    target: "keyboard";
    type: keyof KeyboardPayloads;
    payload: KeyboardPayloads[keyof KeyboardPayloads];
    at: number;
    deviceId: string;
    order: number;
    duration?: number;
}
