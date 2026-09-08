/**
 * Link Preview Card Component - iOS-style rich link preview
 * Uses iMessage design tokens for spacing/typography and iOS_COLORS for colors
 */

import React from "react";
import { DeterministicImage as Img } from "@tokovo/react";
import { useIMessageTheme } from "../ui/ThemeContext.js";
import { iMessageSpacing, iMessageTypography } from "../config/tokens.js";
import type { IMessageLinkPreview } from "../types/index.js";

interface LinkPreviewCardProps {
  preview: IMessageLinkPreview;
  fromMe?: boolean;
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ preview }) => {
  const theme = useIMessageTheme();
  const { colors } = theme;

  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return preview.domain || url;
    }
  };

  // Color derivations based on sender
  const bgColor = colors.bubble.received;
  const textPrimary = colors.bubble.otherText;
  const textSecondary = colors.bubble.timestamp;

  return (
    <div
      style={{
        borderRadius: iMessageSpacing.bubbleRadius,
        overflow: "hidden",
        backgroundColor: bgColor,
        marginTop: iMessageSpacing.messageGapMinimal,
        width: 260,
        maxWidth: "100%",
        overflowWrap: "anywhere",
      }}
    >
      {/* Thumbnail */}
      {preview.thumbnail && (
        <Img
          src={preview.thumbnail}
          alt={preview.title || "Link preview"}
          style={{
            width: "100%",
            height: 140,
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      {/* Content */}
      <div style={{ padding: iMessageSpacing.bubblePaddingH }}>
        {/* Domain */}
        <div
          style={{
            fontFamily: iMessageTypography.fontFamily,
            fontSize: iMessageTypography.timestamp.fontSize,
            lineHeight: `${iMessageTypography.timestamp.lineHeight}px`,
            letterSpacing: iMessageTypography.timestamp.letterSpacing,
            color: textSecondary,
            textTransform: "uppercase",
            marginBottom: iMessageSpacing.messageGapMinimal,
            display: "flex",
            alignItems: "center",
            gap: iMessageSpacing.messageGapMinimal,
          }}
        >
          {preview.favicon && (
            <Img
              src={preview.favicon}
              alt=""
              style={{
                width: iMessageSpacing.bubblePaddingH,
                height: iMessageSpacing.bubblePaddingH,
                borderRadius: 2,
              }}
            />
          )}
          {preview.domain || extractDomain(preview.url)}
        </div>

        {/* Title */}
        {preview.title && (
          <div
            style={{
              fontFamily: iMessageTypography.fontFamily,
              fontSize: iMessageTypography.listPreview.fontSize,
              fontWeight: iMessageTypography.listTitle.fontWeight,
              lineHeight: `${iMessageTypography.listPreview.lineHeight}px`,
              color: textPrimary,
              marginBottom: iMessageSpacing.messageGapMinimal,
            }}
          >
            {preview.title}
          </div>
        )}

        {/* Description */}
        {preview.description && (
          <div
            style={{
              fontFamily: iMessageTypography.fontFamily,
              fontSize: iMessageTypography.caption.fontSize,
              lineHeight: `${iMessageTypography.caption.lineHeight}px`,
              color: textSecondary,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {preview.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkPreviewCard;
