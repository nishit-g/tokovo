import { parseTimeToFrames } from "@tokovo/dsl";
import type { TypewriterTrackEvent } from "../types/index.js";
import { TYPEWRITER_APP_ID } from "../constants.js";
import type { TypewriterThemeConfig, WrapMode } from "../theme/types.js";
import type { TypewriterSettings } from "../runtime/state.js";

type GetDeclarationOrder = () => number;

export type TypeTextOptions = {
  cps?: number;
  seed?: number;
  wrap?: WrapMode;
  maxCols?: number;
  jitter?: { minFrames?: number; maxFrames?: number };
  mistakes?: { rate?: number; max?: number; alphabet?: string };
  allowOverflow?: boolean;
  pauses?: { afterPunctFrames?: number; afterNewlineFrames?: number; afterSpaceFrames?: number };
  audio?: Partial<{
    baseKeyVol: number;
    baseSpaceVol: number;
    basePunctVol: number;
    baseBackspaceVol: number;
    baseCarriageVol: number;
    baseBellVol: number;
    roomVol: number;
    volVar: number;
    roomDurationFrames: number;
    bellColsFromRight: number;
  }>;
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

  initLetter(
    data: {
      to?: string;
      from?: string;
      date?: string;
      subject?: string;
      reset?: boolean;
      seed?: number;
      settings?: Partial<TypewriterSettings>;
      theme?: TypewriterThemeConfig;
      roomTone?: boolean;
      audio?: TypeTextOptions["audio"];
    } = {},
  ): void {
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

  scroll(deltaLines: number): void {
    this._push("TYPEWRITER_SCROLL", { deltaLines });
  }

  /**
   * Deterministic typed text. Lowering expands to KEY/NEWLINE events.
   */
  typeText(text: string, options: TypeTextOptions = {}): void {
    this._push("TYPEWRITER_TYPE_TEXT", {
      text,
      cps: options.cps,
      seed: options.seed,
      wrap: options.wrap,
      maxCols: options.maxCols,
      jitter: options.jitter,
      mistakes: options.mistakes,
      allowOverflow: options.allowOverflow,
      pauses: options.pauses,
      audio: options.audio,
    });
  }

  // Intentionally no `.pause()`; timelines are authored in absolute time.
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
    this._push("TYPEWRITER_TYPE_TEXT", {
      text,
      cps: options.cps,
      fit: "spread",
      seed: options.seed,
      wrap: options.wrap,
      maxCols: options.maxCols,
      jitter: options.jitter,
      mistakes: options.mistakes,
      allowOverflow: options.allowOverflow,
      pauses: options.pauses,
      audio: options.audio,
    });
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
