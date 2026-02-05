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

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

const TextContent: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      fontSize: 16,
      lineHeight: "21px",
      color: "var(--wa-text-primary)",
      fontFamily: FONT_FAMILY,
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
    }}
  >
    {text}
  </div>
);

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

const SystemContent: React.FC<SystemContentProps> = ({ text }) => (
  <div
    style={{
      alignSelf: "center",
      backgroundColor: "var(--wa-system-message-bg)",
      borderRadius: 8,
      padding: "6px 12px",
      fontSize: 12,
      color: "var(--wa-system-message-text)",
      marginBottom: 8,
      marginTop: 8,
      textAlign: "center",
      maxWidth: "85%",
      boxShadow: "0 1px 0.5px rgba(11, 20, 26, 0.13)",
    }}
  >
    {text}
  </div>
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
      return <SystemContent text={message.text} />;

    case "deleted":
      return (
        <div
          style={{
            fontSize: 14,
            lineHeight: "19px",
            color: "var(--wa-text-secondary, #667781)",
            fontFamily: FONT_FAMILY,
            fontStyle: "italic",
            opacity: 0.8,
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
