import React from "react";
import { InstagramState, Post, StoryUser } from "../../types";
import { LayoutState, FeedLayoutState } from "@tokovo/core";

// --- Icons ---
const HeartIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={filled ? "#ed4956" : "none"} stroke={filled ? "#ed4956" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CommentIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={filled ? "white" : "none"} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

// Instagram wordmark with dropdown chevron
const InstagramLogo = () => (
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
    }}>
        <span style={{
            fontFamily: "'Billabong', 'Grand Hotel', cursive",
            fontSize: 84,
            color: "white",
            letterSpacing: 1
        }}>
            Instagram
        </span>
        {/* Dropdown chevron */}
        <svg width="36" height="36" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

// Authentic Instagram DM/Messenger icon
const MessengerIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        {/* Paper airplane style DM icon */}
        <path
            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Notification heart icon for header
const NotificationHeartIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// --- Components ---

const StoryBubble: React.FC<{ user: StoryUser }> = ({ user }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 30 }}>
        <div style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            padding: 4,
            background: user.hasUnseen ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" : "#555"
        }}>
            <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "4px solid black",
                backgroundImage: `url(${user.avatar})`,
                backgroundSize: "cover",
                backgroundColor: "#333"
            }} />
        </div>
        <div style={{ color: "white", fontSize: 24, marginTop: 10, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.username}
        </div>
    </div>
);

const PostItem: React.FC<{ post: Post }> = ({ post }) => (
    <div style={{ marginBottom: 60 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "20px 30px" }}>
            <div style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                backgroundImage: `url(${post.avatar})`,
                backgroundSize: "cover",
                backgroundColor: "#333",
                marginRight: 20
            }} />
            <div style={{ flex: 1, color: "white", fontSize: 32, fontWeight: "600" }}>{post.username}</div>
            <div style={{ color: "white", fontSize: 40 }}>...</div>
        </div>

        {/* Image */}
        <div style={{
            width: "100%",
            aspectRatio: "1/1",
            backgroundColor: "#222",
            backgroundImage: `url(${post.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
        }} />

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 30px" }}>
            <div style={{ display: "flex", gap: 40 }}>
                <HeartIcon filled={post.liked} />
                <CommentIcon />
                <ShareIcon />
            </div>
            <BookmarkIcon filled={post.saved} />
        </div>

        {/* Likes & Caption */}
        <div style={{ padding: "0 30px" }}>
            <div style={{ color: "white", fontSize: 32, fontWeight: "600", marginBottom: 10 }}>
                {post.likes.toLocaleString()} likes
            </div>
            <div style={{ color: "white", fontSize: 32 }}>
                <span style={{ fontWeight: "600", marginRight: 10 }}>{post.username}</span>
                {post.caption}
            </div>
            <div style={{ color: "#888", fontSize: 28, marginTop: 10 }}>
                View all {post.comments} comments
            </div>
        </div>
    </div>
);

export const FeedView: React.FC<{ state: InstagramState; layout?: LayoutState }> = ({ state, layout }) => {
    const feedLayout = layout?.kind === "FEED" ? (layout as FeedLayoutState) : null;
    const scrollY = feedLayout?.scrollY || 0;

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column"
        }}>
            {/* Header */}
            <div style={{
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 30px",
                marginTop: 60, // Status bar spacing
                zIndex: 10,
                backgroundColor: "black"
            }}>
                <InstagramLogo />
                <div style={{ display: "flex", gap: 54 }}>
                    <NotificationHeartIcon />
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
                    transform: `translateY(-${scrollY}px)`,
                    transition: "transform 0.1s linear"
                }}>
                    {/* Stories */}
                    <div style={{
                        display: "flex",
                        padding: "20px 30px",
                        borderBottom: "1px solid #222",
                        marginBottom: 20,
                        overflowX: "hidden" // Should be scrollable in real app, but fixed for video usually
                    }}>
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
