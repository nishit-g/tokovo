import React, {
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useKeyboardHeight } from "./TokovoContext";

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
  const keyboardHeight = useKeyboardHeight();

  return {
    inputText: "",
    cursorPosition: 0,
    isKeyboardVisible: keyboardHeight > 0,
    keyboardHeight,
  };
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
