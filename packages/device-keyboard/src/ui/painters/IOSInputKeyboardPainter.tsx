import React from "react";
import type { InputKeyboardProps } from "../InputKeyboard.js";
import {
  KeyboardGlyph,
  KeyboardPainter,
  KEYBOARD_LOCALE_LABELS,
  SuggestionCandidates,
  type CandidateBarContext,
  type KeyboardPainterSpec,
} from "./KeyboardPainter.js";

function IOSCandidateBar(context: CandidateBarContext) {
  const { projection, theme, scale } = context;
  if (projection.surface.candidateMode === "suggestions") {
    return <SuggestionCandidates {...context} segmented />;
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "44px 1fr 44px",
        alignItems: "center",
        color: theme.colors.suggestionText,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", opacity: 0.72 }}>
        <KeyboardGlyph kind="globe" size={18 * scale} />
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.specialKeyFontSize * scale,
          fontWeight: 500,
          opacity: 0.72,
        }}
      >
        {KEYBOARD_LOCALE_LABELS[projection.locale.language] ??
          projection.locale.language.toUpperCase()}
      </div>
      <div style={{ display: "flex", justifyContent: "center", opacity: 0.72 }}>
        <KeyboardGlyph kind="dictation" size={18 * scale} />
      </div>
    </div>
  );
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
