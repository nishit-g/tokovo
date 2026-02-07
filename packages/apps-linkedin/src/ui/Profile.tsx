/**
 * Profile Screen
 * ==============
 * LinkedIn profile page with banner, avatar, stats, and actions.
 */
import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, Header, Button, LIIcon } from "./components.js";
import { getActiveUser, getUserById } from "../runtime/selectors.js";
import type { LinkedInState } from "../runtime/state.js";

export const Profile: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const state = world.appState?.["app_linkedin"] as LinkedInState | undefined;
  const user = getActiveUser(world) ?? getUserById(world, state?.currentUserId ?? null);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Header title="Profile" showSearch={false} />

      {/* Profile Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Profile Card */}
        <div
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            margin: theme.spacing.screenPadding,
            overflow: "hidden",
          }}
        >
          {/* Banner */}
          <div
            style={{
              height: theme.spacing.bannerHeight,
              background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.accentHover} 100%)`,
              position: "relative",
            }}
          >
            {/* Camera icon for banner edit */}
            <div
              style={{
                position: "absolute",
                top: theme.spacing.sm,
                right: theme.spacing.sm,
                width: 32,
                height: 32,
                borderRadius: theme.radius.pill,
                background: theme.colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LIIcon name="photo" size={16} color={theme.colors.textSecondary} />
            </div>
          </div>

          {/* Avatar - positioned to overlap banner */}
          <div
            style={{
              padding: `0 ${theme.spacing.cardPadding}px`,
              marginTop: theme.spacing.profileAvatarOffset,
            }}
          >
            <div
              style={{
                width: theme.spacing.avatarXl + 8,
                height: theme.spacing.avatarXl + 8,
                borderRadius: theme.radius.avatar,
                background: theme.colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LIAvatar size="xl" src={user?.avatarUrl} name={user?.name} />
            </div>
          </div>

          {/* User Info */}
          <div style={{ padding: theme.spacing.cardPadding, paddingTop: theme.spacing.md }}>
            <div
              style={{
                fontSize: theme.typography.display.fontSize,
                fontWeight: theme.typography.display.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              {user?.name ?? "Your Name"}
            </div>
            <div
              style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textSecondary,
                marginTop: theme.spacing.xs,
              }}
            >
              {user?.headline ?? "Add a headline"}
            </div>

            {/* Location */}
            <div
              style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.textTertiary,
                marginTop: theme.spacing.sm,
              }}
            >
              San Francisco Bay Area · 500+ connections
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: "flex",
                gap: theme.spacing.md,
                marginTop: theme.spacing.md,
                fontSize: theme.typography.headline.fontSize,
                fontWeight: theme.typography.headline.fontWeight,
              }}
            >
              <span style={{ color: theme.colors.accent }}>
                {user?.connections ?? 500}+ connections
              </span>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: theme.spacing.sm,
                marginTop: theme.spacing.lg,
              }}
            >
              <Button variant="primary" size="md">
                Open to
              </Button>
              <Button variant="secondary" size="md">
                Add section
              </Button>
              <Button variant="ghost" size="md">
                More
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Card */}
        <div
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            margin: `0 ${theme.spacing.screenPadding}px`,
            marginBottom: theme.spacing.screenPadding,
            padding: theme.spacing.cardPadding,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.md,
            }}
          >
            Analytics
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: theme.colors.textSecondary,
              fontSize: theme.typography.body.fontSize,
            }}
          >
            <div>
              <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>127</span> profile views
            </div>
            <div>
              <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>45</span> post impressions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
