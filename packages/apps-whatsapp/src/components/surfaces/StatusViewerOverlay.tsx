import { Heart, MoreVertical, Send, X } from "lucide-react";
import { resolveStaticAssetSrc } from "@tokovo/core";
import { DeterministicImage } from "@tokovo/react";
import {
  Loop,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type {
  WhatsAppStatusUpdate,
  WhatsAppStatusViewerState,
} from "../../types/index.js";
import { formatConversationListTimestamp } from "../../utils/messages.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";

function resolveVideoSource(source: string): string {
  return resolveStaticAssetSrc(source, (assetPath) =>
    staticFile(assetPath.replace(/^\//, "")),
  );
}

export function StatusViewerOverlay({
  statuses,
  viewer,
  baseTime,
  contentInsets,
}: {
  statuses: readonly WhatsAppStatusUpdate[];
  viewer: WhatsAppStatusViewerState;
  baseTime: Date;
  contentInsets: { top: number; bottom: number };
}) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const status = statuses.find((candidate) => candidate.id === viewer.statusId);
  if (!status) {
    throw new Error(
      `WhatsApp status viewer references missing status "${viewer.statusId}"`,
    );
  }
  if (status.authorId !== viewer.authorId) {
    throw new Error(
      `WhatsApp status viewer author mismatch for status "${viewer.statusId}"`,
    );
  }

  const authorStatuses = statuses
    .filter((candidate) => candidate.authorId === status.authorId)
    .sort((left, right) => left.postedAt - right.postedAt);
  const activeIndex = authorStatuses.findIndex(
    (candidate) => candidate.id === status.id,
  );
  const durationInFrames = Math.max(
    1,
    status.media.type === "video"
      ? Math.round(status.media.duration * fps)
      : Math.round(5 * fps),
  );
  const progress = Math.max(
    0,
    Math.min(1, (frame - viewer.openedAt) / durationInFrames),
  );

  return (
    <div
      data-cinematic-subject="status_viewer"
      role="dialog"
      aria-modal="true"
      aria-label={t("status.viewer")}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2100,
        overflow: "hidden",
        color: "#FFFFFF",
        backgroundColor: "#080A0C",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        data-cinematic-subject="status_content"
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      >
        {status.media.type === "text" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              padding: "72px 34px 128px",
              boxSizing: "border-box",
              textAlign: "center",
              color: "#FFFFFF",
              background:
                status.media.backgroundColor ??
                "linear-gradient(145deg, #075E54 0%, #0B8F78 54%, #163B36 100%)",
              fontSize: 31,
              fontWeight: 750,
              lineHeight: 1.24,
              letterSpacing: -0.5,
            }}
          >
            {status.media.text}
          </div>
        ) : status.media.type === "image" ? (
          <DeterministicImage
            src={status.media.src}
            alt={status.media.caption ?? status.authorName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Sequence from={viewer.openedAt} layout="none">
            <Loop durationInFrames={durationInFrames}>
              <OffthreadVideo
                src={resolveVideoSource(status.media.src)}
                muted
                pauseWhenBuffering
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Loop>
          </Sequence>
        )}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,.64) 0%, rgba(0,0,0,.05) 26%, rgba(0,0,0,.02) 62%, rgba(0,0,0,.76) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        data-cinematic-subject="status_progress"
        style={{
          position: "absolute",
          insetInline: 10,
          top: contentInsets.top + 6,
          display: "flex",
          gap: 4,
        }}
      >
        {authorStatuses.map((candidate, index) => (
          <div
            key={candidate.id}
            style={{
              height: 3,
              flex: 1,
              overflow: "hidden",
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,.32)",
            }}
          >
            <div
              style={{
                width: `${
                  index < activeIndex
                    ? 100
                    : index === activeIndex
                      ? Math.round(progress * 100)
                      : 0
                }%`,
                height: "100%",
                backgroundColor: "#FFFFFF",
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          insetInline: 12,
          top: contentInsets.top + 16,
          height: 54,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          type="button"
          aria-label={t("action.close")}
          style={{
            width: 34,
            height: 34,
            padding: 0,
            border: 0,
            display: "grid",
            placeItems: "center",
            color: "inherit",
            background: "transparent",
          }}
        >
          <X size={24} aria-hidden="true" />
        </button>
        <div
          style={{
            width: 36,
            height: 36,
            overflow: "hidden",
            flexShrink: 0,
            border: "1px solid rgba(255,255,255,.65)",
            borderRadius: "50%",
          }}
        >
          <DeterministicImage
            src={resolveAvatarWithFallback(status.avatar, status.authorName)}
            alt={status.authorName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              overflow: "hidden",
              fontSize: 14,
              fontWeight: 700,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textShadow: "0 1px 4px rgba(0,0,0,.4)",
            }}
          >
            {status.authorName}
          </div>
          <div style={{ marginTop: 2, fontSize: 11, opacity: 0.82 }}>
            {formatConversationListTimestamp(status.postedAt, baseTime, locale)}
          </div>
        </div>
        <button
          type="button"
          aria-label={t("action.info")}
          style={{
            padding: 5,
            border: 0,
            color: "inherit",
            background: "transparent",
          }}
        >
          <MoreVertical size={22} aria-hidden="true" />
        </button>
      </div>

      {status.media.type !== "text" && status.media.caption && (
        <div
          style={{
            position: "absolute",
            insetInline: 24,
            bottom: contentInsets.bottom + 78,
            textAlign: "center",
            fontSize: 15,
            lineHeight: "21px",
            textShadow: "0 1px 6px rgba(0,0,0,.72)",
          }}
        >
          {status.media.caption}
        </div>
      )}

      <div
        data-cinematic-subject="status_reply"
        style={{
          position: "absolute",
          insetInline: 14,
          bottom: contentInsets.bottom + 8,
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <div
          role="textbox"
          aria-readonly="true"
          aria-label={t("status.reply")}
          style={{
            minHeight: 44,
            flex: 1,
            display: "flex",
            alignItems: "center",
            paddingInline: 16,
            border: "1px solid rgba(255,255,255,.72)",
            borderRadius: 24,
            color: "rgba(255,255,255,.92)",
            backgroundColor: "rgba(0,0,0,.18)",
            backdropFilter: "blur(10px)",
            fontSize: 14,
          }}
        >
          {t("status.reply")}
        </div>
        <button
          type="button"
          aria-label={t("action.send")}
          style={{
            width: 42,
            height: 42,
            padding: 0,
            border: 0,
            display: "grid",
            placeItems: "center",
            color: "inherit",
            background: "transparent",
          }}
        >
          <Send size={22} aria-hidden="true" />
        </button>
        <Heart size={22} aria-hidden="true" />
      </div>
    </div>
  );
}
