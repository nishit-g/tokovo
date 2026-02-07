import React from "react";

type OverlayVariant =
  | "hook"
  | "caption"
  | "receipt"
  | "reactionGif"
  | "cliffhanger";

type OverlayPlacementPreset =
  | "top"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "center";

type OverlayItem = {
  id: string;
  variant: OverlayVariant;
  lane: string;
  startFrame: number;
  endFrame?: number;
  text?: string;
  mediaSrc?: string;
  preset?: OverlayPlacementPreset;
  xPct?: number;
  yPct?: number;
  intensity?: number;
};

type OverlayState = {
  items: OverlayItem[];
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function getActiveItems(state: OverlayState | undefined, t: number): OverlayItem[] {
  const items = state?.items ?? [];
  return items.filter((it) => t >= it.startFrame && (it.endFrame === undefined || t < it.endFrame));
}

function getPositionStyle(preset: OverlayPlacementPreset | undefined): React.CSSProperties {
  switch (preset) {
    case "topLeft":
      return { top: 72, left: 56, alignItems: "flex-start" };
    case "topRight":
      return { top: 72, right: 56, alignItems: "flex-end" };
    case "bottomLeft":
      return { bottom: 112, left: 56, alignItems: "flex-start" };
    case "bottomRight":
      return { bottom: 112, right: 56, alignItems: "flex-end" };
    case "center":
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)", alignItems: "center" };
    case "bottom":
      return { bottom: 112, left: 0, right: 0, alignItems: "center" };
    case "top":
    default:
      return { top: 72, left: 0, right: 0, alignItems: "center" };
  }
}

function getVariantStyle(variant: OverlayVariant, intensity: number): React.CSSProperties {
  const i = clamp01(intensity);
  switch (variant) {
    case "hook":
      return {
        fontSize: lerp(56, 72, i),
        fontWeight: 900,
        letterSpacing: -1.2,
        lineHeight: 1.05,
        color: "#ffffff",
        textShadow: "0 8px 40px rgba(0,0,0,0.55)",
        maxWidth: 940,
        textAlign: "center",
      };
    case "caption":
      return {
        fontSize: 46,
        fontWeight: 800,
        letterSpacing: -0.5,
        lineHeight: 1.1,
        color: "#ffffff",
        maxWidth: 980,
        textAlign: "center",
        textShadow: "0 6px 26px rgba(0,0,0,0.5)",
      };
    case "receipt":
      return {
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: -0.2,
        lineHeight: 1.1,
        color: "#0a0a0a",
        maxWidth: 720,
        textAlign: "left",
      };
    case "cliffhanger":
      return {
        fontSize: 52,
        fontWeight: 900,
        letterSpacing: -0.8,
        lineHeight: 1.05,
        color: "#ffffff",
        maxWidth: 980,
        textAlign: "center",
        textShadow: "0 10px 50px rgba(0,0,0,0.65)",
      };
    case "reactionGif":
    default:
      return {};
  }
}

function getChipStyle(variant: OverlayVariant): React.CSSProperties {
  if (variant === "receipt") {
    return {
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: 18,
      padding: "16px 18px",
      boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
      border: "1px solid rgba(0,0,0,0.08)",
    };
  }
  if (variant === "caption") {
    return {
      background: "rgba(0,0,0,0.55)",
      borderRadius: 20,
      padding: "18px 22px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.08)",
    };
  }
  return {};
}

export const StoryOverlay: React.FC<{
  world: any;
  t: number;
  width: number;
  height: number;
}> = ({ world, t, width, height }) => {
  const overlayState = (world?.appState?.sys_overlay ?? undefined) as OverlayState | undefined;
  const items = getActiveItems(overlayState, t);
  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width,
        height,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {items.map((it) => {
        const inDur = 10;
        const outDur = 10;
        const inP = easeOutCubic((t - it.startFrame) / inDur);
        const outP =
          it.endFrame !== undefined ? easeOutCubic((it.endFrame - t) / outDur) : 1;
        const opacity = clamp01(Math.min(inP, outP));
        const floatY = (1 - inP) * 14;

        const intensity = typeof it.intensity === "number" ? it.intensity : 0.6;
        const pos = getPositionStyle(it.preset);

        const overridePos: React.CSSProperties =
          typeof it.xPct === "number" || typeof it.yPct === "number"
            ? {
                left: typeof it.xPct === "number" ? `${it.xPct * 100}%` : "50%",
                top: typeof it.yPct === "number" ? `${it.yPct * 100}%` : undefined,
                bottom: typeof it.yPct === "number" ? undefined : pos.bottom,
                right: undefined,
                transform: "translate(-50%, 0)",
                alignItems: "center",
              }
            : {};

        const containerStyle: React.CSSProperties = {
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          ...pos,
          ...overridePos,
          opacity,
          transform:
            typeof pos.transform === "string"
              ? `${pos.transform} translateY(${floatY}px)`
              : `translateY(${floatY}px)`,
        };

        if (it.variant === "reactionGif" && it.mediaSrc) {
          return (
            <div key={it.id} style={containerStyle}>
              <img
                src={it.mediaSrc}
                alt=""
                style={{
                  width: 220,
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 24,
                  boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>
          );
        }

        const chipStyle = getChipStyle(it.variant);
        const textStyle = getVariantStyle(it.variant, intensity);

        return (
          <div key={it.id} style={containerStyle}>
            <div style={chipStyle}>
              <div style={textStyle}>{it.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

