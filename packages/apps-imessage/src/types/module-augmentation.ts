import type { IMessageTrackEvent, IMessageEventType } from "./events";
import type { IMessageState } from "./state";

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    app_imessage: IMessageTrackEvent;
  }
}

declare module "@tokovo/core" {
  interface AppStateMap {
    app_imessage: IMessageState;
  }

  interface AppEventKindRegistry {
    app_imessage: IMessageEventType;
  }

  interface AppInitialStateRegistry {
    app_imessage: IMessageState;
  }
}
