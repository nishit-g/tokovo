import { parseTimeToFrames } from "@tokovo/dsl";
import type { TypewriterTrackEvent } from "../types/index.js";
import { TYPEWRITER_APP_ID } from "../constants.js";
import type { TypewriterThemeConfig, WrapMode } from "../theme/types.js";
import type { TypewriterSettings } from "../runtime/state.js";
import { TYPEWRITER_THEME_PRESETS, deepMerge } from "../theme/index.js";

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
	    typingBed: boolean;
	    typingBedVol: number;
	    typingBedTailS: number;
	    volVar: number;
	    roomDurationFrames: number;
	    bellColsFromRight: number;
	    durKeyS: number;
	    durSpaceS: number;
    durPunctS: number;
    durBackspaceS: number;
    durCarriageS: number;
    durBellS: number;
    durRoomS: number;
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
    private _defaults?: {
      settings?: Partial<TypewriterSettings>;
      theme?: TypewriterThemeConfig;
      audio?: TypeTextOptions["audio"];
    },
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
    this._push("TYPEWRITER_INIT_LETTER", {
      ...this._defaults,
      ...data,
      settings: { ...(this._defaults?.settings ?? {}), ...(data.settings ?? {}) },
      theme: data.theme ?? this._defaults?.theme,
      audio: { ...(this._defaults?.audio ?? {}), ...(data.audio ?? {}) },
    });
  }

  key(ch: string): void {
    this._push("TYPEWRITER_KEY", { ch, audio: this._defaults?.audio ?? {} });
  }

  newline(): void {
    this._push("TYPEWRITER_NEWLINE", { audio: this._defaults?.audio ?? {} });
  }

  backspace(): void {
    this._push("TYPEWRITER_BACKSPACE", { audio: this._defaults?.audio ?? {} });
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
      wrap: options.wrap ?? this._defaults?.settings?.wrap,
      maxCols: options.maxCols ?? this._defaults?.settings?.maxCols,
      jitter: options.jitter,
      mistakes: options.mistakes,
      allowOverflow: options.allowOverflow,
      pauses: options.pauses,
      audio: { ...(this._defaults?.audio ?? {}), ...(options.audio ?? {}) },
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
    private _defaults?: {
      settings?: Partial<TypewriterSettings>;
      audio?: TypeTextOptions["audio"];
    },
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
      wrap: options.wrap ?? this._defaults?.settings?.wrap,
      maxCols: options.maxCols ?? this._defaults?.settings?.maxCols,
      jitter: options.jitter,
      mistakes: options.mistakes,
      allowOverflow: options.allowOverflow,
      pauses: options.pauses,
      audio: { ...(this._defaults?.audio ?? {}), ...(options.audio ?? {}) },
    });
  }
}

function deriveDefaultAudioFromTheme(
  theme: TypewriterThemeConfig | undefined,
): NonNullable<TypeTextOptions["audio"]> | undefined {
  const preset = theme?.preset ?? "classic";
  const base = TYPEWRITER_THEME_PRESETS[preset] ?? TYPEWRITER_THEME_PRESETS.classic;
  const merged = deepMerge(base, theme?.overrides);
  return {
    ...merged.audio,
    bellColsFromRight: merged.layout.bellColsFromRight,
  };
}

function deriveDefaultSettingsFromTheme(
  theme: TypewriterThemeConfig | undefined,
): Partial<TypewriterSettings> | undefined {
  const preset = theme?.preset ?? "classic";
  const base = TYPEWRITER_THEME_PRESETS[preset] ?? TYPEWRITER_THEME_PRESETS.classic;
  const merged = deepMerge(base, theme?.overrides);
  return {
    maxCols: merged.layout.maxCols,
    maxRows: merged.layout.maxRows,
    wrap: merged.layout.wrap,
    bellColsFromRight: merged.layout.bellColsFromRight,
  };
}

export class TypewriterTrackBuilder {
  _events: TypewriterTrackEvent[] = [];

  private _defaults?: {
    settings?: Partial<TypewriterSettings>;
    theme?: TypewriterThemeConfig;
    audio?: TypeTextOptions["audio"];
  };

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _getOrder: GetDeclarationOrder,
    defaults?: {
      settings?: Partial<TypewriterSettings>;
      theme?: TypewriterThemeConfig;
      audio?: TypeTextOptions["audio"];
    },
  ) {
    const audioFromTheme = deriveDefaultAudioFromTheme(defaults?.theme);
    const settingsFromTheme = deriveDefaultSettingsFromTheme(defaults?.theme);
    this._defaults = {
      settings: { ...(settingsFromTheme ?? {}), ...(defaults?.settings ?? {}) },
      theme: defaults?.theme,
      audio: { ...(audioFromTheme ?? {}), ...(defaults?.audio ?? {}) },
    };
  }

  at(time: string | number): TypewriterPointBuilder {
    const frame = typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new TypewriterPointBuilder(frame, this._deviceId, this._events, this._getOrder, this._defaults);
  }

  span(start: string | number, end: string | number): TypewriterSpanBuilder {
    const startFrame = typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    const endFrame = typeof end === "number" ? end : parseTimeToFrames(end, this._fps);
    const duration = Math.max(0, endFrame - startFrame);
    return new TypewriterSpanBuilder(startFrame, duration, this._deviceId, this._events, this._getOrder, this._defaults);
  }
}
