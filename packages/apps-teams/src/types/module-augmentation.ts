import type { TeamsTrackEvent, TeamsEventType } from "./events.js";
import type { TeamsState } from "./state.js";

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    app_teams: TeamsTrackEvent;
  }
}

declare module "@tokovo/core" {
  interface AppStateMap {
    app_teams: TeamsState;
  }

  interface AppEventKindRegistry {
    app_teams: TeamsEventType;
  }

  interface AppInitialStateRegistry {
    app_teams: TeamsState;
  }
}
