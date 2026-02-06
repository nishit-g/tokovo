import type { WhatsAppTrackEvent } from "./events.js";
import type { WhatsAppState } from "./state.js";
import type { WhatsAppEventKind } from "../schemas/events.js";

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    app_whatsapp: WhatsAppTrackEvent;
  }
}

declare module "@tokovo/core" {
  interface AppStateMap {
    app_whatsapp: WhatsAppState;
  }

  interface AppEventKindRegistry {
    app_whatsapp: WhatsAppEventKind;
  }

  interface AppInitialStateRegistry {
    app_whatsapp: WhatsAppState;
  }
}
