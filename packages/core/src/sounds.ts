/**
 * Sound Registry - Maps sound IDs to audio files
 * 
 * REFACTORED: Now uses the dynamic SoundRegistry.
 * This file registers the CORE (generic) sounds. 
 * App-specific sounds are registered by the apps themselves.
 */

import { SoundRegistry } from "./sound-registry";

// Register Core Sounds (Generic UI, OS, Ambient)
SoundRegistry.registerMany({
    // Notification sounds
    "notification": "notification.mp3",
    "notification_soft": "notification-soft.mp3",

    // Call sounds (Generic)
    "ringtone": "ringtone.mp3",
    "call_end": "call-end.mp3",

    // UI sounds
    "camera_shutter": "camera-shutter.mp3",
    "screenshot": "screenshot.mp3",
    "lock": "lock.mp3",
    "unlock": "unlock.mp3",
    "tap": "tap.mp3",
    "keyboard_click": "keyboard-click.mp3",

    // Ambient / Music
    "suspense": "suspense.mp3",
    "dramatic": "dramatic.mp3",
});

/**
 * Get sound file path for a sound ID
 * Uses the dynamic SoundRegistry.
 */
export function getSoundPath(soundId: string): string {
    const path = SoundRegistry.getPath(soundId);
    if (!path) {
        // Fallback or warning
        // console.warn(`[SoundRegistry] Unknown sound ID: ${soundId}`);
        // Default behavior: Assume it's a direct filename in sounds/
        return `sounds/${soundId}.mp3`;
    }
    return `sounds/${path}`;
}

export { SoundRegistry };
