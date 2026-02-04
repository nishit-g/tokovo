import React from "react";
import type { WorldState } from "@tokovo/core";
import { framesToSeconds, TokovoConfig } from "@tokovo/core";
import { getXTheme } from "../config/theme";
import { getActiveTweet, getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, MetricPill, VerifiedBadge, XIcon } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface TweetDetailProps {
  world: WorldState;
}

const formatTimestamp = (value: number) => {
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
  return `${minutes}m`;
};

export const TweetDetail: React.FC<TweetDetailProps> = ({ world }) => {
  const theme = getXTheme("dark");
  const state = getXState(world);
  const tweet = getActiveTweet(world);
  const users = state?.users ?? [];
  const currentUserId = state?.currentUserId ?? null;

  const getUser = (id: string | undefined) => users.find((u) => u.id === id);

  if (!tweet) {
    return (
      <AppShell>
        <div style={{ padding: theme.spacing.screenPadding, color: theme.colors.textSecondary }}>
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

  return (
    <AppShell>
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${theme.spacing.screenPadding}px`,
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surface,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700 }}>Post</span>
        <XIcon name="search" />
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ padding: theme.spacing.screenPadding, flex: 1 }}>
          <div
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 18,
              padding: theme.spacing.cardPadding,
              backgroundColor: theme.colors.surface,
              boxShadow: "0 18px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <Avatar size={theme.spacing.avatarSize} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    {author?.name ?? "Unknown"}
                  </span>
                  {author?.verified && <VerifiedBadge variant={author.verified} />}
                  <span style={{ fontSize: 11, color: theme.colors.textMuted }}>
                    @{author?.handle ?? "unknown"}
                  </span>
                </div>
                {tweet.repostOfId && (
                  <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 4 }}>
                    Repost
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 16, lineHeight: 1.5 }}>
              {tweet.text}
            </div>

            {tweet.media && (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 16,
                  border: `1px solid ${theme.colors.border}`,
                  background:
                    tweet.media.type === "image"
                      ? "linear-gradient(135deg, #10141c, #1f2937)"
                      : "linear-gradient(135deg, #111827, #0f172a)",
                  height: tweet.media.aspect === "wide" ? 140 : 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.colors.textMuted,
                  fontSize: 12,
                }}
              >
                {tweet.media.type.toUpperCase()} MEDIA
              </div>
            )}

            {tweet.linkPreview && (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 14,
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surfaceRaised,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 11, color: theme.colors.textMuted }}>
                  {tweet.linkPreview.domain}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                  {tweet.linkPreview.title}
                </div>
                {tweet.linkPreview.description && (
                  <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>
                    {tweet.linkPreview.description}
                  </div>
                )}
              </div>
            )}

            {tweet.poll && (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 14,
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surfaceRaised,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {(() => {
                  const poll = tweet.poll!;
                  return poll.options.map((opt) => {
                    const total = poll.totalVotes || 1;
                    const percent = Math.round((opt.votes / total) * 100);
                    return (
                      <div key={opt.label}>
                        <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                          {opt.label}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            height: 6,
                            borderRadius: 999,
                            backgroundColor: theme.colors.pill,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: "100%",
                              backgroundColor: theme.colors.accent,
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
                {(() => {
                  const poll = tweet.poll!;
                  return (
                    <div style={{ fontSize: 11, color: theme.colors.textMuted }}>
                      {poll.totalVotes} votes
                    </div>
                  );
                })()}
              </div>
            )}

            {quote && (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 14,
                  border: `1px solid ${theme.colors.borderStrong}`,
                  backgroundColor: theme.colors.surfaceRaised,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
                  Quote
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{quote.text}</div>
              </div>
            )}

            <div style={{ marginTop: 10, fontSize: 12, color: theme.colors.textMuted }}>
              {formatTimestamp(tweet.createdAt)} · from X for iPhone
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <MetricPill label="Reply" value={tweet.replyIds.length} />
              <MetricPill label="Repost" value={tweet.repostCount} />
              <MetricPill label="Like" value={tweet.likeCount} active={liked} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginTop: 12,
                color: theme.colors.textMuted,
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <XIcon name="analytics" size={14} />
                {tweet.viewCount}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <XIcon name="bookmark" size={14} />
                {tweet.bookmarkCount}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <XIcon name="share" size={14} />
                {tweet.shareCount}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Replies</div>
            <div
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 16,
                padding: theme.spacing.cardPadding,
                backgroundColor: theme.colors.surface,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <Avatar size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: theme.colors.textMuted }}>
                  Replying to @{author?.handle ?? "unknown"}
                </div>
                <div style={{ marginTop: 6, fontSize: 14, color: theme.colors.textSecondary }}>
                  {state?.composeDraft?.length ? state.composeDraft : "Post your reply"}
                </div>
              </div>
              <button
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "6px 14px",
                  backgroundColor: theme.colors.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Reply
              </button>
            </div>
            {replies.length === 0 && (
              <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                No replies yet.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.cardGap }}>
              {replies.map((reply) => {
                const replyAuthor = getUser(reply?.authorId);
                if (!reply) return null;
                return (
                  <div
                    key={reply.id}
                    style={{
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: 12,
                      padding: theme.spacing.cardPadding,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {replyAuthor?.name ?? "Unknown"}
                      </span>
                      <span style={{ fontSize: 11, color: theme.colors.textMuted }}>
                        @{replyAuthor?.handle ?? "unknown"}
                      </span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14 }}>{reply.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScreenTransition>

      <BottomNav active="home" />
    </AppShell>
  );
};
