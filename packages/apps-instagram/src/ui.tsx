import React from "react";
import { WorldState, LayoutState } from "@tokovo/core";
import { InstagramState } from "./types";
import { InstagramChatView } from "./views/dm/InstagramChatView";
import { FeedView } from "./views/feed/FeedView";
import { StoriesView } from "./views/stories/StoriesView";
import { ProfileView } from "./views/profile/ProfileView";
import { ExploreView } from "./views/explore/ExploreView";
import { NotificationsView } from "./views/notifications/NotificationsView";
import { ReelsView } from "./views/reels/ReelsView";
import { PostView } from "./views/post/PostView";
import { BottomNav } from "./views/BottomNav";

export const InstagramApp: React.FC<{ world: WorldState; t: number; layout?: LayoutState }> = ({ world, t, layout }) => {
    const appState = world.appState?.["app_instagram"] as InstagramState;
    const currentView = appState?.currentView || "dm";

    console.log(`[InstagramApp] Current View: ${currentView}, t=${t}`);

    // Views that show the bottom navigation
    const showBottomNav = ['feed', 'explore', 'reels', 'profile'].includes(currentView);

    const renderView = () => {
        switch (currentView) {
            case "dm":
                return <InstagramChatView world={world} t={t} layout={layout} />;
            case "feed":
                return <FeedView state={appState} layout={layout} />;
            case "stories":
                return <StoriesView state={appState} t={t} layout={layout} />;
            case "profile":
                return <ProfileView state={appState} />;
            case "post":
                return <PostView state={appState} />;
            case "explore":
                return <ExploreView state={appState} />;
            case "notifications":
                return <NotificationsView state={appState} />;
            case "reels":
                return <ReelsView state={appState} />;
            default:
                return <InstagramChatView world={world} t={t} layout={layout} />;
        }
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "black" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                {renderView()}
            </div>
            {showBottomNav && <BottomNav currentView={currentView} />}
        </div>
    );
};

// Re-export specific views if needed externally, but InstagramApp is the main entry
export { InstagramChatView };
