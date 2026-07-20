import {
  countGraphemes,
  replaceGraphemeRange,
} from "./graphemes.js";
import type {
  InputRuntimeState,
  InputSelection,
  PreparedInputOperation,
  PreparedInputSession,
} from "./types.js";

function orderedSelection(selection: InputSelection): [number, number] {
  return selection.anchor <= selection.focus
    ? [selection.anchor, selection.focus]
    : [selection.focus, selection.anchor];
}

function clampSelection(
  selection: InputSelection,
  draft: string,
  locale: string,
): InputSelection {
  const length = countGraphemes(draft, locale);
  return {
    anchor: Math.max(0, Math.min(selection.anchor, length)),
    focus: Math.max(0, Math.min(selection.focus, length)),
  };
}

function replaceSelection(
  state: InputRuntimeState,
  text: string,
  locale: string,
): void {
  const [start, end] = orderedSelection(state.selection);
  state.draft = replaceGraphemeRange(state.draft, start, end, text, locale);
  const next = start + countGraphemes(text, locale);
  state.selection = { anchor: next, focus: next };
}

export function createInputRuntimeState(
  session: PreparedInputSession,
): InputRuntimeState {
  const cursor = countGraphemes(
    session.initialValue,
    session.keyboard.locale.tag,
  );
  return {
    sessionId: session.id,
    deviceId: session.deviceId,
    appInstanceId: session.appInstanceId,
    fieldId: session.fieldId,
    status: "idle",
    focused: false,
    draft: session.initialValue,
    selection: { anchor: cursor, focus: cursor },
    suggestions: [],
    activeSuggestionIndex: null,
    layout: session.keyboard.layout,
  };
}

export function applyPreparedInputOperation(
  state: InputRuntimeState,
  operation: PreparedInputOperation,
  locale: string,
): InputRuntimeState {
  const next: InputRuntimeState = {
    ...state,
    selection: { ...state.selection },
    composition: state.composition
      ? {
          range: { ...state.composition.range },
          text: state.composition.text,
        }
      : undefined,
    suggestions: [...state.suggestions],
    lastOperation: operation,
  };

  switch (operation.type) {
    case "focus":
      next.focused = true;
      next.status = "focused";
      break;

    case "insert":
      replaceSelection(next, operation.text, locale);
      break;

    case "deleteBackward": {
      const [start, end] = orderedSelection(next.selection);
      if (start !== end) {
        next.draft = replaceGraphemeRange(next.draft, start, end, "", locale);
        next.selection = { anchor: start, focus: start };
        break;
      }
      const deleteStart = Math.max(0, start - Math.max(1, operation.count));
      next.draft = replaceGraphemeRange(
        next.draft,
        deleteStart,
        start,
        "",
        locale,
      );
      next.selection = { anchor: deleteStart, focus: deleteStart };
      break;
    }

    case "setSelection":
      next.selection = clampSelection(operation.selection, next.draft, locale);
      break;

    case "moveCursor":
      next.selection = clampSelection(
        { anchor: operation.position, focus: operation.position },
        next.draft,
        locale,
      );
      break;

    case "replaceRange": {
      const range = clampSelection(operation.range, next.draft, locale);
      const [start, end] = orderedSelection(range);
      next.draft = replaceGraphemeRange(
        next.draft,
        start,
        end,
        operation.text,
        locale,
      );
      const cursor = start + countGraphemes(operation.text, locale);
      next.selection = { anchor: cursor, focus: cursor };
      break;
    }

    case "compositionStart":
      next.composition = {
        range: { ...next.selection },
        text: "",
      };
      break;

    case "compositionUpdate":
      next.composition = {
        range: next.composition?.range ?? { ...next.selection },
        text: operation.text,
      };
      break;

    case "compositionCommit": {
      const composition = next.composition;
      if (composition) {
        next.selection = { ...composition.range };
        replaceSelection(next, operation.text ?? composition.text, locale);
        next.composition = undefined;
      } else if (operation.text) {
        replaceSelection(next, operation.text, locale);
      }
      break;
    }

    case "setSuggestions":
      next.suggestions = [...operation.suggestions];
      next.activeSuggestionIndex = null;
      break;

    case "chooseSuggestion":
      if (operation.replaceRange) {
        next.selection = clampSelection(
          operation.replaceRange,
          next.draft,
          locale,
        );
      }
      replaceSelection(next, operation.text, locale);
      next.activeSuggestionIndex = operation.index;
      break;

    case "switchLayout":
      next.layout = operation.layout;
      break;

    case "submit":
      if (next.composition) {
        next.selection = { ...next.composition.range };
        replaceSelection(next, next.composition.text, locale);
        next.composition = undefined;
      }
      next.status = "submitted";
      next.submittedValue = next.draft;
      break;

    case "blur":
      next.focused = false;
      next.status = "blurred";
      next.composition = undefined;
      break;
  }

  return next;
}

export function getInputDisplayDraft(
  state: InputRuntimeState,
  locale: string,
): string {
  if (!state.composition) return state.draft;
  const [start, end] = orderedSelection(state.composition.range);
  return replaceGraphemeRange(
    state.draft,
    start,
    end,
    state.composition.text,
    locale,
  );
}
