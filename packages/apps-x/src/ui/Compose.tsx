import React from "react";
import type { WorldState } from "@tokovo/core";
import { getXTheme } from "../config/theme";
import { getXState } from "../runtime/selectors";
import { AppShell } from "./AppShell";
import { Avatar, XIcon } from "./components";
import { ScreenTransition } from "./ScreenTransition";
import { BottomNav } from "./BottomNav";

interface ComposeProps {
  world: WorldState;
}

export const Compose: React.FC<ComposeProps> = ({ world }) => {
  const theme = getXTheme("dark");
  const state = getXState(world);
  const draft = state?.composeDraft ?? "";

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
            color: theme.colors.background,
            backgroundColor: theme.colors.textPrimary,
            padding: "6px 12px",
            borderRadius: 999,
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
            <Avatar size={theme.spacing.avatarSize} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, lineHeight: 1.5, minHeight: 120 }}>
                {draft || "What's happening?"}
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
                <span>{draft.length}/280</span>
                <span style={{ color: theme.colors.accent }}>Everyone can reply</span>
              </div>
            </div>
          </div>
        </div>
      </ScreenTransition>

      <BottomNav active="home" />
    </AppShell>
  );
};
