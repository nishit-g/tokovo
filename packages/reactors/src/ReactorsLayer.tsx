import React from "react";
import type {
  ReactionEmotion,
  ReactionPlan,
} from "@tokovo/reactions";
import { renderLive2DAvatar, renderStaticAvatar, getEmotionLabel } from "./avatar-renderers.js";
import { buildReactorFrameState } from "./state.js";
import type {
  ReactorCardState,
  ReactorLayoutPreset,
  ReactorsLayerProps,
} from "./types.js";

const layerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};

function getLayoutStyles(layoutPreset: ReactorLayoutPreset): Array<React.CSSProperties> {
  switch (layoutPreset) {
    case "hero-left":
      return [
        { left: 36, top: 260, width: 240, height: 360 },
        { right: 36, bottom: 280, width: 200, height: 240 },
      ];
    case "hero-right":
      return [
        { right: 36, top: 260, width: 240, height: 360 },
        { left: 36, bottom: 280, width: 200, height: 240 },
      ];
    case "duo-sides":
      return [
        { left: 36, top: 260, width: 210, height: 300 },
        { right: 36, top: 260, width: 210, height: 300 },
      ];
    case "stream-chaos-vertical":
    default:
      return [
        { left: 24, top: 220, width: 220, height: 330 },
        { right: 24, top: 210, width: 220, height: 300 },
        { right: 36, bottom: 260, width: 180, height: 200 },
      ];
  }
}

function getCardStyle(
  card: ReactorCardState,
  scale: number,
): React.CSSProperties {
  const glow = card.isActiveSpeaker
    ? `${card.accentColor}88`
    : "rgba(255,255,255,0.08)";
  const translateY = card.isActiveSpeaker ? -8 : 0;

  return {
    position: "absolute",
    borderRadius: 28,
    border: `1px solid ${glow}`,
    boxShadow: `0 24px 60px ${glow}`,
    background:
      card.backgroundColor ??
      "linear-gradient(180deg, rgba(9,14,25,0.92), rgba(17,24,39,0.96))",
    overflow: "hidden",
    transform: `scale(${scale}) translateY(${translateY}px)`,
    transformOrigin: "center center",
  };
}

export const ReactorsLayer: React.FC<ReactorsLayerProps> = ({
  reactionPlan,
  frame,
  durationInFrames,
  width,
  height,
  config,
}) => {
  const layoutPreset = config?.layoutPreset ?? reactionPlan.formatPreset;
  const scale = config?.cardScale ?? 1;
  const state = buildReactorFrameState(reactionPlan, frame, {
    showCaptions: config?.showCaptions,
    showChrome: config?.showChrome,
  });
  const slots = getLayoutStyles(layoutPreset);
  const enableLive2DPreviewRuntime = config?.enableLive2DPreviewRuntime ?? true;

  return (
    <div style={{ ...layerStyle, width, height, zIndex: 9000 }}>
      {state.cards.slice(0, slots.length).map((card, index) => {
        const slot = slots[index];

        return (
          <div
            key={card.id}
            style={{
              ...slot,
              ...getCardStyle(card, scale),
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  `radial-gradient(circle at top, ${card.accentColor}55, transparent 58%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0))`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  {card.isActiveSpeaker ? "Speaking" : card.state}
                </div>
                {card.avatar.kind === "live2d"
                  ? renderLive2DAvatar(card, enableLive2DPreviewRuntime)
                  : renderStaticAvatar(card)}
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 28, fontWeight: 800 }}>
                  {card.displayName}
                </div>
                {getEmotionLabel(card.emotion) ? (
                  <div
                    style={{
                      marginTop: 8,
                      display: "inline-flex",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      color: "#e2e8f0",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {getEmotionLabel(card.emotion)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      {state.activeCaption ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 148,
            transform: "translateX(-50%)",
            maxWidth: 820,
            padding: "16px 22px",
            borderRadius: 24,
            background: "rgba(5,10,20,0.78)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
            color: "#fff",
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1.1,
            textAlign: "center",
            zIndex: 9100,
          }}
        >
          {state.activeCaption.text}
        </div>
      ) : null}

      {state.chrome.liveBadge ? (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            display: "flex",
            gap: 10,
            alignItems: "center",
            zIndex: 9100,
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(239,68,68,0.96)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.1em",
            }}
          >
            LIVE
          </div>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.86)",
              color: "#e2e8f0",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {state.chrome.viewerCount.toLocaleString()} watching
          </div>
        </div>
      ) : null}

      {state.chrome.cueText ? (
        <div
          style={{
            position: "absolute",
            top: 92,
            right: 28,
            padding: "10px 14px",
            borderRadius: 18,
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            zIndex: 9100,
          }}
        >
          {state.chrome.cueText}
        </div>
      ) : null}

      {config?.showDebugTimeline ? (
        <div
          style={{
            position: "absolute",
            left: 28,
            right: 28,
            bottom: 28,
            height: 20,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            zIndex: 9100,
          }}
        >
          {reactionPlan.segments.map((segment) => {
            const left = (segment.startFrame / durationInFrames) * 100;
            const widthPct = Math.max(
              1,
              ((segment.endFrame - segment.startFrame) / durationInFrames) * 100,
            );
            const speaker = reactionPlan.cast.find(
              (member) => member.id === segment.speakerId,
            );
            return (
              <div
                key={segment.id}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${left}%`,
                  width: `${widthPct}%`,
                  background: speaker?.visualProfile.accentColor ?? "#94a3b8",
                  opacity:
                    frame >= segment.startFrame && frame < segment.endFrame
                      ? 0.95
                      : 0.55,
                }}
                title={`${segment.speakerId} ${segment.startFrame}-${segment.endFrame}`}
              />
            );
          })}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(frame / durationInFrames) * 100}%`,
              width: 3,
              background: "#ffffff",
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
