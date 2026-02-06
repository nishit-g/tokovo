import React from "react";
import { Img, staticFile } from "remotion";
import { whatsappColors } from "./theme.js";

export interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

interface LinkPreviewProps {
  preview: LinkPreviewData;
  isMyMessage?: boolean;
  compact?: boolean;
}

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
export const LinkPreview: React.FC<LinkPreviewProps> = ({
  preview,
  isMyMessage = false,
  compact = false,
}) => {
  const bgColor = isMyMessage
    ? whatsappColors.separatorLight
    : whatsappColors.separatorUltraLight;
  const resolvedImage =
    preview.image && preview.image.startsWith("/")
      ? staticFile(preview.image)
      : preview.image;

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 4,
        backgroundColor: bgColor,
      }}
    >
      {resolvedImage && (
        <Img
          src={resolvedImage}
          style={{
            width: "100%",
            height: compact ? 80 : 120,
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      <div
        style={{
          padding: compact ? "6px 8px" : "8px 10px",
        }}
      >
        {preview.siteName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 3,
            }}
          >
            {preview.favicon && (
              <Img
                src={
                  preview.favicon.startsWith("/")
                    ? staticFile(preview.favicon)
                    : preview.favicon
                }
                alt=""
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                }}
              />
            )}
            <span
              style={{
                fontSize: 10,
                color: whatsappColors.textSecondary,
                fontFamily: FONT_FAMILY,
                textTransform: "uppercase",
                letterSpacing: 0.3,
              }}
            >
              {preview.siteName}
            </span>
          </div>
        )}

        <div
          style={{
            fontSize: compact ? 14 : 16,
            fontWeight: 600,
            color: whatsappColors.textPrimary,
            fontFamily: FONT_FAMILY,
            lineHeight: 1.3,
            marginBottom: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {preview.title}
        </div>

        {preview.description && (
          <div
            style={{
              fontSize: compact ? 12 : 14,
              color: whatsappColors.textSecondary,
              fontFamily: FONT_FAMILY,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {preview.description}
          </div>
        )}

        <div
          style={{
            fontSize: 10,
            color: whatsappColors.primary,
            fontFamily: FONT_FAMILY,
            marginTop: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {(() => {
            try {
              return new URL(preview.url).hostname.replace("www.", "");
            } catch {
              return preview.url;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export const MiniLinkPreview: React.FC<{ url: string }> = ({ url }) => {
  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace("www.", "");
  } catch {
    hostname = url;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 6px",
        backgroundColor: whatsappColors.separatorUltraLight,
        borderRadius: 6,
        marginBottom: 3,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill={whatsappColors.primary}>
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
      </svg>
      <span
        style={{
          fontSize: 12,
          color: whatsappColors.primary,
          fontFamily: FONT_FAMILY,
        }}
      >
        {hostname}
      </span>
    </div>
  );
};

export default LinkPreview;
