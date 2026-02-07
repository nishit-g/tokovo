import type { PluginReducer, RuntimeEvent, WorldState } from "@tokovo/core";
import { createTypewriterInitialState, type TypewriterState } from "./state.js";
import { TYPEWRITER_APP_ID } from "../constants.js";
import { deriveKeyPressFromChar } from "../keyboard/index.js";
import { TYPEWRITER_THEME_PRESETS, deepMerge } from "../theme/index.js";
import type { TypewriterThemeConfig, TypewriterThemeTokens } from "../theme/types.js";

function getAppState(draft: WorldState): TypewriterState {
  if (!draft.appState) draft.appState = {};
  if (!draft.appState[TYPEWRITER_APP_ID]) {
    draft.appState[TYPEWRITER_APP_ID] = createTypewriterInitialState();
  }
  return draft.appState[TYPEWRITER_APP_ID] as TypewriterState;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function prunePressedKeys(map: Record<string, number>, now: number): void {
  const cutoff = now - 18;
  for (const [k, v] of Object.entries(map)) {
    if (v < cutoff) {
      delete map[k];
    }
  }
}

function registerKeyPresses(state: TypewriterState, ch: string, at: number): void {
  prunePressedKeys(state.fx.pressedKeys, at);
  const press = deriveKeyPressFromChar(ch);
  for (const k of press.keys) {
    state.fx.pressedKeys[k] = at;
  }
  state.fx.lastKeyFrame = at;
  state.fx.lastCh = ch;
}

function ensurePageCells(state: TypewriterState, pageIndex: number): void {
  const rows = Math.max(1, Math.floor(state.settings.maxRows));
  const cols = Math.max(1, Math.floor(state.settings.maxCols));
  const total = rows * cols;

  while (state.pages.length <= pageIndex) {
    state.pages.push({ index: state.pages.length, cells: new Array(total).fill(null) });
  }

  const page = state.pages[pageIndex];
  if (!page.cells || page.cells.length !== total) {
    page.cells = new Array(total).fill(null);
  }
}

function cellIndex(state: TypewriterState, row: number, col: number): number {
  const cols = Math.max(1, Math.floor(state.settings.maxCols));
  return row * cols + col;
}

function currentPage(state: TypewriterState) {
  ensurePageCells(state, state.cursor.page);
  return state.pages[state.cursor.page]!;
}

function clampCursorToBounds(state: TypewriterState): void {
  const maxRows = Math.max(1, Math.floor(state.settings.maxRows));
  const maxCols = Math.max(1, Math.floor(state.settings.maxCols));
  const page = Math.max(0, Math.floor(state.cursor.page));
  const row = clamp(Math.floor(state.cursor.row), 0, maxRows - 1);
  const col = clamp(Math.floor(state.cursor.col), 0, maxCols - 1);
  state.cursor = { page, row, col };
}

function hardNewline(state: TypewriterState, at: number, fromCol?: number): void {
  const maxRows = Math.max(1, Math.floor(state.settings.maxRows));
  const nextRow = state.cursor.row + 1;
  state.fx.lastCarriageFrame = at;
  state.fx.lastCarriageFromCol = fromCol ?? state.cursor.col;

  if (nextRow >= maxRows) {
    const fromPage = state.cursor.page;
    const toPage = fromPage + 1;
    ensurePageCells(state, toPage);
    state.cursor = { page: toPage, row: 0, col: 0 };
    state.fx.pageFeedAnim = { at, fromPage, toPage };
    return;
  }

  state.cursor = { ...state.cursor, row: nextRow, col: 0 };
}

function deriveSettingsFromThemeConfig(
  theme: TypewriterThemeConfig | undefined,
): Partial<TypewriterState["settings"]> {
  const preset = theme?.preset ?? "classic";
  const base = TYPEWRITER_THEME_PRESETS[preset] ?? TYPEWRITER_THEME_PRESETS.classic;
  const merged = deepMerge(base, (theme?.overrides ?? {}) as any) as TypewriterThemeTokens;
  return {
    maxCols: merged.layout.maxCols,
    maxRows: merged.layout.maxRows,
    wrap: merged.layout.wrap,
    bellColsFromRight: merged.layout.bellColsFromRight,
  };
}

export const typewriterReducer: PluginReducer<typeof TYPEWRITER_APP_ID> = (
  draft: WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: typeof TYPEWRITER_APP_ID },
) => {
  const s = getAppState(draft);
  ensurePageCells(s, s.cursor.page);
  clampCursorToBounds(s);

  switch (event.type) {
    case "TYPEWRITER_INIT_LETTER": {
      const payload = (event.payload ?? {}) as Partial<{
        to: string;
        from: string;
        date: string;
        subject: string;
        reset: boolean;
        seed: number;
        settings: Partial<TypewriterState["settings"]>;
        theme: TypewriterState["theme"];
      }>;
      s.meta = {
        to: payload.to ?? s.meta.to,
        from: payload.from ?? s.meta.from,
        date: payload.date ?? s.meta.date,
        subject: payload.subject ?? s.meta.subject,
      };
      if (typeof payload.seed === "number") {
        s.seed = payload.seed;
      }
      if (payload.theme) {
        s.theme = payload.theme;
      }
      // "Everything via tokens": theme layout drives the typing grid by default.
      const derived = deriveSettingsFromThemeConfig(payload.theme ?? s.theme);
      s.settings = { ...s.settings, ...derived, ...(payload.settings ?? {}) };
      if (payload.reset) {
        s.pages = [];
        ensurePageCells(s, 0);
        s.cursor = { page: 0, row: 0, col: 0 };
        s.fx.pressedKeys = {};
        s.fx.pageFeedAnim = undefined;
      }
      break;
    }

    case "TYPEWRITER_SET_CURSOR": {
      const payload = (event.payload ?? {}) as { page?: number; row?: number; col?: number };
      const maxRows = Math.max(1, Math.floor(s.settings.maxRows));
      const maxCols = Math.max(1, Math.floor(s.settings.maxCols));
      const page = Math.max(0, Math.floor(payload.page ?? s.cursor.page));
      const row = clamp(Math.floor(payload.row ?? s.cursor.row), 0, maxRows - 1);
      const col = clamp(Math.floor(payload.col ?? s.cursor.col), 0, maxCols - 1);
      ensurePageCells(s, page);
      s.cursor = { page, row, col };
      break;
    }

    case "TYPEWRITER_SCROLL": {
      // Kept for compatibility but no-op in paged document mode.
      break;
    }

    case "TYPEWRITER_KEY": {
      const payload = (event.payload ?? {}) as { ch?: string; noAutoWrap?: boolean };
      const ch = typeof payload.ch === "string" ? payload.ch : "";
      const maxRows = Math.max(1, Math.floor(s.settings.maxRows));
      const maxCols = Math.max(1, Math.floor(s.settings.maxCols));
      const row = clamp(Math.floor(s.cursor.row), 0, maxRows - 1);
      const col = clamp(Math.floor(s.cursor.col), 0, maxCols - 1);

      const page = currentPage(s);
      const idx = cellIndex(s, row, col);
      page.cells[idx] = { ch, typedAt: event.at, seed: s.seed ^ idx };

      const nextCol = col + 1;
      if (nextCol >= maxCols) {
        if (payload.noAutoWrap) {
          // TYPE_TEXT lowering already wrapped; don't advance into a double-newline.
          s.cursor = { ...s.cursor, row, col };
        } else if (s.settings.wrap !== "none") {
          hardNewline(s, event.at, col);
        } else {
          s.cursor = { ...s.cursor, row, col };
        }
      } else {
        s.cursor = { ...s.cursor, row, col: nextCol };
      }

      registerKeyPresses(s, ch, event.at);
      break;
    }

    case "TYPEWRITER_NEWLINE": {
      const maxRows = Math.max(1, Math.floor(s.settings.maxRows));
      const maxCols = Math.max(1, Math.floor(s.settings.maxCols));
      const row = clamp(Math.floor(s.cursor.row), 0, maxRows - 1);
      const col = clamp(Math.floor(s.cursor.col), 0, maxCols - 1);

      hardNewline(s, event.at, col);
      registerKeyPresses(s, "\n", event.at);
      break;
    }

    case "TYPEWRITER_BACKSPACE": {
      const maxRows = Math.max(1, Math.floor(s.settings.maxRows));
      const maxCols = Math.max(1, Math.floor(s.settings.maxCols));
      const row = clamp(Math.floor(s.cursor.row), 0, maxRows - 1);
      const col = clamp(Math.floor(s.cursor.col), 0, maxCols - 1);

      // Cinematic edit behavior: move left and clear that cell.
      if (row === 0 && col === 0 && s.cursor.page === 0) {
        registerKeyPresses(s, "Backspace", event.at);
        break;
      }

      let nextPage = s.cursor.page;
      let nextRow = row;
      let nextCol = col - 1;

      if (nextCol < 0) {
        nextRow = row - 1;
        nextCol = maxCols - 1;
        if (nextRow < 0) {
          nextPage = Math.max(0, s.cursor.page - 1);
          nextRow = maxRows - 1;
          nextCol = maxCols - 1;
        }
      }

      ensurePageCells(s, nextPage);
      const page = s.pages[nextPage]!;
      const idx = cellIndex(s, nextRow, nextCol);
      page.cells[idx] = null;
      s.cursor = { page: nextPage, row: nextRow, col: nextCol };

      registerKeyPresses(s, "Backspace", event.at);
      break;
    }
  }
};
