import type { WhatsAppTrackEvent } from "./events";

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    app_whatsapp: WhatsAppTrackEvent;
  }
}
