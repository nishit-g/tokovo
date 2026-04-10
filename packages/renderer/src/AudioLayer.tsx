import React, { useMemo, useCallback, useRef } from "react";
import { Html5Audio, Sequence, staticFile } from "remotion";
import {
  WorldState,
  SoundCue,
  MusicBed,
  DEFAULT_BUS_CONFIG,
  AudioBus,
  resolveStaticAssetSrc,
} from "@tokovo/core";
import { getSoundPath } from "@tokovo/core";
import { computeSoundVolume, computeBusStates, BusState } from "@tokovo/core";
import { computeCrossfade } from "@tokovo/core";
import { useRendererRegistries } from "./RegistryContext.js";

const VOLUME_THRESHOLD = 0.001;
export const AUDIO_PREMOUNT_FRAMES = 30;

interface AudioLayerProps {
  readonly world: WorldState;
  readonly t: number;
  readonly focusDeviceId?: string;
  readonly musicDuckMultiplierOverride?: number;
}

function ensureBuses(audio: NonNullable<WorldState["audio"]>) {
  if (!audio.buses) {
    return { ...audio, buses: DEFAULT_BUS_CONFIG };
  }
  return audio;
}

interface SoundInstanceProps {
  readonly instanceId: string;
  readonly sound: SoundCue;
  readonly compositionFrame: number;
  readonly busStates: Record<AudioBus, BusState>;
}

const SoundInstance: React.FC<SoundInstanceProps> = React.memo(
  ({ sound, compositionFrame, busStates }) => {
    const registries = useRendererRegistries();
    const busStatesRef = useRef(busStates);
    busStatesRef.current = busStates;

    const isExpired = useMemo(() => {
      if (!sound.duration) return false;
      const elapsed = compositionFrame - sound.startFrame;
      return elapsed >= sound.duration;
    }, [sound.duration, sound.startFrame, compositionFrame]);

    const baseVolume = useMemo(
      () => computeSoundVolume(sound, compositionFrame, busStates),
      [sound, compositionFrame, busStates],
    );

    const isMuted = baseVolume < VOLUME_THRESHOLD;

    const volumeCallback = useCallback(
      (localFrame: number) => {
        const absoluteFrame = sound.startFrame + localFrame;
        return computeSoundVolume(sound, absoluteFrame, busStatesRef.current);
      },
      [sound],
    );

    if (isExpired) {
      return null;
    }

    return (
      <Sequence
        from={sound.startFrame}
        durationInFrames={sound.duration || undefined}
        premountFor={AUDIO_PREMOUNT_FRAMES}
      >
        <Html5Audio
          src={resolveStaticAssetSrc(
            getSoundPath(sound.soundId, registries.plugins.sounds),
            staticFile,
          )}
          volume={volumeCallback}
          loop={sound.loop}
          trimBefore={sound.audioStartFrom}
          playbackRate={sound.playbackRate}
          pauseWhenBuffering
          muted={isMuted}
        />
      </Sequence>
    );
  },
);

SoundInstance.displayName = "SoundInstance";

interface MusicBedInstanceProps {
  readonly musicBed: MusicBed;
  readonly outgoingBed?: MusicBed;
  readonly compositionFrame: number;
  readonly busStates: Record<AudioBus, BusState>;
}

const MusicBedInstance: React.FC<MusicBedInstanceProps> = React.memo(
  ({ musicBed, outgoingBed, compositionFrame, busStates }) => {
    const registries = useRendererRegistries();
    const busStatesRef = useRef(busStates);
    busStatesRef.current = busStates;

    const { outVolume, inVolume } = useMemo(
      () => computeCrossfade(outgoingBed, musicBed, compositionFrame),
      [outgoingBed, musicBed, compositionFrame],
    );

    const duckMult = busStatesRef.current.music?.duckMultiplier ?? 1;

    const outgoingFinalVolume = outVolume * duckMult;
    const incomingFinalVolume = inVolume * duckMult;

    const isOutgoingMuted = outgoingFinalVolume < VOLUME_THRESHOLD;
    const isIncomingMuted = incomingFinalVolume < VOLUME_THRESHOLD;

    return (
      <>
        {outgoingBed && (
          <Sequence
            from={outgoingBed.startFrame}
            premountFor={AUDIO_PREMOUNT_FRAMES}
          >
            <Html5Audio
              src={resolveStaticAssetSrc(
                getSoundPath(outgoingBed.soundId, registries.plugins.sounds),
                staticFile,
              )}
              volume={outgoingFinalVolume}
              loop={outgoingBed.loop}
              pauseWhenBuffering
              muted={isOutgoingMuted}
            />
          </Sequence>
        )}

        <Sequence
          from={musicBed.startFrame}
          premountFor={AUDIO_PREMOUNT_FRAMES}
        >
          <Html5Audio
            src={resolveStaticAssetSrc(
              getSoundPath(musicBed.soundId, registries.plugins.sounds),
              staticFile,
            )}
            volume={incomingFinalVolume}
            loop={musicBed.loop}
            pauseWhenBuffering
            muted={isIncomingMuted}
          />
        </Sequence>
      </>
    );
  },
);

MusicBedInstance.displayName = "MusicBedInstance";

export const AudioLayer: React.FC<AudioLayerProps> = ({
  world,
  t,
  focusDeviceId,
  musicDuckMultiplierOverride,
}) => {
  const rawAudio = world.audio;
  if (!rawAudio) {
    return null;
  }

  const audio = ensureBuses(rawAudio);

  const busStates = useMemo(
    () => computeBusStates(audio, t),
    [audio, t],
  ) as Record<AudioBus, BusState>;

  const effectiveBusStates = useMemo(() => {
    if (musicDuckMultiplierOverride === undefined) {
      return busStates;
    }

    return {
      ...busStates,
      music: {
        ...busStates.music,
        duckMultiplier: Math.min(
          busStates.music.duckMultiplier,
          musicDuckMultiplierOverride,
        ),
      },
    };
  }, [busStates, musicDuckMultiplierOverride]);

  const activeSounds = useMemo(() => {
    return Object.entries(audio.activeSounds).filter(([_, sound]) => {
      if (!sound.deviceId) return true;
      if (!focusDeviceId) return true;
      return sound.deviceId === focusDeviceId;
    });
  }, [audio.activeSounds, focusDeviceId]);

  return (
    <>
      {activeSounds.map(([instanceId, sound]) => (
        <SoundInstance
          key={instanceId}
          instanceId={instanceId}
          sound={sound}
          compositionFrame={t}
          busStates={effectiveBusStates}
        />
      ))}

      {audio.musicBed && (
        <MusicBedInstance
          musicBed={audio.musicBed}
          outgoingBed={audio.outgoingMusicBed}
          compositionFrame={t}
          busStates={effectiveBusStates}
        />
      )}
    </>
  );
};

export default AudioLayer;
