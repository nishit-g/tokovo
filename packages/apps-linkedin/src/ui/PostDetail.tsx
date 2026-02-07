import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, LIIcon, Pill } from "./components.js";
import { getActivePost, getCommentsForPost, getUserById } from "../runtime/selectors.js";

export const PostDetail: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const post = getActivePost(world);
  const comments = getCommentsForPost(world, post?.id ?? null);
  const author = getUserById(world, post?.authorId ?? null);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: theme.spacing.screenPadding, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LIIcon name="back" />
          <div style={{ fontSize: theme.typography.title.fontSize, fontWeight: theme.typography.title.fontWeight }}>Post</div>
        </div>
        <Pill>Public</Pill>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: theme.spacing.screenPadding, paddingTop: 0 }}>
        {!post ? (
          <div style={{ color: theme.colors.textSecondary }}>No active post.</div>
        ) : (
          <>
            <div
              style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.spacing.cardRadius,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", gap: theme.spacing.avatarGap }}>
                <LIAvatar size={theme.spacing.avatarSize} src={author?.avatarUrl} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: theme.typography.headline.fontSize, fontWeight: theme.typography.headline.fontWeight }}>
                    {author?.name ?? "Unknown"}
                  </div>
                  <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.caption.fontSize }}>{author?.headline ?? "Professional"}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: theme.typography.body.fontSize, lineHeight: "20px" }}>{post.text}</div>
            </div>

            <div style={{ marginTop: 14, marginBottom: 8, color: theme.colors.textSecondary, fontSize: 12 }}>
              {comments.length} comments
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {comments.map((c) => {
                const u = getUserById(world, c.authorId);
                return (
                  <div key={c.id} style={{ display: "flex", gap: 10 }}>
                    <LIAvatar size={34} src={u?.avatarUrl} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{u?.name ?? "Unknown"}</div>
                        <div style={{ fontSize: 11, color: theme.colors.textMuted }}>• 1h</div>
                      </div>
                      <div style={{ fontSize: 13, color: theme.colors.textPrimary, lineHeight: "18px" }}>{c.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          padding: 12,
          background: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LIAvatar size={30} />
          <div
            style={{
              flex: 1,
              height: 40,
              borderRadius: 999,
              border: `1px solid ${theme.colors.border}`,
              background: theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              color: theme.colors.textMuted,
              fontSize: 13,
            }}
          >
            Add a comment...
          </div>
        </div>
      </div>
    </div>
  );
};

