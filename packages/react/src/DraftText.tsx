import React, { memo, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { splitGraphemes, type InputSelection } from "@tokovo/device-keyboard";
import { ShapedText } from "./ShapedText.js";
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Only this small text viewport is measured; the chat history is never measured. */
export const DraftText = memo(function DraftText({
  text,
  selection,
  focused,
  frame,
  fps,
  lastActivityFrame = 0,
  accent,
  lineHeight,
  locale,
  placeholder,
}: {
  text: string;
  selection?: InputSelection;
  focused: boolean;
  frame: number;
  fps: number;
  lastActivityFrame?: number;
  accent: string;
  lineHeight: number;
  locale?: string;
  placeholder?: string;
}) {
  const graphemes = useMemo(() => splitGraphemes(text, locale), [text, locale]);
  const anchor = Math.max(0, Math.min(graphemes.length, selection?.anchor ?? graphemes.length));
  const focus = Math.max(0, Math.min(graphemes.length, selection?.focus ?? graphemes.length));
  const start = Math.min(anchor, focus);
  const end = Math.max(anchor, focus);
  const viewport = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  useBrowserLayoutEffect(() => {
    const box = viewport.current;
    const caret = cursor.current;
    if (!box || !caret) return;
    // Absolute assignment makes direct seeking independent of prior scrollTop.
    box.scrollTop = Math.max(0, caret.offsetTop + lineHeight - box.clientHeight);
  }, [text, focus, lineHeight]);
  const visible =
    focused &&
    (frame - lastActivityFrame < fps * 0.6 ||
      Math.floor((frame - lastActivityFrame) / (fps * 0.5)) % 2 === 0);
  const caret = (
    <span
      ref={cursor}
      data-draft-caret
      style={{
        display: "inline-block",
        position: "relative",
        width: 0,
        height: lineHeight - 2,
        verticalAlign: "text-bottom",
      }}
    >
      <span
        style={{
          position: "absolute",
          width: 2,
          insetBlock: 0,
          background: accent,
          opacity: visible ? 1 : 0,
        }}
      />
    </span>
  );
  return (
    <div
      ref={viewport}
      data-draft-viewport
      style={{
        position: "relative",
        maxHeight: lineHeight * 4,
        overflow: "hidden",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        lineHeight: `${lineHeight}px`,
      }}
    >
      {!text && !focused ? (
        placeholder
      ) : (
        <>
          <ShapedText text={graphemes.slice(0, start).join("")} />
          {focus === start && caret}
          <span
            data-draft-selection={start !== end || undefined}
            style={{ background: start !== end ? `${accent}33` : undefined }}
          >
            <ShapedText text={graphemes.slice(start, end).join("")} />
          </span>
          {focus !== start && caret}
          <ShapedText text={graphemes.slice(end).join("")} />
        </>
      )}
    </div>
  );
});
