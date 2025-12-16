/**
 * WhatsApp Sound Registry
 * 
 * Maps semantic sound IDs to physical file paths in the public directory.
 * NOTE: Paths are relative to `public/sounds/` because Core `getSoundPath` auto-prepends "sounds/".
 */

import { SoundRegistry } from "@tokovo/core";

// Register WhatsApp-specific sounds
SoundRegistry.registerMany({
    "app_whatsapp.message_out": "plugins/whatsapp/sent.wav",
    "app_whatsapp.message_in": "plugins/whatsapp/received.wav",
    "app_whatsapp.typing_loop": "plugins/whatsapp/typing_loop.wav",
});
