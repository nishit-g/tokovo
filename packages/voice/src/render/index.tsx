import { Audio, Sequence, useVideoConfig } from "remotion";
import type { VoicePlayEvent } from "../dsl/voice-track.js";
import type { VoiceManifest, VoiceSegment } from "../types/manifest.js";

export interface VoiceDuckingRange {
  startFrame: number;
  endFrame: number;
  segmentId: string;
}

export interface SimpleVoiceLayerProps {
  manifest: VoiceManifest;
  audioUrl: string;
  startFrame?: number;
  volume?: number;
}

export interface VoiceLayerProps {
  manifest: VoiceManifest;
  audioUrl: string;
  events: VoicePlayEvent[];
  volume?: number;
}

function segmentStartFrame(segment: VoiceSegment, fps: number): number {
  return Math.max(0, Math.round((segment.startMs / 1000) * fps));
}

function segmentEndFrame(segment: VoiceSegment, fps: number): number {
  return Math.max(segmentStartFrame(segment, fps), Math.round((segment.endMs / 1000) * fps));
}

function segmentDurationFrames(segment: VoiceSegment, fps: number, speed = 1): number {
  const safeSpeed = speed > 0 ? speed : 1;
  return Math.max(1, Math.round(((segment.durationMs / 1000) * fps) / safeSpeed));
}

function segmentById(manifest: VoiceManifest): Map<string, VoiceSegment> {
  return new Map(manifest.segments.map((segment) => [segment.id, segment]));
}

export function computeVoiceDuckingRanges(
  events: VoicePlayEvent[],
  manifest: VoiceManifest,
  fps: number,
): VoiceDuckingRange[] {
  const segments = segmentById(manifest);

  return events.flatMap((event) => {
    const segment = segments.get(event.payload.segmentId);
    if (!segment) {
      return [];
    }

    const startFrame = event.at;
    return [
      {
        startFrame,
        endFrame: startFrame + segmentDurationFrames(segment, fps, event.payload.speed),
        segmentId: segment.id,
      },
    ];
  });
}

export function SimpleVoiceLayer({
  manifest,
  audioUrl,
  startFrame = 0,
  volume = 1,
}: SimpleVoiceLayerProps) {
  const { fps } = useVideoConfig();
  const durationFrames = Math.max(1, Math.ceil((manifest.durationMs / 1000) * fps));

  return (
    <Sequence from={startFrame} durationInFrames={durationFrames}>
      <Audio src={audioUrl} volume={volume} />
    </Sequence>
  );
}

export function VoiceLayer({ manifest, audioUrl, events, volume = 1 }: VoiceLayerProps) {
  const { fps } = useVideoConfig();
  const segments = segmentById(manifest);

  return (
    <>
      {events.map((event, index) => {
        const segment = segments.get(event.payload.segmentId);
        if (!segment) {
          return null;
        }

        const speed = event.payload.speed ?? 1;
        const eventVolume = (event.payload.volume ?? 1) * volume;
        const startFrom = segmentStartFrame(segment, fps);
        const endAt = segmentEndFrame(segment, fps);

        return (
          <Sequence
            key={`${event.payload.segmentId}-${event.at}-${index}`}
            from={event.at}
            durationInFrames={segmentDurationFrames(segment, fps, speed)}
          >
            <Audio
              src={audioUrl}
              startFrom={startFrom}
              endAt={endAt}
              playbackRate={speed}
              volume={eventVolume}
            />
          </Sequence>
        );
      })}
    </>
  );
}
