import React, {
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useDevice, useKeyboardHeight, useTime } from "./TokovoContext.js";
import type { KeyboardState } from "@tokovo/core";

export interface UseKeyboardAwareContainerOptions {
  autoScroll?: boolean;
  scrollToBottom?: boolean;
}

export interface KeyboardAwareContainerResult {
  containerStyle: CSSProperties;
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

export function useKeyboardAwareContainer(
  options: UseKeyboardAwareContainerOptions = {},
): KeyboardAwareContainerResult {
  const keyboardHeight = useKeyboardHeight();
  const isKeyboardVisible = keyboardHeight > 0;

  const containerStyle: CSSProperties = {
    height: isKeyboardVisible ? `calc(100% - ${keyboardHeight}px)` : "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  };

  return {
    containerStyle,
    keyboardHeight,
    isKeyboardVisible,
  };
}

export interface KeyboardAwareViewProps {
  children: ReactNode;
  style?: CSSProperties;
  autoScrollRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({
  children,
  style,
  autoScrollRef,
  className,
}) => {
  const { containerStyle, keyboardHeight } = useKeyboardAwareContainer();

  useEffect(() => {
    if (autoScrollRef?.current) {
      autoScrollRef.current.scrollTop = autoScrollRef.current.scrollHeight;
    }
  }, [keyboardHeight, autoScrollRef]);

  return (
    <div style={{ ...containerStyle, ...style }} className={className}>
      {children}
    </div>
  );
};

export interface UseKeyboardInputOptions {
  onSubmit?: (text: string) => void;
}

export interface KeyboardInputState {
  inputText: string;
  cursorPosition: number;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

export function useKeyboardState(): KeyboardInputState {
  const device = useDevice();
  const t = useTime();
  const keyboardHeight = useKeyboardHeight();
  const keyboard = device.keyboard as KeyboardState | undefined;
  const inputText = getKeyboardDraftText(keyboard, t);

  return {
    inputText,
    cursorPosition: inputText.length,
    isKeyboardVisible: keyboardHeight > 0,
    keyboardHeight,
  };
}

function getKeyboardDraftText(
  keyboard: KeyboardState | undefined,
  currentFrame: number,
): string {
  if (!keyboard) return "";
  if (!keyboard.typingAnimation) return keyboard.inputText;

  const { text, startFrame, charDelay } = keyboard.typingAnimation;
  const elapsed = currentFrame - startFrame;
  if (elapsed < 0) return "";

  const safeCharDelay = Math.max(charDelay, Number.EPSILON);
  const charsTyped = Math.floor(elapsed / safeCharDelay);
  return text.slice(0, Math.min(charsTyped, text.length));
}

export interface ScrollableContentProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  keyboardHeight?: number;
}

export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  children,
  style,
  className,
  keyboardHeight: keyboardHeightProp,
}) => {
  const contextKeyboardHeight = useKeyboardHeight();
  const keyboardHeight = keyboardHeightProp ?? contextKeyboardHeight;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [keyboardHeight]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
};
