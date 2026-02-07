import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, Pill } from "./components.js";
import { getDMThreads, getUserById } from "../runtime/selectors.js";

export const Messages: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const threads = getDMThreads(world);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: theme.spacing.screenPadding }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: theme.typography.title.fontSize, fontWeight: theme.typography.title.fontWeight }}>Messages</div>
        <Pill>{threads.length}</Pill>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {threads.map((t) => {
          const firstOther = t.participantIds.find((id) => id !== null);
          const u = getUserById(world, firstOther ?? null);
          return (
            <div
              key={t.id}
              style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 14,
                padding: 12,
                display: "flex",
                gap: 10,
              }}
            >
              <LIAvatar size={42} src={u?.avatarUrl} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 13 }}>{u?.name ?? "Thread"}</div>
                <div style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Tap to open</div>
              </div>
              <div style={{ color: theme.colors.textMuted, fontSize: 11 }}>Now</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

