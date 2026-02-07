/**
 * Post Detail Screen
 * ==================
 * Single post view with comments.
 */
import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { Header, LIAvatar, LIIcon } from "./components.js";
import { PostCard } from "./PostCard.js";
import { getActivePost, getCommentsForPost, getUserById } from "../runtime/selectors.js";
import type { LIReactionType } from "../types/index.js";

export const PostDetail: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const post = getActivePost(world);
  const comments = getCommentsForPost(world, post?.id ?? null);
  const author = getUserById(world, post?.authorId ?? null);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header with back button */}
      <Header showBack title="Post" />

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.screenPadding,
        }}
      >
        {!post ? (
          <div
            style={{
              padding: theme.spacing.xxl,
              textAlign: "center",
              color: theme.colors.textSecondary,
            }}
          >
            Post not found
          </div>
        ) : (
          <>
            {/* Main Post */}
            <PostCard
              authorName={author?.name ?? "LinkedIn User"}
              authorHeadline={author?.headline}
              authorAvatar={author?.avatarUrl}
              timeAgo="1h"
              content={post.text}
              linkPreview={post.linkPreview}
              reactions={post.reactions as Partial<Record<LIReactionType, number>>}
              commentCount={comments.length}
              repostCount={0}
            />

            {/* Comments Section */}
            {comments.length > 0 && (
              <div style={{ marginTop: theme.spacing.sectionGap }}>
                <div
                  style={{
                    fontSize: theme.typography.headline.fontSize,
                    fontWeight: theme.typography.headline.fontWeight,
                    color: theme.colors.textSecondary,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Comments
                </div>

                <div
                  style={{
                    background: theme.colors.surface,
                    borderRadius: theme.radius.card,
                    boxShadow: theme.shadows.card,
                  }}
                >
                  {comments.map((comment, index) => {
                    const commentAuthor = getUserById(world, comment.authorId);
                    return (
                      <div
                        key={comment.id}
                        style={{
                          padding: theme.spacing.cardPadding,
                          borderBottom:
                            index < comments.length - 1
                              ? `1px solid ${theme.colors.border}`
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: theme.spacing.avatarGap,
                          }}
                        >
                          <LIAvatar
                            size="sm"
                            src={commentAuthor?.avatarUrl}
                            name={commentAuthor?.name}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: theme.spacing.xs,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: theme.typography.captionSemibold.fontSize,
                                  fontWeight: theme.typography.captionSemibold.fontWeight,
                                  color: theme.colors.textPrimary,
                                }}
                              >
                                {commentAuthor?.name ?? "User"}
                              </span>
                              <span
                                style={{
                                  fontSize: theme.typography.caption.fontSize,
                                  color: theme.colors.textTertiary,
                                }}
                              >
                                • 1h
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: theme.typography.bodySmall.fontSize,
                                color: theme.colors.textPrimary,
                                marginTop: theme.spacing.xs,
                                lineHeight: theme.typography.bodySmall.lineHeight,
                              }}
                            >
                              {comment.text}
                            </div>

                            {/* Comment actions */}
                            <div
                              style={{
                                display: "flex",
                                gap: theme.spacing.lg,
                                marginTop: theme.spacing.sm,
                                color: theme.colors.textSecondary,
                                fontSize: theme.typography.caption.fontSize,
                                fontWeight: 600,
                              }}
                            >
                              <span>Like</span>
                              <span>Reply</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comment Composer */}
      <div
        style={{
          padding: theme.spacing.md,
          background: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <LIAvatar size="sm" />
          <div
            style={{
              flex: 1,
              height: theme.spacing.inputHeight,
              background: theme.colors.surfaceHover,
              borderRadius: theme.radius.pill,
              display: "flex",
              alignItems: "center",
              padding: `0 ${theme.spacing.md}px`,
              color: theme.colors.textTertiary,
              fontSize: theme.typography.body.fontSize,
            }}
          >
            Add a comment...
          </div>
          <LIIcon name="send" size={20} color={theme.colors.accent} />
        </div>
      </div>
    </div>
  );
};
