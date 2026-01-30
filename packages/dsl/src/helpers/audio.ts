import type { AudioRuntimeEvent } from "@tokovo/core";

export interface PlayOptions {
  loop?: boolean;
  duration?: number;
  instanceId?: string;
  deviceId?: string;
}

export interface FadeOptions {
  easing?: string;
}

export interface PlaySoundEvent {
  at: number;
  kind: "AUDIO";
  type: "PLAY_SOUND";
  soundId: string;
  volume: number;
  loop?: boolean;
  duration?: number;
  instanceId?: string;
  deviceId?: string;
}

export interface StopSoundEvent {
  at: number;
  kind: "AUDIO";
  type: "STOP_SOUND";
  instanceId: string;
}

export interface FadeVolumeEvent {
  at: number;
  kind: "AUDIO";
  type: "FADE_VOLUME";
  instanceId: string;
  toVolume: number;
  duration: number;
}

export interface BackgroundMusicEvent {
  at: number;
  kind: "AUDIO";
  type: "BACKGROUND_MUSIC";
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
    instanceId,
    toVolume,
    duration,
  }),
};
