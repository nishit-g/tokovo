import React from "react";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, LIIcon, ReactionStack, ActionBar } from "./components.js";
import type { LIReactionType } from "../types/index.js";

export interface PostCardProps {
  authorName: string;
  authorHeadline?: string;
  authorAvatar?: string;
  timeAgo?: string;
  content: string;
  image?: string;
  linkPreview?: {
    url: string;
    title: string;
    domain: string;
    image?: string;
  };
  reactions?: Partial<Record<LIReactionType, number>>;
  commentCount?: number;
  repostCount?: number;
  isLiked?: boolean;
  showFollowButton?: boolean;
  commentPreview?: Array<{ authorName: string; text: string }>;
}

const CONTENT_PREVIEW_LIMIT = 220;

export const PostCard: React.FC<PostCardProps> = ({
  authorName,
  authorHeadline,
  authorAvatar,
  timeAgo = "Now",
  content,
  image,
  linkPreview,
  reactions = {},
  commentCount = 0,
  repostCount = 0,
  isLiked = false,
  showFollowButton = false,
  commentPreview = [],
}) => {
  const theme = useLinkedInTheme();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const totalReactions = Object.values(reactions).reduce((sum, value) => sum + (value ?? 0), 0);
  const activeReactions = (Object.keys(reactions) as LIReactionType[])
    .filter((reaction) => (reactions[reaction] ?? 0) > 0)
    .sort((a, b) => (reactions[b] ?? 0) - (reactions[a] ?? 0));
  const needsTruncation = content.length > CONTENT_PREVIEW_LIMIT;
  const displayContent = needsTruncation && !isExpanded
    ? `${content.slice(0, CONTENT_PREVIEW_LIMIT).trimEnd()}…`
    : content;

  return (
    <article
      style={{
        background: theme.colors.surface,
        borderRadius: 0,
        boxShadow: "none",
        borderTop: `1px solid ${theme.colors.border}`,
        borderBottom: `1px solid ${theme.colors.border}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: theme.spacing.cardPadding,
          display: "flex",
          gap: theme.spacing.avatarGap,
          alignItems: "flex-start",
        }}
      >
        <LIAvatar size="lg" src={authorAvatar} name={authorName} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: theme.spacing.sm,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.xs,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.headline.fontSize,
                    fontWeight: theme.typography.headline.fontWeight,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {authorName}
                </span>
                {showFollowButton ? (
                  <>
                    <span style={{ color: theme.colors.textTertiary }}>•</span>
                    <span
                      style={{
                        fontSize: theme.typography.captionSemibold.fontSize,
                        fontWeight: theme.typography.captionSemibold.fontWeight,
                        color: theme.colors.accent,
                      }}
                    >
                      Follow
                    </span>
                  </>
                ) : null}
              </div>
              {authorHeadline ? (
                <div
                  style={{
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.textSecondary,
                    marginTop: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {authorHeadline}
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.xs,
                  marginTop: 4,
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.textTertiary,
                }}
              >
                <span>{timeAgo}</span>
                <span>•</span>
                <GlobeIcon size={12} color={theme.colors.textTertiary} />
              </div>
            </div>
            <LIIcon name="more" size={20} color={theme.colors.textSecondary} />
          </div>

          <div
            style={{
              marginTop: theme.spacing.md,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              color: theme.colors.textPrimary,
              whiteSpace: "pre-wrap",
            }}
          >
            {renderLinkedInText(displayContent, theme.colors.accent)}
            {needsTruncation && !isExpanded ? (
              <span
                onClick={() => setIsExpanded(true)}
                style={{
                  color: theme.colors.textSecondary,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {" "}see more
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {image ? (
        <div
          style={{
            width: "100%",
            height: theme.spacing.postMediaHeight,
            background: `url(${image}) center/cover`,
            backgroundColor: theme.colors.skeleton,
          }}
        />
      ) : null}

      {linkPreview ? (
        <div
          style={{
            margin: `0 ${theme.spacing.cardPadding}px ${theme.spacing.cardPadding}px`,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.md,
            overflow: "hidden",
            background: theme.colors.surfaceHover,
          }}
        >
          {linkPreview.image ? (
            <div
              style={{
                width: "100%",
                height: 140,
                background: `url(${linkPreview.image}) center/cover`,
                backgroundColor: theme.colors.skeleton,
              }}
            />
          ) : null}
          <div style={{ padding: theme.spacing.md }}>
            <div
              style={{
                fontSize: theme.typography.headline.fontSize,
                fontWeight: theme.typography.headline.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              {linkPreview.title}
            </div>
            <div
              style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.textSecondary,
                marginTop: 4,
              }}
            >
              {linkPreview.domain}
            </div>
          </div>
        </div>
      ) : null}

      {(totalReactions > 0 || commentCount > 0 || repostCount > 0) ? (
        <div
          style={{
            padding: `0 ${theme.spacing.cardPadding}px ${theme.spacing.sm}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: theme.spacing.sm,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.xs,
              color: theme.colors.textSecondary,
              fontSize: theme.typography.caption.fontSize,
            }}
          >
            {activeReactions.length > 0 ? <ReactionStack reactions={activeReactions} size={16} /> : null}
            {totalReactions > 0 ? <span>{formatCompact(totalReactions)}</span> : null}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.md,
              color: theme.colors.textSecondary,
              fontSize: theme.typography.caption.fontSize,
            }}
          >
            {commentCount > 0 ? <span>{formatCompact(commentCount)} comments</span> : null}
            {repostCount > 0 ? <span>{formatCompact(repostCount)} reposts</span> : null}
          </div>
        </div>
      ) : null}

      {commentPreview.length > 0 ? (
        <div
          style={{
            padding: `0 ${theme.spacing.cardPadding}px ${theme.spacing.sm}px`,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {commentCount > commentPreview.length ? (
            <div
              style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.textSecondary,
                fontWeight: 600,
              }}
            >
              View all {formatCompact(commentCount)} comments
            </div>
          ) : null}
          {commentPreview.map((comment, index) => (
            <div
              key={`${comment.authorName}-${index}`}
              style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.textSecondary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>{comment.authorName}</span>{" "}
              {comment.text}
            </div>
          ))}
        </div>
      ) : null}

      <ActionBar
        likeCount={reactions.like ?? 0}
        commentCount={commentCount}
        repostCount={repostCount}
        isLiked={isLiked}
      />
    </article>
  );
};

function renderLinkedInText(text: string, accent: string): React.ReactNode {
  return text.split(/([#@][\w.-]+)/g).map((part, index) => {
    if (part.startsWith("#") || part.startsWith("@")) {
      return (
        <span key={index} style={{ color: accent, fontWeight: 600 }}>
          {part}
        </span>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function formatCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return `${value}`;
}

const GlobeIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.5" />
    <ellipse cx="8" cy="8" rx="3" ry="6.5" stroke={color} strokeWidth="1.5" />
    <path d="M1.5 8h13M2.5 4.5h11M2.5 11.5h11" stroke={color} strokeWidth="1" />
  </svg>
);
