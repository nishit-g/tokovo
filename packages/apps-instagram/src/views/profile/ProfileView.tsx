import React from "react";
import { InstagramState } from "../../types";
import { LayoutState, FeedLayoutState } from "@tokovo/core";

// ============================================================================
// ICONS
// ============================================================================

const GridIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke={active ? "white" : "#A8A8A8"} strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const ReelsIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#A8A8A8"} strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <polygon points="10,8 16,12 10,16" />
    </svg>
);

const TaggedIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#A8A8A8"} strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const AddIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="42" height="42" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ============================================================================
// STAT ITEM
// ============================================================================

const StatItem: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
        }}>
            {value}
        </div>
        <div style={{ fontSize: 36, opacity: 0.9 }}>{label}</div>
    </div>
);

// ============================================================================
// HIGHLIGHT BUBBLE
// ============================================================================

const HighlightBubble: React.FC<{ title: string; imageUrl?: string; isNew?: boolean }> = ({ title, imageUrl, isNew }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginRight: 36,
        width: 192
    }}>
        <div style={{
            width: 192,
            height: 192,
            borderRadius: "50%",
            border: isNew ? "none" : "3px solid #444",
            backgroundColor: "#1a1a1a",
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundSize: "cover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            {isNew && (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            )}
        </div>
        <div style={{
            marginTop: 15,
            fontSize: 30,
            textAlign: "center",
            maxWidth: 192,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
        }}>
            {title}
        </div>
    </div>
);

// ============================================================================
// PROFILE VIEW - Main export
// ============================================================================

export const ProfileView: React.FC<{ state: InstagramState; layout?: LayoutState }> = ({ state, layout }) => {
    const feedLayout = layout?.kind === "FEED" ? (layout as FeedLayoutState) : null;
    const scrollY = feedLayout?.scrollY || 0;

    // Mock user data
    const user = {
        username: "instagram_user",
        name: "Instagram User",
        bio: "Digital Creator 📸\nLiving the dream ✨\n📍 New York",
        posts: 42,
        followers: "1.2M",
        following: 250,
        avatar: "https://i.pravatar.cc/300?u=profile"
    };

    const highlights = [
        { title: "New", isNew: true },
        { title: "Travel ✈️", imageUrl: "https://picsum.photos/seed/h1/200" },
        { title: "Food 🍕", imageUrl: "https://picsum.photos/seed/h2/200" },
        { title: "Pets 🐕", imageUrl: "https://picsum.photos/seed/h3/200" },
    ];

    return (
        <div style={{
            backgroundColor: "#000",
            height: "100%",
            color: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
        }}>
            {/* Scrollable Content */}
            <div style={{
                transform: `translateY(-${scrollY}px)`,
                width: "100%"
            }}>
                {/* Header */}
                <div style={{
                    height: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 36px",
                    marginTop: 120
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 54, fontWeight: 700 }}>{user.username}</span>
                        <ChevronDownIcon />
                    </div>
                    <div style={{ display: "flex", gap: 48 }}>
                        <AddIcon />
                        <SettingsIcon />
                    </div>
                </div>

                {/* Profile Info Section */}
                <div style={{ padding: "24px 36px" }}>
                    {/* Avatar + Stats Row */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 30 }}>
                        {/* Avatar */}
                        <div style={{
                            width: 240,
                            height: 240,
                            borderRadius: "50%",
                            backgroundImage: `url(${user.avatar})`,
                            backgroundSize: "cover",
                            backgroundColor: "#333",
                            marginRight: 60
                        }} />

                        {/* Stats */}
                        <div style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "space-around"
                        }}>
                            <StatItem value={user.posts} label="Posts" />
                            <StatItem value={user.followers} label="Followers" />
                            <StatItem value={user.following} label="Following" />
                        </div>
                    </div>

                    {/* Name & Bio */}
                    <div style={{ marginBottom: 27 }}>
                        <div style={{ fontSize: 39, fontWeight: 600, marginBottom: 6 }}>
                            {user.name}
                        </div>
                        <div style={{ fontSize: 39, whiteSpace: "pre-wrap", lineHeight: 1.35, opacity: 0.95 }}>
                            {user.bio}
                        </div>
                    </div>

                    {/* Edit & Share Buttons */}
                    <div style={{ display: "flex", gap: 24, marginBottom: 30 }}>
                        <div style={{
                            flex: 1,
                            height: 102,
                            backgroundColor: "#262626",
                            borderRadius: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 39,
                            fontWeight: 600
                        }}>
                            Edit profile
                        </div>
                        <div style={{
                            flex: 1,
                            height: 102,
                            backgroundColor: "#262626",
                            borderRadius: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 39,
                            fontWeight: 600
                        }}>
                            Share profile
                        </div>
                    </div>
                </div>

                {/* Highlights Row */}
                <div style={{
                    display: "flex",
                    padding: "12px 36px 30px",
                    overflowX: "hidden"
                }}>
                    {highlights.map((h, i) => (
                        <HighlightBubble key={i} {...h} />
                    ))}
                </div>

                {/* Tabs */}
                <div style={{
                    display: "flex",
                    borderTop: "1px solid #262626",
                    borderBottom: "1px solid #262626"
                }}>
                    <div style={{
                        flex: 1,
                        height: 132,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: "3px solid white"
                    }}>
                        <GridIcon active={true} />
                    </div>
                    <div style={{
                        flex: 1,
                        height: 132,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <ReelsIcon active={false} />
                    </div>
                    <div style={{
                        flex: 1,
                        height: 132,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <TaggedIcon active={false} />
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {state.feed.posts.map(post => (
                        <div key={post.id} style={{
                            width: "calc(33.33% - 2px)",
                            aspectRatio: "1/1",
                            backgroundColor: "#1a1a1a",
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
