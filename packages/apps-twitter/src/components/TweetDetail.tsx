/**
 * Tweet Detail Screen
 * 
 * Shows a single tweet with its replies thread.
 */

import React from "react";
import { twitterColors, twitterTypography, twitterSpacing, twitterLayout } from "../config";
import { Tweet, TweetData } from "./Tweet";
import { Avatar } from "./Avatar";

// =============================================================================
// TYPES
// =============================================================================

export interface TweetDetailProps {
    tweet: TweetData;
    replies?: TweetData[];
    onBack?: () => void;
}

// =============================================================================
// BACK BUTTON
// =============================================================================

const BackButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <div
        style={{
            width: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
        }}
        onClick={onClick}
    >
        <svg width={60} height={60} viewBox="0 0 24 24" fill={twitterColors.text.primary}>
            <path d="M20 11H7.414l4.293-4.293a1 1 0 0 0-1.414-1.414l-6 6a1 1 0 0 0 0 1.414l6 6a1 1 0 0 0 1.414-1.414L7.414 13H20a1 1 0 0 0 0-2z" />
        </svg>
    </div>
);

// =============================================================================
// DETAIL HEADER
// =============================================================================

const DetailHeader: React.FC<{ onBack?: () => void }> = ({ onBack }) => (
    <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(36px)",
        padding: `${twitterLayout.safeAreaTop}px ${twitterSpacing.horizontalPadding}px 0`,
        height: twitterLayout.headerHeight + twitterLayout.safeAreaTop,
        display: "flex",
        alignItems: "center",
        gap: 48,
    }}>
        <BackButton onClick={onBack} />
        <span style={{
            fontSize: twitterTypography.sizes.displayName,
            fontWeight: twitterTypography.weights.bold,
            color: twitterColors.text.primary,
            fontFamily: twitterTypography.fontFamily,
        }}>
            Post
        </span>
    </div>
);

// =============================================================================
// EXPANDED TWEET (Main tweet in detail view)
// =============================================================================

const ExpandedTweet: React.FC<{ tweet: TweetData }> = ({ tweet }) => {
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div style={{
            padding: twitterSpacing.tweetPadding,
            borderBottom: `1px solid ${twitterColors.border.primary}`,
        }}>
            {/* Author Row */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                marginBottom: 36,
            }}>
                <Avatar
                    imageUrl={tweet.author.avatarUrl}
                    name={tweet.author.name}
                    size="large"
                    verified={tweet.author.verified}
                />
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: twitterTypography.sizes.displayName,
                        fontWeight: twitterTypography.weights.bold,
                        color: twitterColors.text.primary,
                        fontFamily: twitterTypography.fontFamily,
                    }}>
                        {tweet.author.name}
                    </div>
                    <div style={{
                        fontSize: twitterTypography.sizes.handle,
                        color: twitterColors.text.secondary,
                        fontFamily: twitterTypography.fontFamily,
                    }}>
                        @{tweet.author.handle}
                    </div>
                </div>
            </div>

            {/* Tweet Text - Larger in detail view */}
            <div style={{
                fontSize: 69,  // Larger for detail
                color: twitterColors.text.primary,
                fontFamily: twitterTypography.fontFamily,
                lineHeight: 1.35,
                marginBottom: 36,
            }}>
                {tweet.text}
            </div>

            {/* Timestamp and Source */}
            <div style={{
                fontSize: twitterTypography.sizes.timestamp,
                color: twitterColors.text.secondary,
                marginBottom: 36,
                paddingBottom: 36,
                borderBottom: `1px solid ${twitterColors.border.primary}`,
            }}>
                {tweet.timestamp} · <span style={{ color: twitterColors.brand.blue }}>Twitter for iPhone</span>
            </div>

            {/* Engagement Stats */}
            <div style={{
                display: "flex",
                gap: 60,
                paddingBottom: 36,
                borderBottom: `1px solid ${twitterColors.border.primary}`,
            }}>
                {(tweet.retweetCount || 0) > 0 && (
                    <div>
                        <span style={{
                            fontWeight: 700,
                            color: twitterColors.text.primary,
                            fontSize: 45,
                        }}>{formatNumber(tweet.retweetCount || 0)}</span>
                        <span style={{
                            color: twitterColors.text.secondary,
                            fontSize: 42,
                            marginLeft: 12,
                        }}>Reposts</span>
                    </div>
                )}
                {(tweet.likeCount || 0) > 0 && (
                    <div>
                        <span style={{
                            fontWeight: 700,
                            color: twitterColors.text.primary,
                            fontSize: 45,
                        }}>{formatNumber(tweet.likeCount || 0)}</span>
                        <span style={{
                            color: twitterColors.text.secondary,
                            fontSize: 42,
                            marginLeft: 12,
                        }}>Likes</span>
                    </div>
                )}
                {(tweet.viewCount || 0) > 0 && (
                    <div>
                        <span style={{
                            fontWeight: 700,
                            color: twitterColors.text.primary,
                            fontSize: 45,
                        }}>{formatNumber(tweet.viewCount || 0)}</span>
                        <span style={{
                            color: twitterColors.text.secondary,
                            fontSize: 42,
                            marginLeft: 12,
                        }}>Views</span>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                paddingTop: 36,
            }}>
                {[
                    { icon: "💬", label: "Reply" },
                    { icon: "🔁", label: "Repost" },
                    { icon: "❤️", label: "Like" },
                    { icon: "🔖", label: "Bookmark" },
                    { icon: "📤", label: "Share" },
                ].map(action => (
                    <div key={action.label} style={{
                        fontSize: 72,
                        opacity: 0.7,
                    }}>
                        {action.icon}
                    </div>
                ))}
            </div>
        </div>
    );
};

// =============================================================================
// REPLY INPUT
// =============================================================================

const ReplyInput: React.FC<{ replyToHandle: string }> = ({ replyToHandle }) => (
    <div style={{
        display: "flex",
        alignItems: "center",
        padding: twitterSpacing.tweetPadding,
        gap: 36,
        borderBottom: `1px solid ${twitterColors.border.primary}`,
    }}>
        <Avatar size="medium" name="You" />
        <div style={{
            flex: 1,
            fontSize: twitterTypography.sizes.tweetText,
            color: twitterColors.text.secondary,
        }}>
            Post your reply
        </div>
        <div style={{
            backgroundColor: twitterColors.brand.blue,
            color: "white",
            padding: "24px 48px",
            borderRadius: 999,
            fontSize: 42,
            fontWeight: 700,
            opacity: 0.5,
        }}>
            Reply
        </div>
    </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const TweetDetail: React.FC<TweetDetailProps> = ({
    tweet,
    replies = [],
    onBack,
}) => {
    return (
        <div style={{
            height: "100%",
            backgroundColor: twitterColors.background.primary,
            overflowY: "auto",
        }}>
            <DetailHeader onBack={onBack} />
            <ExpandedTweet tweet={tweet} />
            <ReplyInput replyToHandle={tweet.author.handle} />

            {/* Replies */}
            {replies.map(reply => (
                <Tweet key={reply.id} tweet={reply} />
            ))}
        </div>
    );
};

export default TweetDetail;
