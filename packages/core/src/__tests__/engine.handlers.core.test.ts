import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { WorldState } from "../types";
import {
  processAudioEvent,
  cleanupExpiredSounds,
  handleAutoSounds,
} from "../engine/handlers/audio";
import { processCallEvent } from "../engine/handlers/call";
import { processOSEvent } from "../engine/handlers/os";
import { processCameraEvent } from "../engine/handlers/camera";
import { processVoiceEvent } from "../engine/handlers/voice";
import { navigationReducer } from "../engine/handlers/navigation";
import { PluginManager } from "../plugin/plugin";
import { AutoSoundRegistry } from "../audio/auto-sound";
import * as autoSound from "../audio/auto-sound";

const baseWorld = (): WorldState => ({
  devices: {
    phone: { id: "phone", screenDimensions: { width: 100, height: 200 } },
  },
  appState: {},
  camera: { baseView: "APP_VIEW" },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState);

beforeEach(() => {
  AutoSoundRegistry.clear();
});

afterEach(() => {
  AutoSoundRegistry.clear();
  PluginManager.unregister("camera");
});

describe("engine handlers", () => {
  it("processes audio events", () => {
    const world = baseWorld();
    (world as any).audio = undefined;

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "PLAY_SOUND",
      soundId: "ding",
      bus: "sfx",
      at: 1,
    } as any, { frame: 1, eventIndex: 0, mode: "preview", fps: 30 });

    expect(Object.keys(world.audio.activeSounds).length).toBe(1);

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "PLAY",
      soundId: "music",
      bus: "music",
      at: 2,
    } as any, { frame: 2, eventIndex: 0, mode: "preview", fps: 30 });
    expect(world.audio.musicBed?.soundId).toBe("music");

    const instanceId = Object.keys(world.audio.activeSounds)[0];
    processAudioEvent(world, {
      kind: "AUDIO",
      type: "STOP_SOUND",
      instanceId,
      at: 3,
    } as any, { frame: 3, eventIndex: 0, mode: "preview", fps: 30 });
    expect(Object.keys(world.audio.activeSounds)).toHaveLength(0);

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "PLAY_SOUND",
      soundId: "sfx",
      bus: "sfx",
      at: 4,
    } as any, { frame: 4, eventIndex: 0, mode: "preview", fps: 30 });

    const sfxInstance = Object.keys(world.audio.activeSounds)[0];
    processAudioEvent(world, {
      kind: "AUDIO",
      type: "FADE_OUT",
      instanceId: sfxInstance,
      duration: 10,
      toVolume: 0,
      at: 5,
    } as any, { frame: 5, eventIndex: 0, mode: "preview", fps: 30 });

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "STOP_SOUND",
      soundId: "sfx",
      at: 5,
    } as any, { frame: 5, eventIndex: 0, mode: "preview", fps: 30 });
    expect(Object.keys(world.audio.activeSounds)).toHaveLength(0);

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "CROSSFADE",
      soundId: "music",
      toSoundId: "music2",
      duration: 20,
      at: 6,
    } as any, { frame: 6, eventIndex: 0, mode: "preview", fps: 30 });
    expect(world.audio.outgoingMusicBed).toBeDefined();
    expect(world.audio.musicBed?.soundId).toBe("music2");

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "FADE_OUT",
      soundId: "music2",
      duration: 5,
      at: 6,
    } as any, { frame: 6, eventIndex: 0, mode: "preview", fps: 30 });
    expect(world.audio.musicBed?.fadeOutDuration).toBe(5);

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "STOP_ALL",
      bus: "music",
      at: 7,
    } as any, { frame: 7, eventIndex: 0, mode: "preview", fps: 30 });
    expect(world.audio.musicBed).toBeUndefined();

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "STOP_ALL",
      at: 8,
    } as any, { frame: 8, eventIndex: 0, mode: "preview", fps: 30 });
    expect(Object.keys(world.audio.activeSounds)).toHaveLength(0);
  });

  it("fills play defaults and applies policy removals", () => {
    const ctx = { frame: 1, eventIndex: 0, mode: "preview" as const, fps: 30 };

    const musicWorld = baseWorld();
    processAudioEvent(musicWorld, {
      kind: "AUDIO",
      type: "PLAY",
      bus: "music",
      fadeIn: 12,
      at: 1,
    } as any, ctx);
    expect(musicWorld.audio.musicBed?.soundId).toBe("");
    expect(musicWorld.audio.musicBed?.crossfadeCurve).toBe("easeInOut");

    const sfxWorld = baseWorld();
    processAudioEvent(sfxWorld, { kind: "AUDIO", type: "PLAY_SOUND", at: 1 } as any, ctx);
    const added = Object.values(sfxWorld.audio.activeSounds)[0] as any;
    expect(added.soundId).toBe("");
    expect(added.bus).toBe("sfx");

    const policyWorld = baseWorld();
    policyWorld.audio.activeSounds = {
      low: { soundId: "low", bus: "sfx", priority: 10, startFrame: 0 } as any,
      mid: { soundId: "mid", bus: "sfx", priority: 20, startFrame: 0 } as any,
      high: { soundId: "high", bus: "sfx", priority: 30, startFrame: 0 } as any,
      higher: { soundId: "higher", bus: "sfx", priority: 40, startFrame: 0 } as any,
    };
    processAudioEvent(policyWorld, {
      kind: "AUDIO",
      type: "PLAY_SOUND",
      soundId: "new",
      bus: "sfx",
      at: 5,
    } as any, { ...ctx, frame: 5 });
    expect(policyWorld.audio.activeSounds.low).toBeUndefined();
    expect(
      Object.values(policyWorld.audio.activeSounds).some(
        (sound) => (sound as any).soundId === "new",
      ),
    ).toBe(true);
  });

  it("handles stop events and music bed removal", () => {
    const world = baseWorld();
    const ctx = { frame: 1, eventIndex: 0, mode: "preview" as const, fps: 30 };

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "PLAY_SOUND",
      soundId: "tone",
      bus: "sfx",
      at: 0,
    } as any, ctx);
    const instanceId = Object.keys(world.audio.activeSounds)[0];
    processAudioEvent(world, {
      kind: "AUDIO",
      type: "STOP",
      instanceId,
      at: 1,
    } as any, ctx);
    expect(world.audio.activeSounds[instanceId]).toBeUndefined();

    world.audio.musicBed = {
      soundId: "theme",
      baseGain: 0.5,
      loop: true,
      startFrame: 0,
    } as any;
    world.audio.activeSounds.theme = {
      soundId: "theme",
      bus: "music",
      startFrame: 0,
      volume: 1,
      priority: 1,
    } as any;

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "STOP_SOUND",
      soundId: "theme",
      at: 2,
    } as any, ctx);
    expect(world.audio.musicBed).toBeUndefined();
  });

  it("uses default fade and crossfade durations", () => {
    const world = baseWorld();
    const ctx = { frame: 1, eventIndex: 0, mode: "preview" as const, fps: 30 };

    world.audio.musicBed = {
      soundId: "bed",
      baseGain: 0.5,
      loop: true,
      startFrame: 0,
    } as any;

    processAudioEvent(world, { kind: "AUDIO", type: "FADE_OUT", at: 5 } as any, ctx);
    expect(world.audio.musicBed?.fadeOutDuration).toBe(30);

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "CROSSFADE",
      soundId: "next",
      at: 6,
    } as any, { ...ctx, frame: 6 });
    expect(world.audio.musicBed?.crossfadeFrames).toBe(60);

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "CROSSFADE",
      soundId: "next2",
      crossfadeDuration: 12,
      at: 7,
    } as any, { ...ctx, frame: 7 });
    expect(world.audio.musicBed?.crossfadeFrames).toBe(12);
  });

  it("fades by soundId and fades music bed when no ids are provided", () => {
    const world = baseWorld();

    world.audio.activeSounds = {
      a: { soundId: "ding", bus: "sfx", startFrame: 0, volume: 1, priority: 1 } as any,
      b: { soundId: "ding", bus: "sfx", startFrame: 1, volume: 1, priority: 1, duration: 5 } as any,
    };

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "FADE_OUT",
      soundId: "ding",
      duration: 10,
      at: 3,
    } as any, { frame: 3, eventIndex: 0, mode: "preview", fps: 30 });

    expect(world.audio.activeSounds.a.fadeStartFrame).toBe(3);
    expect(world.audio.activeSounds.b.fadeStartFrame).toBe(3);

    world.audio.musicBed = {
      soundId: "bed",
      baseGain: 0.5,
      loop: true,
      startFrame: 0,
    } as any;

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "FADE_OUT",
      duration: 12,
      at: 4,
    } as any, { frame: 4, eventIndex: 0, mode: "preview", fps: 30 });

    expect(world.audio.musicBed.fadeOutStart).toBe(4);
    expect(world.audio.musicBed.fadeOutDuration).toBe(12);
  });

  it("clamps fade duration and stops sounds by bus", () => {
    const world = baseWorld();
    world.audio.activeSounds = {
      a: {
        soundId: "tone",
        bus: "sfx",
        startFrame: 0,
        duration: 5,
        volume: 1,
        priority: 1,
      } as any,
    };

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "FADE_OUT",
      instanceId: "a",
      duration: 10,
      at: 10,
    } as any, { frame: 10, eventIndex: 0, mode: "preview", fps: 30 });

    expect(world.audio.activeSounds.a.fadeDuration).toBe(0);

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "STOP_ALL",
      bus: "sfx",
      at: 11,
    } as any, { frame: 11, eventIndex: 0, mode: "preview", fps: 30 });
    expect(Object.keys(world.audio.activeSounds)).toHaveLength(0);
  });

  it("respects concurrency limits and ignores unknown audio events", () => {
    const world = baseWorld();
    world.audio.activeSounds = {
      a: { soundId: "a", bus: "sfx", priority: 70, startFrame: 0 } as any,
      b: { soundId: "b", bus: "sfx", priority: 80, startFrame: 0 } as any,
      c: { soundId: "c", bus: "sfx", priority: 90, startFrame: 0 } as any,
      d: { soundId: "d", bus: "sfx", priority: 100, startFrame: 0 } as any,
    };

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "PLAY_SOUND",
      soundId: "e",
      bus: "sfx",
      at: 10,
    } as any, { frame: 10, eventIndex: 0, mode: "preview", fps: 30 });

    expect(Object.keys(world.audio.activeSounds)).toHaveLength(4);

    processAudioEvent(world, {
      kind: "AUDIO",
      type: "UNKNOWN",
      at: 11,
    } as any, { frame: 11, eventIndex: 0, mode: "preview", fps: 30 });
  });

  it("initializes missing audio policy state", () => {
    const world = baseWorld();
    (world.audio as any).policyState = undefined;
    delete (world.audio as any).activeSounds;
    delete (world.audio as any).buses;
    processAudioEvent(world, { kind: "AUDIO", type: "PLAY_SOUND", soundId: "ding", at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.audio.policyState).toBeDefined();
    expect(world.audio.activeSounds).toBeDefined();
    expect(world.audio.buses).toBeDefined();
  });

  it("cleans up expired sounds and outgoing music", () => {
    const world = baseWorld();
    world.audio.activeSounds = {
      loop: { soundId: "loop", loop: true, startFrame: 0, bus: "sfx" } as any,
      fade: {
        soundId: "fade",
        loop: false,
        startFrame: 0,
        bus: "sfx",
        fadeTarget: 0,
        fadeStartFrame: 0,
        fadeDuration: 5,
      } as any,
      fadeDefault: {
        soundId: "fadeDefault",
        loop: false,
        startFrame: 0,
        bus: "sfx",
        fadeTarget: 0,
        fadeStartFrame: 0,
      } as any,
      dur: { soundId: "dur", loop: false, startFrame: 0, duration: 3, bus: "sfx" } as any,
    };
    world.audio.outgoingMusicBed = {
      soundId: "out",
      fadeOutStart: 0,
      fadeOutDuration: 2,
    } as any;
    world.audio.policyState.recentSounds = { old: 0 };

    cleanupExpiredSounds(world, 4000);
    expect(world.audio.outgoingMusicBed).toBeUndefined();
    expect(Object.keys(world.audio.activeSounds)).toHaveLength(0);
  });

  it("handles cleanup with missing audio state", () => {
    const world = baseWorld();
    (world as any).audio = undefined;
    cleanupExpiredSounds(world, 0);
    expect((world as any).audio).toBeUndefined();
  });

  it("applies auto sound instructions", () => {
    const world = baseWorld();
    world.audio.autoSoundRules = [
      {
        match: { kind: "APP", type: "MESSAGE_RECEIVED", appId: "app" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
      {
        match: { kind: "APP", type: "MESSAGE_RECEIVED", appId: "app" },
        action: "STOP_SOUND",
        stopId: "ding_{conversationId}",
      },
    ];

    handleAutoSounds(world, { kind: "APP", type: "MESSAGE_RECEIVED", appId: "app", at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });

    expect(Object.keys(world.audio.activeSounds).length).toBe(1);

    const spy = vi
      .spyOn(autoSound, "deriveAudioInstructions")
      .mockReturnValue([
        { action: "STOP_SOUND", soundId: "ding" } as any,
      ]);

    handleAutoSounds(world, { kind: "APP", type: "MESSAGE_RECEIVED", appId: "app", at: 2 } as any, {
      frame: 2,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });

    expect(Object.keys(world.audio.activeSounds).length).toBe(0);
    spy.mockRestore();
  });

  it("uses auto sound priority overrides", () => {
    const world = baseWorld();
    world.audio.autoSoundRules = [
      {
        match: { kind: "APP", type: "MESSAGE_RECEIVED", appId: "app" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
        priority: 80,
      },
    ];

    handleAutoSounds(world, { kind: "APP", type: "MESSAGE_RECEIVED", appId: "app", at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });

    const sound = Object.values(world.audio.activeSounds)[0] as any;
    expect(sound.priority).toBe(80);
  });

  it("defaults auto sound priority when cues omit it", () => {
    const world = baseWorld();
    const spy = vi.spyOn(autoSound, "deriveAudioInstructions").mockReturnValue([
      {
        action: "PLAY_ONE_SHOT",
        soundId: "ding",
        cue: { soundId: "ding", startFrame: 0, volume: 1, bus: "sfx" } as any,
      },
    ]);

    handleAutoSounds(world, { kind: "APP", type: "MESSAGE_RECEIVED", appId: "app", at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });

    const sound = Object.values(world.audio.activeSounds)[0] as any;
    expect(sound.priority).toBe(50);
    spy.mockRestore();
  });

  it("processes call events", () => {
    const world = baseWorld();

    processCallEvent(world, { kind: "CALL", type: "INCOMING", deviceId: "phone", at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.call?.status).toBe("incoming");

    processCallEvent(world, { kind: "CALL", type: "ANSWER", deviceId: "phone", at: 2 } as any, {
      frame: 2,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.call?.status).toBe("active");

    processCallEvent(world, { kind: "CALL", type: "TOGGLE_MUTE", deviceId: "phone", at: 3 } as any, {
      frame: 3,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.call?.isMuted).toBe(true);

    processCallEvent(world, { kind: "CALL", type: "TOGGLE_SPEAKER", deviceId: "phone", at: 3 } as any, {
      frame: 3,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.call?.isSpeakerOn).toBe(true);

    processCallEvent(world, { kind: "CALL", type: "TOGGLE_HOLD", deviceId: "phone", at: 3 } as any, {
      frame: 3,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.call?.isOnHold).toBe(true);

    processCallEvent(world, { kind: "CALL", type: "DECLINE", deviceId: "phone", at: 3 } as any, {
      frame: 3,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.call?.status).toBe("declined");

    processCallEvent(world, { kind: "CALL", type: "END", deviceId: "phone", at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.call?.status).toBe("ended");

    processCallEvent(world, { kind: "CALL", type: "INCOMING", at: 5 } as any, {
      frame: 5,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.call?.status).toBe("incoming");

    const emptyWorld = { ...baseWorld(), devices: {} } as WorldState;
    processCallEvent(emptyWorld, { kind: "CALL", type: "INCOMING", at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
  });

  it("processes OS events and normalizes network", () => {
    const world = baseWorld();

    processOSEvent(world, { kind: "OS", type: "SET_TIME", deviceId: "phone", time: 100, at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.clock).toBe(100);

    processOSEvent(world, { kind: "OS", type: "SET_TIME", deviceId: "phone", at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.clock).toBeGreaterThan(0);

    processOSEvent(world, { kind: "OS", type: "SET_BATTERY", deviceId: "phone", level: 120, at: 2 } as any, {
      frame: 2,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.battery).toBe(100);

    processOSEvent(world, { kind: "OS", type: "SET_BATTERY", deviceId: "phone", at: 2 } as any, {
      frame: 2,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.battery).toBe(100);

    processOSEvent(world, { kind: "OS", type: "SET_BATTERY", deviceId: "phone", level: 50, charging: true, at: 2 } as any, {
      frame: 2,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.charging).toBe(true);

    processOSEvent(world, { kind: "OS", type: "DRAIN_BATTERY", deviceId: "phone", rate: 30, at: 3 } as any, {
      frame: 3,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.battery).toBeLessThan(100);

    processOSEvent(world, { kind: "OS", type: "DRAIN_BATTERY", deviceId: "phone", at: 3 } as any, {
      frame: 3,
      eventIndex: 0,
      mode: "preview",
      fps: undefined,
    } as any);
    expect(world.devices.phone.os?.battery).toBeLessThanOrEqual(100);

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", network: "5g", strength: 2, at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("5G");
    expect(world.devices.phone.os?.cellStrength).toBe(2);

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", network: "4g", at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("4G");

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", network: "lte", at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("LTE");

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", network: "3g", at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("3G");

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", network: "e", at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("E");

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", network: "no-service", at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("no-service");

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", network: "unknown", at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("wifi");

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", network: "wifi", strength: 1, at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("wifi");
    expect(world.devices.phone.os?.wifiStrength).toBe(1);

    processOSEvent(world, { kind: "OS", type: "SET_NETWORK", deviceId: "phone", at: 4 } as any, {
      frame: 4,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.network).toBe("wifi");

    processOSEvent(world, { kind: "OS", type: "SET_DND", deviceId: "phone", enabled: true, at: 5 } as any, {
      frame: 5,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.dnd).toBe(true);

    processOSEvent(world, { kind: "OS", type: "SET_DND", deviceId: "phone", at: 5 } as any, {
      frame: 5,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.dnd).toBe(false);

    processOSEvent(world, { kind: "OS", type: "SET_LOW_POWER", deviceId: "phone", enabled: true, at: 6 } as any, {
      frame: 6,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.lowPowerMode).toBe(true);

    processOSEvent(world, { kind: "OS", type: "SET_LOW_POWER", deviceId: "phone", at: 6 } as any, {
      frame: 6,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.devices.phone.os?.lowPowerMode).toBe(false);

    const emptyWorld = { ...baseWorld(), devices: {} } as WorldState;
    processOSEvent(emptyWorld, { kind: "OS", type: "SET_TIME", at: 1 } as any, {
      frame: 1,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
  });

  it("initializes app state for navigation events", () => {
    const world = baseWorld();
    (world as any).appState = undefined;

    navigationReducer(world, {
      kind: "APP",
      type: "NAVIGATE_SCREEN",
      appId: "app",
      payload: { screen: "chat" },
    } as any);

    const appState = (world.appState as any).app;
    expect(appState.currentScreen).toBe("chat");
  });

  it("processes camera events and falls back to plugin reducer", () => {
    const world = baseWorld();

    processCameraEvent(world, { kind: "CAMERA", type: "SET_VIEW", view: { type: "TRANSITION", appId: "app" } } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.camera.baseView).toBe("TRANSITION");

    processCameraEvent(world, { kind: "CAMERA", type: "CUT", toDeviceId: "phone", toView: "app" } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.camera.activeDeviceId).toBe("phone");

    processCameraEvent(world, { kind: "CAMERA", type: "CUT", toView: "transition" } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.camera.baseView).toBe("TRANSITION");

    processCameraEvent(world, { kind: "CAMERA", type: "LAYOUT", mode: "split", primaryDeviceId: "phone" } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.camera.layout?.mode).toBe("SPLIT_HORIZONTAL");

    processCameraEvent(world, { kind: "CAMERA", type: "LAYOUT", mode: undefined } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.camera.layout?.mode).toBe("SINGLE");

    processCameraEvent(world, { kind: "CAMERA", type: "LAYOUT", mode: "pip" } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.camera.layout?.primaryDeviceId).toBe("phone");

    processCameraEvent(world, { kind: "CAMERA", type: "LAYOUT", mode: "pip", primaryDeviceId: "phone" } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.camera.layout?.mode).toBe("PIP");

    const layoutWorld = {
      ...baseWorld(),
      camera: { baseView: "APP_VIEW", activeEffects: [] } as any,
    } as WorldState;
    processCameraEvent(layoutWorld, { kind: "CAMERA", type: "SET_VIEW", view: { type: "APP_VIEW" } } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(layoutWorld.camera.layout?.mode).toBe("SINGLE");

    processCameraEvent(world, { kind: "CAMERA", type: "LAYOUT", mode: "unknown", primaryDeviceId: "phone" } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(world.camera.layout?.mode).toBe("SINGLE");

    expect(() =>
      processCameraEvent(world, { kind: "CAMERA", type: "ZOOM" } as any, {
        frame: 0,
        eventIndex: 0,
        mode: "preview",
        fps: 30,
      }),
    ).toThrow(/Camera plugin not registered/);

    PluginManager.register({
      id: "camera",
      displayName: "Camera",
      version: "1.0.0",
      views: { AppRoot: () => null },
      reducer: (draft) => {
        (draft.camera as any).handled = true;
      },
    });

    processCameraEvent(world, { kind: "CAMERA", type: "ZOOM" } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect((world.camera as any).handled).toBe(true);
  });

  it("defaults camera layout primary device when none exist", () => {
    const world = {
      devices: {},
      appState: {},
      camera: { baseView: "APP_VIEW", activeEffects: [] },
      audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
    } as WorldState;

    processCameraEvent(world, { kind: "CAMERA", type: "CUT" } as any, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });

    expect(world.camera.layout?.primaryDeviceId).toBe("main_phone");
  });

  it("processes voice events", () => {
    const world = baseWorld();

    const worldWithFps = {
      ...world,
      config: { fps: 60 },
    } as WorldState;

    const fpsResult = processVoiceEvent({
      kind: "VOICE",
      type: "PLAY_SEGMENT",
      segmentId: "fps",
      audioPath: "voice.mp3",
      at: 0,
      startMs: 0,
      endMs: 1000,
    } as any, worldWithFps);
    const fpsCue = Object.values(fpsResult.audio.activeSounds)[0] as any;
    expect(fpsCue.duration).toBe(60);

    const playResult = processVoiceEvent({
      kind: "VOICE",
      type: "PLAY_SEGMENT",
      segmentId: "s1",
      audioPath: "voice.mp3",
      at: 1,
      startMs: 0,
      endMs: 1000,
    } as any, world);
    expect(Object.keys(playResult.audio.activeSounds)).toHaveLength(1);

    const stopMatch = processVoiceEvent({
      kind: "VOICE",
      type: "STOP_VOICE",
      at: 2,
      segmentId: "s1",
    } as any, {
      ...world,
      audio: playResult.audio,
    });
    expect(Object.keys(stopMatch.audio.activeSounds)).toHaveLength(0);

    const stopResult = processVoiceEvent({
      kind: "VOICE",
      type: "STOP_VOICE",
      at: 2,
    } as any, {
      ...world,
      audio: playResult.audio,
    });
    expect(Object.keys(stopResult.audio.activeSounds)).toHaveLength(0);

    const playResult2 = processVoiceEvent({
      kind: "VOICE",
      type: "PLAY_SEGMENT",
      segmentId: "keep",
      audioPath: "voice.mp3",
      at: 2,
      startMs: 0,
      endMs: 500,
    } as any, world);

    const stopFiltered = processVoiceEvent({
      kind: "VOICE",
      type: "STOP_VOICE",
      at: 3,
      segmentId: "other",
    } as any, {
      ...world,
      audio: playResult2.audio,
    });
    expect(Object.keys(stopFiltered.audio.activeSounds)).toHaveLength(1);

    const mixedAudio = {
      ...world,
      audio: {
        ...world.audio,
        activeSounds: {
          sfx: { soundId: "sfx", bus: "sfx", startFrame: 0 } as any,
        },
      },
    } as WorldState;
    const keepNonVoice = processVoiceEvent(
      { kind: "VOICE", type: "STOP_VOICE", at: 4 } as any,
      mixedAudio,
    );
    expect(Object.keys(keepNonVoice.audio.activeSounds)).toHaveLength(1);

    const zeroDuration = processVoiceEvent({
      kind: "VOICE",
      type: "PLAY_SEGMENT",
      segmentId: "s2",
      audioPath: "voice.mp3",
      at: 3,
      startMs: 1000,
      endMs: 1000,
    } as any, world);
    expect(Object.keys(zeroDuration.audio.activeSounds)).toHaveLength(0);
  });
});
