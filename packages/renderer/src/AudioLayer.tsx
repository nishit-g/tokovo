/**
 * AudioLayer - Production-grade audio rendering for Tokovo
 *
 * Uses Remotion's <Audio> component to play sounds synchronized with video frames.
 * Features:
 * - Bus-based volume routing
 * - Ducking (UI/voice lowers music)
 * - Attack/release envelopes
 * - Per-device sound filtering
 */

import React, { useMemo } from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import {
  WorldState,
  SoundCue,
  ActiveSound,
  MusicBed,
  DEFAULT_BUS_CONFIG,
} from "@tokovo/core";
import { getSoundPath } from "@tokovo/core";
import { computeSoundVolume, computeBusStates, BusState } from "@tokovo/core";
import { computeCrossfade } from "@tokovo/core";

// =============================================================================
// TYPES
// =============================================================================

interface AudioLayerProps {
  world: WorldState;
  t: number;
  focusDeviceId?: string; // If provided, only play sounds for this device
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a sound is a SoundCue (has bus property)
 */
function isSoundCue(sound: SoundCue | ActiveSound): sound is SoundCue {
  return "bus" in sound;
}

/**
 * Ensure audio state has buses (backward compatibility)
 */
function ensureBuses(audio: WorldState["audio"]) {
  if (!audio.buses) {
    return {
      ...audio,
      buses: DEFAULT_BUS_CONFIG,
    };
  }
  return audio;
}

// =============================================================================
// SOUND INSTANCE COMPONENT
// =============================================================================

interface SoundInstanceProps {
  instanceId: string;
  sound: SoundCue | ActiveSound;
  currentFrame: number;
  busStates: Record<string, BusState>;
}

/**
 * Individual sound instance - handles timing, volume, and mixing
 */
const SoundInstance: React.FC<SoundInstanceProps> = ({
  instanceId,
  sound,
  currentFrame,
  busStates,
}) => {
  // Calculate if sound has expired
  if (sound.duration) {
    const elapsed = currentFrame - sound.startFrame;
    if (elapsed > sound.duration) {
      return null;
    }
  }

  // Compute final volume through mixer
  const finalVolume = computeSoundVolume(
    sound,
    currentFrame,
    busStates as Record<string, BusState>,
  );

  // Skip if volume is effectively zero
  if (finalVolume < 0.01) {
    return null;
  }

  return (
    <Sequence
      from={sound.startFrame}
      durationInFrames={sound.duration || undefined}
      premountFor={30}
    >
      <Audio
        src={staticFile(getSoundPath(sound.soundId))}
        volume={finalVolume}
        loop={sound.loop}
      />
    </Sequence>
  );
};

// =============================================================================
// MUSIC BED COMPONENT
// =============================================================================

interface MusicBedInstanceProps {
  musicBed: MusicBed;
  outgoingBed?: MusicBed;
  currentFrame: number;
  busStates: Record<string, BusState>;
}

/**
 * Music bed instance with crossfade support
 */
const MusicBedInstance: React.FC<MusicBedInstanceProps> = ({
  musicBed,
  outgoingBed,
  currentFrame,
  busStates,
}) => {
  // Compute crossfade volumes
  const { outVolume, inVolume } = computeCrossfade(
    outgoingBed,
    musicBed,
    currentFrame,
  );

  // Apply bus ducking to music
  const musicBusState = busStates.music || {
    baseGain: 0.35,
    duckMultiplier: 1,
  };
  const duckMult = musicBusState.duckMultiplier;

  return (
    <>
      {/* Outgoing music (if crossfading) */}
      {outgoingBed && outVolume > 0.01 && (
        <Sequence from={outgoingBed.startFrame} premountFor={30}>
          <Audio
            src={staticFile(getSoundPath(outgoingBed.soundId))}
            volume={outVolume * duckMult}
            loop={outgoingBed.loop}
          />
        </Sequence>
      )}

      {/* Incoming music */}
      <Sequence from={musicBed.startFrame} premountFor={30}>
        <Audio
          src={staticFile(getSoundPath(musicBed.soundId))}
          volume={inVolume * duckMult}
          loop={musicBed.loop}
        />
      </Sequence>
    </>
  );
};

// =============================================================================
// MAIN AUDIO LAYER COMPONENT
// =============================================================================

/**
 * AudioLayer component - renders all active sounds as Remotion Audio components
 */
export const AudioLayer: React.FC<AudioLayerProps> = ({
  world,
  t,
  focusDeviceId,
}) => {
  const frame = useCurrentFrame();

  // Get audio state with safety check
  const rawAudio = world.audio;
  if (!rawAudio) {
    return null;
  }

  // Ensure buses exist (backward compatibility)
  const audio = ensureBuses(rawAudio);

  // Compute bus states (with ducking) for this frame
  const busStates = useMemo(
    () => computeBusStates(audio, frame),
    [audio, frame],
  );

  // Filter sounds based on focusDeviceId
  const activeSounds = useMemo(() => {
    return Object.entries(audio.activeSounds).filter(([_, sound]) => {
      // If no deviceId on sound, it's global - always play
      if (!sound.deviceId) return true;
      // If no focusDeviceId specified, play all sounds
      if (!focusDeviceId) return true;
      // Only play if device matches
      return sound.deviceId === focusDeviceId;
    });
  }, [audio.activeSounds, focusDeviceId]);

  return (
    <>
      {/* Active sound cues */}
      {activeSounds.map(([instanceId, sound]) => (
        <SoundInstance
          key={instanceId}
          instanceId={instanceId}
          sound={sound}
          currentFrame={t}
          busStates={busStates}
        />
      ))}

      {/* Music bed (with crossfade support) */}
      {audio.musicBed && (
        <MusicBedInstance
          musicBed={audio.musicBed}
          currentFrame={t}
          busStates={busStates}
        />
      )}

      {/* Legacy background music (backward compatible) */}
      {audio.backgroundMusic && !audio.musicBed && (
        <Sequence from={audio.backgroundMusic.startFrame} premountFor={30}>
          <Audio
            src={staticFile(getSoundPath(audio.backgroundMusic.soundId))}
            volume={
              audio.backgroundMusic.volume *
              (busStates.music?.duckMultiplier ?? 1)
            }
            loop={audio.backgroundMusic.loop}
          />
        </Sequence>
      )}
    </>
  );
};

export default AudioLayer;
