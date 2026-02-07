import type { SoundRegistryAPI } from "../registries/sound.js";
import { AudioLogger } from "../engine/logger.js";

const BUILT_IN_SOUNDS = {
  notification: "generated/core/notification.wav",
  notification_soft: "generated/core/notification-soft.wav",

  ringtone: "generated/core/ringtone.wav",
  call_end: "generated/core/call-end.wav",

  camera_shutter: "generated/core/camera-shutter.wav",
  screenshot: "generated/core/screenshot.wav",
  lock: "generated/core/lock.wav",
  unlock: "generated/core/unlock.wav",
  tap: "generated/core/tap.wav",
  keyboard_click: "generated/core/keyboard-click.wav",

  suspense: "generated/core/suspense.wav",
  dramatic: "generated/core/dramatic.wav",
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
    // Default to wav fallback. (Prefer explicit registry entries in production.)
    const fallbackPath = `sounds/${soundId}.wav`;
    AudioLogger.soundPathFallback(soundId, fallbackPath);
    return fallbackPath;
  }
  return `sounds/${path}`;
}
