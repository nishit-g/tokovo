/**
 * PostCard Component
 * ==================
 * LinkedIn-style post card with author info, content, reactions, and action bar.
 * Matches real LinkedIn's design patterns.
 */
import React from "react";
import { useLinkedInTheme } from "./ThemeContext.js";
import { LIAvatar, LIIcon, ReactionStack, ActionBar } from "./components.js";
import type { LIReactionType } from "../types/index.js";

export interface PostCardProps {
    authorName: string;
    authorHeadline?: string;
    authorAvatar?: string;
    authorFollowers?: string;
    timeAgo?: string;
    content: string;
    image?: string;
    linkPreview?: {
        url: string;
        title: string;
        domain: string;
        image?: string;
    };
    reactions?: Partial<Record<LIReactionType, number>>;
    commentCount?: number;
    repostCount?: number;
    isLiked?: boolean;
    showFollowButton?: boolean;
    isPromoted?: boolean;
}

// Character limit before showing "...see more"
const CONTENT_PREVIEW_LIMIT = 150;

export const PostCard: React.FC<PostCardProps> = ({
    authorName,
    authorHeadline,
    authorAvatar,
    authorFollowers,
    timeAgo = "1h",
    content,
    image,
    linkPreview,
    reactions = {},
    commentCount = 0,
    repostCount = 0,
    isLiked = false,
    showFollowButton = false,
    isPromoted = false,
}) => {
    const theme = useLinkedInTheme();
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Calculate total reactions
    const totalReactions = Object.values(reactions).reduce((a, b) => a + (b ?? 0), 0);

    // Get reaction types that have counts (sorted by count)
    const activeReactions = (Object.keys(reactions) as LIReactionType[])
        .filter((r) => (reactions[r] ?? 0) > 0)
        .sort((a, b) => (reactions[b] ?? 0) - (reactions[a] ?? 0));

    // Check if content needs truncation
    const needsTruncation = content.length > CONTENT_PREVIEW_LIMIT;
    const displayContent = needsTruncation && !isExpanded
        ? content.slice(0, CONTENT_PREVIEW_LIMIT)
        : content;

    // Parse content for hashtags
    const renderContent = (text: string) => {
        const parts = text.split(/(#\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith("#")) {
                return (
                    <span key={i} style={{ color: theme.colors.accent, fontWeight: 600 }}>
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div
            style={{
                background: theme.colors.surface,
                borderRadius: theme.radius.card,
                boxShadow: theme.shadows.card,
                overflow: "hidden",
            }}
        >
            {/* Promoted Badge */}
            {isPromoted && (
                <div
                    style={{
                        padding: `${theme.spacing.xs}px ${theme.spacing.cardPadding}px`,
                        paddingTop: theme.spacing.sm,
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.textTertiary,
                    }}
                >
                    Promoted
                </div>
            )}

            {/* Author Header */}
            <div
                style={{
                    padding: theme.spacing.cardPadding,
                    paddingTop: isPromoted ? theme.spacing.sm : theme.spacing.cardPadding,
                    paddingBottom: theme.spacing.sm,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: theme.spacing.avatarGap,
                    }}
                >
                    <LIAvatar size="lg" src={authorAvatar} name={authorName} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: theme.spacing.xs,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: theme.typography.headline.fontSize,
                                    fontWeight: theme.typography.headline.fontWeight,
                                    color: theme.colors.textPrimary,
                                }}
                            >
                                {authorName}
                            </span>
                            {showFollowButton && (
                                <>
                                    <span style={{ color: theme.colors.textTertiary }}>•</span>
                                    <span
                                        style={{
                                            fontSize: theme.typography.headline.fontSize,
                                            fontWeight: theme.typography.headline.fontWeight,
                                            color: theme.colors.accent,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Follow
                                    </span>
                                </>
                            )}
                        </div>
                        {authorHeadline && (
                            <div
                                style={{
                                    fontSize: theme.typography.caption.fontSize,
                                    color: theme.colors.textSecondary,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    marginTop: 1,
                                }}
                            >
                                {authorHeadline}
                            </div>
                        )}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: theme.spacing.xs,
                                marginTop: 2,
                                fontSize: theme.typography.caption.fontSize,
                                color: theme.colors.textTertiary,
                            }}
                        >
                            <span>{timeAgo}</span>
                            <span>•</span>
                            <GlobeIcon size={12} color={theme.colors.textTertiary} />
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: theme.spacing.xs,
                        }}
                    >
                        <div style={{ padding: theme.spacing.xs, cursor: "pointer" }}>
                            <LIIcon name="more" size={20} color={theme.colors.textSecondary} />
                        </div>
                        <div style={{ padding: theme.spacing.xs, cursor: "pointer" }}>
                            <LIIcon name="close" size={20} color={theme.colors.textSecondary} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    padding: `0 ${theme.spacing.cardPadding}px`,
                    paddingBottom: theme.spacing.md,
                }}
            >
                <div
                    style={{
                        fontSize: theme.typography.body.fontSize,
                        lineHeight: theme.typography.body.lineHeight,
                        color: theme.colors.textPrimary,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {renderContent(displayContent)}
                    {needsTruncation && !isExpanded && (
                        <span
                            onClick={() => setIsExpanded(true)}
                            style={{
                                color: theme.colors.textSecondary,
                                cursor: "pointer",
                                fontWeight: 500,
                            }}
                        >
                            ...see more
                        </span>
                    )}
                </div>
            </div>

            {/* Image */}
            {image && (
                <div
                    style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        background: `url(${image}) center/cover`,
                        backgroundColor: theme.colors.skeleton,
                    }}
                />
            )}

            {/* Link Preview */}
            {linkPreview && (
                <div
                    style={{
                        border: `1px solid ${theme.colors.border}`,
                        borderLeft: "none",
                        borderRight: "none",
                        background: theme.colors.surfaceHover,
                    }}
                >
                    {linkPreview.image && (
                        <div
                            style={{
                                width: "100%",
                                height: 150,
                                background: `url(${linkPreview.image}) center/cover`,
                                backgroundColor: theme.colors.skeleton,
                            }}
                        />
                    )}
                    <div style={{ padding: theme.spacing.md }}>
                        <div
                            style={{
                                fontSize: theme.typography.headline.fontSize,
                                fontWeight: theme.typography.headline.fontWeight,
                                color: theme.colors.textPrimary,
                                marginBottom: theme.spacing.xs,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {linkPreview.title}
                        </div>
                        <div
                            style={{
                                fontSize: theme.typography.caption.fontSize,
                                color: theme.colors.textSecondary,
                            }}
                        >
                            {linkPreview.domain}
                        </div>
                    </div>
                </div>
            )}

            {/* Reactions & Comments Row */}
            {(totalReactions > 0 || commentCount > 0 || repostCount > 0) && (
                <div
                    style={{
                        padding: `${theme.spacing.sm}px ${theme.spacing.cardPadding}px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Reactions */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: theme.spacing.xs,
                            cursor: "pointer",
                        }}
                    >
                        {activeReactions.length > 0 && <ReactionStack reactions={activeReactions} size={16} />}
                        {totalReactions > 0 && (
                            <span
                                style={{
                                    fontSize: theme.typography.caption.fontSize,
                                    color: theme.colors.textSecondary,
                                }}
                            >
                                {formatReactionText(totalReactions, authorName)}
                            </span>
                        )}
                    </div>

                    {/* Comments & Reposts */}
                    <div
                        style={{
                            display: "flex",
                            gap: theme.spacing.md,
                            fontSize: theme.typography.caption.fontSize,
                            color: theme.colors.textSecondary,
                        }}
                    >
                        {commentCount > 0 && (
                            <span style={{ cursor: "pointer" }}>
                                {commentCount} comment{commentCount !== 1 ? "s" : ""}
                            </span>
                        )}
                        {repostCount > 0 && (
                            <span style={{ cursor: "pointer" }}>
                                {repostCount} repost{repostCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <ActionBar
                likeCount={reactions.like ?? 0}
                commentCount={commentCount}
                repostCount={repostCount}
                isLiked={isLiked}
            />
        </div>
    );
};

// Helper to format reaction text like "John and 42 others"
function formatReactionText(count: number, _authorName: string): string {
    if (count === 1) return "1";
    if (count < 100) return count.toString();
    if (count < 1000) return count.toString();
    return `${Math.floor(count / 1000)}K`;
}

// Simple globe icon for visibility indicator
const GlobeIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.5" />
        <ellipse cx="8" cy="8" rx="3" ry="6.5" stroke={color} strokeWidth="1.5" />
        <path d="M1.5 8h13M2.5 4.5h11M2.5 11.5h11" stroke={color} strokeWidth="1" />
    </svg>
);
