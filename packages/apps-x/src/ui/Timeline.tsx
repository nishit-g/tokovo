import React from "react";
import type { WorldState } from "@tokovo/core";
import { getXTheme } from "../config/theme";
import { useXTheme } from "./ThemeContext";
import { getTimelineTweets, getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import {
  Avatar,
  VerifiedBadge,
  XLogo,
  XIcon,
  ActionButton,
  formatTimestamp,
  TabButton,
} from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface TimelineProps {
  world: WorldState;
}

// Rich text rendering for hashtags and mentions
const renderRichText = (
  text: string,
  theme: ReturnType<typeof getXTheme>
): React.ReactNode => {
  const parts = text.split(/(#[\w_]+|@[\w_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("#") || part.startsWith("@")) {
      return (
        <span key={index} style={{ color: theme.colors.accent }}>
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// Tweet Card Component - Real X layout
const TweetCard: React.FC<{
  tweet: ReturnType<typeof getTimelineTweets>[0];
  author: { name: string; handle: string; verified?: "blue" | "gold" | "grey" | null } | undefined;
  liked: boolean;
  theme: ReturnType<typeof getXTheme>;
}> = ({ tweet, author, liked, theme }) => {
  return (
    <div
      style={{
        display: "flex",
        padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
        borderBottom: `1px solid ${theme.colors.border}`,
        gap: theme.spacing.avatarGap,
      }}
    >
      {/* Avatar Column */}
      <Avatar size={theme.spacing.avatarSize} />

      {/* Content Column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header: Name, badge, handle, time, more */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: theme.colors.textPrimary,
            }}
          >
            {author?.name ?? "Unknown"}
          </span>
          {author?.verified && <VerifiedBadge variant={author.verified} size={16} />}
          <span
            style={{
              fontSize: 15,
              color: theme.colors.textSecondary,
            }}
          >
            @{author?.handle ?? "unknown"}
          </span>
          <span style={{ color: theme.colors.textSecondary }}>·</span>
          <span
            style={{
              fontSize: 15,
              color: theme.colors.textSecondary,
            }}
          >
            {formatTimestamp(tweet.createdAt)}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <XIcon name="more" size={18} color={theme.colors.textSecondary} />
          </div>
        </div>

        {/* Repost indicator */}
        {tweet.repostOfId && (
          <div
            style={{
              fontSize: 13,
              color: theme.colors.textSecondary,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <XIcon name="repost" size={14} color={theme.colors.textSecondary} />
            Reposted
          </div>
        )}

        {/* Tweet Text */}
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.4,
            color: theme.colors.textPrimary,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {renderRichText(tweet.text, theme)}
        </div>

        {/* Media */}
        {tweet.media && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              border: `1px solid ${theme.colors.border}`,
              overflow: "hidden",
              backgroundColor: theme.colors.surfaceRaised,
              height: tweet.media.aspect === "wide" ? 160 : 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              {tweet.media.type.toUpperCase()}
            </span>
          </div>
        )}

        {/* Link Preview */}
        {tweet.linkPreview && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              border: `1px solid ${theme.colors.border}`,
              overflow: "hidden",
              backgroundColor: theme.colors.surface,
            }}
          >
            <div
              style={{
                height: 120,
                backgroundColor: theme.colors.surfaceRaised,
              }}
            />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                {tweet.linkPreview.domain}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: theme.colors.textPrimary,
                  marginTop: 4,
                }}
              >
                {tweet.linkPreview.title}
              </div>
              {tweet.linkPreview.description && (
                <div
                  style={{
                    fontSize: 15,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {tweet.linkPreview.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Poll */}
        {tweet.poll && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {tweet.poll.options.map((opt) => {
              const total = tweet.poll!.totalVotes || 1;
              const percent = Math.round((opt.votes / total) * 100);
              return (
                <div
                  key={opt.label}
                  style={{
                    position: "relative",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: `1px solid ${theme.colors.border}`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${percent}%`,
                      backgroundColor: theme.colors.accentSoft,
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 15, color: theme.colors.textPrimary }}>
                      {opt.label}
                    </span>
                    <span style={{ fontSize: 15, color: theme.colors.textSecondary }}>
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              {tweet.poll.totalVotes} votes
            </div>
          </div>
        )}

        {/* Action Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            maxWidth: 425,
          }}
        >
          <ActionButton icon="reply" count={tweet.replyIds.length} />
          <ActionButton icon="repost" count={tweet.repostCount} />
          <ActionButton icon="like" count={tweet.likeCount} active={liked} />
          <ActionButton icon="view" count={tweet.viewCount} />
          <div style={{ display: "flex", gap: 12 }}>
            <ActionButton icon="bookmark" count={tweet.bookmarkCount > 0 ? tweet.bookmarkCount : undefined} />
            <ActionButton icon="share" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({ world }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const tweets = getTimelineTweets(world);
  const users = state?.users ?? [];
  const currentUserId = state?.currentUserId ?? null;

  const getUser = (id: string | undefined) => users.find((u) => u.id === id);

  return (
    <AppShell>
      {/* Header */}
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${theme.spacing.screenPadding}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Avatar size={32} />
        <XLogo size={28} />
        <XIcon name="grok" size={24} color={theme.colors.textPrimary} />
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <TabButton label="For you" active />
        <TabButton label="Following" />
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ flex: 1 }}>
          {tweets.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: theme.colors.textSecondary,
              }}
            >
              Welcome to X! Your timeline is empty.
            </div>
          )}

          {tweets.map((tweet) => {
            const author = getUser(tweet.authorId);
            const liked = currentUserId
              ? tweet.likedBy.includes(currentUserId)
              : false;

            return (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                author={author}
                liked={liked}
                theme={theme}
              />
            );
          })}
        </div>
      </ScreenTransition>

      <BottomNav active="home" />

      {/* FAB Compose */}
      <div
        style={{
          position: "absolute",
          right: 16,
          bottom: 72,
          width: theme.spacing.fabSize,
          height: theme.spacing.fabSize,
          borderRadius: "50%",
          backgroundColor: theme.colors.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(29,155,240,0.4)",
          zIndex: 10,
        }}
      >
        <XIcon name="compose" size={24} color="#FFFFFF" />
      </div>
    </AppShell>
  );
};
