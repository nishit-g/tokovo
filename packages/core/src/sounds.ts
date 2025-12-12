/**
 * Sound Registry - Maps sound IDs to audio files
 * 
 * Place audio files in apps/video-runner/public/sounds/
 */

export const SOUND_REGISTRY: Record<string, string> = {
    // WhatsApp sounds
    "whatsapp_sent": "whatsapp-sent.mp3",
    "whatsapp_received": "whatsapp-received.mp3",
    "whatsapp_typing": "typing.mp3",

    // Notification sounds
    "notification": "notification.mp3",
    "notification_soft": "notification-soft.mp3",

    // Call sounds
    "ringtone": "ringtone.mp3",
    "call_end": "call-end.mp3",

    // UI sounds
    "camera_shutter": "camera-shutter.mp3",
    "screenshot": "screenshot.mp3",
    "lock": "lock.mp3",
    "unlock": "unlock.mp3",

    // Ambient / Music
    "suspense": "suspense.mp3",
    "dramatic": "dramatic.mp3",
};

/**
 * Get sound file path for a sound ID
 */
export function getSoundPath(soundId: string): string {
    const filename = SOUND_REGISTRY[soundId];
    if (!filename) {
        console.warn(`Unknown sound ID: ${soundId}`);
        return `sounds/${soundId}.mp3`; // Fallback to direct ID
    }
    return `sounds/${filename}`;
}
