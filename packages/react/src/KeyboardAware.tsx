import React, {
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  useAppId,
  useDeviceId,
  useInputProgram,
  useInputProjection,
  useKeyboardHeight,
  useTime,
} from "./TokovoContext.js";
import {
  evaluateInputSession,
  findInputSessionForField,
  getInputDisplayDraft,
  inferTextDirection,
  type InputCompositionState,
  type InputDirection,
  type InputSelection,
  type ResolvedInputLocale,
} from "@tokovo/device-keyboard";

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

export interface InputFieldState {
  sessionId: string;
  value: string;
  committedValue: string;
  selection: InputSelection;
  composition?: InputCompositionState;
  direction: InputDirection;
  locale: ResolvedInputLocale;
  focused: boolean;
  submittedValue?: string;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
}

export interface UseInputFieldOptions {
  appInstanceId?: string;
}

/** Read one exact app-owned input field at the current random-access frame. */
export function useInputField(
  fieldId: string,
  options: UseInputFieldOptions = {},
): InputFieldState | null {
  const inputProgram = useInputProgram();
  const inputProjection = useInputProjection();
  const deviceId = useDeviceId();
  const appId = useAppId();
  const frame = useTime();
  const keyboardHeight = useKeyboardHeight();
  const appInstanceId = options.appInstanceId ?? `${deviceId}:${appId}`;

  if (!inputProgram) return null;
  const session = findInputSessionForField(
    inputProgram,
    appInstanceId,
    fieldId,
    frame,
  );
  if (!session || session.deviceId !== deviceId) return null;

  const state = evaluateInputSession(session, frame);
  const value = getInputDisplayDraft(state, session.keyboard.locale.tag);
  const direction =
    session.direction === "auto"
      ? inferTextDirection(value, session.keyboard.locale.direction)
      : session.direction;
  const projectionMatches = inputProjection?.sessionId === session.id;

  return {
    sessionId: session.id,
    value,
    committedValue: state.draft,
    selection: { ...state.selection },
    composition: state.composition
      ? {
          range: { ...state.composition.range },
          text: state.composition.text,
        }
      : undefined,
    direction,
    locale: session.keyboard.locale,
    focused: state.focused,
    submittedValue: state.submittedValue,
    isKeyboardVisible: projectionMatches
      ? Boolean(inputProjection?.surface.visible)
      : keyboardHeight > 0,
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
