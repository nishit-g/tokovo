import React, { useMemo } from "react";
import type { AppViewProps } from "@tokovo/react";
import { Easing, interpolate } from "remotion";
import { useVideoConfig } from "remotion";

import { TYPEWRITER_APP_ID } from "../constants.js";
import type { TypewriterState } from "../runtime/state.js";
import { resolveTypewriterTheme } from "../theme/resolve.js";
import { computeTypewriterGeometry } from "../anchors/geometry.js";
import { TYPEWRITER_KEYBOARD_ROWS, type TypewriterKeyId } from "../keyboard/index.js";

function useTypewriterState(world: AppViewProps["world"]): TypewriterState {
  const raw = world.appState?.[TYPEWRITER_APP_ID] as TypewriterState | undefined;
  return (
    raw ?? {
      viewMode: "FULLSCREEN",
      meta: {},
      lines: [""],
      cursor: { row: 0, col: 0 },
      scrollLines: 0,
      settings: { maxCols: 44, maxRows: 26, wrap: "word", bellColsFromRight: 5 },
      seed: 1337,
      theme: { preset: "classic" },
      fx: { pressedKeys: {} },
    }
  );
}

function isHot(frame: number | undefined, t: number, windowFrames: number): boolean {
  if (typeof frame !== "number") return false;
  return t >= frame && t < frame + windowFrames;
}

function hotProgress(frame: number | undefined, t: number, windowFrames: number): number {
  if (typeof frame !== "number") return 0;
  if (t < frame) return 0;
  if (t >= frame + windowFrames) return 0;
  const p = (t - frame) / windowFrames;
  return 1 - Math.pow(1 - p, 3);
}

export const TypewriterView: React.FC<AppViewProps> = ({ world, t = 0 }) => {
  const s = useTypewriterState(world);
  const video = useVideoConfig();

  const theme = useMemo(
    () => resolveTypewriterTheme({ config: s.theme, video: { width: video.width, height: video.height } }),
    [s.theme, video.height, video.width],
  );

  const geom = useMemo(
    () => computeTypewriterGeometry({ width: video.width, height: video.height }, theme),
    [theme, video.height, video.width],
  );

  const keyHot = isHot(s.fx.lastKeyFrame, t, theme.motion.keyPressFrames);
  const carriageHot = isHot(s.fx.lastCarriageFrame, t, theme.motion.carriageReturnFrames);
  const shakeP = hotProgress(s.fx.lastKeyFrame, t, theme.motion.keyPressFrames);
  const carriageP = hotProgress(s.fx.lastCarriageFrame, t, theme.motion.carriageReturnFrames);

  const scrollLinesAnimated = useMemo(() => {
    const anim = s.fx.scrollAnim;
    if (!anim) return s.scrollLines;
    const frames = theme.motion.paperFeedFrames;
    if (t < anim.at) return s.scrollLines;
    if (t >= anim.at + frames) return s.scrollLines;
    const p = (t - anim.at) / frames;
    const eased = Easing.bezier(0.2, 0.75, 0.2, 1)(p);
    return anim.fromLines + (anim.toLines - anim.fromLines) * eased;
  }, [s.fx.scrollAnim, s.scrollLines, t, theme.motion.paperFeedFrames]);

  const topLine = Math.max(0, Math.floor(scrollLinesAnimated));
  const frac = scrollLinesAnimated - topLine;
  const visibleCount = theme.layout.maxRows + 2;
  const lines = s.lines.length > 0 ? s.lines : [""];
  const visibleLines = lines.slice(topLine, topLine + visibleCount);

  const cursorRow = Math.max(0, Math.min(lines.length - 1, s.cursor.row));
  const cursorCol = Math.max(0, Math.min((lines[cursorRow] ?? "").length, s.cursor.col));
  const cursorRowInWindow = cursorRow - topLine;

  const stageShakeX = keyHot ? Math.sin(t * 0.9) * theme.motion.deskShakePx * shakeP : 0;
  const stageShakeY = keyHot ? Math.cos(t * 1.1) * theme.motion.deskShakePx * 0.7 * shakeP : 0;
  const stageShakeR = keyHot ? Math.sin(t * 0.7) * theme.motion.deskShakeDeg * shakeP : 0;
  const idleSway = Math.sin(t / 180) * theme.motion.idleSwayDeg;

  const carriageFromCol = s.fx.lastCarriageFromCol ?? cursorCol;
  const carriageFromP = carriageFromCol / Math.max(1, theme.layout.maxCols - 1);
  const carriageToP = cursorCol / Math.max(1, theme.layout.maxCols - 1);
  const carriagePosP = carriageHot
    ? interpolate(carriageP, [0, 1], [carriageFromP, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : carriageToP;

  const paperTransform = `rotate(${theme.paper.rotationDeg + stageShakeR + idleSway}deg) translate(${stageShakeX}px, ${stageShakeY}px)`;
  const writerTransform = `translate(${stageShakeX}px, ${stageShakeY}px)`;

  return (
    <div style={rootStyle}>
      <div
        style={{
          ...deskStyle,
          background:
            `radial-gradient(1200px 900px at 30% 20%, rgba(255,255,255,${theme.desk.highlightOpacity}), transparent 60%),` +
            `radial-gradient(900px 700px at 70% 10%, rgba(255,190,120,${theme.desk.highlightOpacity * 0.75}), transparent 55%),` +
            `radial-gradient(1400px 980px at 50% 70%, rgba(0,0,0,${theme.desk.vignetteOpacity}), transparent 60%),` +
            `linear-gradient(135deg, ${theme.desk.baseColor} 0%, #0b0705 55%, #070504 100%)`,
        }}
      />

      <div
        style={{
          ...paperWrapStyle,
          left: geom.paper.x,
          top: geom.paper.y,
          width: geom.paper.width,
          height: geom.paper.height,
          transform: paperTransform,
        }}
      >
        <div
          style={{
            ...paperShadowStyle,
            borderRadius: theme.paper.borderRadiusPx,
            background: `rgba(0,0,0,${theme.paper.shadowOpacity})`,
            filter: `blur(${theme.paper.shadowBlurPx}px)`,
          }}
        />

        <div
          style={{
            ...paperStyle,
            borderRadius: theme.paper.borderRadiusPx,
            background: `linear-gradient(180deg, ${theme.paper.bgTop}, ${theme.paper.bgBottom})`,
          }}
        >
          <div
            style={{
              ...paperTextureStyle,
              opacity: theme.paper.fiberOpacity,
            }}
          />
          <div
            style={{
              ...paperGrainStyle,
              opacity: theme.paper.grainOpacity,
            }}
          />
          <div
            style={{
              ...paperVignetteStyle,
              opacity: theme.paper.vignetteOpacity,
            }}
          />

          <div
            style={{
              ...paperHeaderStyle,
              padding: `${theme.text.headerTopPadPx}px ${Math.round(theme.text.headerTopPadPx * 1.25)}px ${theme.text.headerBottomPadPx}px`,
              borderBottom: `1px solid ${theme.text.metaDividerColor}`,
              fontFamily: theme.text.metaFontFamily,
              fontSize: theme.text.metaFontSizePx,
              lineHeight: `${theme.text.metaLineHeightPx}px`,
            }}
          >
            <MetaRow label="To:" labelW={theme.text.metaLabelWidthPx} labelColor={theme.text.metaLabelColor} valueColor={theme.text.metaValueColor} gapPx={10} value={s.meta.to ?? ""} />
            <MetaRow label="From:" labelW={theme.text.metaLabelWidthPx} labelColor={theme.text.metaLabelColor} valueColor={theme.text.metaValueColor} gapPx={10} value={s.meta.from ?? ""} />
            <MetaRow label="Date:" labelW={theme.text.metaLabelWidthPx} labelColor={theme.text.metaLabelColor} valueColor={theme.text.metaValueColor} gapPx={10} value={s.meta.date ?? ""} />
            <MetaRow label="Subject:" labelW={theme.text.metaLabelWidthPx} labelColor={theme.text.metaLabelColor} valueColor={theme.text.metaValueColor} gapPx={10} value={s.meta.subject ?? ""} />
          </div>

          <div
            style={{
              ...textAreaStyle,
              left: geom.textArea.x - geom.paper.x,
              top: geom.textArea.y - geom.paper.y,
              width: geom.textArea.width,
              height: geom.textArea.height,
              fontFamily: theme.text.fontFamily,
              fontSize: theme.text.fontSizePx,
              lineHeight: `${theme.text.lineHeightPx}px`,
              letterSpacing: `${theme.text.letterSpacingPx}px`,
              color: theme.text.inkColor,
              opacity: theme.text.inkOpacity,
            }}
          >
            <div
              style={{
                ...inkBleedLayerStyle,
                color: theme.text.inkColor,
                opacity: theme.text.inkBleedOpacity,
                filter: `blur(${theme.text.inkBleedBlurPx}px)`,
                transform: `translateY(${-frac * theme.text.lineHeightPx}px)`,
              }}
            >
              {renderTextLines({
                lines: visibleLines,
                cursorRowInWindow,
                cursorCol,
                showCursor: true,
                cursorWidthPx: Math.max(2, theme.text.charWidthPx * 0.55),
                cursorHeightPx: Math.max(2, theme.text.lineHeightPx * 0.9),
                cursorColor: "rgba(20, 22, 26, 0.25)",
              })}
            </div>

            <div
              style={{
                ...inkMainLayerStyle,
                transform: `translateY(${-frac * theme.text.lineHeightPx}px)`,
              }}
            >
              {renderTextLines({
                lines: visibleLines,
                cursorRowInWindow,
                cursorCol,
                showCursor: true,
                cursorWidthPx: Math.max(2, theme.text.charWidthPx * 0.55),
                cursorHeightPx: Math.max(2, theme.text.lineHeightPx * 0.92),
                cursorColor: "rgba(20, 22, 26, 0.92)",
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          ...typewriterWrapStyle,
          left: geom.typewriter.x,
          top: geom.typewriter.y,
          width: geom.typewriter.width,
          height: geom.typewriter.height,
          transform: writerTransform,
        }}
      >
        <div
          style={{
            ...typewriterBodyStyle,
            borderRadius: theme.typewriter.bodyRadiusPx,
            background:
              `radial-gradient(900px 260px at 30% 20%, rgba(255,255,255,0.10), transparent 55%),` +
              `linear-gradient(180deg, ${theme.typewriter.bodyBgTop} 0%, ${theme.typewriter.bodyBgBottom} 100%)`,
            boxShadow: `0 28px 70px rgba(0,0,0,${theme.typewriter.bodyShadowOpacity})`,
            border: `1px solid ${theme.typewriter.bodyOutline}`,
          }}
        >
          <div
            style={{
              ...typewriterTopPlateStyle,
              left: theme.typewriter.bodySidePadPx,
              right: theme.typewriter.bodySidePadPx,
              top: theme.typewriter.bodyTopPadPx,
              height: theme.typewriter.plateHeightPx,
              borderRadius: theme.typewriter.plateRadiusPx,
            }}
          />

          <div
            style={{
              ...carriageTrackStyle,
              left: theme.typewriter.bodySidePadPx,
              right: theme.typewriter.bodySidePadPx,
              top: theme.typewriter.bodyTopPadPx + theme.typewriter.plateHeightPx + 10,
              height: theme.typewriter.carriage.trackHeightPx,
              borderRadius: theme.typewriter.carriage.trackRadiusPx,
              opacity: 0.9,
            }}
          >
            <div
              style={{
                ...carriageKnobStyle,
                width: theme.typewriter.carriage.knobRadiusPx * 2,
                height: theme.typewriter.carriage.knobRadiusPx * 2,
                borderRadius: theme.typewriter.carriage.knobRadiusPx,
                background: theme.typewriter.carriage.knobColor,
                boxShadow: `0 10px 18px rgba(0,0,0,${theme.typewriter.carriage.knobShadowOpacity})`,
                left: `calc(${carriagePosP * 100}% - ${theme.typewriter.carriage.knobRadiusPx}px)`,
              }}
            />
            <div
              style={{
                ...carriageBarStyle,
                background: theme.typewriter.carriage.carriageColor,
              }}
            />
          </div>

          <div
            style={{
              ...keysWrapStyle,
              left: theme.typewriter.bodySidePadPx,
              right: theme.typewriter.bodySidePadPx,
              top: theme.typewriter.bodyTopPadPx + theme.typewriter.plateHeightPx + 46,
              bottom: 48,
            }}
          >
            {TYPEWRITER_KEYBOARD_ROWS.map((row, ri) => (
              <div key={ri} style={{ ...keysRowStyle, gap: theme.typewriter.keys.gapPx }}>
                {row.map((k) => (
                  <KeyCap
                    key={k.id}
                    id={k.id}
                    label={k.label}
                    shiftedLabel={k.shiftedLabel}
                    w={k.w ?? 1}
                    pressedAt={s.fx.pressedKeys[k.id]}
                    t={t}
                    frames={theme.motion.keyPressFrames}
                    tokens={theme}
                  />
                ))}
              </div>
            ))}
          </div>

          <div style={typewriterBrandStyle}>TOKOVO</div>
        </div>
      </div>
    </div>
  );
};

function MetaRow(props: {
  label: string;
  value: string;
  gapPx: number;
  labelW: number;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <div style={{ display: "flex", gap: props.gapPx, alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ width: props.labelW, color: props.labelColor }}>{props.label}</span>
      <span style={{ flex: 1, color: props.valueColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {props.value}
      </span>
    </div>
  );
}

function renderTextLines(input: {
  lines: string[];
  cursorRowInWindow: number;
  cursorCol: number;
  showCursor: boolean;
  cursorWidthPx: number;
  cursorHeightPx: number;
  cursorColor: string;
}) {
  const { lines, cursorRowInWindow, cursorCol } = input;
  return (
    <>
      {lines.map((line, i) => {
        const isCursorLine = input.showCursor && i === cursorRowInWindow;
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
            <span style={{ ...cursorStyle, width: input.cursorWidthPx, height: input.cursorHeightPx, background: input.cursorColor }} />
            <span>{after || "\u00A0"}</span>
          </div>
        );
      })}
    </>
  );
}

function KeyCap(props: {
  id: TypewriterKeyId;
  label: string;
  shiftedLabel?: string;
  w: number;
  pressedAt: number | undefined;
  t: number;
  frames: number;
  tokens: ReturnType<typeof resolveTypewriterTheme>;
}) {
  const p = hotProgress(props.pressedAt, props.t, props.frames);
  const down = p > 0;
  const tx = down ? 2.2 * p : 0;
  const shadowMult = down ? 0.45 : 1;

  return (
    <div
      style={{
        ...keyStyle,
        flex: props.w,
        borderRadius: props.tokens.typewriter.keys.keyRadiusPx,
        fontSize: props.tokens.typewriter.keys.keyFontSizePx,
        color: props.tokens.typewriter.keys.legendColor,
        border: `1px solid ${props.tokens.typewriter.keys.keyOutline}`,
        boxShadow: `0 ${Math.round(10 * shadowMult)}px ${Math.round(18 * shadowMult)}px rgba(0,0,0,${props.tokens.typewriter.keys.keyShadowOpacity})`,
        background: down
          ? `linear-gradient(180deg, ${props.tokens.typewriter.keys.keyBgDownTop}, ${props.tokens.typewriter.keys.keyBgDownBottom})`
          : `linear-gradient(180deg, ${props.tokens.typewriter.keys.keyBgUpTop}, ${props.tokens.typewriter.keys.keyBgUpBottom})`,
        transform: `translateY(${tx}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, lineHeight: 1 }}>
        {props.shiftedLabel && (
          <div style={{ fontSize: Math.max(10, props.tokens.typewriter.keys.keyFontSizePx - 3), color: props.tokens.typewriter.keys.legendSecondaryColor }}>
            {props.shiftedLabel}
          </div>
        )}
        <div>{props.label}</div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: props.tokens.typewriter.keys.keyRadiusPx,
          background: "radial-gradient(120px 40px at 30% 15%, rgba(255,255,255,0.14), transparent 60%)",
          opacity: down ? 0.4 : 1,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

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
};

const paperWrapStyle: React.CSSProperties = {
  position: "absolute",
  pointerEvents: "none",
};

const paperShadowStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  transform: "translate(0, 14px)",
};

const paperStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
};

const paperHeaderStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
};

const paperTextureStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "repeating-linear-gradient(88deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)",
  mixBlendMode: "multiply",
  pointerEvents: "none",
};

const paperGrainStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "radial-gradient(1px 1px at 20% 30%, rgba(0,0,0,0.9), rgba(0,0,0,0) 70%)," +
    "radial-gradient(1px 1px at 80% 70%, rgba(0,0,0,0.9), rgba(0,0,0,0) 70%)," +
    "radial-gradient(1px 1px at 50% 40%, rgba(0,0,0,0.7), rgba(0,0,0,0) 70%)",
  backgroundSize: "180px 180px",
  mixBlendMode: "multiply",
  pointerEvents: "none",
};

const paperVignetteStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(110% 85% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)",
  mixBlendMode: "multiply",
  pointerEvents: "none",
};

const textAreaStyle: React.CSSProperties = {
  position: "absolute",
  overflow: "hidden",
  textShadow: "0 0.6px 0 rgba(0,0,0,0.06)",
};

const inkBleedLayerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
};

const inkMainLayerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
};

const lineStyle: React.CSSProperties = {
  whiteSpace: "pre",
};

const cursorStyle: React.CSSProperties = {
  display: "inline-block",
  margin: "0 2px",
  verticalAlign: "text-bottom",
};

const typewriterWrapStyle: React.CSSProperties = {
  position: "absolute",
  pointerEvents: "none",
};

const typewriterBodyStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
};

const typewriterTopPlateStyle: React.CSSProperties = {
  position: "absolute",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
};

const keysWrapStyle: React.CSSProperties = {
  position: "absolute",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  alignItems: "stretch",
  justifyContent: "flex-start",
};

const keysRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "stretch",
};

const keyStyle: React.CSSProperties = {
  position: "relative",
  minHeight: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  userSelect: "none",
};

const carriageTrackStyle: React.CSSProperties = {
  position: "absolute",
  background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.12))",
  border: "1px solid rgba(255,255,255,0.06)",
  overflow: "hidden",
};

const carriageBarStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: "50%",
  height: 2,
  transform: "translateY(-50%)",
};

const carriageKnobStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
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

