import React from "react";
import type { WorldState } from "@tokovo/core";
import { getTypedTextProgress } from "@tokovo/device-keyboard";
import { useXTheme } from "./ThemeContext.js";
import { getXState } from "../runtime/selectors.js";
import { AppShell } from "./AppShell.js";
import { Avatar } from "./components.js";
import { ScreenTransition } from "./ScreenTransition.js";
import { BottomNav } from "./BottomNav.js";

interface ComposeProps {
  world: WorldState;
  deviceId?: string;
  t?: number;
}

export const Compose: React.FC<ComposeProps> = ({ world, deviceId, t }) => {
  const theme = useXTheme();
  const state = getXState(world);
  const draft = state?.composeDraft ?? "";
  const currentUser = state?.users.find((u) => u.id === state?.currentUserId);
  const focusedDevice =
    (deviceId && world.devices?.[deviceId]) ||
    world.devices?.[Object.keys(world.devices ?? {})[0]];
  const keyboard = focusedDevice?.keyboard;
  const typedDraft =
    keyboard?.visible && keyboard.typingAnimation
      ? getTypedTextProgress(keyboard, t ?? 0)
      : draft;
  const draftLength = typedDraft.length;
  const isEmpty = draftLength === 0;
  const isOverLimit = draftLength > 280;
  const canPost = !isEmpty && !isOverLimit;
  const ctaBg = canPost ? theme.colors.textPrimary : theme.colors.surfaceRaised;
  const ctaFg = canPost ? theme.colors.background : theme.colors.textMuted;

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
        <span style={{ fontSize: 14, fontWeight: 700 }}>Compose</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: ctaFg,
            backgroundColor: ctaBg,
            padding: "6px 12px",
            borderRadius: 999,
            border: `1px solid ${theme.colors.border}`,
            opacity: canPost ? 1 : 0.75,
          }}
        >
          Post
        </span>
      </div>

      <ScreenTransition lastNavFrame={state?.lastNavFrame}>
        <div style={{ padding: theme.spacing.screenPadding, flex: 1 }}>
          <div
            style={{
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 18,
              padding: theme.spacing.tweetPaddingH,
              backgroundColor: theme.colors.surface,
              display: "flex",
              gap: 12,
            }}
          >
            <Avatar size={theme.spacing.avatarSize} src={currentUser?.avatarUrl} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, lineHeight: 1.5, minHeight: 120 }}>
                {typedDraft || "What's happening?"}
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: theme.colors.textMuted,
                  fontSize: 12,
                }}
              >
                <span style={{ color: isOverLimit ? theme.colors.likeActive : undefined }}>
                  {draftLength}/280
                </span>
                <span style={{ color: theme.colors.accent }}>Everyone can reply</span>
              </div>
            </div>
          </div>
        </div>
      </ScreenTransition>

      <BottomNav />
    </AppShell>
  );
};
