import React, { useEffect, useMemo, useState } from "react";
import type { ReactionEmotion } from "@tokovo/reactions";
import { Live2DPreviewCanvas } from "./Live2DPreviewCanvas.js";
import type { PngtuberMouthShape, ReactorCardState } from "./types.js";

export function getEmotionLabel(emotion: ReactionEmotion | null): string | null {
  if (!emotion || emotion === "neutral") {
    return null;
  }
  return emotion.toUpperCase();
}

function getLive2DModelLabel(modelJsonSrc: string): string {
  const normalizedSrc = modelJsonSrc.replace(/^\/static-[^/]+/, "");
  const parts = normalizedSrc.split("/").filter(Boolean);
  return parts.slice(Math.max(parts.length - 2, 0)).join(" / ") || modelJsonSrc;
}

interface PngtuberMouthTrackCue {
  startFrame: number;
  endFrame: number;
  shape: PngtuberMouthShape;
}

interface PngtuberMouthTrack {
  version: number;
  durationFrames?: number;
  cues: PngtuberMouthTrackCue[];
}

function getPngtuberTrackLabel(trackSrc: string): string {
  const normalizedSrc = trackSrc.replace(/^\/static-[^/]+/, "");
  const parts = normalizedSrc.split("/").filter(Boolean);
  return parts.slice(Math.max(parts.length - 2, 0)).join(" / ") || trackSrc;
}

function usePngtuberMouthTrack(trackSrc?: string) {
  const [track, setTrack] = useState<PngtuberMouthTrack | null>(null);

  useEffect(() => {
    if (!trackSrc) {
      setTrack(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(trackSrc);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = (await response.json()) as PngtuberMouthTrack;
        if (!cancelled) {
          setTrack(json);
        }
      } catch {
        if (!cancelled) {
          setTrack(null);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [trackSrc]);

  return track;
}

function resolveTrackedMouthShape(
  track: PngtuberMouthTrack | null,
  playbackFrame: number,
  fallbackShape: PngtuberMouthShape,
): PngtuberMouthShape {
  if (!track?.cues?.length) {
    return fallbackShape;
  }

  const maxEndFrame = track.durationFrames
    ?? Math.max(...track.cues.map((cue) => cue.endFrame), 1);
  const loopFrame = maxEndFrame > 0 ? playbackFrame % maxEndFrame : playbackFrame;
  const cue = track.cues.find(
    (entry) => loopFrame >= entry.startFrame && loopFrame < entry.endFrame,
  );

  return cue?.shape ?? fallbackShape;
}

function PngtuberMotionVideoAvatar({ card }: { card: ReactorCardState }) {
  if (card.avatar.kind !== "pngtuber" || card.avatar.mode !== "motion-video") {
    return null;
  }

  const avatar = card.avatar;
  const track = usePngtuberMouthTrack(avatar.mouthTrackSrc);
  const trackedShape = useMemo(
    () => resolveTrackedMouthShape(track, avatar.playbackFrame, avatar.mouthShape),
    [avatar.mouthShape, avatar.playbackFrame, track],
  );
  const mouthSprite =
    avatar.mouthSprites?.[trackedShape]
    ?? avatar.mouthSprites?.half
    ?? avatar.mouthSprites?.open
    ?? avatar.mouthSprites?.closed;
  const aura = card.isActiveSpeaker ? `${card.accentColor}aa` : `${card.accentColor}66`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: 24,
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.16), transparent 45%), linear-gradient(180deg, rgba(8,13,22,0.98), rgba(18,26,42,0.98))",
      }}
    >
      {avatar.videoSrc ? (
        <video
          src={avatar.videoSrc}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.46,
            filter: "saturate(1.15) contrast(1.08) blur(0px)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 12%, rgba(255,255,255,0.14), transparent 36%), linear-gradient(180deg, rgba(5,10,20,0.22), rgba(5,10,20,0.58))",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "4% 6% 5%",
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 36px ${aura}`,
        }}
      >
        {avatar.activeAssetSrc ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `center / cover no-repeat url(${avatar.activeAssetSrc})`,
              transform: `scale(${avatar.pulseScale * 1.02}) translateY(${card.isActiveSpeaker ? "-1.6%" : "0%"})`,
              transformOrigin: "center center",
              filter: "contrast(1.03) saturate(1.06)",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0)), linear-gradient(180deg, rgba(5,10,20,0), rgba(5,10,20,0.36))",
          }}
        />
        {mouthSprite ? (
          <img
            src={mouthSprite}
            alt={`${trackedShape} mouth`}
            style={{
              position: "absolute",
              left: `${avatar.mouthAnchor.x * 100}%`,
              top: `${avatar.mouthAnchor.y * 100}%`,
              width: `${18 * avatar.mouthAnchor.scale}%`,
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.38))",
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            background: "rgba(5,10,20,0.76)",
            color: "#f8fafc",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Motion Video
        </div>
        <div
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            background: card.isActiveSpeaker ? `${card.accentColor}cc` : "rgba(255,255,255,0.12)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Mouth {trackedShape}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          display: "grid",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "flex-end",
            height: 26,
          }}
        >
          {Array.from({ length: 8 }).map((_, index) => {
            const activity = card.isActiveSpeaker
              ? 0.32 + ((avatar.playbackFrame + index * 3) % 10) / 10
              : 0.18 + (index % 3) * 0.05;
            return (
              <div
                key={index}
                style={{
                  width: 8,
                  height: `${Math.max(18, activity * 100)}%`,
                  borderRadius: 999,
                  background: `linear-gradient(180deg, ${card.accentColor}, rgba(255,255,255,0.92))`,
                  opacity: 0.82,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 16,
            background: "rgba(5,10,20,0.74)",
            color: "#cbd5e1",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {avatar.mouthTrackSrc
            ? `Track: ${getPngtuberTrackLabel(avatar.mouthTrackSrc)}`
            : "Track: fallback mouth cadence"}
        </div>
      </div>
    </div>
  );
}

export function renderStaticAvatar(card: ReactorCardState): React.ReactNode {
  const imageAvatar = card.avatar.kind === "image" ? card.avatar : null;
  const pngAvatar = card.avatar.kind === "pngtuber" ? card.avatar : null;

  if (pngAvatar?.mode === "motion-video") {
    return <PngtuberMotionVideoAvatar card={card} />;
  }

  const activeAssetSrc = pngAvatar?.activeAssetSrc ?? imageAvatar?.activeAssetSrc;
  const scale = pngAvatar?.pulseScale ?? 1;
  const cropMode = imageAvatar?.cropMode ?? "cover";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: 24,
        overflow: "hidden",
        background: activeAssetSrc
          ? "rgba(15,23,42,0.82)"
          : `linear-gradient(135deg, ${card.accentColor}, rgba(255,255,255,0.18))`,
      }}
    >
      {activeAssetSrc ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            background: `center / ${cropMode} no-repeat url(${activeAssetSrc})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0)), linear-gradient(180deg, rgba(2,6,23,0), rgba(2,6,23,0.48))",
        }}
      />
      {pngAvatar ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(5,10,20,0.72)",
              color: "#e2e8f0",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            PNGTUBER {pngAvatar.frameKey}
          </div>
          <div
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              bottom: 14,
              display: "flex",
              gap: 6,
              alignItems: "flex-end",
              height: 26,
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => {
              const activity = card.isActiveSpeaker
                ? 0.36 + ((index + Math.round(scale * 10)) % 5) * 0.1
                : 0.2 + (index % 2) * 0.06;
              return (
                <div
                  key={index}
                  style={{
                    width: 7,
                    height: `${Math.max(18, activity * 100)}%`,
                    borderRadius: 999,
                    background: `linear-gradient(180deg, ${card.accentColor}, rgba(255,255,255,0.92))`,
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function renderLive2DAvatar(
  card: ReactorCardState,
  enablePreviewRuntime: boolean,
): React.ReactNode {
  if (card.avatar.kind !== "live2d") {
    return null;
  }

  const avatar = card.avatar;
  const runtimeState = avatar.runtimeState;
  const posterTransform = `translate(${avatar.offsetX + runtimeState.swayX}px, ${avatar.offsetY + runtimeState.bobY}px) scale(${avatar.scale + runtimeState.focusEnergy * 0.03})`;
  const mouthScaleY = 0.35 + runtimeState.mouthOpen;
  const eyeScaleY = Math.max(0.08, 1 - runtimeState.blink * 0.92);
  const focusGlow = `${card.accentColor}${Math.round(
    80 + runtimeState.focusEnergy * 100,
  )
    .toString(16)
    .padStart(2, "0")}`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: 24,
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.18), transparent 55%), linear-gradient(180deg, rgba(10,14,25,0.96), rgba(19,28,49,0.96))",
      }}
    >
      {avatar.posterSrc ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `center / cover no-repeat url(${avatar.posterSrc})`,
            opacity: enablePreviewRuntime ? 0.56 : 0.72,
            transform: posterTransform,
            transformOrigin: "center center",
            filter: enablePreviewRuntime
              ? `saturate(${1 + runtimeState.focusEnergy * 0.2}) contrast(1.04)`
              : "none",
          }}
        />
      ) : null}
      {enablePreviewRuntime ? (
        <Live2DPreviewCanvas card={card} enabled={enablePreviewRuntime} />
      ) : null}
      {!enablePreviewRuntime ? (
        <>
          <div
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: 22,
              border: `1px solid ${focusGlow}`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 0 36px ${focusGlow}`,
              opacity: 0.78,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "18% 18% 20% 18%",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "22%",
                top: "34%",
                width: 28,
                height: 6,
                borderRadius: 999,
                background: "rgba(15,23,42,0.72)",
                transform: `scaleY(${eyeScaleY})`,
                transformOrigin: "center center",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "22%",
                top: "34%",
                width: 28,
                height: 6,
                borderRadius: 999,
                background: "rgba(15,23,42,0.72)",
                transform: `scaleY(${eyeScaleY})`,
                transformOrigin: "center center",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "18%",
                width: 48,
                height: 12,
                borderRadius: 999,
                background: `linear-gradient(180deg, ${card.accentColor}, rgba(255,255,255,0.92))`,
                transform: `translateX(-50%) scaleY(${mouthScaleY})`,
                transformOrigin: "center center",
                boxShadow: `0 0 18px ${focusGlow}`,
                opacity: 0.92,
              }}
            />
          </div>
        </>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.05), rgba(2,6,23,0.68))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            background: "rgba(15,23,42,0.82)",
            color: "#f8fafc",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Live2D {avatar.cubismVersion}
        </div>
        <div
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            background: enablePreviewRuntime
              ? `${card.accentColor}bb`
              : "rgba(148,163,184,0.72)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {enablePreviewRuntime ? "Preview Runtime" : "Render Fallback"}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          display: "grid",
          gap: 8,
        }}
      >
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 16,
            background: "rgba(5,10,20,0.75)",
            color: "#cbd5e1",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {getLive2DModelLabel(avatar.modelJsonSrc)}
        </div>
        {enablePreviewRuntime ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {avatar.motion ? (
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Motion: {avatar.motion}
              </div>
            ) : null}
            {avatar.expression ? (
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Expression: {avatar.expression}
              </div>
            ) : null}
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Mouth: {avatar.runtimeState.mouthOpen.toFixed(2)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
