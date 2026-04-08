import React from "react";
import type { WorldState } from "@tokovo/core";
import { useXTheme } from "./ThemeContext.js";
import {
  getActiveUser,
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

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

export const Profile: React.FC<ProfileProps> = ({ world }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const activeUser =
    getActiveUser(world) ??
    (state?.currentUserId
      ? state?.users.find((u) => u.id === state.currentUserId) ?? null
      : null);

  const tweets = getTweetsByAuthor(world, activeUser?.id ?? null);
  const currentUser = state?.users.find((u) => u.id === state.currentUserId);
  const isSelfProfile = Boolean(currentUser && activeUser && currentUser.id === activeUser.id);
  const isFollowingActiveUser = Boolean(
    currentUser && activeUser && currentUser.followingIds.includes(activeUser.id),
  );
  const referenceNowMs = tweets.reduce(
    (max, tweet) => Math.max(max, tweet.createdAt),
    0,
  );

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
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <XIcon name="back" size={20} color={theme.colors.textPrimary} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: theme.colors.textPrimary,
            }}
          >
            {activeUser.name}
          </div>
          <div style={{ fontSize: 13, color: theme.colors.textSecondary }}>
            {tweets.length} posts
          </div>
        </div>
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ flex: 1 }}>
          {/* Banner */}
          <div
            style={{
              height: theme.spacing.bannerHeight,
              background:
                "linear-gradient(135deg, #1D1F23 0%, #2F3336 50%, #1D1F23 100%)",
            }}
          />

          {/* Profile Info Section */}
          <div style={{ padding: `0 ${theme.spacing.screenPadding}px` }}>
            {/* Avatar + Follow Button Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginTop: -32,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: `4px solid ${theme.colors.background}`,
                  overflow: "hidden",
                }}
              >
                <Avatar size={80} src={activeUser.avatarUrl} />
              </div>
              <div style={{ marginTop: 44, display: "flex", gap: 8 }}>
                <button
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: "transparent",
                    color: theme.colors.textPrimary,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <XIcon name="more" size={18} color={theme.colors.textPrimary} />
                </button>
                {!isSelfProfile && (
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: "transparent",
                      color: theme.colors.textPrimary,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <XIcon name="mail" size={18} color={theme.colors.textPrimary} />
                  </button>
                )}
                <button
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: isSelfProfile
                      ? `1px solid ${theme.colors.border}`
                      : "none",
                    backgroundColor: isSelfProfile
                      ? "transparent"
                      : theme.colors.textPrimary,
                    color: isSelfProfile
                      ? theme.colors.textPrimary
                      : theme.colors.background,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isSelfProfile
                    ? "Edit profile"
                    : isFollowingActiveUser
                      ? "Following"
                      : "Follow"}
                </button>
              </div>
            </div>

            {/* Name + Handle */}
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {activeUser.name}
                </span>
                {activeUser.verified && (
                  <VerifiedBadge variant={activeUser.verified} size={20} />
                )}
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: theme.colors.textSecondary,
                  marginTop: 2,
                }}
              >
                @{activeUser.handle}
              </div>
            </div>

            {/* Bio */}
            {activeUser.bio && (
              <div
                style={{
                  fontSize: 15,
                  color: theme.colors.textPrimary,
                  marginTop: 12,
                  lineHeight: 1.4,
                }}
              >
                {activeUser.bio}
              </div>
            )}

            {/* Following / Followers */}
            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 12,
              }}
            >
              <span style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {formatCount(activeUser.following ?? 0)}
                </span>{" "}
                Following
              </span>
              <span style={{ fontSize: 14, color: theme.colors.textSecondary }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {formatCount(activeUser.followers ?? 0)}
                </span>{" "}
                Followers
              </span>
            </div>
          </div>

          {/* Tab Bar */}
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${theme.colors.border}`,
              marginTop: 16,
            }}
          >
            <TabButton label="Posts" active />
            <TabButton label="Replies" />
            <TabButton label="Media" />
            <TabButton label="Likes" />
          </div>

          {/* Posts List */}
          <div>
            {tweets.length === 0 && (
              <div
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: theme.colors.textSecondary,
                }}
              >
                {isSelfProfile
                  ? "You haven't posted yet."
                  : `@${activeUser.handle} hasn't posted yet.`}
              </div>
            )}

            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                style={{
                  display: "flex",
                  padding: `${theme.spacing.tweetPaddingV}px ${theme.spacing.tweetPaddingH}px`,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  gap: theme.spacing.avatarGap,
                }}
              >
                <Avatar size={theme.spacing.avatarSize} src={activeUser.avatarUrl} />
                <div style={{ flex: 1, minWidth: 0 }}>
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
                      {activeUser.name}
                    </span>
                    {activeUser.verified && (
                      <VerifiedBadge variant={activeUser.verified} size={16} />
                    )}
                    <span
                      style={{ fontSize: 15, color: theme.colors.textSecondary }}
                    >
                      @{activeUser.handle}
                    </span>
                    <span style={{ color: theme.colors.textSecondary }}>·</span>
                    <span
                      style={{ fontSize: 15, color: theme.colors.textSecondary }}
                    >
                      {formatTimestamp(tweet.createdAt, { nowMs: referenceNowMs })}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.4,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {tweet.replyToId && (
                      <div
                        style={{
                          fontSize: 13,
                          color: theme.colors.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        Reply
                      </div>
                    )}
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
        </div>
      </ScreenTransition>

      <BottomNav active="home" />
    </AppShell>
  );
};
