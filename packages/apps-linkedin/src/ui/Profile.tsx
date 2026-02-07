import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, Pill } from "./components.js";
import { getActiveUser, getUserById } from "../runtime/selectors.js";
import type { LinkedInState } from "../runtime/state.js";

export const Profile: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const state = world.appState?.["app_linkedin"] as LinkedInState | undefined;
  const active = getActiveUser(world) ?? getUserById(world, state?.currentUserId ?? null);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: theme.spacing.screenPadding }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: theme.typography.title.fontSize, fontWeight: theme.typography.title.fontWeight }}>Profile</div>
        <Pill>{state?.themeMode ?? "light"}</Pill>
      </div>

      <div
        style={{
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.spacing.cardRadius,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 92, background: theme.mode === "dark" ? "linear-gradient(135deg, #142233 0%, #0B1117 100%)" : "linear-gradient(135deg, #0A66C2 0%, #A8D8FF 100%)" }} />
        <div style={{ padding: 14 }}>
          <div style={{ marginTop: -36 }}>
            <LIAvatar size={72} src={active?.avatarUrl} />
          </div>
          <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900 }}>{active?.name ?? "Unknown"}</div>
          <div style={{ marginTop: 4, color: theme.colors.textSecondary, fontSize: 13 }}>{active?.headline ?? "Professional"}</div>
          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <Pill>{active?.connections ?? 0} connections</Pill>
            <Pill>{active?.followers ?? 0} followers</Pill>
          </div>
        </div>
      </div>
    </div>
  );
};

