/**
 * Tweet Actions Component
 * 
 * Reply, Retweet, Like, Views, Share/Bookmark buttons.
 */

import React from "react";
import { twitterColors, twitterSpacing, twitterTypography } from "../config";

// =============================================================================
// TYPES
// =============================================================================

export interface TweetActionsProps {
    replyCount: number;
    retweetCount: number;
    likeCount: number;
    viewCount: number;
    isLiked?: boolean;
    isRetweeted?: boolean;
    isBookmarked?: boolean;
    compact?: boolean;
}

// =============================================================================
// HELPER
// =============================================================================

function formatCount(count: number): string {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}

// =============================================================================
// ICONS
// =============================================================================

const ReplyIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const RetweetIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2">
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
);

const HeartIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const ViewIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const BookmarkIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const ShareIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16,6 12,2 8,6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

// =============================================================================
// TWEET ACTIONS COMPONENT
// =============================================================================

export const TweetActions: React.FC<TweetActionsProps> = ({
    replyCount,
    retweetCount,
    likeCount,
    viewCount,
    isLiked = false,
    isRetweeted = false,
    isBookmarked = false,
    compact = false,
}) => {
    const iconSize = compact ? 48 : twitterSpacing.engagementIconSize;
    const fontSize = compact ? twitterTypography.sizes.engagement - 6 : twitterTypography.sizes.engagement;
    const gap = compact ? 30 : twitterSpacing.engagementGap;

    const ActionButton: React.FC<{
        icon: React.ReactNode;
        count?: number;
        color: string;
        activeColor?: string;
        isActive?: boolean;
    }> = ({ icon, count, color, activeColor, isActive }) => (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
        }}>
            {icon}
            {count !== undefined && count > 0 && (
                <span style={{
                    fontSize,
                    color: isActive && activeColor ? activeColor : color,
                    fontFamily: twitterTypography.fontFamily,
                    fontWeight: 400,
                }}>
                    {formatCount(count)}
                </span>
            )}
        </div>
    );

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            paddingRight: 60,
        }}>
            {/* Reply */}
            <ActionButton
                icon={<ReplyIcon size={iconSize} color={twitterColors.engagement.reply} />}
                count={replyCount}
                color={twitterColors.engagement.reply}
            />

            {/* Retweet */}
            <ActionButton
                icon={<RetweetIcon size={iconSize} color={isRetweeted ? twitterColors.engagement.retweet : twitterColors.engagement.reply} filled={isRetweeted} />}
                count={retweetCount}
                color={twitterColors.engagement.reply}
                activeColor={twitterColors.engagement.retweet}
                isActive={isRetweeted}
            />

            {/* Like */}
            <ActionButton
                icon={<HeartIcon size={iconSize} color={isLiked ? twitterColors.engagement.like : twitterColors.engagement.reply} filled={isLiked} />}
                count={likeCount}
                color={twitterColors.engagement.reply}
                activeColor={twitterColors.engagement.like}
                isActive={isLiked}
            />

            {/* Views */}
            <ActionButton
                icon={<ViewIcon size={iconSize} color={twitterColors.engagement.view} />}
                count={viewCount}
                color={twitterColors.engagement.view}
            />

            {/* Bookmark/Share */}
            <div style={{ display: "flex", gap: 18 }}>
                <BookmarkIcon
                    size={iconSize}
                    color={isBookmarked ? twitterColors.brand.blue : twitterColors.engagement.share}
                    filled={isBookmarked}
                />
                <ShareIcon size={iconSize} color={twitterColors.engagement.share} />
            </div>
        </div>
    );
};

export default TweetActions;
