import React from "react";
import { InstagramState, StoryUser } from "../../types";
import { LayoutState, StoryLayoutState } from "@tokovo/core";

// ============================================================================
// ICONS
// ============================================================================

const CloseIcon = () => (
    <svg width="66" height="66" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const MoreIcon = () => (
    <svg width="66" height="66" viewBox="0 0 24 24" fill="white">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
    </svg>
);

const HeartIcon = () => (
    <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
    </svg>
);

// ============================================================================
// PROGRESS BAR
// ============================================================================

const ProgressBar: React.FC<{ count: number; activeIndex: number; progress: number }> = ({ count, activeIndex, progress }) => (
    <div style={{ display: "flex", gap: 9, padding: "30px 24px" }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
                flex: 1,
                height: 9,
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: 6,
                overflow: "hidden"
            }}>
                <div style={{
                    height: "100%",
                    width: i < activeIndex ? "100%" : i === activeIndex ? `${progress * 100}%` : "0%",
                    backgroundColor: "white",
                    borderRadius: 6,
                    transition: "width 0.1s linear"
                }} />
            </div>
        ))}
    </div>
);

// ============================================================================
// EMOJI SHORTCUTS
// ============================================================================

const EmojiShortcuts = () => (
    <div style={{ display: "flex", gap: 30 }}>
        {["❤️", "🔥", "👏", "😂", "😮", "😢"].map(emoji => (
            <span key={emoji} style={{ fontSize: 66 }}>{emoji}</span>
        ))}
    </div>
);

// ============================================================================
// STORIES VIEW - Main export
// ============================================================================

export const StoriesView: React.FC<{ state: InstagramState; t: number; layout?: LayoutState }> = ({ state, t, layout }) => {
    const storyLayout = layout?.kind === "STORY" ? (layout as StoryLayoutState) : null;

    if (!storyLayout) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    const activeUser = state.stories.users.find(u => u.username === state.stories.activeStoryId?.split(':')[0]);
    if (!activeUser) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    const activeIndex = storyLayout.activeStoryIndex;
    const progress = storyLayout.storyProgress;
    const activeStory = activeUser.stories[activeIndex];

    if (!activeStory) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    return (
        <div style={{
            backgroundColor: "#000",
            height: "100%",
            color: "white",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {/* Story Images (with transitions) */}
            {storyLayout.storyLayouts.map(sl => {
                const story = activeUser.stories[sl.index];
                if (!story) return null;

                return (
                    <div key={story.id} style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${story.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: sl.opacity,
                        transform: `translateX(${sl.translateX}%) scale(${sl.scale})`
                    }} />
                );
            })}

            {/* Top Gradient */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 450,
                background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 5
            }} />

            {/* Bottom Gradient */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 450,
                background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 5
            }} />

            {/* Top UI */}
            <div style={{ position: "relative", zIndex: 10, paddingTop: 120 }}>
                {/* Progress bars */}
                <ProgressBar count={activeUser.stories.length} activeIndex={activeIndex} progress={progress} />

                {/* User info */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px",
                    marginTop: 12
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        backgroundImage: `url(${activeUser.avatar})`,
                        backgroundSize: "cover",
                        backgroundColor: "#333",
                        marginRight: 24
                    }} />

                    {/* Username + Time */}
                    <span style={{
                        fontSize: 42,
                        fontWeight: 600,
                        marginRight: 18
                    }}>
                        {activeUser.username}
                    </span>
                    <span style={{
                        fontSize: 36,
                        opacity: 0.7
                    }}>
                        12h
                    </span>

                    <div style={{ flex: 1 }} />

                    {/* Actions */}
                    <MoreIcon />
                    <div style={{ width: 30 }} />
                    <CloseIcon />
                </div>
            </div>

            {/* Bottom UI */}
            <div style={{
                position: "absolute",
                bottom: 60,
                left: 0,
                right: 0,
                padding: "0 36px",
                display: "flex",
                alignItems: "center",
                gap: 30,
                zIndex: 10
            }}>
                {/* Message Input */}
                <div style={{
                    flex: 1,
                    height: 132,
                    borderRadius: 66,
                    border: "3px solid rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 42px",
                    fontSize: 42,
                    color: "rgba(255,255,255,0.8)"
                }}>
                    Send message
                </div>

                {/* Quick reactions */}
                <HeartIcon />
                <ShareIcon />
            </div>
        </div>
    );
};
