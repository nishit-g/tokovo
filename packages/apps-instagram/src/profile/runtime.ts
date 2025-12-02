import { produce } from "immer";
import { TimelineEvent, WorldState } from "@tokovo/core";
import { InstagramState } from "../types";

export function profileReducer(draft: WorldState, event: TimelineEvent, instagram: InstagramState) {
    if (event.kind !== "APP") return;

    if (!instagram.profile) {
        instagram.profile = {};
    }

    switch (event.type) {
        case "PROFILE_OPEN":
            instagram.profile.currentProfile = event.username;
            break;
    }
}
