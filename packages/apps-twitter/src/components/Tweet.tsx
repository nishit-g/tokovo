/**
 * Tweet Component
 * 
 * Main tweet display with avatar, content, media, and actions.
 */

import React from "react";
import { twitterColors, twitterSpacing, twitterTypography } from "../config";
import { Avatar, VerifiedType } from "./Avatar";
import { TweetActions } from "./TweetActions";
import { MediaGrid, MediaItem } from "./MediaGrid";

// =============================================================================
// TYPES
// =============================================================================

export interface TweetData {
    id: string;
    author: {
        name: string;
        handle: string;
        avatarUrl?: string;
        verified?: VerifiedType;
    };
    text: string;
    timestamp: string;
    media?: MediaItem[];
    quoteTweet?: TweetData;
    replyCount: number;
    retweetCount: number;
    likeCount: number;
    viewCount: number;
    isLiked?: boolean;
    isRetweeted?: boolean;
    isBookmarked?: boolean;
    isReply?: boolean;
    replyToHandle?: string;
}

export interface TweetProps {
    tweet: TweetData;
    showThread?: boolean;
    isDetailView?: boolean;
}

// =============================================================================
// TEXT PARSING (Hashtags, Mentions, Links)
// =============================================================================

const parseText = (text: string): React.ReactNode => {
    // Split by hashtags, mentions, and links
    const parts = text.split(/([@#]\w+|https?:\/\/\S+)/g);

    return parts.map((part, index) => {
        if (part.startsWith("@")) {
            return (
                <span key={index} style={{ color: twitterColors.brand.blue }}>
                    {part}
                </span>
            );
        }
        if (part.startsWith("#")) {
            return (
                <span key={index} style={{ color: twitterColors.brand.blue }}>
                    {part}
                </span>
            );
        }
        if (part.startsWith("http")) {
            return (
                <span key={index} style={{ color: twitterColors.brand.blue }}>
                    {part.replace(/^https?:\/\//, "").slice(0, 30)}...
                </span>
            );
        }
        return part;
    });
};

// =============================================================================
// QUOTE TWEET
// =============================================================================

const QuoteTweet: React.FC<{ tweet: TweetData }> = ({ tweet }) => (
    <div style={{
        marginTop: 24,
        border: `1px solid ${twitterColors.ui.border}`,
        borderRadius: twitterSpacing.mediaRadius,
        padding: 24,
        backgroundColor: twitterColors.background.primary,
    }}>
        {/* Quote header */}
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
        }}>
            <Avatar
                name={tweet.author.name}
                imageUrl={tweet.author.avatarUrl}
                size="small"
                verified={tweet.author.verified}
            />
            <span style={{
                fontSize: twitterTypography.sizes.displayName - 6,
                fontWeight: 700,
                color: twitterColors.text.primary,
                fontFamily: twitterTypography.fontFamily,
            }}>
                {tweet.author.name}
            </span>
            <span style={{
                fontSize: twitterTypography.sizes.handle - 6,
                color: twitterColors.text.secondary,
                fontFamily: twitterTypography.fontFamily,
            }}>
                @{tweet.author.handle} · {tweet.timestamp}
            </span>
        </div>

        {/* Quote text */}
        <p style={{
            fontSize: twitterTypography.sizes.tweetText - 6,
            lineHeight: `${twitterTypography.lineHeights.tweetText - 6}px`,
            color: twitterColors.text.primary,
            fontFamily: twitterTypography.fontFamily,
            margin: 0,
        }}>
            {parseText(tweet.text)}
        </p>

        {/* Quote media (smaller) */}
        {tweet.media && tweet.media.length > 0 && (
            <MediaGrid media={tweet.media} maxHeight={300} />
        )}
    </div>
);

// =============================================================================
// TWEET COMPONENT
// =============================================================================

export const Tweet: React.FC<TweetProps> = ({
    tweet,
    showThread = false,
    isDetailView = false,
}) => {
    const fontSize = isDetailView
        ? twitterTypography.sizes.tweetTextLarge
        : twitterTypography.sizes.tweetText;
    const lineHeight = isDetailView
        ? twitterTypography.lineHeights.tweetTextLarge
        : twitterTypography.lineHeights.tweetText;

    return (
        <div style={{
            display: "flex",
            padding: `${twitterSpacing.tweetPaddingVertical}px ${twitterSpacing.tweetPadding}px`,
            borderBottom: `1px solid ${twitterColors.ui.border}`,
            backgroundColor: twitterColors.background.primary,
        }}>
            {/* Avatar column */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginRight: twitterSpacing.avatarGap,
            }}>
                <Avatar
                    name={tweet.author.name}
                    imageUrl={tweet.author.avatarUrl}
                    verified={tweet.author.verified}
                />

                {/* Thread line */}
                {showThread && (
                    <div style={{
                        width: twitterSpacing.threadLineWidth,
                        flex: 1,
                        backgroundColor: twitterColors.ui.border,
                        marginTop: twitterSpacing.threadLineGap,
                    }} />
                )}
            </div>

            {/* Content column */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header: Name, handle, timestamp */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 6,
                    flexWrap: "wrap",
                }}>
                    <span style={{
                        fontSize: twitterTypography.sizes.displayName,
                        fontWeight: 700,
                        color: twitterColors.text.primary,
                        fontFamily: twitterTypography.fontFamilyDisplay,
                    }}>
                        {tweet.author.name}
                    </span>

                    {/* Verified badge inline */}
                    {tweet.author.verified && tweet.author.verified !== "none" && (
                        <svg width={24} height={24} viewBox="0 0 24 24" fill={twitterColors.verified[tweet.author.verified]}>
                            <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                        </svg>
                    )}

                    <span style={{
                        fontSize: twitterTypography.sizes.handle,
                        color: twitterColors.text.secondary,
                        fontFamily: twitterTypography.fontFamily,
                    }}>
                        @{tweet.author.handle}
                    </span>

                    <span style={{
                        fontSize: twitterTypography.sizes.timestamp,
                        color: twitterColors.text.secondary,
                        fontFamily: twitterTypography.fontFamily,
                    }}>
                        · {tweet.timestamp}
                    </span>
                </div>

                {/* Replying to */}
                {tweet.isReply && tweet.replyToHandle && (
                    <p style={{
                        fontSize: twitterTypography.sizes.handle,
                        color: twitterColors.text.secondary,
                        fontFamily: twitterTypography.fontFamily,
                        margin: "0 0 12px 0",
                    }}>
                        Replying to <span style={{ color: twitterColors.brand.blue }}>@{tweet.replyToHandle}</span>
                    </p>
                )}

                {/* Tweet text */}
                <p style={{
                    fontSize,
                    lineHeight: `${lineHeight}px`,
                    color: twitterColors.text.primary,
                    fontFamily: twitterTypography.fontFamily,
                    margin: 0,
                    wordWrap: "break-word",
                }}>
                    {parseText(tweet.text)}
                </p>

                {/* Media */}
                {tweet.media && tweet.media.length > 0 && (
                    <MediaGrid media={tweet.media} />
                )}

                {/* Quote Tweet */}
                {tweet.quoteTweet && (
                    <QuoteTweet tweet={tweet.quoteTweet} />
                )}

                {/* Actions */}
                <TweetActions
                    replyCount={tweet.replyCount}
                    retweetCount={tweet.retweetCount}
                    likeCount={tweet.likeCount}
                    viewCount={tweet.viewCount}
                    isLiked={tweet.isLiked}
                    isRetweeted={tweet.isRetweeted}
                    isBookmarked={tweet.isBookmarked}
                />
            </div>
        </div>
    );
};

export default Tweet;
