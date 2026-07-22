import React from "react";
import type { WorldState } from "@tokovo/core";
import { DeterministicImage, useInputField } from "@tokovo/react";
import { AppShell } from "./AppShell.js";
import { Icon } from "./components.js";
import { useInstagramTheme } from "./ThemeContext.js";
import { getInstagramState } from "../runtime/selectors.js";

export const ComposerScreen: React.FC<{
  world: WorldState;
  deviceId: string;
  t: number;
}> = ({ world, deviceId }) => {
  const theme = useInstagramTheme();
  const state = getInstagramState(world, deviceId);
  const input = useInputField("post");
  const typedCaption = input?.value ?? state?.composerDraft.caption ?? "";

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
        <Icon name="back" />
        <div style={{ fontSize: 16, fontWeight: 700 }}>New post</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.accentCool }}>Share</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "16px" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 22,
            overflow: "hidden",
            background: theme.colors.backgroundAlt,
            boxShadow:
              theme.mode === "storybook"
                ? "0 18px 42px rgba(114,154,115,0.18)"
                : "0 18px 42px rgba(17,17,17,0.08)",
          }}
        >
          {state?.composerDraft.imageUrl ? (
            <DeterministicImage
              src={state.composerDraft.imageUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>

        <div
          style={{
            marginTop: 18,
            borderRadius: 18,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.surface,
            padding: "14px",
          }}
        >
          <div
            lang={input?.locale.tag}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: theme.colors.textSecondary,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            Caption
          </div>
          <div
            style={{
              marginTop: 10,
              minHeight: 88,
              fontSize: 15,
              lineHeight: 1.5,
              color: typedCaption ? theme.colors.textPrimary : theme.colors.textSecondary,
              whiteSpace: "pre-wrap",
              direction: input?.direction,
              unicodeBidi: "plaintext",
            }}
          >
            {typedCaption || "Write a caption..."}
          </div>
          {state?.composerDraft.location ? (
            <div style={{ marginTop: 14, fontSize: 13, color: theme.colors.textSecondary }}>
              Location: {state.composerDraft.location}
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
};
