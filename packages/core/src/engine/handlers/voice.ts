import type { WorldState, SoundCue, DuckRule } from "../../types";
import type {
  VoiceRuntimeEvent,
  VoicePlaySegmentEvent,
} from "../../types/runtime-event";

const DEFAULT_FPS = 30;

const DEFAULT_VOICE_DUCK: DuckRule = {
  targetBus: "music",
  amount: 0.15,
  attack: 6,
  release: 12,
};

export interface VoiceHandlerResult {
  audio: WorldState["audio"];
  logs?: Array<{
    type: "play" | "stop";
    soundId: string;
    bus: string;
    frame: number;
  }>;
}

export function processVoiceEvent(
  event: VoiceRuntimeEvent,
  world: WorldState,
): VoiceHandlerResult {
  const audio = { ...world.audio };
  const logs: VoiceHandlerResult["logs"] = [];
  const fps = world.config?.fps ?? DEFAULT_FPS;

  switch (event.type) {
    case "PLAY_SEGMENT": {
      const segmentCue = createVoiceSegmentCue(event, fps);

      if (segmentCue.duration !== undefined && segmentCue.duration <= 0) {
        break;
      }

      const instanceId = `voice_${event.segmentId}_${event.at}`;
      audio.activeSounds = {
        ...audio.activeSounds,
        [instanceId]: segmentCue,
      };

      logs.push({
        type: "play",
        soundId: event.audioPath,
        bus: "voice",
        frame: event.at,
      });
      break;
    }

    case "STOP_VOICE": {
      const targetSegmentId = (event as { segmentId?: string }).segmentId;

      const toRemove: string[] = [];
      const toKeep: Record<string, (typeof audio.activeSounds)[string]> = {};

      for (const [id, sound] of Object.entries(audio.activeSounds)) {
        const isVoice = "bus" in sound && sound.bus === "voice";

        if (isVoice) {
          if (targetSegmentId) {
            if (sound.metadata?.segmentId === targetSegmentId) {
              toRemove.push(id);
            } else {
              toKeep[id] = sound;
            }
          } else {
            toRemove.push(id);
          }
        } else {
          toKeep[id] = sound;
        }
      }

      for (const id of toRemove) {
        logs.push({ type: "stop", soundId: id, bus: "voice", frame: event.at });
      }

      audio.activeSounds = toKeep;
      break;
    }
  }

  return { audio, logs };
}

function createVoiceSegmentCue(
  event: VoicePlaySegmentEvent,
  fps: number,
): SoundCue {
  const startMs = Math.max(0, event.startMs);
  const endMs = Math.max(startMs, event.endMs);
  const durationMs = endMs - startMs;

  const audioStartFromFrames = Math.round((startMs / 1000) * fps);
  const durationFrames = Math.round((durationMs / 1000) * fps);

  const cue: SoundCue = {
    soundId: event.audioPath,
    startFrame: event.at,
    volume: clamp01(event.volume ?? 1.0),
    bus: "voice",
    priority: 100,
    audioStartFrom: audioStartFromFrames,
    duration: durationFrames > 0 ? durationFrames : undefined,
    origin: "world",
    duck: DEFAULT_VOICE_DUCK,
    playbackRate: clamp(event.speed ?? 1.0, 0.25, 4.0),
  };

  cue.metadata = {
    segmentId: event.segmentId,
    speaker: event.speaker,
    text: event.text,
  };

  return cue;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
