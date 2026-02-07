import type { PluginReducer, RuntimeEvent, WorldState } from "@tokovo/core";
import { createTypewriterInitialState, type TypewriterState } from "./state.js";
import { TYPEWRITER_APP_ID } from "../constants.js";

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
      }>;
      s.meta = {
        to: payload.to ?? s.meta.to,
        from: payload.from ?? s.meta.from,
        date: payload.date ?? s.meta.date,
        subject: payload.subject ?? s.meta.subject,
      };
      if (payload.reset) {
        s.lines = [""];
        s.cursor = { row: 0, col: 0 };
        s.scrollY = 0;
      }
      break;
    }

    case "TYPEWRITER_SET_CURSOR": {
      const payload = (event.payload ?? {}) as { row?: number; col?: number };
      const row = clamp(payload.row ?? s.cursor.row, 0, Math.max(0, s.lines.length - 1));
      const line = s.lines[row] ?? "";
      const col = clamp(payload.col ?? s.cursor.col, 0, line.length);
      s.cursor = { row, col };
      break;
    }

    case "TYPEWRITER_SCROLL": {
      const payload = (event.payload ?? {}) as { deltaY?: number };
      s.scrollY += payload.deltaY ?? 0;
      break;
    }

    case "TYPEWRITER_KEY": {
      const payload = (event.payload ?? {}) as { ch?: string };
      const ch = typeof payload.ch === "string" ? payload.ch : "";
      const row = clamp(s.cursor.row, 0, Math.max(0, s.lines.length - 1));
      const line = s.lines[row] ?? "";
      const col = clamp(s.cursor.col, 0, line.length);
      s.lines[row] = line.slice(0, col) + ch + line.slice(col);
      s.cursor = { row, col: col + ch.length };
      s.fx.lastKeyFrame = event.at;
      s.fx.lastKey = ch;
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

      s.fx.lastKeyFrame = event.at;
      s.fx.lastKey = "Backspace";
      break;
    }
  }
};

