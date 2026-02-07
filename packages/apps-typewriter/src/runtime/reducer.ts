import type { PluginReducer, RuntimeEvent, WorldState } from "@tokovo/core";
import { createTypewriterInitialState, type TypewriterState } from "./state.js";
import { TYPEWRITER_APP_ID } from "../constants.js";
import { deriveKeyPressFromChar } from "../keyboard/index.js";

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

function ensureScrollVisible(state: TypewriterState, at: number): void {
  const maxRows = state.settings.maxRows;
  const visibleRow = state.cursor.row - state.scrollLines;
  if (visibleRow < maxRows) return;

  const toLines = state.cursor.row - (maxRows - 1);
  const fromLines = state.scrollLines;
  state.scrollLines = Math.max(state.scrollLines, toLines);
  if (state.scrollLines !== fromLines) {
    state.fx.scrollAnim = { at, fromLines, toLines: state.scrollLines };
  }
}

export const typewriterReducer: PluginReducer<typeof TYPEWRITER_APP_ID> = (
  draft: WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: typeof TYPEWRITER_APP_ID },
) => {
  const s = getAppState(draft);

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
      if (payload.settings) {
        s.settings = { ...s.settings, ...payload.settings };
      }
      if (payload.theme) {
        s.theme = payload.theme;
      }
      if (payload.reset) {
        s.lines = [""];
        s.cursor = { row: 0, col: 0 };
        s.scrollLines = 0;
        s.fx.pressedKeys = {};
        s.fx.scrollAnim = undefined;
      }
      break;
    }

    case "TYPEWRITER_SET_CURSOR": {
      const payload = (event.payload ?? {}) as { row?: number; col?: number };
      const row = clamp(payload.row ?? s.cursor.row, 0, Math.max(0, s.lines.length - 1));
      const line = s.lines[row] ?? "";
      const col = clamp(payload.col ?? s.cursor.col, 0, line.length);
      s.cursor = { row, col };
      ensureScrollVisible(s, event.at);
      break;
    }

    case "TYPEWRITER_SCROLL": {
      const payload = (event.payload ?? {}) as { deltaLines?: number };
      s.scrollLines = Math.max(0, s.scrollLines + (payload.deltaLines ?? 0));
      break;
    }

    case "TYPEWRITER_KEY": {
      const payload = (event.payload ?? {}) as { ch?: string };
      const ch = typeof payload.ch === "string" ? payload.ch : "";
      const row = clamp(s.cursor.row, 0, Math.max(0, s.lines.length - 1));
      const line = s.lines[row] ?? "";
      const col = clamp(s.cursor.col, 0, line.length);
      const next = line.slice(0, col) + ch + line.slice(col);
      const maxCols = s.settings.maxCols;

      // Hard cap + deterministic wrap to keep UI/anchors stable.
      if (next.length <= maxCols) {
        s.lines[row] = next;
        s.cursor = { row, col: col + ch.length };
      } else if (s.settings.wrap !== "none") {
        const head = next.slice(0, maxCols);
        const tail = next.slice(maxCols);
        s.lines[row] = head;
        s.lines.splice(row + 1, 0, tail);
        s.cursor = { row: row + 1, col: tail.length };
        s.fx.lastCarriageFrame = event.at;
        ensureScrollVisible(s, event.at);
      } else {
        s.lines[row] = next.slice(0, maxCols);
        s.cursor = { row, col: Math.min(col + ch.length, maxCols) };
      }

      registerKeyPresses(s, ch, event.at);
      break;
    }

    case "TYPEWRITER_NEWLINE": {
      const row = clamp(s.cursor.row, 0, Math.max(0, s.lines.length - 1));
      const line = s.lines[row] ?? "";
      const col = clamp(s.cursor.col, 0, line.length);

      const before = line.slice(0, col);
      const after = line.slice(col);
      s.lines[row] = before;
      s.lines.splice(row + 1, 0, after);
      s.cursor = { row: row + 1, col: 0 };
      s.fx.lastCarriageFrame = event.at;
      s.fx.lastCarriageFromCol = col;
      registerKeyPresses(s, "\n", event.at);
      ensureScrollVisible(s, event.at);
      break;
    }

    case "TYPEWRITER_BACKSPACE": {
      const row = clamp(s.cursor.row, 0, Math.max(0, s.lines.length - 1));
      const line = s.lines[row] ?? "";
      const col = clamp(s.cursor.col, 0, line.length);

      if (col > 0) {
        s.lines[row] = line.slice(0, col - 1) + line.slice(col);
        s.cursor = { row, col: col - 1 };
      } else if (row > 0) {
        const prev = s.lines[row - 1] ?? "";
        s.lines[row - 1] = prev + line;
        s.lines.splice(row, 1);
        s.cursor = { row: row - 1, col: prev.length };
      }

      registerKeyPresses(s, "Backspace", event.at);
      break;
    }
  }
};
