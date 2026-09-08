import React from "react";
import type { InputKeyboardProps } from "../InputKeyboard.js";
import {
  KeyboardPainter,
  SuggestionCandidates,
  type CandidateBarContext,
  type KeyboardPainterSpec,
} from "./KeyboardPainter.js";

function IOSCandidateBar(context: CandidateBarContext) {
  const { projection } = context;
  if (projection.surface.candidateMode === "suggestions") {
    return <SuggestionCandidates {...context} segmented />;
  }
  // No invented toolbar: predictive words are authored input, not fabricated UI.
  return null;
}

const IOS_SPEC: KeyboardPainterSpec = {
  id: "ios-system-keyboard@1",
  includeDictation: true,
  specialKeyFlex: 0.85,
  keyBorderWidth: 0,
  surfaceTopBorder: true,
  renderCandidateBar: IOSCandidateBar,
};

export const IOSInputKeyboardPainter = React.memo(function IOSInputKeyboardPainter({
  projection,
  scale = 1,
}: InputKeyboardProps) {
  if (projection.surface.platform !== "ios") {
    throw new Error("INPUT_PAINTER_PLATFORM_MISMATCH: iOS painter received a non-iOS projection.");
  }
  return <KeyboardPainter projection={projection} scale={scale} spec={IOS_SPEC} />;
});
