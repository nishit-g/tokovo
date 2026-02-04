import type { XTrackEvent, XEventKind } from "./events";
import type { XState } from "../runtime/state";

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
