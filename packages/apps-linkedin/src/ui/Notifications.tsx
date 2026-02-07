import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, Pill } from "./components.js";
import { getNotifications, getUserById } from "../runtime/selectors.js";

export const Notifications: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const items = getNotifications(world);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: theme.spacing.screenPadding }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: theme.typography.title.fontSize, fontWeight: theme.typography.title.fontWeight }}>Notifications</div>
        <Pill>{items.length}</Pill>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((n) => {
          const u = getUserById(world, n.actorId);
          return (
            <div
              key={n.id}
              style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 14,
                padding: 12,
                display: "flex",
                gap: 10,
              }}
            >
              <LIAvatar size={38} src={u?.avatarUrl} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{u?.name ?? "Someone"}</div>
                <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                  {n.type} {n.postId ? `on your post` : ""}
                </div>
              </div>
              <div style={{ color: theme.colors.textMuted, fontSize: 11 }}>1h</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

