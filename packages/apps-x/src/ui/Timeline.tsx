import React from "react";
import type { WorldState } from "@tokovo/core";
import { framesToSeconds, TokovoConfig } from "@tokovo/core";
import { useTime } from "@tokovo/react";
import { getXTheme } from "../config/theme";
import { getTimelineTweets, getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, MetricPill, VerifiedBadge, XIcon, XLogo } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface TimelineProps {
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

const renderRichText = (text: string, theme: ReturnType<typeof getXTheme>) => {
  const parts = text.split(/(#[\w_]+|@[\w_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("#") || part.startsWith("@")) {
      return (
        <span key={index} style={{ color: theme.colors.link }}>
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const Timeline: React.FC<TimelineProps> = ({ world }) => {
  const theme = getXTheme("dark");
  const state = getXState(world);
  const tweets = getTimelineTweets(world);
  const users = state?.users ?? [];
  const currentUserId = state?.currentUserId ?? null;
  const t = useTime();
  const scrollOffset = Math.min(80, t * 0.35);

  const getUser = (id: string | undefined) => users.find((u) => u.id === id);

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
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <XLogo size={18} />
          <span style={{ fontSize: 14, letterSpacing: 2, fontWeight: 700 }}>X</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            backgroundColor: theme.colors.surfaceRaised,
            borderRadius: 999,
            padding: "3px 4px",
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              backgroundColor: theme.colors.textPrimary,
              color: theme.colors.background,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            For you
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              color: theme.colors.textMuted,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            Following
          </span>
        </div>
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ padding: theme.spacing.screenPadding, flex: 1 }}>
          {tweets.length === 0 && (
            <div
              style={{
                padding: theme.spacing.cardPadding,
                border: `1px dashed ${theme.colors.border}`,
                borderRadius: 12,
                color: theme.colors.textSecondary,
                textAlign: "center",
                backgroundColor: theme.colors.surface,
              }}
            >
              No tweets yet.
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.cardGap,
              transform: `translateY(-${scrollOffset}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            {tweets.map((tweet) => {
              const author = getUser(tweet.authorId);
              const liked = currentUserId ? tweet.likedBy.includes(currentUserId) : false;
              const quote = tweet.quoteTweetId
                ? state?.tweets.find((t) => t.id === tweet.quoteTweetId)
                : undefined;

              return (
                <div
                  key={tweet.id}
                  style={{
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 18,
                    padding: theme.spacing.cardPadding,
                    backgroundColor: theme.colors.surface,
                    boxShadow: "0 18px 30px rgba(0,0,0,0.25)",
                  }}
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <Avatar size={theme.spacing.avatarSize} ring={tweet.mentions.includes(currentUserId ?? "")}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {author?.name ?? "Unknown"}
                        </span>
                        {author?.verified && <VerifiedBadge variant={author.verified} />}
                        <span style={{ fontSize: 11, color: theme.colors.textMuted }}>
                          @{author?.handle ?? "unknown"}
                        </span>
                        <span style={{ fontSize: 11, color: theme.colors.textMuted }}>·</span>
                        <span style={{ fontSize: 11, color: theme.colors.textMuted }}>
                          {formatTimestamp(tweet.createdAt)}
                        </span>
                      </div>
                      {tweet.repostOfId && (
                        <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 4 }}>
                          Repost
                        </div>
                      )}
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 15,
                          lineHeight: 1.5,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {renderRichText(tweet.text, theme)}
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
                            height: tweet.media.aspect === "wide" ? 120 : 180,
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
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: theme.colors.textSecondary,
                                    }}
                                  >
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
                              <div
                                style={{ fontSize: 11, color: theme.colors.textMuted }}
                              >
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

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: 12,
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScreenTransition>

      <BottomNav active="home" />

      <div
        style={{
          position: "absolute",
          right: 20,
          bottom: 70,
          width: theme.spacing.fabSize,
          height: theme.spacing.fabSize,
          borderRadius: 16,
          backgroundColor: theme.colors.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 16px 40px rgba(29,155,240,0.45)",
          zIndex: 3,
        }}
      >
        <XIcon name="compose" active />
      </div>
    </AppShell>
  );
};
