import { parseTimeToFrames } from "@tokovo/dsl";
import type { TypewriterTrackEvent } from "../types/index.js";
import { TYPEWRITER_APP_ID } from "../constants.js";

type GetDeclarationOrder = () => number;

export type TypeTextOptions = {
  cps?: number;
};

type PayloadInput =
  | Record<string, unknown>
  | ((order: number) => Record<string, unknown>);

class TypewriterPointBuilder {
  constructor(
    private _frame: number,
    private _deviceId: string,
    private _events: TypewriterTrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) {}

  private _push(type: TypewriterTrackEvent["type"], payload: PayloadInput, duration?: number): void {
    const order = this._getOrder();
    const resolvedPayload = typeof payload === "function" ? payload(order) : payload;
    this._events.push({
      at: this._frame,
      duration,
      kind: "APP",
      appId: TYPEWRITER_APP_ID,
      type,
      payload: resolvedPayload,
      deviceId: this._deviceId,
      _declarationOrder: order,
    } as unknown as TypewriterTrackEvent);
  }

  initLetter(data: { to?: string; from?: string; date?: string; subject?: string; reset?: boolean } = {}): void {
    this._push("TYPEWRITER_INIT_LETTER", data);
  }

  key(ch: string): void {
    this._push("TYPEWRITER_KEY", { ch });
  }

  newline(): void {
    this._push("TYPEWRITER_NEWLINE", {});
  }

  backspace(): void {
    this._push("TYPEWRITER_BACKSPACE", {});
  }

  setCursor(row: number, col: number): void {
    this._push("TYPEWRITER_SET_CURSOR", { row, col });
  }

  scroll(deltaY: number): void {
    this._push("TYPEWRITER_SCROLL", { deltaY });
  }

  /**
   * Deterministic typed text. Lowering expands to KEY/NEWLINE events.
   */
  typeText(text: string, options: TypeTextOptions = {}): void {
    this._push("TYPEWRITER_TYPE_TEXT", { text, cps: options.cps });
  }
}

class TypewriterSpanBuilder {
  constructor(
    private _frame: number,
    private _duration: number,
    private _deviceId: string,
    private _events: TypewriterTrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) {}

  private _push(type: TypewriterTrackEvent["type"], payload: PayloadInput): void {
    const order = this._getOrder();
    const resolvedPayload = typeof payload === "function" ? payload(order) : payload;
    this._events.push({
      at: this._frame,
      duration: this._duration,
      kind: "APP",
      appId: TYPEWRITER_APP_ID,
      type,
      payload: resolvedPayload,
      deviceId: this._deviceId,
      _declarationOrder: order,
    } as unknown as TypewriterTrackEvent);
  }

  typeText(text: string, options: TypeTextOptions = {}): void {
    this._push("TYPEWRITER_TYPE_TEXT", { text, cps: options.cps, fit: "spread" });
  }
}

export class TypewriterTrackBuilder {
  _events: TypewriterTrackEvent[] = [];

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _getOrder: GetDeclarationOrder,
  ) {}

  at(time: string | number): TypewriterPointBuilder {
    const frame = typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new TypewriterPointBuilder(frame, this._deviceId, this._events, this._getOrder);
  }

  span(start: string | number, end: string | number): TypewriterSpanBuilder {
    const startFrame = typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    const endFrame = typeof end === "number" ? end : parseTimeToFrames(end, this._fps);
    const duration = Math.max(0, endFrame - startFrame);
    return new TypewriterSpanBuilder(startFrame, duration, this._deviceId, this._events, this._getOrder);
  }
}

