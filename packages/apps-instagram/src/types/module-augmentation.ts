import type { InstagramEventKind, InstagramTrackEvent } from "./events.js";
import type { InstagramState } from "../runtime/state.js";

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    app_instagram: InstagramTrackEvent;
  }
}

declare module "@tokovo/core" {
  interface AppStateMap {
    app_instagram: InstagramState;
  }

  interface AppEventKindRegistry {
    app_instagram: InstagramEventKind;
  }

  interface AppInitialStateRegistry {
    app_instagram: InstagramState;
  }
}
