import React from "react";
import type { WorldState } from "@tokovo/core";
import { useXTheme } from "./ThemeContext.js";
import {
  getActiveUser,
  getProfileTab,
  getTweetsByAuthor,
  getXState,
} from "../runtime/selectors.js";
import { AppShell } from "./AppShell.js";
import {
  Avatar,
  VerifiedBadge,
  XIcon,
  ActionButton,
  formatTimestamp,
  TabButton,
} from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";
import { BottomNav } from "./BottomNav.js";

interface ProfileProps {
  world: WorldState;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export const Profile: React.FC<ProfileProps> = ({ world }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const activeUser =
    getActiveUser(world) ??
    (state?.currentUserId
      ? state.users.find((user) => user.id === state.currentUserId) ?? null
      : null);
  const currentUser = state?.users.find((user) => user.id === state.currentUserId);
  const profileTab = getProfileTab(world);

  if (!activeUser) {
    return (
      <AppShell>
        <div
          style={{
            padding: theme.spacing.screenPadding,
            color: theme.colors.textSecondary,
          }}
        >
          Profile not found.
        </div>
      </AppShell>
    );
  }

  const allTweets = getTweetsByAuthor(world, activeUser.id);
  const tweets = allTweets.filter((tweet) => {
    if (profileTab === "replies") return Boolean(tweet.replyToId);
    if (profileTab === "media") return Boolean(tweet.media);
    if (profileTab === "likes") return Boolean(state?.currentUserId && tweet.likedBy.includes(state.currentUserId));
    return true;
  });
  const isSelf = activeUser.id === currentUser?.id;
  const isFollowing = Boolean(
    currentUser && currentUser.followingIds.includes(activeUser.id),
  );
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
            height: theme.spacing.headerHeight,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: `0 ${theme.spacing.screenPadding}px`,
            backgroundColor: theme.colors.background,
            borderBottom: `1px solid ${theme.colors.border}`,
            flexShrink: 0,
          }}
        >
          <XIcon name="back" size={20} color={theme.colors.textPrimary} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: theme.colors.textPrimary }}>
              {activeUser.name}
            </div>
            <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              {allTweets.length} posts
            </div>
          </div>
        </div>

        <ScreenTransition lastNavFrame={state?.lastNavFrame}>
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <div
              style={{
                height: theme.spacing.bannerHeight,
                background:
                  theme.mode === "storybook"
                    ? "linear-gradient(135deg, #8fb6a0 0%, #d9c4a3 100%)"
                    : "linear-gradient(135deg, #1d9bf0 0%, #0f1419 100%)",
              }}
            />

            <div style={{ padding: `0 ${theme.spacing.screenPadding}px` }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginTop: -34,
                }}
              >
                <div
                  style={{
                    borderRadius: "50%",
                    border: `4px solid ${theme.colors.background}`,
                  }}
                >
                  <Avatar size={80} src={activeUser.avatarUrl} />
                </div>
                <div style={{ marginTop: 42, display: "flex", gap: 8 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      border: `1px solid ${theme.colors.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <XIcon name="more" size={18} color={theme.colors.textPrimary} />
                  </div>
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      backgroundColor: isSelf ? "transparent" : theme.colors.textPrimary,
                      color: isSelf ? theme.colors.textPrimary : theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {isSelf ? "Edit profile" : isFollowing ? "Following" : "Follow"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      fontSize: 21,
                      fontWeight: 800,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {activeUser.name}
                  </span>
                  {activeUser.verified ? (
                    <VerifiedBadge variant={activeUser.verified} size={20} />
                  ) : null}
                </div>
                <div style={{ marginTop: 2, fontSize: 15, color: theme.colors.textSecondary }}>
                  @{activeUser.handle}
                </div>
              </div>

              {activeUser.bio ? (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 15,
                    lineHeight: 1.4,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {activeUser.bio}
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  gap: 18,
                  marginTop: 12,
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}
              >
                <span>
                  <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
                    {formatCount(activeUser.following)}
                  </span>{" "}
                  Following
                </span>
                <span>
                  <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
                    {formatCount(activeUser.followers)}
                  </span>{" "}
                  Followers
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 16,
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <TabButton label="Posts" active={profileTab === "posts"} />
              <TabButton label="Replies" active={profileTab === "replies"} />
              <TabButton label="Media" active={profileTab === "media"} />
              <TabButton label="Likes" active={profileTab === "likes"} />
            </div>

            {tweets.length === 0 ? (
              <div
                style={{
                  padding: 28,
                  color: theme.colors.textSecondary,
                  fontSize: 15,
                }}
              >
                Nothing in this tab yet.
              </div>
            ) : null}

            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                <Avatar size={40} src={activeUser.avatarUrl} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: theme.colors.textPrimary,
                      }}
                    >
                      {activeUser.name}
                    </span>
                    {activeUser.verified ? (
                      <VerifiedBadge variant={activeUser.verified} size={16} />
                    ) : null}
                    <span style={{ fontSize: 15, color: theme.colors.textSecondary }}>
                      @{activeUser.handle}
                    </span>
                    <span style={{ color: theme.colors.textSecondary }}>·</span>
                    <span style={{ fontSize: 15, color: theme.colors.textSecondary }}>
                      {formatTimestamp(tweet.createdAt, { nowMs })}
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
                    {tweet.text}
                  </div>
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
                    <ActionButton icon="like" count={tweet.likeCount} />
                    <ActionButton icon="view" count={tweet.viewCount} />
                    <ActionButton icon="bookmark" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScreenTransition>
      </div>

      <BottomNav active="home" />
    </AppShell>
  );
};
