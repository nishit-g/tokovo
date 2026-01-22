/**
 * WhatsApp Sound Registry
 *
 * Maps semantic sound IDs to physical file paths in the public directory.
 * NOTE: Paths are relative to `public/sounds/` because Core `getSoundPath` auto-prepends "sounds/".
 */

import { SoundRegistry } from "@tokovo/core";

SoundRegistry.registerMany({
  "app_whatsapp.message_out": "plugins/whatsapp/sent.wav",
  "app_whatsapp.message_in": "plugins/whatsapp/received.wav",
  "app_whatsapp.typing_loop": "plugins/whatsapp/typing_loop.wav",
  "app_whatsapp.call_ringtone": "plugins/whatsapp/call_ringtone.wav",
  "app_whatsapp.call_outgoing": "plugins/whatsapp/call_outgoing.wav",
  "app_whatsapp.call_end": "plugins/whatsapp/call_end.wav",
  "app_whatsapp.ptt_start": "plugins/whatsapp/ptt_start.wav",
  "app_whatsapp.ptt_send": "plugins/whatsapp/ptt_send.wav",
  "app_whatsapp.ptt_cancel": "plugins/whatsapp/ptt_cancel.wav",
});
