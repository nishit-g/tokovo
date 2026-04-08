import React from "react";
import type { WorldState } from "@tokovo/core";
import { framesToSeconds, TokovoConfig } from "@tokovo/core";
import { useXTheme } from "./ThemeContext.js";
import { getActiveTweet, getXState } from "../runtime/selectors.js";
import { AppShell } from "./AppShell.js";
import {
  Avatar,
  VerifiedBadge,
  XIcon,
  ActionButton,
  LinkPreviewCard,
  MediaCard,
  formatTimestamp as formatRelative,
} from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";
import { BottomNav } from "./BottomNav.js";

interface TweetDetailProps {
  world: WorldState;
}

const formatFullTimestamp = (value: number) => {
  if (value > 1_000_000_000_000) {
    const date = new Date(value);
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
    const day = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
    return `${time} · ${day}`;
  }
  const fps = TokovoConfig.rendering.defaultFps ?? 30;
  const seconds = framesToSeconds(value, fps);
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
};

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
};

export const TweetDetail: React.FC<TweetDetailProps> = ({ world }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const tweet = getActiveTweet(world);
  const users = state?.users ?? [];
  const currentUserId = state?.currentUserId ?? null;
  const currentUser = currentUserId
    ? users.find((user) => user.id === currentUserId)
    : undefined;

  const getUser = (id: string | undefined) => users.find((u) => u.id === id);

  if (!tweet) {
    return (
      <AppShell>
        <div
          style={{
            padding: theme.spacing.screenPadding,
            color: theme.colors.textSecondary,
          }}
        >
          Tweet not found.
        </div>
      </AppShell>
    );
  }

  const author = getUser(tweet.authorId);
  const replies = tweet.replyIds
    .map((id) => state?.tweets.find((t) => t.id === id))
    .filter(Boolean);
  const liked = currentUserId ? tweet.likedBy.includes(currentUserId) : false;
  const quote = tweet.quoteTweetId
    ? state?.tweets.find((t) => t.id === tweet.quoteTweetId)
    : undefined;
  const quoteAuthor = quote ? getUser(quote.authorId) : undefined;

  return (
    <AppShell>
      {/* Header */}
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          padding: `0 ${theme.spacing.screenPadding}px`,
          gap: 32,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <XIcon name="back" size={20} color={theme.colors.textPrimary} />
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: theme.colors.textPrimary,
          }}
        >
          Post
        </span>
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ flex: 1 }}>
          {/* Main Tweet */}
          <div
            style={{
              padding: theme.spacing.screenPadding,
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            {/* Author Row */}
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <Avatar size={48} src={author?.avatarUrl} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {author?.name ?? "Unknown"}
                  </span>
                  {author?.verified && (
                    <VerifiedBadge variant={author.verified} size={18} />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: theme.colors.textSecondary,
                  }}
                >
                  @{author?.handle ?? "unknown"}
                </div>
              </div>
              <XIcon name="more" size={20} color={theme.colors.textSecondary} />
            </div>

            {/* Tweet Text */}
            <div
              style={{
                marginTop: 12,
                fontSize: 17,
                lineHeight: 1.5,
                color: theme.colors.textPrimary,
              }}
            >
              {tweet.text}
            </div>

            {/* Media */}
            {tweet.media && <MediaCard media={tweet.media} variant="detail" />}

            {/* Link Preview */}
            {tweet.linkPreview && <LinkPreviewCard preview={tweet.linkPreview} />}

            {/* Quote Tweet */}
            {quote && (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  border: `1px solid ${theme.colors.border}`,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Avatar size={20} src={quoteAuthor?.avatarUrl} />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: theme.colors.textPrimary,
                      marginLeft: 4,
                    }}
                  >
                    {quoteAuthor?.name ?? "Unknown"}
                  </span>
                  {quoteAuthor?.verified && (
                    <VerifiedBadge variant={quoteAuthor.verified} size={14} />
                  )}
                  <span
                    style={{
                      fontSize: 13,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    @{quoteAuthor?.handle ?? "unknown"}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 15,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {quote.text}
                </div>
              </div>
            )}

            {/* Timestamp + Source */}
            <div
              style={{
                marginTop: 16,
                fontSize: 15,
                color: theme.colors.textSecondary,
              }}
            >
              {formatFullTimestamp(tweet.createdAt)} ·{" "}
              <span style={{ color: theme.colors.textPrimary }}>
                {formatCount(tweet.viewCount)}
              </span>{" "}
              Views
            </div>
          </div>

          {/* Engagement Stats Bar */}
          <div
            style={{
              display: "flex",
              padding: `12px ${theme.spacing.screenPadding}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
              gap: 20,
            }}
          >
            <span style={{ fontSize: 14, color: theme.colors.textSecondary }}>
              <span
                style={{ fontWeight: 700, color: theme.colors.textPrimary }}
              >
                {formatCount(tweet.repostCount)}
              </span>{" "}
              Reposts
            </span>
            <span style={{ fontSize: 14, color: theme.colors.textSecondary }}>
              <span
                style={{ fontWeight: 700, color: theme.colors.textPrimary }}
              >
                {formatCount(tweet.likeCount)}
              </span>{" "}
              Likes
            </span>
            <span style={{ fontSize: 14, color: theme.colors.textSecondary }}>
              <span
                style={{ fontWeight: 700, color: theme.colors.textPrimary }}
              >
                {formatCount(tweet.bookmarkCount)}
              </span>{" "}
              Bookmarks
            </span>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: `12px ${theme.spacing.screenPadding}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            <ActionButton icon="reply" />
            <ActionButton icon="repost" />
            <ActionButton icon="like" active={liked} />
            <ActionButton icon="bookmark" />
            <ActionButton icon="share" />
          </div>

          {/* Reply Composer */}
          <div
            style={{
              display: "flex",
              padding: `12px ${theme.spacing.screenPadding}px`,
              gap: 12,
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            <Avatar size={40} src={currentUser?.avatarUrl} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  color: theme.colors.textSecondary,
                }}
              >
                Post your reply
              </div>
            </div>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: 9999,
                border: "none",
                backgroundColor: theme.colors.accent,
                opacity: 0.5,
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Reply
            </button>
          </div>

          {/* Replies */}
          {replies.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: theme.colors.textSecondary,
              }}
            >
              No replies yet
            </div>
          ) : (
            replies.map((reply) => {
              if (!reply) return null;
              const replyAuthor = getUser(reply.authorId);
              return (
                <div
                  key={reply.id}
                  style={{
                    display: "flex",
                    padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    gap: theme.spacing.avatarGap,
                  }}
                >
                  <Avatar size={40} src={replyAuthor?.avatarUrl} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {replyAuthor?.name ?? "Unknown"}
                      </span>
                      {replyAuthor?.verified && (
                        <VerifiedBadge variant={replyAuthor.verified} size={16} />
                      )}
                      <span
                        style={{
                          fontSize: 15,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        @{replyAuthor?.handle ?? "unknown"}
                      </span>
                      <span style={{ color: theme.colors.textSecondary }}>·</span>
                      <span
                        style={{
                          fontSize: 15,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {formatRelative(reply.createdAt)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        lineHeight: 1.4,
                        color: theme.colors.textPrimary,
                        marginTop: 4,
                      }}
                    >
                      {reply.text}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 12,
                        maxWidth: 425,
                      }}
                    >
                      <ActionButton icon="reply" count={reply.replyIds.length} />
                      <ActionButton icon="repost" count={reply.repostCount} />
                      <ActionButton icon="like" count={reply.likeCount} />
                      <ActionButton icon="view" count={reply.viewCount} />
                      <ActionButton icon="bookmark" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScreenTransition>

      <BottomNav active="home" />
    </AppShell>
  );
};
