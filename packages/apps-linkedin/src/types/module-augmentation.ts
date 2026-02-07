import type { LITrackEvent, LIEventKind } from "./events.js";
import type { LinkedInState } from "../runtime/state.js";

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    app_linkedin: LITrackEvent;
  }
}

declare module "@tokovo/core" {
  interface AppStateMap {
    app_linkedin: LinkedInState;
  }

  interface AppEventKindRegistry {
    app_linkedin: LIEventKind;
  }

  interface AppInitialStateRegistry {
    app_linkedin: LinkedInState;
  }
}

