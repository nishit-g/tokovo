import { produce } from "immer";
import { TimelineEvent, WorldState } from "@tokovo/core";
import { InstagramState } from "../types";

export function postsReducer(draft: WorldState, event: TimelineEvent, instagram: InstagramState) {
    if (event.kind !== "APP") return;

    // placeholder
}
