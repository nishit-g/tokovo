/**
 * Audio Builder
 * 
 * Fluent API for audio operations in DSL episodes.
 * 
 * AUDIO PRIMITIVES:
 * - playSound: One-shot sound effect
 * - music: Background music with optional crossfade
 * - stopSound: Stop a specific sound instance
 * - fadeVolume: Fade a sound's volume
 */

// =============================================================================
// OPTION TYPES
// =============================================================================

export interface PlaySoundOptions {
    volume?: number;      // 0-1, default 1.0
    loop?: boolean;       // Default false
    duration?: number;    // Frames, optional
    bus?: "music" | "ui" | "sfx" | "voice";
    instanceId?: string;  // For stopping later
}

export interface BackgroundMusicOptions {
    volume?: number;       // 0-1, default 0.3
    loop?: boolean;        // Default true
    crossfade?: number;    // Frames to crossfade
    mood?: "tense" | "romantic" | "chaotic" | "calm" | "dramatic";
}

export interface FadeVolumeOptions {
    duration?: number;    // Frames
}

// =============================================================================
// AUDIO DSL FUNCTIONS
// =============================================================================

/**
 * Audio DSL namespace - provides fluent builders for audio events
 */
export const audio = {
    /**
     * Play a sound effect
     */
    playSound(soundId: string, options: PlaySoundOptions = {}) {
        return {
            kind: "AUDIO" as const,
            type: "PLAY_SOUND" as const,
            soundId,
            volume: options.volume ?? 1.0,
            loop: options.loop ?? false,
            duration: options.duration,
            instanceId: options.instanceId,
        };
    },

    /**
     * Start background music
     */
    backgroundMusic(soundId: string, options: BackgroundMusicOptions = {}) {
        return {
            kind: "AUDIO" as const,
            type: "BACKGROUND_MUSIC" as const,
            soundId,
            volume: options.volume ?? 0.3,
            loop: options.loop ?? true,
        };
    },

    /**
     * Stop a sound by instance ID
     */
    stopSound(instanceId: string) {
        return {
            kind: "AUDIO" as const,
            type: "STOP_SOUND" as const,
            instanceId,
        };
    },

    /**
     * Fade a sound's volume
     */
    fadeVolume(instanceId: string, toVolume: number, options: FadeVolumeOptions = {}) {
        return {
            kind: "AUDIO" as const,
            type: "FADE_VOLUME" as const,
            instanceId,
            toVolume,
            duration: options.duration ?? 30,
        };
    },

    // =========================================================================
    // CONVENIENCE HELPERS
    // =========================================================================

    /**
     * Play WhatsApp received notification
     */
    whatsappReceived(options: Partial<PlaySoundOptions> = {}) {
        return audio.playSound("whatsapp_received", { bus: "ui", volume: 0.9, ...options });
    },

    /**
     * Play WhatsApp sent sound
     */
    whatsappSent(options: Partial<PlaySoundOptions> = {}) {
        return audio.playSound("whatsapp_sent", { bus: "ui", volume: 0.7, ...options });
    },

    /**
     * Play typing sound (with loop)
     */
    typing(durationFrames: number, options: Partial<PlaySoundOptions> = {}) {
        return audio.playSound("whatsapp_typing", {
            bus: "sfx",
            volume: 0.4,
            loop: true,
            duration: durationFrames,
            instanceId: "typing",
            ...options
        });
    },

    /**
     * Stop typing sound
     */
    typingStop() {
        return audio.stopSound("typing");
    },

    /**
     * Play notification sound
     */
    notification(options: Partial<PlaySoundOptions> = {}) {
        return audio.playSound("notification", { bus: "ui", volume: 1.0, ...options });
    },

    /**
     * Start tense background music
     */
    tenseMood(options: Partial<BackgroundMusicOptions> = {}) {
        return audio.backgroundMusic("suspense", { volume: 0.25, mood: "tense", ...options });
    },

    /**
     * Start dramatic background music
     */
    dramaticMood(options: Partial<BackgroundMusicOptions> = {}) {
        return audio.backgroundMusic("dramatic", { volume: 0.3, mood: "dramatic", ...options });
    },
};
