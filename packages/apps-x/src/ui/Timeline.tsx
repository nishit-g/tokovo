import React from "react";
import type { WorldState } from "@tokovo/core";
import { useXTheme } from "./ThemeContext.js";
import {
  getTimelineTab,
  getTimelineTweets,
  getXState,
} from "../runtime/selectors.js";
import { AppShell } from "./AppShell.js";
import {
  Avatar,
  VerifiedBadge,
  XLogo,
  XIcon,
  ActionButton,
  LinkPreviewCard,
  MediaCard,
  formatTimestamp,
  TabButton,
} from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";
import { BottomNav } from "./BottomNav.js";

interface TimelineProps {
  world: WorldState;
}

function renderRichText(text: string, accent: string): React.ReactNode {
  return text.split(/(#[\w_]+|@[\w_]+)/g).map((part, index) => {
    if (part.startsWith("#") || part.startsWith("@")) {
      return (
        <span key={`${part}-${index}`} style={{ color: accent }}>
          {part}
        </span>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

const TimelineTweetRow: React.FC<{
  tweet: ReturnType<typeof getTimelineTweets>[number];
  currentUserId: string | null;
  users: NonNullable<ReturnType<typeof getXState>>["users"];
  nowMs: number;
}> = ({ tweet, currentUserId, users, nowMs }) => {
  const theme = useXTheme();
  const author = users.find((user) => user.id === tweet.authorId);
  const liked = currentUserId ? tweet.likedBy.includes(currentUserId) : false;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <Avatar size={40} src={author?.avatarUrl} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              whiteSpace: "nowrap",
            }}
          >
            {author?.name ?? "Unknown"}
          </span>
          {author?.verified ? (
            <VerifiedBadge variant={author.verified} size={16} />
          ) : null}
          <span
            style={{
              fontSize: 15,
              color: theme.colors.textSecondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            @{author?.handle ?? "unknown"}
          </span>
          <span style={{ color: theme.colors.textSecondary }}>·</span>
          <span
            style={{
              fontSize: 15,
              color: theme.colors.textSecondary,
              whiteSpace: "nowrap",
            }}
          >
            {formatTimestamp(tweet.createdAt, { nowMs })}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <XIcon name="more" size={18} color={theme.colors.textSecondary} />
          </div>
        </div>

        <div
          style={{
            marginTop: 2,
            fontSize: 15,
            lineHeight: 1.42,
            color: theme.colors.textPrimary,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {renderRichText(tweet.text, theme.colors.accent)}
        </div>

        {tweet.media ? <MediaCard media={tweet.media} variant="timeline" /> : null}
        {tweet.linkPreview ? <LinkPreviewCard preview={tweet.linkPreview} /> : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            marginTop: 12,
            maxWidth: 430,
          }}
        >
          <ActionButton icon="reply" count={tweet.replyIds.length} />
          <ActionButton icon="repost" count={tweet.repostCount} />
          <ActionButton icon="like" count={tweet.likeCount} active={liked} />
          <ActionButton icon="view" count={tweet.viewCount} />
          <div style={{ display: "flex", gap: 12 }}>
            <ActionButton icon="bookmark" count={tweet.bookmarkCount || undefined} />
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
  const timelineTab = getTimelineTab(world);
  const users = state?.users ?? [];
  const currentUser = users.find((user) => user.id === state?.currentUserId);
  const nowMs = tweets.reduce((max, tweet) => Math.max(max, tweet.createdAt), 0);

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
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: theme.colors.background,
            backdropFilter: "blur(12px)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: theme.spacing.headerHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `0 ${theme.spacing.screenPadding}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            <Avatar size={32} src={currentUser?.avatarUrl} />
            <XLogo size={28} />
            <XIcon name="grok" size={22} color={theme.colors.textPrimary} />
          </div>
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            <TabButton label="For you" active={timelineTab === "forYou"} />
            <TabButton label="Following" active={timelineTab === "following"} />
          </div>
        </div>

        <ScreenTransition lastNavFrame={state?.lastNavFrame}>
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            {tweets.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  color: theme.colors.textSecondary,
                }}
              >
                <div
                  style={{
                    fontSize: 31,
                    lineHeight: 1.1,
                    fontWeight: 800,
                    color: theme.colors.textPrimary,
                  }}
                >
                  Nothing in your timeline yet
                </div>
                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.45 }}>
                  Follow accounts, switch tabs, or seed posts into the scene to
                  make the timeline feel live.
                </div>
              </div>
            ) : null}

            {tweets.map((tweet) => (
              <TimelineTweetRow
                key={tweet.id}
                tweet={tweet}
                currentUserId={state?.currentUserId ?? null}
                users={users}
                nowMs={nowMs}
              />
            ))}
          </div>
        </ScreenTransition>
      </div>

      <BottomNav active="home" />

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
          boxShadow: "0 12px 28px rgba(29,155,240,0.32)",
          zIndex: 12,
        }}
      >
        <XIcon name="compose" size={24} color="#FFFFFF" />
      </div>
    </AppShell>
  );
};
