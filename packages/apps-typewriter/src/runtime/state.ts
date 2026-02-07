import type { ViewKind } from "@tokovo/core";
import type { TypewriterThemeConfig, WrapMode } from "../theme/types.js";

export interface TypewriterLetterMeta {
  to?: string;
  from?: string;
  date?: string;
  subject?: string;
}

export interface TypewriterCursor {
  row: number;
  col: number;
}

export interface TypewriterSettings {
  maxCols: number;
  maxRows: number;
  wrap: WrapMode;
  bellColsFromRight: number;
}

export interface TypewriterFxState {
  pressedKeys: Record<string, number>;
  lastKeyFrame?: number;
  lastCh?: string;
  lastCarriageFrame?: number;
  lastCarriageFromCol?: number;
  scrollAnim?: {
    at: number;
    fromLines: number;
    toLines: number;
  };
}

export interface TypewriterState {
  viewMode: ViewKind;
  meta: TypewriterLetterMeta;
  lines: string[];
  cursor: TypewriterCursor;
  scrollLines: number;
  settings: TypewriterSettings;
  seed: number;
  theme: TypewriterThemeConfig;
  fx: TypewriterFxState;
}

export function createTypewriterInitialState(): TypewriterState {
  return {
    viewMode: "FULLSCREEN",
    meta: {},
    lines: [""],
    cursor: { row: 0, col: 0 },
    scrollLines: 0,
    settings: {
      maxCols: 44,
      maxRows: 26,
      wrap: "word",
      bellColsFromRight: 5,
    },
    seed: 1337,
    theme: { preset: "classic" },
    fx: { pressedKeys: {} },
  };
}
