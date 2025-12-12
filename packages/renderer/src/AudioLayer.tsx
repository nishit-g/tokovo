/**
 * AudioLayer - Renders audio for the Tokovo timeline
 * 
 * Uses Remotion's <Audio> component to play sounds synchronized with video frames.
 * Supports both global sounds and per-device sounds.
 */

import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { WorldState, ActiveSound } from "@tokovo/core";
import { getSoundPath } from "@tokovo/core";

interface AudioLayerProps {
    world: WorldState;
    t: number;
    focusDeviceId?: string;  // If provided, only play sounds for this device
}

/**
 * AudioLayer component - renders all active sounds as Remotion Audio components
 */
export const AudioLayer: React.FC<AudioLayerProps> = ({ world, t, focusDeviceId }) => {
    const frame = useCurrentFrame();

    // Get audio state with safety check
    const audio = world.audio;
    if (!audio) {
        return null;
    }

    // Filter sounds based on focusDeviceId
    const activeSounds = Object.entries(audio.activeSounds).filter(([_, sound]) => {
        // If no deviceId on sound, it's global - always play
        if (!sound.deviceId) return true;
        // If no focusDeviceId specified, play all sounds
        if (!focusDeviceId) return true;
        // Only play if device matches
        return sound.deviceId === focusDeviceId;
    });

    return (
        <>
            {/* Active sounds */}
            {activeSounds.map(([instanceId, sound]) => (
                <SoundInstance
                    key={instanceId}
                    instanceId={instanceId}
                    sound={sound}
                    currentFrame={t}
                />
            ))}

            {/* Background music */}
            {audio.backgroundMusic && (
                <Sequence from={audio.backgroundMusic.startFrame}>
                    <Audio
                        src={staticFile(getSoundPath(audio.backgroundMusic.soundId))}
                        volume={audio.backgroundMusic.volume}
                        loop={audio.backgroundMusic.loop}
                    />
                </Sequence>
            )}
        </>
    );
};

/**
 * Individual sound instance - handles timing and volume
 */
const SoundInstance: React.FC<{
    instanceId: string;
    sound: ActiveSound;
    currentFrame: number;
}> = ({ instanceId, sound, currentFrame }) => {
    // Calculate if sound should be playing
    const soundFrame = currentFrame - sound.startFrame;

    // If sound has a duration and we're past it, don't render
    if (sound.duration && soundFrame > sound.duration) {
        return null;
    }

    // Calculate volume (could be fading)
    let volume = sound.volume;
    const fadeSound = sound as any;
    if (fadeSound.fadeTarget !== undefined && fadeSound.fadeStartFrame !== undefined) {
        const fadeProgress = Math.min(1, (currentFrame - fadeSound.fadeStartFrame) / fadeSound.fadeDuration);
        volume = sound.volume + (fadeSound.fadeTarget - sound.volume) * fadeProgress;
    }

    return (
        <Sequence from={sound.startFrame} durationInFrames={sound.duration || undefined}>
            <Audio
                src={staticFile(getSoundPath(sound.soundId))}
                volume={Math.max(0, Math.min(1, volume))}
                loop={sound.loop}
            />
        </Sequence>
    );
};

export default AudioLayer;
