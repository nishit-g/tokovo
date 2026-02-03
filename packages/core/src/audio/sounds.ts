import type { SoundRegistryAPI } from "../registries/sound";
import { AudioLogger } from "../engine/logger";

const BUILT_IN_SOUNDS = {
  notification: "notification.mp3",
  notification_soft: "notification-soft.mp3",

  ringtone: "ringtone.mp3",
  call_end: "call-end.mp3",

  camera_shutter: "camera-shutter.mp3",
  screenshot: "screenshot.mp3",
  lock: "lock.mp3",
  unlock: "unlock.mp3",
  tap: "tap.mp3",
  keyboard_click: "keyboard-click.mp3",

  suspense: "suspense.mp3",
  dramatic: "dramatic.mp3",
};

export function registerBuiltInSounds(registry: SoundRegistryAPI): void {
  registry.registerMany(BUILT_IN_SOUNDS);
}

export function getSoundPath(
  soundId: string,
  registry: SoundRegistryAPI,
): string {
  if (soundId.startsWith("/")) {
    return soundId.substring(1);
  }

  if (soundId.includes("/")) {
    return soundId;
  }

  const path = registry.getPath(soundId);
  if (!path) {
    const fallbackPath = `sounds/${soundId}.mp3`;
    AudioLogger.soundPathFallback(soundId, fallbackPath);
    return fallbackPath;
  }
  return `sounds/${path}`;
}
