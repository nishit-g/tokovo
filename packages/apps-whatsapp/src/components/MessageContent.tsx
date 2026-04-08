import React from "react";
import { LinkPreviewData, MessageData } from "../types/index.js";
import {
  ContactMessageBubble,
  DocumentMessageBubble,
  GifMessageBubble,
  ImageMessageBubble,
  LocationMessageBubble,
  StickerMessageBubble,
  VideoMessageBubble,
  VoiceMessageBubble,
} from "./MediaBubbles.js";
import { LinkPreview } from "./LinkPreview.js";
import { DateSeparator } from "./DateSeparator.js";
import { useTheme } from "../theme/ThemeContext.js";
import { CallMessageBubble } from "./bubbles/CallMessageBubble.js";

type DeliveryStatus = "sending" | "sent" | "delivered" | "read";

interface TimingProps {
  messageAt?: number;
  deliveredAt?: number;
  readAt?: number;
  status?: DeliveryStatus;
  starred?: boolean;
}

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

const ImageContent: React.FC<
  {
    url: string;
    caption?: string;
    isMe?: boolean;
    timestamp?: string;
    read?: boolean;
  } & TimingProps
> = ({
  url,
  caption,
  isMe = false,
  timestamp,
  read,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred,
}) => (
  <ImageMessageBubble
    imageUrl={url}
    caption={caption}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
    messageAt={messageAt}
    deliveredAt={deliveredAt}
    readAt={readAt}
    status={status}
    starred={starred}
  />
);

const VideoContent: React.FC<
  {
    url?: string;
    thumbnail?: string;
    caption?: string;
    duration?: number;
    isMe?: boolean;
    timestamp?: string;
    read?: boolean;
  } & TimingProps
> = ({
  thumbnail,
  caption,
  duration = 0,
  isMe = false,
  timestamp,
  read,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred,
}) => (
  <VideoMessageBubble
    thumbnailUrl={thumbnail || "https://placehold.co/300x200?text=Video"}
    duration={duration}
    caption={caption}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
    messageAt={messageAt}
    deliveredAt={deliveredAt}
    readAt={readAt}
    status={status}
    starred={starred}
  />
);

const VoiceContent: React.FC<
  {
    duration?: number;
    isMe?: boolean;
    timestamp?: string;
    read?: boolean;
    isPlaying?: boolean;
    playProgress?: number;
  } & TimingProps
> = ({
  duration = 0,
  isMe = false,
  timestamp,
  read,
  isPlaying,
  playProgress,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred,
}) => (
  <VoiceMessageBubble
    duration={duration}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
    isPlaying={isPlaying}
    playProgress={playProgress}
    messageAt={messageAt}
    deliveredAt={deliveredAt}
    readAt={readAt}
    status={status}
    starred={starred}
  />
);

const StickerContent: React.FC<
  {
    url: string;
    isMe?: boolean;
    timestamp?: string;
    read?: boolean;
  } & TimingProps
> = ({
  url,
  isMe = false,
  timestamp,
  read,
  messageAt,
  deliveredAt,
  readAt,
  status,
}) => (
  <StickerMessageBubble
    stickerUrl={url}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
    messageAt={messageAt}
    deliveredAt={deliveredAt}
    readAt={readAt}
    status={status}
  />
);

const GifContent: React.FC<
  {
    url: string;
    isMe?: boolean;
    timestamp?: string;
    read?: boolean;
  } & TimingProps
> = ({
  url,
  isMe = false,
  timestamp,
  read,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred,
}) => (
  <GifMessageBubble
    gifUrl={url}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
    messageAt={messageAt}
    deliveredAt={deliveredAt}
    readAt={readAt}
    status={status}
    starred={starred}
  />
);

const DocumentContent: React.FC<
  {
    fileName: string;
    fileSize: string;
    fileType?: string;
    pageCount?: number;
    isMe?: boolean;
    timestamp?: string;
    read?: boolean;
  } & TimingProps
> = ({
  fileName,
  fileSize,
  fileType,
  pageCount,
  isMe = false,
  timestamp,
  read,
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred,
}) => (
  <DocumentMessageBubble
    fileName={fileName}
    fileSize={fileSize}
    fileType={fileType}
    pageCount={pageCount}
    isMe={isMe}
    timestamp={timestamp}
    read={read}
    messageAt={messageAt}
    deliveredAt={deliveredAt}
    readAt={readAt}
    status={status}
    starred={starred}
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

const SystemContent: React.FC<{ text: string }> = ({ text }) => {
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

const UnreadDivider: React.FC<{ text?: string }> = ({
  text = "Unread messages",
}) => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        margin: `${Math.max(8, theme.spacing.sectionGap - 6)}px 0`,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: `${theme.colors.divider}99`,
        }}
      />
      <div
        style={{
          fontSize: theme.typography.systemMessageFontSize,
          fontWeight: 600,
          color: theme.colors.systemMessage,
          backgroundColor: theme.colors.systemMessageBg,
          border: `0.5px solid ${theme.colors.systemMessageBorder}`,
          borderRadius: Math.max(12, theme.spacing.bubbleRadius - 6),
          padding: "4px 12px",
          boxShadow: theme.colors.systemMessageShadow,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {text}
      </div>
      <div
        style={{
          flex: 1,
          height: 1,
          backgroundColor: `${theme.colors.divider}99`,
        }}
      />
    </div>
  );
};

const DisappearingMessagesBanner: React.FC<{ text?: string }> = ({
  text = "Messages disappear after 24 hours in this chat.",
}) => {
  const theme = useTheme();
  return (
    <div
      style={{
        alignSelf: "center",
        backgroundColor: theme.colors.systemBannerBg,
        color: theme.colors.systemBannerText,
        border: `0.5px solid ${theme.colors.systemBannerBorder}`,
        borderRadius: Math.max(12, theme.spacing.bubbleRadius - 6),
        padding: "7px 12px",
        margin: `${Math.max(8, theme.spacing.sectionGap - 8)}px 0`,
        fontSize: theme.typography.systemMessageFontSize,
        lineHeight: "18px",
        maxWidth: "88%",
        textAlign: "center",
        fontFamily: theme.typography.fontFamily,
        boxShadow: theme.colors.systemMessageShadow,
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

const PollContent: React.FC<{
  question: string;
  options: Array<{ text: string; votes?: number }>;
  totalVotes?: number;
  pollStatus?: string;
}> = ({ question, options, totalVotes, pollStatus }) => {
  const theme = useTheme();
  const maxVotes = Math.max(1, ...options.map((option) => option.votes ?? 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontSize: theme.typography.messageFontSize,
          lineHeight: `${theme.typography.messageLineHeight}px`,
          color: "inherit",
          fontFamily: theme.typography.fontFamily,
          fontWeight: 600,
        }}
      >
        {question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((option, index) => {
          const votes = option.votes ?? 0;
          const width = Math.max(8, (votes / maxVotes) * 100);
          return (
            <div
              key={`${option.text}_${index}`}
              style={{
                position: "relative",
                borderRadius: Math.max(12, theme.spacing.bubbleRadius - 6),
                border: `1px solid ${theme.colors.divider}`,
                overflow: "hidden",
                backgroundColor: "rgba(255,255,255,0.32)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${width}%`,
                  background:
                    "linear-gradient(90deg, rgba(37,211,102,0.18), rgba(37,211,102,0.08))",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 12px",
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.messageFontSize - 1,
                    color: "inherit",
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  {option.text}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.timestampFontSize + 1,
                    color: theme.colors.timestamp,
                    fontFamily: theme.typography.fontFamilyMono,
                  }}
                >
                  {votes}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          fontSize: theme.typography.timestampFontSize + 1,
          color: theme.colors.timestamp,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        <span>{totalVotes ?? 0} votes</span>
        <span>{pollStatus ?? "Poll"}</span>
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

export interface MessageContentProps extends TimingProps {
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
  messageAt,
  deliveredAt,
  readAt,
  status,
  starred = false,
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
          messageAt={messageAt}
          deliveredAt={deliveredAt}
          readAt={readAt}
          status={status}
          starred={starred}
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
          messageAt={messageAt}
          deliveredAt={deliveredAt}
          readAt={readAt}
          status={status}
          starred={starred}
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
          messageAt={messageAt}
          deliveredAt={deliveredAt}
          readAt={readAt}
          status={status}
          starred={starred}
        />
      );

    case "poll":
      return (
        <PollContent
          question={message.pollQuestion}
          options={message.options}
          totalVotes={message.totalVotes}
          pollStatus={message.pollStatus}
        />
      );

    case "sticker":
      return (
        <StickerContent
          url={message.stickerUrl || ""}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
          messageAt={messageAt}
          deliveredAt={deliveredAt}
          readAt={readAt}
          status={status}
        />
      );

    case "gif":
      return (
        <GifContent
          url={message.gifUrl || ""}
          isMe={isMe}
          timestamp={timestamp}
          read={read}
          messageAt={messageAt}
          deliveredAt={deliveredAt}
          readAt={readAt}
          status={status}
          starred={starred}
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
          messageAt={messageAt}
          deliveredAt={deliveredAt}
          readAt={readAt}
          status={status}
          starred={starred}
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
          messageAt={messageAt}
          deliveredAt={deliveredAt}
          readAt={readAt}
          status={status}
          starred={starred}
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
          messageAt={messageAt}
          deliveredAt={deliveredAt}
          readAt={readAt}
          status={status}
          starred={starred}
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
      if (message.systemType === "unread_divider") {
        return <UnreadDivider text={message.text ?? "Unread messages"} />;
      }
      if (message.systemType === "disappearing_messages") {
        return (
          <DisappearingMessagesBanner
            text={message.text ?? "Messages disappear after 24 hours in this chat."}
          />
        );
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
