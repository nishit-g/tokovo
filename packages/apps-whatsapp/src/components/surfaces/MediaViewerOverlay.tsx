import { FileText, MapPin, Pause, Play, X } from "lucide-react";
import {
  Img,
  Loop,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { resolveStaticAssetSrc } from "@tokovo/core";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type { WhatsAppMessage } from "../../types/index.js";

function resolveAsset(source: string | undefined): string | undefined {
  return source
    ? resolveStaticAssetSrc(source, (assetPath) =>
        staticFile(assetPath.replace(/^\//, "")),
      )
    : undefined;
}

function viewerImageSource(message: WhatsAppMessage): string | undefined {
  return resolveAsset(
    message.imageUrl ??
      message.thumbnailUrl ??
      message.gifUrl ??
      message.stickerUrl ??
      message.mapThumbnailUrl,
  );
}

export function MediaViewerOverlay({
  message,
  openedAt,
}: {
  message: WhatsAppMessage;
  openedAt: number;
}) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const { fps } = useVideoConfig();
  const source = viewerImageSource(message);
  const videoSource =
    message.type === "video" ? resolveAsset(message.videoUrl) : undefined;
  const isPlaying = message.media?.playbackState === "playing";
  const playbackProgress = Math.max(
    0,
    Math.min(1, message.media?.playbackProgress ?? 0),
  );
  const progress = Math.round(playbackProgress * 100);
  const trimBefore = Math.round(
    playbackProgress * Math.max(0, message.duration ?? 0) * fps,
  );
  const loopDurationInFrames = Math.max(
    1,
    Math.round(Math.max(1 / fps, message.duration ?? 0) * fps) - trimBefore,
  );

  return (
    <div
      data-anchor="media_viewer"
      role="dialog"
      aria-modal="true"
      aria-label={t("media.viewer")}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        color: theme.colors.mediaViewerText,
        backgroundColor: theme.colors.mediaViewerBackground,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        data-anchor="media_viewer_header"
        style={{
          height: 64,
          padding: "16px 14px 8px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          backgroundColor: theme.colors.mediaViewerControlsBackground,
        }}
      >
        <button
          type="button"
          aria-label={t("action.close")}
          style={{
            padding: 0,
            border: 0,
            color: "inherit",
            background: "transparent",
            font: "inherit",
          }}
        >
          <X size={24} aria-hidden="true" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {message.senderName ?? message.from}
          </div>
          <div
            style={{
              marginTop: 2,
              color: theme.colors.mediaViewerTextMuted,
              fontSize: 11,
            }}
          >
            {message.timestamp}
          </div>
        </div>
      </div>

      <div
        data-anchor="media_viewer_content"
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {videoSource && isPlaying ? (
          <Sequence from={openedAt} layout="none">
            <Loop durationInFrames={loopDurationInFrames}>
              <OffthreadVideo
                key={`${message.id}:${trimBefore}`}
                src={videoSource}
                trimBefore={trimBefore}
                muted
                pauseWhenBuffering
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Loop>
          </Sequence>
        ) : source ? (
          <Img
            src={source}
            alt={message.caption ?? t("media.viewer")}
            pauseWhenLoading
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : message.type === "document" ? (
          <FileText size={76} aria-hidden="true" />
        ) : (
          <MapPin size={76} aria-hidden="true" />
        )}

        {(message.type === "video" || message.type === "gif") && (
          <div
            role="status"
            aria-label={`${t(isPlaying ? "media.playing" : "media.paused")}, ${progress}%`}
            style={{
              position: "absolute",
              width: 58,
              height: 58,
              borderRadius: 29,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.mediaViewerControlsBackground,
            }}
          >
            {isPlaying ? (
              <Pause size={25} aria-hidden="true" />
            ) : (
              <Play size={25} fill="currentColor" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {(message.caption || message.fileName || message.locationName) && (
        <div
          data-anchor="media_viewer_caption"
          style={{
            padding: "12px 16px 24px",
            color: theme.colors.mediaViewerText,
            backgroundColor: theme.colors.mediaViewerControlsBackground,
            fontSize: 14,
            lineHeight: "20px",
            textAlign: "center",
          }}
        >
          {message.caption ?? message.fileName ?? message.locationName}
        </div>
      )}
    </div>
  );
}
