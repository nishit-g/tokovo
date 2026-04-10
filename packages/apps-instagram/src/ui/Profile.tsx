import React from "react";
import type { WorldState } from "@tokovo/core";
import { AppShell } from "./AppShell.js";
import { Avatar, BottomNav, Icon } from "./components.js";
import { useInstagramTheme } from "./ThemeContext.js";
import { getActiveProfile, getCurrentUser, getInstagramState, getProfilePosts } from "../runtime/selectors.js";

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

export const ProfileScreen: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useInstagramTheme();
  const state = getInstagramState(world);
  const currentUser = getCurrentUser(world);
  const profile = getActiveProfile(world);
  const posts = getProfilePosts(world, profile?.id ?? null);

  if (!profile) {
    return (
      <AppShell>
        <div style={{ padding: 20, color: theme.colors.textSecondary }}>Profile not found.</div>
      </AppShell>
    );
  }

  const isSelf = profile.id === currentUser?.id;
  const isFollowing = Boolean(currentUser && currentUser.followingIds.includes(profile.id));

  return (
    <AppShell>
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>{profile.username}</div>
        <div style={{ display: "flex", gap: 14 }}>
          <Icon name="plus" />
          <Icon name="more" />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <div style={{ padding: "18px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
            <Avatar size={84} src={profile.avatarUrl} />
            {[
              ["Posts", posts.length],
              ["Followers", profile.followers],
              ["Following", profile.following],
            ].map(([label, value]) => (
              <div key={label} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCount(Number(value))}</div>
                <div style={{ marginTop: 4, fontSize: 13, color: theme.colors.textSecondary }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{profile.displayName}</div>
            {profile.bio ? (
              <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45 }}>
                {profile.bio}
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                height: 34,
                borderRadius: 8,
                border: `1px solid ${theme.colors.border}`,
                background: isSelf ? theme.colors.surface : theme.colors.textPrimary,
                color: isSelf ? theme.colors.textPrimary : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {isSelf ? "Edit profile" : isFollowing ? "Following" : "Follow"}
            </div>
            <div
              style={{
                flex: 1,
                height: 34,
                borderRadius: 8,
                border: `1px solid ${theme.colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Share profile
            </div>
          </div>
        </div>

        <div style={{ display: "flex", borderTop: `1px solid ${theme.colors.border}`, borderBottom: `1px solid ${theme.colors.border}` }}>
          {(["posts", "tagged"] as const).map((tab) => (
            <div
              key={tab}
              style={{
                flex: 1,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderBottom:
                  state?.profileTab === tab
                    ? `2px solid ${theme.colors.textPrimary}`
                    : "2px solid transparent",
                fontSize: 13,
                fontWeight: 700,
                color: state?.profileTab === tab ? theme.colors.textPrimary : theme.colors.textSecondary,
                textTransform: "capitalize",
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: theme.colors.border,
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                aspectRatio: "1 / 1",
                background: theme.colors.backgroundAlt,
                overflow: "hidden",
              }}
            >
              <img src={post.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>

      <BottomNav active={isSelf ? "profile" : "home"} />
    </AppShell>
  );
};
