import { produce } from "immer";
import { TimelineEvent, WorldState, ReducerRegistry } from "@tokovo/core";
import { InstagramState } from "./types";
import { dmReducer } from "./dm/runtime";
import { feedReducer } from "./feed/runtime";
import { storiesReducer } from "./stories/runtime";
import { profileReducer } from "./profile/runtime";
import { notificationsReducer } from "./notifications/runtime";
import { exploreReducer } from "./explore/runtime";
import { postsReducer } from "./posts/runtime";
import { reelsReducer } from "./reels/runtime";

export function instagramReducer(draft: WorldState, event: TimelineEvent) {
    if (event.kind !== "APP" || event.appId !== "app_instagram") return;

    // Ensure app state exists
    if (!draft.appState) draft.appState = {};
    if (!draft.appState["app_instagram"]) {
        draft.appState["app_instagram"] = {
            activeModule: "dm", // Default to DM for now
            dm: { conversations: {} },
            feed: { posts: [], scrollPosition: 0 },
            stories: { viewedStories: [] },
            profile: {}
        } as InstagramState;
    }
    const instagram = draft.appState["app_instagram"] as InstagramState;

    // Logic to switch active module based on event
    if (event.type.startsWith("DM_")) instagram.activeModule = "dm";
    if (event.type.startsWith("FEED_")) instagram.activeModule = "feed";
    if (event.type.startsWith("STORY_")) instagram.activeModule = "stories";
    if (event.type.startsWith("PROFILE_")) instagram.activeModule = "profile";
    if (event.type.startsWith("POST_")) instagram.activeModule = "posts";
    if (event.type.startsWith("REEL_")) instagram.activeModule = "reels";
    if (event.type.startsWith("INSTA_NOTIFICATION_")) instagram.activeModule = "notifications";

    // Dispatch to sub-reducers
    dmReducer(draft, event, instagram);
    feedReducer(draft, event, instagram);
    storiesReducer(draft, event, instagram);
    profileReducer(draft, event, instagram);
    notificationsReducer(draft, event, instagram);
    exploreReducer(draft, event, instagram);
    postsReducer(draft, event, instagram);
    reelsReducer(draft, event, instagram);
}

// Register itself
ReducerRegistry.registerAppReducer("app_instagram", instagramReducer);
