import type { KeyboardState } from "./state.js";
import { keyboardSpacing } from "../ui/tokens.js";
import { sliceGraphemes, splitGraphemes } from "./graphemes.js";

export function isKeyboardVisible(state: KeyboardState): boolean {
  return state.visible;
}

export function getInputText(state: KeyboardState): string {
  return state.inputText;
}

export function getCursorPosition(state: KeyboardState): number {
  return state.cursorPosition;
}

export function isKeyActive(
  state: KeyboardState,
  key: string,
  currentFrame: number,
): boolean {
  const keyLower = key.toLowerCase();

  // Check activeKeyPresses (explicit key press events)
  const fromKeyPresses = state.activeKeyPresses.some(
    (kp) =>
      kp.key.toLowerCase() === keyLower &&
      currentFrame >= kp.startFrame &&
      currentFrame < kp.startFrame + kp.duration,
  );
  if (fromKeyPresses) return true;

  // Check typingAnimation (optimized bulk typing)
  if (state.typingAnimation) {
    const { text, startFrame, charDelay } = state.typingAnimation;
    const graphemes = splitGraphemes(text);
    const elapsed = currentFrame - startFrame;
    if (elapsed >= 0) {
      const charIndex = Math.floor(elapsed / charDelay);
      const frameInChar = elapsed % charDelay;
      const keyPressDuration = Math.min(charDelay, 6);

      if (charIndex < graphemes.length && frameInChar < keyPressDuration) {
        const activeChar = graphemes[charIndex];
        if (activeChar.toLowerCase() === keyLower) {
          return true;
        }
        if (activeChar === " " && keyLower === "space") {
          return true;
        }
      }
    }
  }

  return false;
}

export function getKeyboardSlideProgress(
  state: KeyboardState,
  currentFrame: number,
  fps: number,
): number {
  const slideDuration = Math.round(fps * 0.25);

  if (state.visible && state.showFrame !== null) {
    const elapsed = currentFrame - state.showFrame;
    if (elapsed < 0) return 0;
    if (elapsed >= slideDuration) return 1;
    return easeOutCubic(elapsed / slideDuration);
  }

  if (!state.visible && state.hideFrame !== null) {
    const elapsed = currentFrame - state.hideFrame;
    if (elapsed < 0) return 1;
    if (elapsed >= slideDuration) return 0;
    return 1 - easeOutCubic(elapsed / slideDuration);
  }

  return state.visible ? 1 : 0;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function getKeyboardHeight(scale = 3): number {
  return keyboardSpacing.height * scale;
}

export function getSuggestions(state: KeyboardState): string[] {
  return state.suggestions;
}

export function getTypedTextProgress(
  state: KeyboardState,
  currentFrame: number,
): string {
  if (!state.typingAnimation) {
    return state.inputText;
  }

  const { text, startFrame, charDelay } = state.typingAnimation;
  const elapsed = currentFrame - startFrame;
  const graphemes = splitGraphemes(text);

  if (elapsed < 0) return "";

  const charsTyped = Math.floor(elapsed / Math.max(charDelay, Number.EPSILON));
  return sliceGraphemes(text, 0, Math.min(charsTyped, graphemes.length));
}
