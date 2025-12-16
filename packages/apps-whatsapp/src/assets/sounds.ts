/**
 * WhatsApp Sound Registry
 * 
 * Maps semantic sound IDs to physical file paths in the public directory.
 * NOTE: Paths are relative to `public/sounds/` because Core `getSoundPath` auto-prepends "sounds/".
 */

import { SoundRegistry } from "@tokovo/core";

// Register WhatsApp-specific sounds
SoundRegistry.registerMany({
    "whatsapp_sent": "plugins/whatsapp/sent.wav",
    "whatsapp_received": "plugins/whatsapp/received.wav",
    "whatsapp_typing": "plugins/whatsapp/typing_loop.wav",
});
