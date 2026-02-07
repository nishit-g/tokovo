import type { ViewKind } from "@tokovo/core";

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

export interface TypewriterFxState {
  lastKeyFrame?: number;
  lastKey?: string;
  lastCarriageFrame?: number;
}

export interface TypewriterState {
  viewMode: ViewKind;
  meta: TypewriterLetterMeta;
  lines: string[];
  cursor: TypewriterCursor;
  scrollY: number;
  fx: TypewriterFxState;
}

export function createTypewriterInitialState(): TypewriterState {
  return {
    viewMode: "FULLSCREEN",
    meta: {},
    lines: [""],
    cursor: { row: 0, col: 0 },
    scrollY: 0,
    fx: {},
  };
}

