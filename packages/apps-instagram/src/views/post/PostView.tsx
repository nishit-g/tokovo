import React from "react";
import { InstagramState } from "../../types";

// Reuse icons from FeedView or create shared icon library
const BackIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

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

export const PostView: React.FC<{ state: InstagramState }> = ({ state }) => {
    // Mock single post data
    const post = {
        username: "instagram_user",
        avatar: "https://i.pravatar.cc/150?u=instagram_user",
        image: "https://picsum.photos/seed/insta1/1080/1080",
        caption: "Living my best life! 🌟 #blessed",
        likes: 1234,
        comments: 42,
        liked: false,
        saved: false
    };

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
                height: 120,
                display: "flex",
                alignItems: "center",
                padding: "0 30px",
                marginTop: 60,
                borderBottom: "1px solid #222"
            }}>
                <BackIcon />
                <div style={{ marginLeft: 30, fontSize: 36, fontWeight: "bold" }}>Posts</div>
            </div>

            {/* Post Content (Similar to Feed Item) */}
            <div style={{ flex: 1, overflow: "hidden" }}>
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

                <div style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    backgroundColor: "#222",
                    backgroundImage: `url(${post.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 30px" }}>
                    <div style={{ display: "flex", gap: 40 }}>
                        <HeartIcon filled={post.liked} />
                        <CommentIcon />
                        <ShareIcon />
                    </div>
                    <BookmarkIcon filled={post.saved} />
                </div>

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
                    <div style={{ color: "#888", fontSize: 24, marginTop: 10, textTransform: "uppercase" }}>
                        2 hours ago
                    </div>
                </div>
            </div>
        </div>
    );
};
