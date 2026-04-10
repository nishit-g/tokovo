/**
 * Compose Screen
 * ==============
 * LinkedIn post creation interface.
 */
import React from "react";
import type { WorldState } from "@tokovo/core";
import { getTypedTextProgress } from "@tokovo/device-keyboard";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, LIIcon } from "./components.js";
import type { LinkedInState } from "../runtime/state.js";
import { getActiveUser } from "../runtime/selectors.js";

export const Compose: React.FC<{ world: WorldState; deviceId?: string; t?: number }> = ({
  world,
  deviceId,
  t,
}) => {
  const theme = useLinkedInTheme();
  const appState = world.appState?.["app_linkedin"] as LinkedInState | undefined;
  const currentUser = getActiveUser(world);
  const focusedDevice =
    (deviceId && world.devices?.[deviceId]) || world.devices?.[Object.keys(world.devices ?? {})[0]];
  const keyboard = focusedDevice?.keyboard;

  const draftText =
    keyboard?.visible && keyboard.typingAnimation
      ? getTypedTextProgress(keyboard, t ?? 0)
      : appState?.composeDraft ?? "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          height: theme.spacing.headerHeight,
          background: theme.colors.surface,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${theme.spacing.screenPadding}px`,
          gap: theme.spacing.md,
        }}
      >
        <LIIcon name="close" size={24} color={theme.colors.textPrimary} />
        <div style={{ flex: 1 }} />
        <div
          style={{
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            background: theme.colors.accent,
            borderRadius: theme.radius.button,
            color: theme.colors.textInverse,
            fontSize: theme.typography.headline.fontSize,
            fontWeight: theme.typography.headline.fontWeight,
            opacity: draftText ? 1 : 0.5,
          }}
        >
          Post
        </div>
      </div>

      {/* Compose Area */}
      <div style={{ flex: 1, overflow: "auto", padding: theme.spacing.screenPadding }}>
        {/* User Info */}
        <div style={{ display: "flex", gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          <LIAvatar size="lg" src={currentUser?.avatarUrl} name={currentUser?.name} />
          <div>
            <div
              style={{
                fontSize: theme.typography.headline.fontSize,
                fontWeight: theme.typography.headline.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              {currentUser?.name ?? "You"}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: theme.spacing.xs,
                marginTop: theme.spacing.xs,
                padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.pill,
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.textSecondary,
              }}
            >
              <span>🌐</span>
              <span>Anyone</span>
              <span style={{ fontSize: 10 }}>▼</span>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div
          style={{
            minHeight: 200,
            fontSize: theme.typography.title.fontSize,
            lineHeight: 1.5,
            color: draftText ? theme.colors.textPrimary : theme.colors.textTertiary,
            whiteSpace: "pre-wrap",
          }}
        >
          {draftText || "What do you want to talk about?"}
        </div>
      </div>

      {/* Media Bar */}
      <div
        style={{
          padding: theme.spacing.md,
          background: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.lg,
        }}
      >
        <LIIcon name="photo" size={24} color={theme.colors.textSecondary} />
        <LIIcon name="video" size={24} color={theme.colors.textSecondary} />
        <LIIcon name="calendar" size={24} color={theme.colors.textSecondary} />
        <LIIcon name="more" size={24} color={theme.colors.textSecondary} />
      </div>
    </div>
  );
};
