import React, { useMemo } from "react";
import type { AppViewProps } from "@tokovo/react";
import { TYPEWRITER_APP_ID } from "../constants.js";
import type { TypewriterState } from "../runtime/state.js";

function useTypewriterState(world: AppViewProps["world"]): TypewriterState {
  const raw = world.appState?.[TYPEWRITER_APP_ID] as TypewriterState | undefined;
  return (
    raw ?? {
      viewMode: "FULLSCREEN",
      meta: {},
      lines: [""],
      cursor: { row: 0, col: 0 },
      scrollY: 0,
      fx: {},
    }
  );
}

function isHot(frame: number | undefined, t: number, windowFrames: number): boolean {
  if (typeof frame !== "number") return false;
  return t >= frame && t < frame + windowFrames;
}

export const TypewriterView: React.FC<AppViewProps> = ({ world, t = 0 }) => {
  const s = useTypewriterState(world);

  const pressed = useMemo(() => {
    const keyHot = isHot(s.fx.lastKeyFrame, t, 4);
    const carriageHot = isHot(s.fx.lastCarriageFrame, t, 8);
    return { keyHot, carriageHot };
  }, [s.fx.lastCarriageFrame, s.fx.lastKeyFrame, t]);

  const lines = s.lines.length > 0 ? s.lines : [""];
  const cursorRow = Math.max(0, Math.min(lines.length - 1, s.cursor.row));
  const cursorCol = Math.max(0, Math.min((lines[cursorRow] ?? "").length, s.cursor.col));

  return (
    <div style={rootStyle}>
      <div style={deskStyle} />

      <div style={paperWrapStyle}>
        <div style={paperShadowStyle} />
        <div style={paperStyle}>
          <div style={paperHeaderStyle}>
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>To:</span>
              <span style={metaValueStyle}>{s.meta.to ?? ""}</span>
            </div>
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>From:</span>
              <span style={metaValueStyle}>{s.meta.from ?? ""}</span>
            </div>
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Date:</span>
              <span style={metaValueStyle}>{s.meta.date ?? ""}</span>
            </div>
            <div style={metaRowStyle}>
              <span style={metaLabelStyle}>Subject:</span>
              <span style={metaValueStyle}>{s.meta.subject ?? ""}</span>
            </div>
          </div>

          <div style={textAreaStyle}>
            {lines.map((line, i) => {
              const isCursorLine = i === cursorRow;
              if (!isCursorLine) {
                return (
                  <div key={i} style={lineStyle}>
                    {line || "\u00A0"}
                  </div>
                );
              }
              const before = line.slice(0, cursorCol);
              const after = line.slice(cursorCol);
              return (
                <div key={i} style={lineStyle}>
                  <span>{before}</span>
                  <span style={cursorStyle} />
                  <span>{after || "\u00A0"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={typewriterWrapStyle}>
        <div
          style={{
            ...typewriterBodyStyle,
            transform: pressed.carriageHot ? "translateX(-10px)" : "translateX(0)",
          }}
        >
          <div style={typewriterTopPlateStyle} />
          <div style={keysGridStyle}>
            {KEYS.map((k) => {
              const active = pressed.keyHot && s.fx.lastKey === k;
              return (
                <div
                  key={k}
                  style={{
                    ...keyStyle,
                    transform: active ? "translateY(2px)" : "translateY(0)",
                    background: active
                      ? "linear-gradient(180deg, #1a1f25, #0d1014)"
                      : "linear-gradient(180deg, #222a33, #0f141a)",
                  }}
                >
                  {k}
                </div>
              );
            })}
          </div>
          <div style={typewriterBrandStyle}>TOKOVO</div>
        </div>
      </div>
    </div>
  );
};

const KEYS = [
  "Q","W","E","R","T","Y","U","I","O","P",
  "A","S","D","F","G","H","J","K","L",
  "Z","X","C","V","B","N","M",
  "Space","Backspace","Return",
];

const rootStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  background: "transparent",
};

const deskStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(1200px 900px at 30% 20%, rgba(255,255,255,0.08), transparent 60%)," +
    "radial-gradient(900px 700px at 70% 10%, rgba(255,190,120,0.06), transparent 55%)," +
    "linear-gradient(135deg, #2a1c14 0%, #1b120d 55%, #120c09 100%)",
};

const paperWrapStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "7%",
  transform: "translateX(-50%)",
  width: "72%",
  maxWidth: 940,
  height: "62%",
  pointerEvents: "none",
};

const paperShadowStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  transform: "translate(0, 14px) rotate(-0.3deg)",
  background: "rgba(0,0,0,0.35)",
  filter: "blur(16px)",
  borderRadius: 10,
};

const paperStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 10,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,248,0.94))",
  boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
  transform: "rotate(-0.35deg)",
  overflow: "hidden",
};

const paperHeaderStyle: React.CSSProperties = {
  padding: "28px 36px 12px",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "baseline",
  marginBottom: 6,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 18,
  color: "rgba(10, 12, 14, 0.9)",
};

const metaLabelStyle: React.CSSProperties = {
  width: 84,
  color: "rgba(10, 12, 14, 0.55)",
};

const metaValueStyle: React.CSSProperties = {
  flex: 1,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const textAreaStyle: React.CSSProperties = {
  position: "absolute",
  left: "9%",
  right: "9%",
  top: "22%",
  bottom: "10%",
  fontFamily: "\"Courier New\", Courier, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 28,
  lineHeight: "34px",
  letterSpacing: "0.2px",
  color: "rgba(10, 12, 14, 0.92)",
  textShadow: "0 0.6px 0 rgba(0,0,0,0.06)",
};

const lineStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap",
};

const cursorStyle: React.CSSProperties = {
  display: "inline-block",
  width: 10,
  height: 30,
  margin: "0 2px",
  background: "rgba(20, 22, 26, 0.9)",
  verticalAlign: "text-bottom",
};

const typewriterWrapStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "0%",
  transform: "translateX(-50%)",
  width: "90%",
  height: "34%",
  pointerEvents: "none",
};

const typewriterBodyStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 18,
  background:
    "radial-gradient(900px 260px at 30% 20%, rgba(255,255,255,0.10), transparent 55%)," +
    "linear-gradient(180deg, #121820 0%, #0b0f14 100%)",
  boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const typewriterTopPlateStyle: React.CSSProperties = {
  position: "absolute",
  left: 18,
  right: 18,
  top: 18,
  height: 26,
  borderRadius: 12,
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
};

const keysGridStyle: React.CSSProperties = {
  position: "absolute",
  left: 26,
  right: 26,
  top: 64,
  bottom: 48,
  display: "grid",
  gridTemplateColumns: "repeat(10, 1fr)",
  gridAutoRows: "minmax(46px, 1fr)",
  gap: 10,
  alignContent: "start",
};

const keyStyle: React.CSSProperties = {
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 14,
  color: "rgba(230, 240, 255, 0.95)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
  userSelect: "none",
};

const typewriterBrandStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 14,
  left: 26,
  fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
  letterSpacing: "0.24em",
  fontWeight: 700,
  fontSize: 14,
  color: "rgba(255,255,255,0.30)",
};

