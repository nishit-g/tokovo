import React from "react";
import { InstagramState, Post, StoryUser } from "../../types";
import { LayoutState, FeedLayoutState } from "@tokovo/core";

// ============================================================================
// HEADER ICONS - Authentic Instagram iOS
// ============================================================================

const CameraIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.8" />
    </svg>
);

const MessengerIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={filled ? "#FF3040" : "none"} stroke={filled ? "#FF3040" : "white"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CommentIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ShareIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={filled ? "white" : "none"} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const MoreIcon = () => (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
    </svg>
);

// ============================================================================
// INSTAGRAM LOGO - Script font with dropdown
// ============================================================================

const InstagramLogo = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12
    }}>
        <span style={{
            fontFamily: "'Billabong', 'Grand Hotel', cursive, -apple-system",
            fontSize: 90,
            color: "white",
            letterSpacing: 1,
            fontWeight: 400
        }}>
            Instagram
        </span>
        <svg width="36" height="36" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

// ============================================================================
// STORY BUBBLE - Larger authentic Instagram style
// ============================================================================

const StoryBubble = React.memo(({ user, isYourStory }: { user: StoryUser; isYourStory?: boolean }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: 36,
        width: 210
    }}>
        {/* Story Ring */}
        <div style={{
            width: 210,
            height: 210,
            borderRadius: "50%",
            padding: 9,
            background: isYourStory
                ? "transparent"
                : user.hasUnseen
                    ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                    : "#444"
        }}>
            <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "6px solid #000",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundImage: user.avatar ? `url(${user.avatar})` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundColor: "#333"
                }} />

                {/* Your Story + icon */}
                {isYourStory && (
                    <div style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "#0095F6",
                        border: "4px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>
                )}
            </div>
        </div>

        {/* Username */}
        <div style={{
            color: "white",
            fontSize: 30,
            marginTop: 15,
            maxWidth: 210,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center"
        }}>
            {isYourStory ? "Your story" : user.username}
        </div>
    </div>
));

// ============================================================================
// POST ITEM - Authentic Instagram post
// ============================================================================

const PostItem = React.memo(({ post }: { post: Post }) => (
    <div style={{ marginBottom: 48 }}>
        {/* Header */}
        <div style={{
            display: "flex",
            alignItems: "center",
            padding: "24px 36px",
            gap: 24
        }}>
            {/* Avatar with story ring if applicable */}
            <div style={{
                width: 102,
                height: 102,
                borderRadius: "50%",
                padding: 6,
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
            }}>
                <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    border: "4px solid #000",
                    backgroundImage: `url(${post.avatar})`,
                    backgroundSize: "cover",
                    backgroundColor: "#333"
                }} />
            </div>

            {/* Username + Location */}
            <div style={{ flex: 1 }}>
                <div style={{
                    color: "white",
                    fontSize: 39,
                    fontWeight: 600,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                }}>
                    {post.username}
                </div>
            </div>

            <MoreIcon />
        </div>

        {/* Image */}
        <div style={{
            width: "100%",
            aspectRatio: "1/1",
            backgroundColor: "#1a1a1a",
            backgroundImage: `url(${post.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
        }} />

        {/* Actions */}
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "30px 36px 18px",
            alignItems: "center"
        }}>
            <div style={{ display: "flex", gap: 48 }}>
                <HeartIcon filled={post.liked} />
                <CommentIcon />
                <ShareIcon />
            </div>
            <BookmarkIcon filled={post.saved} />
        </div>

        {/* Likes */}
        <div style={{ padding: "0 36px", marginBottom: 12 }}>
            <div style={{
                color: "white",
                fontSize: 39,
                fontWeight: 600,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                {post.likes.toLocaleString()} likes
            </div>
        </div>

        {/* Caption */}
        <div style={{ padding: "0 36px", marginBottom: 12 }}>
            <span style={{
                color: "white",
                fontSize: 39,
                fontWeight: 600,
                marginRight: 12,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                {post.username}
            </span>
            <span style={{ color: "white", fontSize: 39 }}>
                {post.caption}
            </span>
        </div>

        {/* Comments link */}
        <div style={{ padding: "0 36px", marginBottom: 6 }}>
            <span style={{ color: "#A8A8A8", fontSize: 36 }}>
                View all {post.comments} comments
            </span>
        </div>

        {/* Timestamp */}
        <div style={{ padding: "0 36px" }}>
            <span style={{ color: "#A8A8A8", fontSize: 30, textTransform: "uppercase" }}>
                2 hours ago
            </span>
        </div>
    </div>
));

// ============================================================================
// FEED VIEW - Main export
// ============================================================================

// Create "Your Story" user for first position - moved outside for referential stability
const yourStory: StoryUser = {
    username: "Your story",
    avatar: "",
    hasUnseen: false,
    stories: []
};

export const FeedView: React.FC<{ state: InstagramState; layout?: LayoutState }> = ({ state, layout }) => {
    const feedLayout = layout?.kind === "FEED" ? (layout as FeedLayoutState) : null;
    const scrollY = feedLayout?.scrollY || 0;

    return (
        <div style={{
            backgroundColor: "#000",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
        }}>
            {/* Header */}
            <div style={{
                height: 156,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 36px",
                marginTop: 120,
                backgroundColor: "#000",
                zIndex: 10
            }}>
                <CameraIcon />
                <InstagramLogo />
                <div style={{ display: "flex", gap: 60 }}>
                    <HeartIcon />
                    <MessengerIcon />
                </div>
            </div>

            {/* Scrollable Content */}
            <div style={{
                flex: 1,
                overflow: "hidden",
                position: "relative"
            }}>
                <div style={{
                    transform: `translateY(-${scrollY}px)`
                }}>
                    {/* Stories Row */}
                    <div style={{
                        display: "flex",
                        padding: "24px 36px",
                        borderBottom: "1px solid #262626",
                        marginBottom: 6,
                        overflowX: "hidden"
                    }}>
                        <StoryBubble user={yourStory} isYourStory />
                        {state.stories.users.map(user => (
                            <StoryBubble key={user.username} user={user} />
                        ))}
                    </div>

                    {/* Posts */}
                    {state.feed.posts.map(post => (
                        <PostItem key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
};
