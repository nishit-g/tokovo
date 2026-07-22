import React from "react";
import type { InputKeyboardProps } from "../InputKeyboard.js";
import {
  KeyboardGlyph,
  KeyboardPainter,
  SuggestionCandidates,
  type CandidateBarContext,
  type KeyboardPainterSpec,
} from "./KeyboardPainter.js";

function AndroidCandidateBar(context: CandidateBarContext) {
  const { projection, theme, scale } = context;
  if (projection.surface.candidateMode === "suggestions") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: theme.colors.surfaceRaised,
          borderRadius: theme.geometry.keyRadius * scale,
          overflow: "hidden",
        }}
      >
        <SuggestionCandidates {...context} segmented={false} />
      </div>
    );
  }
  const icon = (kind: "toolbar" | "emoji" | "clipboard" | "translate" | "dictation") => (
    <div
      style={{
        width: 40 * scale,
        height: 34 * scale,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 17 * scale,
      }}
    >
      <KeyboardGlyph kind={kind} size={19 * scale} />
    </div>
  );
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: 4 * scale,
        boxSizing: "border-box",
        color: theme.colors.suggestionText,
      }}
    >
      {icon("toolbar")}
      {icon("emoji")}
      {icon("clipboard")}
      {icon("translate")}
      {icon("dictation")}
    </div>
  );
}

const ANDROID_SPEC: KeyboardPainterSpec = {
  id: "android-gboard@1",
  includeDictation: false,
  specialKeyFlex: 0.95,
  keyBorderWidth: 0.35,
  surfaceTopBorder: false,
  renderCandidateBar: AndroidCandidateBar,
};

export const AndroidInputKeyboardPainter = React.memo(function AndroidInputKeyboardPainter({
  projection,
  scale = 1,
}: InputKeyboardProps) {
  if (projection.surface.platform !== "android") {
    throw new Error(
      "INPUT_PAINTER_PLATFORM_MISMATCH: Android painter received a non-Android projection.",
    );
  }
  return <KeyboardPainter projection={projection} scale={scale} spec={ANDROID_SPEC} />;
});
