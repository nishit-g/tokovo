/**
 * Compose Screen
 * ==============
 * LinkedIn post creation interface.
 */
import React from "react";
import type { WorldState } from "@tokovo/core";
import { KeyboardAwareView, ScrollableContent, useKeyboardState } from "@tokovo/react";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, LIIcon } from "./components.js";
import { getCurrentUser } from "../runtime/selectors.js";

export const Compose: React.FC<{ world: WorldState; deviceId?: string; t?: number }> = ({
  world,
  deviceId: _deviceId,
  t: _t,
}) => {
  const theme = useLinkedInTheme();
  const currentUser = getCurrentUser(world);
  const keyboardState = useKeyboardState();
  const state = world.appState?.["app_linkedin"] as { composeDraft?: string } | undefined;
  const draftText = keyboardState.isKeyboardVisible && keyboardState.inputText
    ? keyboardState.inputText
    : state?.composeDraft ?? "";

  return (
    <KeyboardAwareView style={{ flex: 1, minHeight: 0 }}>
      <div
        style={{
          minHeight: theme.spacing.headerHeight,
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

      <ScrollableContent
        style={{
          flex: 1,
          padding: theme.spacing.screenPadding,
          background: theme.colors.surface,
        }}
      >
        <div style={{ display: "flex", gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          <LIAvatar size="lg" src={currentUser?.avatarUrl} name={currentUser?.name} />
          <div style={{ minWidth: 0, flex: 1 }}>
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
            <div
              style={{
                marginTop: theme.spacing.sm,
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Post will appear in feed and on your profile.
            </div>
          </div>
        </div>

        <div
          style={{
            minHeight: keyboardState.isKeyboardVisible ? 260 : 320,
            fontSize: theme.typography.title.fontSize,
            lineHeight: 1.5,
            color: draftText ? theme.colors.textPrimary : theme.colors.textTertiary,
            whiteSpace: "pre-wrap",
          }}
        >
          {draftText || "What do you want to talk about?"}
          {keyboardState.isKeyboardVisible ? (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: theme.typography.title.fontSize + 4,
                marginLeft: 2,
                transform: "translateY(3px)",
                background: theme.colors.textPrimary,
                borderRadius: 1,
              }}
            />
          ) : null}
        </div>

        <div
          style={{
            marginTop: theme.spacing.xl,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: theme.spacing.sm,
          }}
        >
          <ComposeTool icon="photo" label="Add a photo" />
          <ComposeTool icon="video" label="Add a video" />
          <ComposeTool icon="article" label="Write article" />
          <ComposeTool icon="calendar" label="Create event" />
        </div>
      </ScrollableContent>

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
        <LIIcon name="article" size={24} color={theme.colors.textSecondary} />
        <LIIcon name="more" size={24} color={theme.colors.textSecondary} />
      </div>
    </KeyboardAwareView>
  );
};

const ComposeTool: React.FC<{ icon: "photo" | "video" | "article" | "calendar"; label: string }> = ({
  icon,
  label,
}) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        minHeight: 54,
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surfaceHover,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.sm,
        padding: `0 ${theme.spacing.md}px`,
        fontSize: theme.typography.captionSemibold.fontSize,
        fontWeight: theme.typography.captionSemibold.fontWeight,
        color: theme.colors.textPrimary,
      }}
    >
      <LIIcon name={icon} size={18} color={theme.colors.accent} />
      <span>{label}</span>
    </div>
  );
};
