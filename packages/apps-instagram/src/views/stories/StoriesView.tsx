import React from "react";
import { InstagramState, StoryUser } from "../../types";
import { LayoutState, StoryLayoutState } from "@tokovo/core";

const CloseIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const MoreIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </svg>
);

const ProgressBar: React.FC<{ count: number; activeIndex: number; progress: number }> = ({ count, activeIndex, progress }) => (
    <div style={{ display: "flex", gap: 6, padding: "30px 15px 15px 15px" }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{
                flex: 1,
                height: 6,
                backgroundColor: "rgba(255,255,255,0.35)",
                borderRadius: 3,
                overflow: "hidden"
            }}>
                <div style={{
                    height: "100%",
                    width: i < activeIndex ? "100%" : i === activeIndex ? `${progress * 100}%` : "0%",
                    backgroundColor: "white",
                    borderRadius: 3,
                    boxShadow: i === activeIndex ? "0 0 4px rgba(255,255,255,0.5)" : "none"
                }} />
            </div>
        ))}
    </div>
);
// ... (Icons remain same)

export const StoriesView: React.FC<{ state: InstagramState; t: number; layout?: LayoutState }> = ({ state, t, layout }) => {
    const storyLayout = layout?.kind === "STORY" ? (layout as StoryLayoutState) : null;

    // Fallback if no layout provided (shouldn't happen in new system)
    if (!storyLayout) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    const activeUser = state.stories.users.find(u => u.username === state.stories.activeStoryId?.split(':')[0]);
    // Or derive from layout if we stored user info there? 
    // LayoutEngine stores IDs. We can look up the user/story from state using the ID in layout.
    // For now, let's stick to state lookup for data, layout for position/timing.

    if (!activeUser) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    const activeIndex = storyLayout.activeStoryIndex;
    const progress = storyLayout.storyProgress;
    const activeStory = activeUser.stories[activeIndex];

    if (!activeStory) return <div style={{ backgroundColor: "black", height: "100%" }} />;

    return (
        <div style={{
            backgroundColor: "#111",
            height: "100%",
            color: "white",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden" // Important for transitions
        }}>
            {/* Render all stories that have layout info (for transitions) */}
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
                        filter: "brightness(0.9)",
                        opacity: sl.opacity,
                        transform: `translateX(${sl.translateX}%) scale(${sl.scale})`,
                        transition: "none" // Layout engine handles animation
                    }} />
                );
            })}

            {/* Overlay Content (UI doesn't transition, just stays on top) */}
            <div style={{ position: "relative", zIndex: 10, paddingTop: 60, paddingLeft: 20, paddingRight: 20 }}>
                <ProgressBar count={activeUser.stories.length} activeIndex={activeIndex} progress={progress} />

                <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundImage: `url(${activeUser.avatar})`, backgroundSize: "cover", marginRight: 20 }} />
                    <div style={{ fontSize: 28, fontWeight: "600", marginRight: 20 }}>{activeUser.username}</div>
                    <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)" }}>12h</div>
                    <div style={{ flex: 1 }} />
                    <MoreIcon />
                    <div style={{ width: 20 }} />
                    <CloseIcon />
                </div>
            </div>

            {/* Input / Reactions */}
            <div style={{ marginTop: "auto", padding: "40px 30px", display: "flex", alignItems: "center", gap: 30, position: "relative", zIndex: 10 }}>
                <div style={{
                    flex: 1,
                    height: 100,
                    borderRadius: 50,
                    border: "2px solid rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 40px",
                    fontSize: 32,
                    color: "white"
                }}>
                    Send message
                </div>
                <HeartIcon />
                <ShareIcon />
            </div>
        </div>
    );
};

const HeartIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
