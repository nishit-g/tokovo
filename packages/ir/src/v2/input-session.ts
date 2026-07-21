/**
 * Serializable authoring contract for deterministic text input.
 *
 * Positions and ranges are grapheme indices, never UTF-16 offsets. The
 * capability compiler resolves locale, platform presentation and exact frame
 * operations when the episode is prepared.
 */

export type InputSourceIR =
  | "softwareKeyboard"
  | "hardwareKeyboard"
  | "paste"
  | "voice";

export type InputDirectionIR = "ltr" | "rtl" | "auto";
export type InputPlatformIR = "ios" | "android";
export type InputAppearanceIR = "light" | "dark";
export type InputLayoutIR = "letters" | "numbers" | "symbols" | "emoji";
export type InputReturnKeyIR =
  | "return"
  | "send"
  | "search"
  | "done"
  | "go"
  | "next";

export interface InputSelectionIR {
  anchor: number;
  focus: number;
}

export interface InputCadenceIR {
  style?: "slow" | "natural" | "fast";
  framesPerGrapheme?: number;
  varianceFrames?: number;
  punctuationPauseFrames?: number;
  focusLeadFrames?: number;
  keyPressDurationFrames?: number;
}

export interface InputKeyboardIR {
  platform?: InputPlatformIR;
  locale?: string;
  layout?: InputLayoutIR;
  returnKey?: InputReturnKeyIR;
  appearance?: InputAppearanceIR;
  themeId?: "system";
  autocapitalization?: "none" | "sentences" | "words" | "characters";
  autocorrection?: boolean;
}

export type InputScriptStepIR =
  | {
      type: "type";
      text: string;
      source?: Exclude<InputSourceIR, "paste" | "voice">;
      cadence?: InputCadenceIR;
    }
  | { type: "pause"; frames: number }
  | { type: "deleteBackward"; count?: number; intervalFrames?: number }
  | { type: "setSelection"; selection: InputSelectionIR }
  | { type: "moveCursor"; position: number }
  | {
      type: "replaceRange";
      range: InputSelectionIR;
      text: string;
      source?: InputSourceIR;
    }
  | {
      type: "compose";
      updates: string[];
      commit: string;
      intervalFrames?: number;
      keys?: string[];
    }
  | { type: "setSuggestions"; suggestions: string[] }
  | {
      type: "chooseSuggestion";
      index: number;
      text: string;
      replaceRange?: InputSelectionIR;
    }
  | { type: "switchLayout"; layout: InputLayoutIR }
  | { type: "paste"; text: string }
  | { type: "voice"; text: string };

export interface InputSessionIR {
  id?: string;
  deviceId: string;
  /** Stable app instance identity. The DSL defaults this to deviceId:appId. */
  appInstanceId: string;
  fieldId: string;
  startFrame: number;
  endFrame?: number;
  submitAtFrame?: number;
  /** Clear the field draft when submit is applied. Defaults to true. */
  clearOnSubmit?: boolean;
  initialValue?: string;
  text?: string;
  script?: InputScriptStepIR[];
  expectedFinalValue?: string;
  seed?: string | number;
  source?: InputSourceIR;
  locale?: string;
  direction?: InputDirectionIR;
  keyboard?: InputKeyboardIR;
  cadence?: InputCadenceIR;
}
