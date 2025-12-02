import { produce } from "immer";
import { TimelineEvent, WorldState } from "@tokovo/core";
import { InstagramState } from "../types";

export function feedReducer(draft: WorldState, event: TimelineEvent, instagram: InstagramState) {
    if (event.kind !== "APP") return;

    // Check if feed state exists, if not initialize
    if (!instagram.feed) {
        instagram.feed = { posts: [], scrollPosition: 0 };
    }

    switch (event.type) {
        case "FEED_SCROLL_POSITION":
            instagram.feed.scrollPosition = event.y;
            break;
        case "FEED_OPEN_POST":
            // logic
            break;
        // ...
    }
}
