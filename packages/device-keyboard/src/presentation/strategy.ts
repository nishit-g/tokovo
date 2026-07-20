import type {
  InputPlatform,
  InputPresentationStrategy,
} from "../contract/index.js";

export const IOS_INPUT_PRESENTATION: InputPresentationStrategy = {
  id: "ios-system-keyboard",
  platform: "ios",
  keyPreview: "iosBubble",
  suggestionStyle: "segmented",
  returnKeyStyle: "accent",
  bottomRowOrder: [
    "layout",
    "emoji",
    "language",
    "space",
    "dictation",
    "return",
  ],
};

export const ANDROID_INPUT_PRESENTATION: InputPresentationStrategy = {
  id: "android-system-keyboard",
  platform: "android",
  keyPreview: "androidPopup",
  suggestionStyle: "strip",
  returnKeyStyle: "tonal",
  bottomRowOrder: ["layout", "emoji", "language", "space", "return"],
};

export function getInputPresentationStrategy(
  platform: InputPlatform,
): InputPresentationStrategy {
  switch (platform) {
    case "ios":
      return IOS_INPUT_PRESENTATION;
    case "android":
      return ANDROID_INPUT_PRESENTATION;
  }
}
