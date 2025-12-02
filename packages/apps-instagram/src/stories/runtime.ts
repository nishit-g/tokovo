import { produce } from "immer";
import { TimelineEvent, WorldState } from "@tokovo/core";
import { InstagramState } from "../types";

export function storiesReducer(draft: WorldState, event: TimelineEvent, instagram: InstagramState) {
    if (event.kind !== "APP") return;

    if (!instagram.stories) {
        instagram.stories = { viewedStories: [] };
    }

    switch (event.type) {
        case "STORY_OPEN":
            instagram.stories.activeStoryId = event.storyId;
            break;
        case "STORY_REACTION_SENT":
            // ...
            break;
    }
}
