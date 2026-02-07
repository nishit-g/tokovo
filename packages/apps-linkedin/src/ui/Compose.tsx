import React from "react";
import type { WorldState } from "@tokovo/core";
import { getTypedTextProgress } from "@tokovo/device-keyboard";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, Pill } from "./components.js";
import type { LinkedInState } from "../runtime/state.js";

export const Compose: React.FC<{ world: WorldState; deviceId?: string; t?: number }> = ({ world, deviceId, t }) => {
  const theme = useLinkedInTheme();
  const appState = world.appState?.["app_linkedin"] as LinkedInState | undefined;
  const focusedDevice = (deviceId && world.devices?.[deviceId]) || world.devices?.[Object.keys(world.devices ?? {})[0]];
  const keyboard = focusedDevice?.keyboard;

  const draftText =
    keyboard?.visible && keyboard.typingAnimation
      ? getTypedTextProgress(keyboard, t ?? 0)
      : (appState?.composeDraft ?? "");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: theme.spacing.screenPadding, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: theme.typography.title.fontSize, fontWeight: theme.typography.title.fontWeight }}>Start a post</div>
          <Pill>{appState?.themeMode ?? "light"}</Pill>
        </div>
        <div style={{ background: theme.colors.accent, color: "#fff", padding: "8px 12px", borderRadius: 999, fontWeight: 800, fontSize: 12 }}>
          Post
        </div>
      </div>

      <div style={{ flex: 1, padding: theme.spacing.screenPadding, paddingTop: 6, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LIAvatar size={40} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>You</div>
            <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>Posting to anyone</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            minHeight: 240,
            borderRadius: 14,
            border: `1px dashed ${theme.colors.borderStrong}`,
            background: theme.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.65)",
            padding: 14,
            fontSize: 15,
            lineHeight: "21px",
            color: draftText ? theme.colors.textPrimary : theme.colors.textMuted,
            whiteSpace: "pre-wrap",
          }}
        >
          {draftText || "What do you want to talk about?"}
        </div>
      </div>
    </div>
  );
};

