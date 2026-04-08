import React, { memo } from "react";
import { MediaBubbleBase } from "./shared.js";
import { useTheme } from "../../theme/ThemeContext.js";

export interface DocumentMessageBubbleProps {
  fileName: string;
  fileSize: string;
  fileType?: string;
  pageCount?: number;
  isMe: boolean;
  senderName?: string;
  timestamp?: string;
  read?: boolean;
  platform?: string;
}

export const DocumentMessageBubble = memo(function DocumentMessageBubble({
  fileName,
  fileSize,
  fileType = "pdf",
  pageCount,
  isMe,
  senderName,
  timestamp = "10:42",
  read = false,
}: DocumentMessageBubbleProps) {
  const theme = useTheme();
  const getIconColor = () => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "#F40F02";
    if (type.includes("xls") || type.includes("sheet")) return "#1D6F42";
    if (type.includes("doc") || type.includes("word")) return "#2B579A";
    if (type.includes("ppt") || type.includes("slide")) return "#D24726";
    return theme.colors.timestamp;
  };

  const iconColor = getIconColor();

  return (
    <MediaBubbleBase
      isMe={isMe}
      senderName={senderName}
      timestamp={timestamp}
      read={read}
      minWidth={200}
      maxWidth={280}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "6px 0",
        }}
      >
        <div
          style={{ position: "relative", width: 34, height: 40, flexShrink: 0 }}
        >
          <svg width="34" height="40" viewBox="0 0 34 40" fill="none">
            <path
              d="M4 0H20L34 14V36C34 38.2 32.2 40 30 40H4C1.8 40 0 38.2 0 36V4C0 1.8 1.8 0 4 0Z"
              fill={iconColor}
              fillOpacity="0.15"
            />
            <path d="M20 0V14H34" fill={iconColor} fillOpacity="0.3" />
            <text
              x="50%"
              y="65%"
              textAnchor="middle"
              fill={iconColor}
              fontSize="10"
              fontWeight="bold"
              fontFamily={theme.typography.fontFamily}
              style={{ textTransform: "uppercase" }}
            >
              {fileType.slice(0, 3)}
            </text>
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: theme.typography.messageFontSize,
              color: isMe
                ? theme.colors.sentBubbleText
                : theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {fileName}
          </div>
          <div
            style={{
              fontSize: 13,
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
              marginTop: 1,
            }}
          >
            {pageCount ? `${pageCount} pages • ` : ""}
            {fileSize} • {fileType.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1px solid ${theme.colors.timestamp}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={theme.colors.timestamp}>
            <path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20V18H18V20H6Z" />
          </svg>
        </div>
      </div>
    </MediaBubbleBase>
  );
});
