import type { SnapchatTrackEvent, SnapchatEventType } from "./events.js";
import type { SnapchatState } from "./state.js";

declare module "@tokovo/ir" {
    interface AppTrackEventRegistry {
        app_snapchat: SnapchatTrackEvent;
    }
}

declare module "@tokovo/core" {
    interface AppStateMap {
        app_snapchat: SnapchatState;
    }

    interface AppEventKindRegistry {
        app_snapchat: SnapchatEventType;
    }

    interface AppInitialStateRegistry {
        app_snapchat: SnapchatState;
    }
}
