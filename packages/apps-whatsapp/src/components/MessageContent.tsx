import React from "react";
import { MessageData, LinkPreviewData } from "../types";
import {
  VoiceMessageBubble,
  ImageMessageBubble,
  VideoMessageBubble,
  GifMessageBubble,
  StickerMessageBubble,
  DocumentMessageBubble,
  ContactMessageBubble,
  LocationMessageBubble,
} from "./MediaBubbles";
import { LinkPreview } from "./LinkPreview";
import { DateSeparator } from "./DateSeparator";
import { useTheme } from "../theme/context";
import { CallMessageBubble } from "./bubbles/CallMessageBubble";

const TextContent: React.FC<{ text: string }> = ({ text }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        fontSize: theme.typography.messageFontSize,
        lineHeight: `${theme.typography.messageLineHeight}px`,
        color: "inherit",
        fontFamily: theme.typography.fontFamily,
        wordWrap: "break-word",
        whiteSpace: "pre-wrap",
      }}
    >
      {text}
    </div>
  );
};

const ImageContent: React.FC<{
  url: string;
  caption?: string;
  isMe?: boolean;
  timestamp?: string;
  read?: boolean;
}> = ({ url, caption, isMe = false, timestamp, read }) => (
  <ImageMessageBubble
    imageUrl={url}
    caption={caption}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
  />
);

const VideoContent: React.FC<{
  url?: string;
  thumbnail?: string;
  caption?: string;
  duration?: number;
  isMe?: boolean;
  timestamp?: string;
  read?: boolean;
}> = ({ thumbnail, caption, duration = 0, isMe = false, timestamp, read }) => (
  <VideoMessageBubble
    thumbnailUrl={thumbnail || "https://placehold.co/300x200?text=Video"}
    duration={duration}
    caption={caption}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
  />
);

const VoiceContent: React.FC<{
  duration?: number;
  isMe?: boolean;
  timestamp?: string;
  read?: boolean;
  isPlaying?: boolean;
  playProgress?: number;
}> = ({
  duration = 0,
  isMe = false,
  timestamp,
  read,
  isPlaying,
  playProgress,
}) => (
  <VoiceMessageBubble
    duration={duration}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
    isPlaying={isPlaying}
    playProgress={playProgress}
  />
);

const StickerContent: React.FC<{
  url: string;
  isMe?: boolean;
  timestamp?: string;
  read?: boolean;
}> = ({ url, isMe = false, timestamp, read }) => (
  <StickerMessageBubble
    stickerUrl={url}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
  />
);

const GifContent: React.FC<{
  url: string;
  isMe?: boolean;
  timestamp?: string;
  read?: boolean;
}> = ({ url, isMe = false, timestamp, read }) => (
  <GifMessageBubble
    gifUrl={url}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
  />
);

const DocumentContent: React.FC<{
  fileName: string;
  fileSize: string;
  fileType?: string;
  pageCount?: number;
  isMe?: boolean;
  timestamp?: string;
  read?: boolean;
}> = ({
  fileName,
  fileSize,
  fileType,
  pageCount,
  isMe = false,
  timestamp,
  read,
}) => (
  <DocumentMessageBubble
    fileName={fileName}
    fileSize={fileSize}
    fileType={fileType}
    pageCount={pageCount}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
  />
);

const LinkContent: React.FC<{
  preview: LinkPreviewData;
  text?: string;
  isMe?: boolean;
}> = ({ preview, text, isMe = false }) => (
  <div>
    <LinkPreview preview={preview} isMyMessage={isMe} />
    {text && <TextContent text={text} />}
  </div>
);

interface SystemContentProps {
  text: string;
}

const SystemContent: React.FC<SystemContentProps> = ({ text }) => {
  const theme = useTheme();
  const paddingY = Math.max(4, theme.spacing.messagePaddingVertical - 2);
  const paddingX = Math.max(12, theme.spacing.messagePaddingHorizontal);
  const radius = Math.max(10, theme.spacing.bubbleRadius - 8);
  return (
    <div
      style={{
        alignSelf: "center",
        backgroundColor: theme.colors.systemMessageBg,
        borderRadius: radius,
        padding: `${paddingY}px ${paddingX}px`,
        fontSize: theme.typography.systemMessageFontSize,
        color: theme.colors.systemMessage,
        marginBottom: Math.max(8, theme.spacing.sectionGap - 6),
        marginTop: Math.max(8, theme.spacing.sectionGap - 6),
        textAlign: "center",
        maxWidth: "85%",
        border: `0.5px solid ${theme.colors.systemMessageBorder}`,
        boxShadow: theme.colors.systemMessageShadow,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {text}
    </div>
  );
};

const EncryptionNotice: React.FC<{ text?: string }> = ({ text }) => {
  const theme = useTheme();
  const paddingY = Math.max(8, theme.spacing.messagePaddingVertical);
  const paddingX = Math.max(12, theme.spacing.messagePaddingHorizontal);
  const radius = Math.max(10, theme.spacing.bubbleRadius - 8);
  const message =
    text && text.trim().length > 0
      ? text
      : "Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them.";

  return (
    <div
      style={{
        alignSelf: "center",
        backgroundColor: theme.colors.systemBannerBg,
        borderRadius: radius,
        padding: `${paddingY}px ${paddingX}px`,
        marginBottom: Math.max(10, theme.spacing.sectionGap - 4),
        marginTop: Math.max(10, theme.spacing.sectionGap - 4),
        maxWidth: "88%",
        border: `0.5px solid ${theme.colors.systemBannerBorder}`,
        boxShadow: theme.colors.systemMessageShadow,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.colors.systemBannerIcon}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginTop: 1, flexShrink: 0 }}
        >
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div
          style={{
            fontSize: theme.typography.systemMessageFontSize,
            lineHeight: "18px",
            color: theme.colors.systemBannerText,
          }}
        >
          {message}{" "}
          <span
            style={{
              color: theme.colors.systemBannerLink,
              fontWeight: 600,
            }}
          >
            Learn more
          </span>
        </div>
      </div>
    </div>
  );
};

const CallContent: React.FC<{
  callType?: "voice" | "video";
  duration?: number;
  missed?: boolean;
  isMe?: boolean;
}> = ({ callType, duration, missed, isMe }) => (
  <CallMessageBubble
    callType={callType}
    duration={duration}
    missed={missed}
    isMe={isMe}
  />
);

export interface MessageContentProps {
  message: MessageData;
  isMe?: boolean;
  timestamp?: string;
  read?: boolean;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  message,
  isMe = false,
  timestamp,
  read = false,
}) => {
  const theme = useTheme();
  switch (message.type) {
    case "text":
      return <TextContent text={message.text} />;

    case "image":
      return (
        <ImageContent
          url={message.imageUrl}
          caption={message.caption}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
        />
      );

    case "video":
      return (
        <VideoContent
          url={message.videoUrl}
          thumbnail={message.thumbnailUrl}
          duration={message.duration}
          caption={message.caption}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
        />
      );

    case "voice":
      return (
        <VoiceContent
          duration={message.duration}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
          isPlaying={message.isPlaying}
          playProgress={message.playProgress}
        />
      );

    case "sticker":
      return (
        <StickerContent
          url={message.stickerUrl || ""}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
        />
      );

    case "gif":
      return (
        <GifContent
          url={message.gifUrl || ""}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
        />
      );

    case "document":
      return (
        <DocumentContent
          fileName={message.fileName || "Document"}
          fileSize={message.fileSize || "0 KB"}
          fileType={message.fileType}
          pageCount={message.pageCount}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
        />
      );

    case "contact":
      return (
        <ContactMessageBubble
          contactName={message.contactName || "Contact"}
          contactPhone={message.contactPhone}
          contactAvatarUrl={message.contactAvatarUrl}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
        />
      );

    case "location":
      return (
        <LocationMessageBubble
          latitude={message.latitude || 0}
          longitude={message.longitude || 0}
          locationName={message.locationName}
          locationAddress={message.locationAddress}
          mapThumbnailUrl={message.mapThumbnailUrl}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
        />
      );

    case "link":
      return (
        <LinkContent
          preview={message.linkPreview}
          text={message.text}
          isMe={isMe}
        />
      );

    case "system":
      if (message.systemType === "date_change") {
        return <DateSeparator text={message.text ?? "Today"} />;
      }
      if (message.systemType === "encryption_notice") {
        return <EncryptionNotice text={message.text} />;
      }
      return <SystemContent text={message.text ?? "System update"} />;

    case "call":
      return (
        <CallContent
          callType={message.callType}
          duration={message.duration}
          isMe={isMe}
        />
      );

    case "call_missed":
      return (
        <CallContent
          callType={message.callType}
          missed
          isMe={isMe}
        />
      );

    case "screenshot_alert":
      return <SystemContent text={message.text ?? "Screenshot taken"} />;

    case "deleted":
      return (
        <div
          style={{
            fontSize: 14,
            lineHeight: "19px",
            color: theme.colors.timestamp,
            opacity: 0.8,
            fontFamily: theme.typography.fontFamily,
            fontStyle: "italic",
          }}
        >
          <span style={{ marginRight: 4 }}>🚫</span>
          {message.text || "This message was deleted"}
        </div>
      );

    default: {
      const unknownMessage = message as { text?: string };
      return (
        <TextContent
          text={
            unknownMessage.text && typeof unknownMessage.text === "string"
              ? unknownMessage.text
              : "[Unsupported message type]"
          }
        />
      );
    }
  }
};
