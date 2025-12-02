import React from "react";
import { InstagramState } from "../../types";


const GridIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const TaggedIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#888"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const MenuIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const LockIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const PlusIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

import { LayoutState, FeedLayoutState } from "@tokovo/core";

export const ProfileView: React.FC<{ state: InstagramState; layout?: LayoutState }> = ({ state, layout }) => {
    // Mock user data for now
    const user = {
        username: "instagram_user",
        name: "Instagram User",
        bio: "Digital Creator 📸\nLiving the dream ✨\n📍 New York",
        posts: 42,
        followers: "1.2M",
        following: 250,
        avatar: "" // TODO: Add default avatar
    };

    const feedLayout = layout?.kind === "FEED" ? (layout as FeedLayoutState) : null;
    const scrollY = feedLayout?.scrollY || 0;

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", // Hide native scroll
            position: "relative"
        }}>
            {/* Scrollable Content Container */}
            <div style={{
                transform: `translateY(-${scrollY}px)`,
                transition: "transform 0.1s linear", // Layout engine drives this
                width: "100%",
                minHeight: "100%"
            }}>
                {/* Header */}
                <div style={{
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 30px",
                    marginTop: 60,
                    zIndex: 10
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <LockIcon />
                        <div style={{ fontSize: 42, fontWeight: "bold" }}>{user.username}</div>
                    </div>
                    <div style={{ display: "flex", gap: 40 }}>
                        <PlusIcon />
                        <MenuIcon />
                    </div>
                </div>

                {/* Profile Info */}
                <div style={{ padding: "20px 30px" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
                        <div style={{
                            width: 180,
                            height: 180,
                            borderRadius: "50%",
                            backgroundColor: "#333",
                            backgroundImage: `url(${user.avatar})`,
                            backgroundSize: "cover",
                            marginRight: 60
                        }} />
                        <div style={{ flex: 1, display: "flex", justifyContent: "space-between", paddingRight: 20 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontSize: 36, fontWeight: "bold" }}>{user.posts}</div>
                                <div style={{ fontSize: 28 }}>Posts</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontSize: 36, fontWeight: "bold" }}>{user.followers}</div>
                                <div style={{ fontSize: 28 }}>Followers</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontSize: 36, fontWeight: "bold" }}>{user.following}</div>
                                <div style={{ fontSize: 28 }}>Following</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 30 }}>
                        <div style={{ fontSize: 32, fontWeight: "bold", marginBottom: 5 }}>{user.name}</div>
                        <div style={{ fontSize: 30, whiteSpace: "pre-wrap", lineHeight: "1.3" }}>{user.bio}</div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
                        <div style={{ flex: 1, height: 70, backgroundColor: "#333", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: "600" }}>
                            Edit profile
                        </div>
                        <div style={{ flex: 1, height: 70, backgroundColor: "#333", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: "600" }}>
                            Share profile
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", borderTop: "1px solid #222", height: 100 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "2px solid white" }}>
                        <GridIcon active={true} />
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TaggedIcon active={false} />
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {state.feed.posts.map(post => (
                        <div key={post.id} style={{
                            width: "calc(33.33% - 2px)",
                            aspectRatio: "1/1",
                            backgroundColor: "#222",
                            backgroundImage: `url(${post.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
};
