import type { ViewKind } from "@tokovo/core";
import type { TypewriterThemeConfig, WrapMode } from "../theme/types.js";

export interface TypewriterLetterMeta {
  to?: string;
  from?: string;
  date?: string;
  subject?: string;
}

export interface TypewriterCursor {
  page: number;
  row: number;
  col: number;
}

export interface TypewriterGlyph {
  ch: string;
  typedAt: number;
  seed: number;
}

export interface TypewriterPage {
  index: number;
  cells: Array<TypewriterGlyph | null>;
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
  pageFeedAnim?: {
    at: number;
    fromPage: number;
    toPage: number;
  };
}

export interface TypewriterState {
  viewMode: ViewKind;
  meta: TypewriterLetterMeta;
  cursor: TypewriterCursor;
  pages: TypewriterPage[];
  settings: TypewriterSettings;
  seed: number;
  theme: TypewriterThemeConfig;
  fx: TypewriterFxState;
}

export function createTypewriterInitialState(): TypewriterState {
  return {
    viewMode: "FULLSCREEN",
    meta: {},
    pages: [{ index: 0, cells: [] }],
    cursor: { page: 0, row: 0, col: 0 },
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
