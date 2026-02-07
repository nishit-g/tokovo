import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, Pill, ReactionChip } from "./components.js";
import { getFeedPosts, getUserById } from "../runtime/selectors.js";

export const Feed: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const posts = getFeedPosts(world);

  return (
    <div style={{ flex: 1, overflow: "auto", padding: theme.spacing.screenPadding }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: theme.colors.accent, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800 }}>in</div>
          <div style={{ fontSize: theme.typography.title.fontSize, fontWeight: theme.typography.title.fontWeight }}>Home</div>
        </div>
        <Pill>Top</Pill>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((p) => {
          const author = getUserById(world, p.authorId);
          const reactionCounts = p.reactions ?? {};
          const likeCount = (reactionCounts.like ?? 0) + (reactionCounts.celebrate ?? 0) + (reactionCounts.love ?? 0);
          return (
            <div
              key={p.id}
              className="li-fade-up"
              style={{
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.spacing.cardRadius,
                overflow: "hidden",
                boxShadow: theme.mode === "dark" ? "0 16px 40px rgba(0,0,0,0.35)" : "0 16px 40px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", gap: theme.spacing.avatarGap }}>
                  <LIAvatar size={theme.spacing.avatarSize} src={author?.avatarUrl} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <div style={{ fontSize: theme.typography.headline.fontSize, fontWeight: theme.typography.headline.fontWeight }}>
                        {author?.name ?? "Unknown"}
                      </div>
                      <div style={{ color: theme.colors.textMuted, fontSize: theme.typography.caption.fontSize }}>• 1d</div>
                    </div>
                    <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.caption.fontSize }}>{author?.headline ?? "Professional"}</div>
                  </div>
                </div>

                <div style={{ marginTop: 10, fontSize: theme.typography.body.fontSize, lineHeight: "20px" }}>
                  {p.text}
                </div>

                {p.linkPreview?.url && (
                  <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${theme.colors.border}`, overflow: "hidden" }}>
                    <div style={{ height: 110, background: theme.mode === "dark" ? "linear-gradient(135deg, #142233 0%, #0F1720 100%)" : "linear-gradient(135deg, #D8EAFE 0%, #FFFFFF 100%)" }} />
                    <div style={{ padding: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{p.linkPreview.title}</div>
                      <div style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{p.linkPreview.domain}</div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderTop: `1px solid ${theme.colors.border}`, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <ReactionChip reaction="like" count={reactionCounts.like ?? 0} />
                  <ReactionChip reaction="celebrate" count={reactionCounts.celebrate ?? 0} />
                  <ReactionChip reaction="insightful" count={reactionCounts.insightful ?? 0} />
                </div>
                <div style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{likeCount} reactions • {p.commentIds.length} comments</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

