import type { MaterialRecipe, PlatformDesignProfileId } from "@tokovo/visual-system";

export type InputSessionId = string;
export type InputFieldId = string;
export type AppInstanceId = string;

export type InputSource = "softwareKeyboard" | "hardwareKeyboard" | "paste" | "voice";

export type InputDirection = "ltr" | "rtl";
export type InputDirectionIntent = InputDirection | "auto";
export type InputPlatform = "ios" | "android";
export type InputAppearance = "light" | "dark";

export type KeyboardLayoutKind = "letters" | "numbers" | "symbols" | "emoji";

export type KeyboardFamily =
  | "latin"
  | "arabic"
  | "cyrillic"
  | "devanagari"
  | "bengali"
  | "gurmukhi"
  | "gujarati"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "thai"
  | "hangul"
  | "kana"
  | "cjk"
  | "generic";

export type InputReturnKey = "return" | "send" | "search" | "done" | "go" | "next";

export interface ResolvedInputLocale {
  tag: string;
  language: string;
  script?: string;
  region?: string;
  direction: InputDirection;
  keyboardFamily: KeyboardFamily;
}

export interface InputSelection {
  anchor: number;
  focus: number;
}

export interface InputCompositionState {
  range: InputSelection;
  text: string;
}

export interface InputKeyboardConfig {
  platform: InputPlatform;
  locale: ResolvedInputLocale;
  layout: KeyboardLayoutKind;
  returnKey: InputReturnKey;
  appearance: InputAppearance;
  platformProfileId: PlatformDesignProfileId;
  autocapitalization: "none" | "sentences" | "words" | "characters";
  autocorrection: boolean;
}

export interface InputThemeProjection {
  id: string;
  platform: InputPlatform;
  appearance: InputAppearance;
  colors: {
    surface: string;
    surfaceRaised: string;
    key: string;
    keyPressed: string;
    keyText: string;
    specialKey: string;
    specialKeyPressed: string;
    specialKeyText: string;
    accentKey: string;
    accentKeyPressed: string;
    accentKeyText: string;
    suggestionText: string;
    suggestionDivider: string;
    border: string;
    keyShadow: string;
    keyPreview: string;
  };
  material: MaterialRecipe;
  typography: {
    fontFamily: string;
    keyFontSize: number;
    specialKeyFontSize: number;
    suggestionFontSize: number;
    returnKeyFontSize: number;
  };
  geometry: {
    height: number;
    suggestionHeight: number;
    keyHeight: number;
    keyRadius: number;
    keyGap: number;
    rowGap: number;
    horizontalPadding: number;
    topPadding: number;
    bottomPadding: number;
  };
  motion: {
    entranceDurationSeconds: number;
    exitDurationSeconds: number;
    keyPressDurationSeconds: number;
    keyPreviewDurationSeconds: number;
  };
}

export interface InputPresentationStrategy {
  id: string;
  platform: InputPlatform;
  keyPreview: "iosBubble" | "androidPopup";
  suggestionStyle: "segmented" | "strip";
  returnKeyStyle: "accent" | "tonal";
  bottomRowOrder: readonly ("layout" | "emoji" | "language" | "space" | "dictation" | "return")[];
}

interface PreparedInputOperationBase {
  at: number;
  sequence: number;
}

export type PreparedInputOperation =
  | (PreparedInputOperationBase & {
      type: "focus";
    })
  | (PreparedInputOperationBase & {
      type: "insert";
      text: string;
      key?: string;
      source: InputSource;
      keyPressDurationFrames?: number;
    })
  | (PreparedInputOperationBase & {
      type: "deleteBackward";
      count: number;
      keyPressDurationFrames?: number;
    })
  | (PreparedInputOperationBase & {
      type: "setSelection";
      selection: InputSelection;
    })
  | (PreparedInputOperationBase & {
      type: "moveCursor";
      position: number;
    })
  | (PreparedInputOperationBase & {
      type: "replaceRange";
      range: InputSelection;
      text: string;
      source: InputSource;
    })
  | (PreparedInputOperationBase & {
      type: "compositionStart";
    })
  | (PreparedInputOperationBase & {
      type: "compositionUpdate";
      text: string;
      key?: string;
      keyPressDurationFrames?: number;
    })
  | (PreparedInputOperationBase & {
      type: "compositionCommit";
      text?: string;
    })
  | (PreparedInputOperationBase & {
      type: "setSuggestions";
      suggestions: readonly string[];
    })
  | (PreparedInputOperationBase & {
      type: "chooseSuggestion";
      index: number;
      text: string;
      replaceRange?: InputSelection;
      keyPressDurationFrames?: number;
    })
  | (PreparedInputOperationBase & {
      type: "switchLayout";
      layout: KeyboardLayoutKind;
    })
  | (PreparedInputOperationBase & {
      type: "submit";
      clearDraft: boolean;
      keyPressDurationFrames?: number;
    })
  | (PreparedInputOperationBase & {
      type: "blur";
    });

export interface PreparedInputSession {
  version: "1";
  id: InputSessionId;
  deviceId: string;
  appInstanceId: AppInstanceId;
  fieldId: InputFieldId;
  source: InputSource;
  direction: InputDirectionIntent;
  keyboard: InputKeyboardConfig;
  initialValue: string;
  startFrame: number;
  endFrame: number;
  submitAtFrame?: number;
  clearOnSubmit: boolean;
  expectedFinalValue?: string;
  operations: readonly PreparedInputOperation[];
}

export interface PreparedInputProgram {
  version: "1";
  sessions: readonly PreparedInputSession[];
}

export type InputSessionStatus = "idle" | "focused" | "submitted" | "blurred";

export interface InputRuntimeState {
  sessionId: InputSessionId;
  deviceId: string;
  appInstanceId: AppInstanceId;
  fieldId: InputFieldId;
  status: InputSessionStatus;
  focused: boolean;
  draft: string;
  selection: InputSelection;
  composition?: InputCompositionState;
  suggestions: readonly string[];
  activeSuggestionIndex: number | null;
  layout: KeyboardLayoutKind;
  submittedValue?: string;
  lastOperation?: PreparedInputOperation;
}

export interface InputRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InputProjection {
  sessionId: InputSessionId;
  deviceId: string;
  appInstanceId: AppInstanceId;
  fieldId: InputFieldId;
  status: InputSessionStatus;
  focused: boolean;
  draft: string;
  displayDraft: string;
  selection: InputSelection;
  composition?: InputCompositionState;
  direction: InputDirection;
  locale: ResolvedInputLocale;
  surface: {
    visible: boolean;
    progress: number;
    platform: InputPlatform;
    layout: KeyboardLayoutKind;
    family: KeyboardFamily;
    appearance: InputAppearance;
    platformProfileId: PlatformDesignProfileId;
    theme: InputThemeProjection;
    presentation: InputPresentationStrategy;
    returnKey: InputReturnKey;
    activeKey: string | null;
    suggestions: readonly string[];
    candidateMode: "suggestions" | "toolbar";
    activeSuggestionIndex: number | null;
    viewportInset: number;
    bounds: InputRect;
  };
}
