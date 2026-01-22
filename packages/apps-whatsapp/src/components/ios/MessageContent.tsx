import React from "react";
import { MessageData, LinkPreviewData } from "../../types";
import {
  VoiceMessageBubble,
  ImageMessageBubble,
  VideoMessageBubble,
} from "../MediaBubbles";
import { LinkPreview } from "../LinkPreview";

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

const TextContent: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      fontSize: 16,
      lineHeight: "21px",
      color: "var(--app-wa-bubble-text)",
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

const SystemContent: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      alignSelf: "center",
      backgroundColor: "var(--app-wa-header-bg)",
      borderRadius: 8,
      padding: "4px 8px",
      fontSize: 12,
      color: "var(--app-wa-bubble-timestamp)",
      marginBottom: 8,
      marginTop: 8,
      textAlign: "center",
      maxWidth: "80%",
      boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
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

    case "link":
      return (
        <LinkContent
          preview={message.linkPreview}
          text={message.text}
          isMe={isMe}
        />
      );

    case "system":
      return <SystemContent text={message.text} />;

    default:
      return (
        <TextContent text={message.text || "[Unsupported message type]"} />
      );
  }
};
