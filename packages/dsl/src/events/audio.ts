import type { AudioRuntimeEvent } from "@tokovo/core";
import { createTrace } from "@tokovo/ir";
import { Tracer } from "../tracer";

export interface PlayOptions {
  loop?: boolean;
  duration?: number;
  instanceId?: string;
  deviceId?: string;
}

export interface FadeOptions {
  easing?: string;
}

interface PlaySoundEvent {
  at: number;
  kind: "AUDIO";
  type: "PLAY_SOUND";
  _trace: ReturnType<typeof createTrace>;
  soundId: string;
  volume: number;
  loop?: boolean;
  duration?: number;
  instanceId?: string;
  deviceId?: string;
}

interface StopSoundEvent {
  at: number;
  kind: "AUDIO";
  type: "STOP_SOUND";
  _trace: ReturnType<typeof createTrace>;
  instanceId: string;
}

interface FadeVolumeEvent {
  at: number;
  kind: "AUDIO";
  type: "FADE_VOLUME";
  _trace: ReturnType<typeof createTrace>;
  instanceId: string;
  toVolume: number;
  duration: number;
}

interface BackgroundMusicEvent {
  at: number;
  kind: "AUDIO";
  type: "BACKGROUND_MUSIC";
  _trace: ReturnType<typeof createTrace>;
  soundId: string;
  volume: number;
  loop: boolean;
}

export const audio = {
  play: (
    at: number,
    soundId: string,
    volume = 1.0,
    opts: PlayOptions = {},
  ): PlaySoundEvent => ({
    at,
    kind: "AUDIO",
    type: "PLAY_SOUND",
    _trace: createTrace(Tracer.capture()),
    soundId,
    volume,
    loop: opts.loop,
    duration: opts.duration,
    instanceId: opts.instanceId,
    deviceId: opts.deviceId,
  }),

  stop: (at: number, instanceId: string): StopSoundEvent => ({
    at,
    kind: "AUDIO",
    type: "STOP_SOUND",
    _trace: createTrace(Tracer.capture()),
    instanceId,
  }),

  fade: (
    at: number,
    instanceId: string,
    toVolume: number,
    duration: number,
  ): FadeVolumeEvent => ({
    at,
    kind: "AUDIO",
    type: "FADE_VOLUME",
    _trace: createTrace(Tracer.capture()),
    instanceId,
    toVolume,
    duration,
  }),

  backgroundMusic: (
    at: number,
    soundId: string,
    volume = 0.5,
    loop = true,
  ): BackgroundMusicEvent => ({
    at,
    kind: "AUDIO",
    type: "BACKGROUND_MUSIC",
    _trace: createTrace(Tracer.capture()),
    soundId,
    volume,
    loop,
  }),
};
