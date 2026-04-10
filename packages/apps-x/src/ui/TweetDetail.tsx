import React from "react";
import type { WorldState } from "@tokovo/core";
import { getTypedTextProgress } from "@tokovo/device-keyboard";
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
  formatTimestamp,
} from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";
import { BottomNav } from "./BottomNav.js";

interface TweetDetailProps {
  world: WorldState;
  deviceId?: string;
  t?: number;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

export const TweetDetail: React.FC<TweetDetailProps> = ({ world, deviceId, t }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const tweet = getActiveTweet(world);
  const users = state?.users ?? [];
  const currentUser = users.find((user) => user.id === state?.currentUserId);
  const author = users.find((user) => user.id === tweet?.authorId);
  const replies = tweet?.replyIds
    .map((id) => state?.tweets.find((item) => item.id === id))
    .filter(Boolean) ?? [];
  const focusedDevice =
    (deviceId && world.devices?.[deviceId]) ||
    world.devices?.[Object.keys(world.devices ?? {})[0]];
  const keyboard = focusedDevice?.keyboard;
  const typedReply =
    keyboard?.visible && keyboard.typingAnimation
      ? getTypedTextProgress(keyboard, t ?? 0)
      : state?.composeDraft ?? "";
  const canReply = typedReply.length > 0 && typedReply.length <= 280;
  const nowMs = Math.max(
    tweet?.createdAt ?? 0,
    ...replies.map((reply) => reply?.createdAt ?? 0),
  );

  if (!tweet) {
    return (
      <AppShell>
        <div
          style={{
            padding: theme.spacing.screenPadding,
            color: theme.colors.textSecondary,
          }}
        >
          Post not found.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: theme.spacing.headerHeight,
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: `0 ${theme.spacing.screenPadding}px`,
            borderBottom: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background,
            flexShrink: 0,
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
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <div
              style={{
                padding: theme.spacing.screenPadding,
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <Avatar size={44} src={author?.avatarUrl} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: theme.colors.textPrimary,
                      }}
                    >
                      {author?.name ?? "Unknown"}
                    </span>
                    {author?.verified ? (
                      <VerifiedBadge variant={author.verified} size={17} />
                    ) : null}
                  </div>
                  <div style={{ fontSize: 15, color: theme.colors.textSecondary }}>
                    @{author?.handle ?? "unknown"}
                  </div>
                </div>
                <XIcon name="more" size={20} color={theme.colors.textSecondary} />
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 23,
                  lineHeight: 1.3,
                  letterSpacing: -0.4,
                  color: theme.colors.textPrimary,
                  whiteSpace: "pre-wrap",
                }}
              >
                {tweet.text}
              </div>

              {tweet.media ? <MediaCard media={tweet.media} variant="detail" /> : null}
              {tweet.linkPreview ? <LinkPreviewCard preview={tweet.linkPreview} /> : null}

              <div
                style={{
                  marginTop: 18,
                  fontSize: 15,
                  color: theme.colors.textSecondary,
                }}
              >
                {formatTimestamp(tweet.createdAt, { nowMs })} ·{" "}
                <span style={{ color: theme.colors.textPrimary }}>
                  {formatCount(tweet.viewCount)}
                </span>{" "}
                Views
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 18,
                padding: `14px ${theme.spacing.screenPadding}px`,
                borderBottom: `1px solid ${theme.colors.border}`,
                fontSize: 14,
              }}
            >
              <span style={{ color: theme.colors.textSecondary }}>
                <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
                  {formatCount(tweet.replyIds.length)}
                </span>{" "}
                Replies
              </span>
              <span style={{ color: theme.colors.textSecondary }}>
                <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
                  {formatCount(tweet.repostCount)}
                </span>{" "}
                Reposts
              </span>
              <span style={{ color: theme.colors.textSecondary }}>
                <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
                  {formatCount(tweet.likeCount)}
                </span>{" "}
                Likes
              </span>
            </div>

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
              <ActionButton icon="like" active={Boolean(state?.currentUserId && tweet.likedBy.includes(state.currentUserId))} />
              <ActionButton icon="bookmark" />
              <ActionButton icon="share" />
            </div>

            {replies.length === 0 ? (
              <div
                style={{
                  padding: 28,
                  color: theme.colors.textSecondary,
                  fontSize: 15,
                }}
              >
                No replies yet.
              </div>
            ) : null}

            {replies.map((reply) => {
              if (!reply) return null;
              const replyAuthor = users.find((user) => user.id === reply.authorId);
              return (
                <div
                  key={reply.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
                    borderBottom: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <Avatar size={40} src={replyAuthor?.avatarUrl} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: theme.colors.textPrimary,
                        }}
                      >
                        {replyAuthor?.name ?? "Unknown"}
                      </span>
                      <span style={{ fontSize: 15, color: theme.colors.textSecondary }}>
                        @{replyAuthor?.handle ?? "unknown"}
                      </span>
                      <span style={{ color: theme.colors.textSecondary }}>·</span>
                      <span style={{ fontSize: 15, color: theme.colors.textSecondary }}>
                        {formatTimestamp(reply.createdAt, { nowMs })}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 15,
                        lineHeight: 1.4,
                        color: theme.colors.textPrimary,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {reply.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScreenTransition>
      </div>

      <div
        style={{
          padding: `12px ${theme.spacing.screenPadding}px`,
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Avatar size={36} src={currentUser?.avatarUrl} />
        <div
          style={{
            flex: 1,
            minHeight: 42,
            padding: "10px 14px",
            borderRadius: 999,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surfaceRaised,
            color: typedReply ? theme.colors.textPrimary : theme.colors.textSecondary,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
          }}
        >
          {typedReply || "Post your reply"}
        </div>
        <div
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            backgroundColor: canReply ? theme.colors.accent : theme.colors.surfaceRaised,
            color: canReply ? "#FFFFFF" : theme.colors.textMuted,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          Reply
        </div>
      </div>

      <BottomNav active="home" />
    </AppShell>
  );
};
