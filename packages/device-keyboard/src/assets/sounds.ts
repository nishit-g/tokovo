/**
 * Device Keyboard Sound Registry
 * 
 * NOTE: Paths are relative to `public/sounds/` because Core `getSoundPath` auto-prepends "sounds/".
 */

import { SoundRegistry } from "@tokovo/core";

// Register Keyboard sounds
SoundRegistry.registerMany({
    "keyboard_typing_loop": "core/keyboard/typing_loop.wav",
});
