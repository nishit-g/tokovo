import type { WhatsAppTrackEvent } from "./events";
import type { WhatsAppState } from "./state";
import type { WhatsAppEventKind } from "../schemas/events";

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
