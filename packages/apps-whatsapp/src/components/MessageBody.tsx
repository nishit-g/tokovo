import { memo, type ReactNode } from "react";
import {
  Ban,
  Download,
  FileText,
  MapPin,
  Mic,
  Pause,
  Phone,
  Play,
  User,
  Video,
} from "lucide-react";
import { Img, staticFile } from "remotion";
import { resolveStaticAssetSrc } from "@tokovo/core";
import { useTheme, useWhatsAppLocale } from "../experience/ExperienceContext.js";
import type { ProjectedThreadMessage } from "../thread/projector.js";
import {
  formatWhatsAppDigits,
  formatWhatsAppFileSize,
  formatWhatsAppNumber,
  type WhatsAppLocale,
} from "../localization/index.js";
import { LinkPreview } from "./LinkPreview.js";

export interface MessageBodyProps {
  message: ProjectedThreadMessage;
  isMe: boolean;
  footerReserveWidth?: number;
}

function formatDuration(seconds: number | undefined, locale: WhatsAppLocale): string {
  const safeSeconds = Math.max(0, Math.floor(seconds ?? 0));
  const minutes = Math.floor(safeSeconds / 60);
  return formatWhatsAppDigits(locale, `${minutes}:${String(safeSeconds % 60).padStart(2, "0")}`);
}

function resolveAsset(source: string | undefined): string | undefined {
  return source
    ? resolveStaticAssetSrc(source, (assetPath) => staticFile(assetPath.replace(/^\//, "")))
    : undefined;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const MediaLifecycleOverlay = memo(function MediaLifecycleOverlay({
  message,
}: {
  message: ProjectedThreadMessage;
}) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const media = message.media;
  if (!media || media.transferState === "ready") return null;

  const progress = Math.round(Math.max(0, Math.min(1, media.transferProgress)) * 100);
  const label =
    media.transferState === "downloading"
      ? t("media.progress", { progress })
      : media.transferState === "failed"
        ? t("media.failed")
        : t("media.remote");

  return (
    <div
      role="status"
      aria-label={label}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderRadius: 10,
        color: "#FFFFFF",
        backgroundColor: theme.colors.mediaScrim,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          border: "2px solid rgba(255,255,255,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {media.transferState === "downloading" ? (
          `${progress}%`
        ) : media.transferState === "failed" ? (
          <Ban size={18} aria-hidden="true" />
        ) : (
          <Download size={18} aria-hidden="true" />
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    </div>
  );
});

const TextBody = memo(function TextBody({
  text,
  footerReserveWidth = 0,
}: {
  text: string;
  footerReserveWidth?: number;
}) {
  const theme = useTheme();
  return (
    <div
      style={{
        fontSize: theme.typography.messageFontSize,
        lineHeight: `${theme.typography.messageLineHeight}px`,
        color: "inherit",
        fontFamily: theme.typography.fontFamily,
        overflowWrap: "anywhere",
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
      {footerReserveWidth > 0 && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: footerReserveWidth,
            height: 1,
          }}
        />
      )}
    </div>
  );
});

const MissingMedia = memo(function MissingMedia({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}) {
  const theme = useTheme();
  return (
    <div
      style={{
        width: "100%",
        height: 168,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: theme.colors.timestamp,
        background: `linear-gradient(145deg, ${theme.colors.divider}99, ${theme.colors.background})`,
      }}
    >
      {icon}
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {label}
      </span>
    </div>
  );
});

const Caption = memo(function Caption({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div style={{ padding: "6px 7px 3px" }}>
      <TextBody text={text} />
    </div>
  );
});

const ImageBody = memo(function ImageBody({
  source,
  caption,
}: {
  source?: string;
  caption?: string;
}) {
  const { t } = useWhatsAppLocale();
  const resolved = resolveAsset(source);
  return (
    <div data-anchor="media" style={{ overflow: "hidden", borderRadius: 12 }}>
      {resolved ? (
        <Img
          src={resolved}
          alt={caption ?? t("message.photo")}
          pauseWhenLoading
          style={{
            display: "block",
            width: "100%",
            height: 196,
            objectFit: "cover",
          }}
        />
      ) : (
        <MissingMedia label={t("media.photoUnavailable")} icon={<FileText size={24} />} />
      )}
      <Caption text={caption} />
    </div>
  );
});

const VideoBody = memo(function VideoBody({ message }: { message: ProjectedThreadMessage }) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const resolved = resolveAsset(message.thumbnailUrl);
  const progress = Math.max(0, Math.min(1, message.media?.playbackProgress ?? 0));
  const isPlaying = message.media?.playbackState === "playing";
  return (
    <div data-anchor="media" style={{ overflow: "hidden", borderRadius: 12 }}>
      <div style={{ height: 196, position: "relative", overflow: "hidden" }}>
        {resolved ? (
          <Img
            src={resolved}
            alt={message.caption ?? t("message.video")}
            pauseWhenLoading
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <MissingMedia label={t("media.videoUnavailable")} icon={<Video size={26} />} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              backgroundColor: theme.colors.mediaScrim,
              boxShadow: "0 1px 6px rgba(0,0,0,0.3)",
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={21} fill="currentColor" />}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 7,
            bottom: 7,
            padding: "2px 6px",
            borderRadius: 5,
            color: "#FFFFFF",
            backgroundColor: theme.colors.mediaScrim,
            fontSize: 11,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {formatDuration(message.duration, locale)}
        </div>
        {isPlaying && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 3,
              backgroundColor: "rgba(255,255,255,0.35)",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                backgroundColor: theme.colors.accent,
              }}
            />
          </div>
        )}
      </div>
      <Caption text={message.caption} />
    </div>
  );
});

const GifBody = memo(function GifBody({ source }: { source?: string }) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const resolved = resolveAsset(source);
  return (
    <div
      data-anchor="media"
      style={{ height: 186, position: "relative", overflow: "hidden", borderRadius: 12 }}
    >
      {resolved ? (
        <Img
          src={resolved}
          alt={t("message.gif")}
          pauseWhenLoading
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <MissingMedia label={t("media.gifUnavailable")} icon={<Play size={26} />} />
      )}
      <div
        style={{
          position: "absolute",
          top: 7,
          left: 7,
          padding: "2px 6px",
          borderRadius: 5,
          color: "#FFFFFF",
          backgroundColor: theme.colors.mediaScrim,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.4,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {t("message.gif")}
      </div>
    </div>
  );
});

const StickerBody = memo(function StickerBody({ source }: { source?: string }) {
  const { t } = useWhatsAppLocale();
  const resolved = resolveAsset(source);
  return (
    <div data-anchor="media" style={{ width: 144, height: 144 }}>
      {resolved ? (
        <Img
          src={resolved}
          alt={t("message.unavailable")}
          pauseWhenLoading
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))",
          }}
        />
      ) : (
        <MissingMedia label={t("media.stickerUnavailable")} icon={<FileText size={24} />} />
      )}
    </div>
  );
});

const VoiceBody = memo(function VoiceBody({ message, isMe }: MessageBodyProps) {
  const theme = useTheme();
  const { locale } = useWhatsAppLocale();
  const duration = Math.max(0, message.duration ?? 0);
  const progress = Math.max(0, Math.min(1, message.media?.playbackProgress ?? 0));
  const isPlaying = message.media?.playbackState === "playing";
  const playedBars = Math.floor(progress * 32);
  const seed = hashString(`${message.id}:${duration}`);
  const accent = isMe ? theme.colors.link : theme.colors.accent;

  return (
    <div
      data-anchor="media"
      style={{
        width: "100%",
        minHeight: 52,
        display: "flex",
        alignItems: "center",
        gap: 9,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          backgroundColor: accent,
        }}
      >
        {isPlaying ? (
          <Pause size={17} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            height: 26,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {Array.from({ length: 32 }, (_, index) => {
            const value = ((seed >>> (index % 24)) + index * 37) % 13;
            const height = 5 + value;
            return (
              <div
                key={index}
                style={{
                  width: 2,
                  height,
                  borderRadius: 1,
                  backgroundColor: index < playedBars ? accent : `${theme.colors.timestamp}66`,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: theme.colors.timestamp,
            fontSize: 11,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          <Mic size={11} />
          <span>{formatDuration(isPlaying ? duration * progress : duration, locale)}</span>
        </div>
      </div>
    </div>
  );
});

const DocumentBody = memo(function DocumentBody({ message }: { message: ProjectedThreadMessage }) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const fileType = (message.fileType ?? "file").replace(/^\./, "").toUpperCase();
  const fileSize = formatWhatsAppFileSize(locale, message.fileSize);
  return (
    <div data-anchor="media" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: 10,
          borderRadius: 10,
          backgroundColor: `${theme.colors.divider}66`,
        }}
      >
        <div
          style={{
            width: 38,
            height: 44,
            borderRadius: 7,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: theme.colors.link,
            backgroundColor: theme.colors.background,
          }}
        >
          <FileText size={18} />
          <span style={{ fontSize: 7, fontWeight: 700 }}>{fileType.slice(0, 4)}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {message.fileName ?? t("message.untitledDocument")}
          </div>
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: 3,
              color: theme.colors.timestamp,
              fontSize: 11,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {[
              message.pageCount ? t("message.pages", { count: message.pageCount }) : undefined,
              fileSize,
              fileType,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
        <Download size={18} color={theme.colors.timestamp} />
      </div>
    </div>
  );
});

const ContactBody = memo(function ContactBody({ message }: { message: ProjectedThreadMessage }) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const avatar = resolveAsset(message.contactAvatarUrl);
  return (
    <div data-anchor="media" style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 2px 10px" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.timestamp,
            backgroundColor: theme.colors.divider,
          }}
        >
          {avatar ? (
            <Img
              src={avatar}
              alt=""
              pauseWhenLoading
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <User size={24} />
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {message.contactName ?? t("message.unnamedContact")}
          </div>
          {message.contactPhone && (
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: 2,
                color: theme.colors.timestamp,
                fontSize: 12,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {message.contactPhone}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          borderTop: `1px solid ${theme.colors.divider}`,
          paddingTop: 7,
          color: theme.colors.link,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {t("composer.placeholder")}
      </div>
    </div>
  );
});

const MapPlaceholder = memo(function MapPlaceholder() {
  const theme = useTheme();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: `${theme.colors.divider}AA`,
        backgroundImage: `linear-gradient(32deg, transparent 45%, ${theme.colors.background} 46%, ${theme.colors.background} 52%, transparent 53%), linear-gradient(118deg, transparent 42%, ${theme.colors.background} 43%, ${theme.colors.background} 49%, transparent 50%)`,
        backgroundSize: "74px 74px, 96px 96px",
      }}
    >
      <MapPin
        size={34}
        color="#FF3B30"
        fill="#FF3B30"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -80%)",
        }}
      />
    </div>
  );
});

const LocationBody = memo(function LocationBody({ message }: { message: ProjectedThreadMessage }) {
  const theme = useTheme();
  const map = resolveAsset(message.mapThumbnailUrl);
  return (
    <div data-anchor="media" style={{ width: "100%", overflow: "hidden", borderRadius: 12 }}>
      <div style={{ height: 154, position: "relative" }}>
        {map ? (
          <Img
            src={map}
            alt=""
            pauseWhenLoading
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <MapPlaceholder />
        )}
      </div>
      {(message.locationName || message.locationAddress) && (
        <div style={{ padding: "7px 7px 3px" }}>
          {message.locationName && (
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {message.locationName}
            </div>
          )}
          {message.locationAddress && (
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: 2,
                color: theme.colors.timestamp,
                fontSize: 11,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {message.locationAddress}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

const PollBody = memo(function PollBody({ message }: { message: ProjectedThreadMessage }) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const options = message.options ?? [];
  const totalVotes =
    message.totalVotes ?? options.reduce((sum, option) => sum + (option.votes ?? 0), 0);
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          overflow: "hidden",
          fontSize: 16,
          lineHeight: "21px",
          fontWeight: 600,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {message.pollQuestion ?? t("message.untitledPoll")}
      </div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 9 }}>
        {options.map((option, index) => {
          const votes = option.votes ?? 0;
          const width = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          return (
            <div key={`${option.text}:${index}`}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 14,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                <span
                  style={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.text}
                </span>
                <span style={{ color: theme.colors.timestamp }}>
                  {formatWhatsAppNumber(locale, votes)}
                </span>
              </div>
              <div
                style={{
                  marginTop: 5,
                  height: 4,
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: `${theme.colors.timestamp}33`,
                }}
              >
                <div
                  style={{
                    width: `${width}%`,
                    height: "100%",
                    borderRadius: 2,
                    backgroundColor: theme.colors.accent,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 10,
          color: theme.colors.timestamp,
          fontSize: 11,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {t(totalVotes === 1 ? "message.vote" : "message.votes", {
          count: totalVotes,
        })}
        {message.pollStatus ? ` · ${message.pollStatus}` : ""}
      </div>
    </div>
  );
});

const CallBody = memo(function CallBody({ message, isMe }: MessageBodyProps) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const missed = message.type === "call_missed";
  const isVideo = message.callType === "video";
  const Icon = isVideo ? Video : Phone;
  const title = t(
    missed
      ? isVideo
        ? "message.missedVideoCall"
        : "message.missedVoiceCall"
      : isVideo
        ? "message.videoCall"
        : "message.voiceCall",
  );
  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: missed ? theme.colors.callCardMissed : theme.colors.callCardIcon,
          backgroundColor: isMe
            ? theme.colors.callCardIconBgOutgoing
            : theme.colors.callCardIconBgIncoming,
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, fontFamily: theme.typography.fontFamily }}>
          {title}
        </div>
        <div
          style={{
            marginTop: 2,
            color: theme.colors.callCardSubtext,
            fontSize: 11,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {missed
            ? t("message.callBack")
            : message.duration
              ? formatDuration(message.duration, locale)
              : t("message.callEnded")}
        </div>
      </div>
    </div>
  );
});

const DeletedBody = memo(function DeletedBody({
  deletedForEveryone,
}: {
  deletedForEveryone?: boolean;
}) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: theme.colors.timestamp,
        fontSize: 14,
        fontStyle: "italic",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Ban size={15} />
      <span>{t(deletedForEveryone === false ? "message.deletedByYou" : "message.deleted")}</span>
    </div>
  );
});

export const MessageBody = memo(function MessageBody({
  message,
  isMe,
  footerReserveWidth,
}: MessageBodyProps) {
  let content: ReactNode;
  switch (message.type) {
    case "text":
      content = <TextBody text={message.text ?? ""} footerReserveWidth={footerReserveWidth} />;
      break;
    case "image":
      content = <ImageBody source={message.imageUrl} caption={message.caption} />;
      break;
    case "video":
      content = <VideoBody message={message} />;
      break;
    case "voice":
      content = <VoiceBody message={message} isMe={isMe} />;
      break;
    case "gif":
      content = <GifBody source={message.gifUrl} />;
      break;
    case "sticker":
      content = <StickerBody source={message.stickerUrl} />;
      break;
    case "document":
      content = <DocumentBody message={message} />;
      break;
    case "contact":
      content = <ContactBody message={message} />;
      break;
    case "location":
      content = <LocationBody message={message} />;
      break;
    case "poll":
      content = <PollBody message={message} />;
      break;
    case "link":
      content = (
        <div style={{ width: "100%" }}>
          {message.linkPreview && <LinkPreview preview={message.linkPreview} isMyMessage={isMe} />}
          {message.text && <TextBody text={message.text} />}
        </div>
      );
      break;
    case "call":
    case "call_missed":
      content = <CallBody message={message} isMe={isMe} />;
      break;
    case "deleted":
      content = <DeletedBody deletedForEveryone={message.deletedForEveryone} />;
      break;
    case "system":
    case "screenshot_alert":
      return null;
  }

  if (!message.media) return content;
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {content}
      <MediaLifecycleOverlay message={message} />
    </div>
  );
});
