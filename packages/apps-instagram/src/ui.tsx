import React from "react";
import { WorldState } from "@tokovo/core";
import { InstagramState } from "./types";

import { InstagramChatView } from "./dm/ui";
import { FeedView } from "./feed/ui";
import { StoriesView } from "./stories/ui";
import { ProfileView } from "./profile/ui";
import { NotificationsView } from "./notifications/ui";
import { ExploreView } from "./explore/ui";
import { PostView } from "./posts/ui";
import { ReelsView } from "./reels/ui";

export { InstagramChatView }; // Export for specific usage if needed

export const InstagramAppView: React.FC<{ world: WorldState; t: number; layout?: any }> = ({ world, t, layout }) => {
    const instagram = world.appState?.["app_instagram"] as InstagramState | undefined;
    const activeModule = instagram?.activeModule || "dm";

    switch (activeModule) {
        case "dm":
            return <InstagramChatView world={world} t={t} layout={layout} />;
        case "feed":
            return <FeedView world={world} t={t} />;
        case "stories":
            return <StoriesView world={world} t={t} />;
        case "profile":
            return <ProfileView world={world} t={t} />;
        case "notifications":
            return <NotificationsView world={world} t={t} />;
        case "explore":
            return <ExploreView world={world} t={t} />;
        case "posts":
            return <PostView world={world} t={t} />;
        case "reels":
            return <ReelsView world={world} t={t} />;
        default:
            return <InstagramChatView world={world} t={t} layout={layout} />;
    }
};
