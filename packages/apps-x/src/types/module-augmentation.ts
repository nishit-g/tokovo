import type { XTrackEvent, XEventKind } from "./events.js";
import type { XState } from "../runtime/state.js";

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    app_x: XTrackEvent;
  }
}

declare module "@tokovo/core" {
  interface AppStateMap {
    app_x: XState;
  }

  interface AppEventKindRegistry {
    app_x: XEventKind;
  }

  interface AppInitialStateRegistry {
    app_x: XState;
  }
}
