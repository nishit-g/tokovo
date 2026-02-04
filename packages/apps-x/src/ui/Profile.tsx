import React from "react";
import type { WorldState } from "@tokovo/core";
import { getXTheme } from "../config/theme";
import { getActiveUser, getXState, getTimelineTweets } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, VerifiedBadge, XIcon } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface ProfileProps {
  world: WorldState;
}

export const Profile: React.FC<ProfileProps> = ({ world }) => {
  const theme = getXTheme("dark");
  const state = getXState(world);
  const activeUser =
    getActiveUser(world) ??
    (state?.currentUserId
      ? state?.users.find((u) => u.id === state.currentUserId) ?? null
      : null);

  const tweets = getTimelineTweets(world).filter(
    (tweet) => tweet.authorId === activeUser?.id,
  );

  if (!activeUser) {
    return (
      <AppShell>
        <div style={{ padding: theme.spacing.screenPadding, color: theme.colors.textSecondary }}>
          Profile not found.
        </div>
      </AppShell>
    );
  }

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
        <span style={{ fontSize: 14, fontWeight: 700 }}>{activeUser.name}</span>
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
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar size={64} />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{activeUser.name}</span>
                  {activeUser.verified && <VerifiedBadge variant={activeUser.verified} />}
                </div>
                <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
                  @{activeUser.handle}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 14, marginTop: 12 }}>
              {activeUser.bio ?? "No bio yet."}
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 16,
                fontSize: 12,
                color: theme.colors.textSecondary,
              }}
            >
              <span>
                <strong style={{ color: theme.colors.textPrimary }}>
                  {activeUser.following}
                </strong>{" "}
                Following
              </span>
              <span>
                <strong style={{ color: theme.colors.textPrimary }}>
                  {activeUser.followers}
                </strong>{" "}
                Followers
              </span>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Posts</div>
            {tweets.length === 0 && (
              <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                No posts yet.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.cardGap }}>
              {tweets.map((tweet) => (
                <div
                  key={tweet.id}
                  style={{
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 12,
                    padding: theme.spacing.cardPadding,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <div style={{ fontSize: 14 }}>{tweet.text}</div>
                  <div style={{ marginTop: 8, fontSize: 11, color: theme.colors.textMuted }}>
                    Reply {tweet.replyIds.length} · Repost {tweet.repostCount} · Like {tweet.likeCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScreenTransition>

      <BottomNav active="home" />
    </AppShell>
  );
};
