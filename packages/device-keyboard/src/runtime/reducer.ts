import { produce } from "immer";
import type { KeyboardState, KeyPressState } from "./state.js";
import { createKeyboardInitialState } from "./state.js";

interface KeyboardShowPayload {
  keyboardType?: KeyboardState["keyboardType"];
  returnKeyType?: KeyboardState["returnKeyType"];
}

interface KeyboardKeyPressPayload {
  key: string;
  duration?: number;
}

interface KeyboardTypePayload {
  text: string;
  charDelay?: number;
  speed?: "slow" | "natural" | "fast" | (string & {});
}

interface KeyboardSetSuggestionsPayload {
  suggestions: string[];
}

interface KeyboardTapSuggestionPayload {
  index: number;
}

type KeyboardPayload =
  | KeyboardShowPayload
  | KeyboardKeyPressPayload
  | KeyboardTypePayload
  | KeyboardSetSuggestionsPayload
  | KeyboardTapSuggestionPayload
  | undefined;

export interface KeyboardEvent {
  kind: "DEVICE";
  type: string;
  deviceId: string;
  at: number;
  payload?: KeyboardPayload;
}

function isKeyPressPayload(
  payload: KeyboardPayload,
): payload is KeyboardKeyPressPayload {
  return payload !== undefined && "key" in payload;
}

function isTypePayload(
  payload: KeyboardPayload,
): payload is KeyboardTypePayload {
  return payload !== undefined && "text" in payload;
}

function isSuggestionsPayload(
  payload: KeyboardPayload,
): payload is KeyboardSetSuggestionsPayload {
  return payload !== undefined && "suggestions" in payload;
}

function isTapSuggestionPayload(
  payload: KeyboardPayload,
): payload is KeyboardTapSuggestionPayload {
  return payload !== undefined && "index" in payload;
}

function isShowPayload(
  payload: KeyboardPayload,
): payload is KeyboardShowPayload {
  return (
    payload !== undefined &&
    ("keyboardType" in payload || "returnKeyType" in payload)
  );
}

export function keyboardReducer(
  state: KeyboardState | undefined,
  event: KeyboardEvent,
  currentFrame: number,
): KeyboardState {
  if (!state) {
    state = createKeyboardInitialState();
  }

  return produce(state, (draft) => {
    switch (event.type) {
      case "KEYBOARD_SHOW": {
        draft.visible = true;
        draft.showFrame = event.at;
        draft.hideFrame = null;
        if (isShowPayload(event.payload)) {
          if (event.payload.keyboardType) {
            draft.keyboardType = event.payload.keyboardType;
          }
          if (event.payload.returnKeyType) {
            draft.returnKeyType = event.payload.returnKeyType;
          }
        }
        break;
      }

      case "KEYBOARD_HIDE": {
        draft.visible = false;
        draft.hideFrame = event.at;
        break;
      }

      case "KEYBOARD_KEY_PRESS": {
        if (!isKeyPressPayload(event.payload)) break;
        const { key, duration = 6 } = event.payload;

        const keyPress: KeyPressState = {
          key,
          startFrame: event.at,
          duration,
        };
        draft.activeKeyPresses.push(keyPress);

        if (key === "backspace") {
          if (draft.cursorPosition > 0) {
            draft.inputText =
              draft.inputText.slice(0, draft.cursorPosition - 1) +
              draft.inputText.slice(draft.cursorPosition);
            draft.cursorPosition--;
          }
        } else if (key === "return" || key === "send") {
          // Return key - apps handle this via their own handlers
        } else if (key === "space") {
          draft.inputText =
            draft.inputText.slice(0, draft.cursorPosition) +
            " " +
            draft.inputText.slice(draft.cursorPosition);
          draft.cursorPosition++;
        } else if (key.length === 1) {
          draft.inputText =
            draft.inputText.slice(0, draft.cursorPosition) +
            key +
            draft.inputText.slice(draft.cursorPosition);
          draft.cursorPosition++;
        }
        break;
      }

      case "KEYBOARD_TYPE": {
        if (!isTypePayload(event.payload)) break;
        const { text } = event.payload;
        const charDelay =
          event.payload.charDelay ??
          speedToCharDelay(event.payload.speed) ??
          3;

        draft.typingAnimation = {
          text,
          startFrame: event.at,
          charDelay,
        };
        draft.inputText = text;
        draft.cursorPosition = text.length;
        break;
      }

      case "KEYBOARD_CLEAR": {
        draft.inputText = "";
        draft.cursorPosition = 0;
        break;
      }

      case "KEYBOARD_SET_SUGGESTIONS": {
        if (!isSuggestionsPayload(event.payload)) break;
        draft.suggestions = event.payload.suggestions;
        break;
      }

      case "KEYBOARD_TAP_SUGGESTION": {
        if (!isTapSuggestionPayload(event.payload)) break;
        const { index } = event.payload;

        if (index >= 0 && index < draft.suggestions.length) {
          const word = draft.suggestions[index];
          const lastSpaceIndex = draft.inputText.lastIndexOf(" ");
          if (lastSpaceIndex === -1) {
            draft.inputText = word + " ";
          } else {
            draft.inputText =
              draft.inputText.slice(0, lastSpaceIndex + 1) + word + " ";
          }
          draft.cursorPosition = draft.inputText.length;
        }
        break;
      }
    }

    draft.activeKeyPresses = draft.activeKeyPresses.filter(
      (kp) => currentFrame < kp.startFrame + kp.duration,
    );
  });
}

function speedToCharDelay(
  speed: KeyboardTypePayload["speed"] | undefined,
): number | undefined {
  if (!speed) return undefined;
  switch (speed) {
    case "fast":
      return 1;
    case "natural":
      return 3;
    case "slow":
      return 6;
    default:
      return undefined;
  }
}
