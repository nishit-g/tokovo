/**
 * Instagram Post Component (iOS)
 */

import React from "react";
import { instagramTheme } from "../../config/theme";
import type { InstagramPost } from "../../types";

interface PostProps {
    post: InstagramPost;
}

// Icons
const HeartIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#ED4956" : "none"} stroke={filled ? "#ED4956" : "currentColor"} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CommentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

export const Post: React.FC<PostProps> = ({ post }) => {
    const theme = instagramTheme;

    return (
        <div
            data-post-id={post.id}
            style={{
                backgroundColor: theme.colors.background,
                borderBottom: `1px solid ${theme.colors.divider}`,
            }}
        >
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: theme.spacing.postPadding,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Avatar */}
                    <div style={{
                        width: theme.spacing.avatarSize,
                        height: theme.spacing.avatarSize,
                        borderRadius: "50%",
                        backgroundColor: theme.colors.backgroundSecondary,
                        backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
                        backgroundSize: "cover",
                    }} />
                    {/* Username */}
                    <div>
                        <span style={{
                            ...theme.typography.username,
                            color: theme.colors.textPrimary,
                        }}>
                            {post.author.username}
                            {post.author.verified && " ✓"}
                        </span>
                    </div>
                </div>
                {/* More */}
                <div style={{ color: theme.colors.textPrimary }}>•••</div>
            </div>

            {/* Image */}
            <div style={{
                width: "100%",
                aspectRatio: "1",
                backgroundColor: theme.colors.backgroundSecondary,
                backgroundImage: post.image ? `url(${post.image})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }} />

            {/* Actions */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: theme.spacing.postPadding,
            }}>
                <div style={{ display: "flex", gap: 16, color: theme.colors.icon }}>
                    <HeartIcon filled={post.liked} />
                    <CommentIcon />
                    <ShareIcon />
                </div>
                <div style={{ color: theme.colors.icon }}>
                    <BookmarkIcon filled={post.saved} />
                </div>
            </div>

            {/* Likes */}
            {post.likes > 0 && (
                <div style={{
                    paddingLeft: theme.spacing.postPadding,
                    paddingRight: theme.spacing.postPadding,
                    paddingBottom: 8,
                }}>
                    <span style={{
                        ...theme.typography.likes,
                        color: theme.colors.textPrimary,
                    }}>
                        {post.likes.toLocaleString()} likes
                    </span>
                </div>
            )}

            {/* Caption */}
            {post.caption && (
                <div style={{
                    paddingLeft: theme.spacing.postPadding,
                    paddingRight: theme.spacing.postPadding,
                    paddingBottom: 8,
                }}>
                    <span style={{
                        ...theme.typography.username,
                        color: theme.colors.textPrimary,
                    }}>
                        {post.author.username}
                    </span>
                    {" "}
                    <span style={{
                        ...theme.typography.caption,
                        color: theme.colors.textPrimary,
                    }}>
                        {post.caption}
                    </span>
                </div>
            )}

            {/* Comments preview */}
            {post.comments.length > 0 && (
                <div style={{
                    paddingLeft: theme.spacing.postPadding,
                    paddingRight: theme.spacing.postPadding,
                    paddingBottom: 8,
                }}>
                    <span style={{
                        ...theme.typography.caption,
                        color: theme.colors.textSecondary,
                    }}>
                        View all {post.comments.length} comments
                    </span>
                </div>
            )}

            {/* Timestamp */}
            <div style={{
                paddingLeft: theme.spacing.postPadding,
                paddingRight: theme.spacing.postPadding,
                paddingBottom: theme.spacing.postPadding,
            }}>
                <span style={{
                    ...theme.typography.timestamp,
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                }}>
                    {post.timestamp}
                </span>
            </div>
        </div>
    );
};
