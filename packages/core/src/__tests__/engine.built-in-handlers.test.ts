import { describe, expect, it, vi, afterEach } from "vitest";
import type { WorldState } from "../types.js";
import {
  hasBuiltInHandler,
  getBuiltInHandler,
} from "../engine/built-in-handlers.js";
import { createReducerRegistry } from "../engine/registry.js";
import * as handlers from "../engine/handlers/index.js";

const baseWorld = (): WorldState =>
  ({
    devices: { phone: { id: "phone" } },
    appState: {},
    audio: {
      activeSounds: {},
      buses: {},
      policyState: { recentSounds: {}, nextId: 0 },
      autoSoundRules: [],
    },
  }) as WorldState;

let reducerRegistry = createReducerRegistry();

afterEach(() => {
  reducerRegistry.reset();
  reducerRegistry = createReducerRegistry();
});

describe("built-in handlers", () => {
  it("registers the device reducer", () => {
    const world = baseWorld();
    reducerRegistry.registerDeviceReducer((devices) => {
      return { ...devices, phone: { ...devices.phone, touched: true } } as any;
    });
    const handler = getBuiltInHandler("DEVICE", reducerRegistry);
    expect(handler).toBeDefined();
    handler?.(world, { kind: "DEVICE", type: "LOCK" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });

    expect((world.devices as any).phone.touched).toBe(true);
  });

  it("dispatches to handler modules", () => {
    const world = baseWorld();

    const audioSpy = vi
      .spyOn(handlers, "processAudioEvent")
      .mockImplementation(() => undefined);
    const osSpy = vi
      .spyOn(handlers, "processOSEvent")
      .mockImplementation(() => undefined);
    const callSpy = vi
      .spyOn(handlers, "processCallEvent")
      .mockImplementation(() => undefined);
    const voiceSpy = vi
      .spyOn(handlers, "processVoiceEvent")
      .mockReturnValue({ audio: world.audio });

    getBuiltInHandler("AUDIO", reducerRegistry)?.(
      world,
      { kind: "AUDIO", type: "PLAY" } as any,
      0,
      {
        frame: 0,
        eventIndex: 0,
        mode: "preview",
        fps: 30,
      },
    );
    expect(audioSpy).toHaveBeenCalled();

    getBuiltInHandler("OS", reducerRegistry)?.(
      world,
      { kind: "OS", type: "SET_TIME" } as any,
      0,
      {
        frame: 0,
        eventIndex: 0,
        mode: "preview",
        fps: 30,
      },
    );
    expect(osSpy).toHaveBeenCalled();

    getBuiltInHandler("CALL", reducerRegistry)?.(
      world,
      { kind: "CALL", type: "INCOMING" } as any,
      0,
      {
        frame: 0,
        eventIndex: 0,
        mode: "preview",
        fps: 30,
      },
    );
    expect(callSpy).toHaveBeenCalled();

    getBuiltInHandler("VOICE", reducerRegistry)?.(
      world,
      { kind: "VOICE", type: "STOP_VOICE" } as any,
      0,
      {
        frame: 0,
        eventIndex: 0,
        mode: "preview",
        fps: 30,
      },
    );
    expect(voiceSpy).toHaveBeenCalled();

    audioSpy.mockRestore();
    osSpy.mockRestore();
    callSpy.mockRestore();
    voiceSpy.mockRestore();
  });

  it("exposes handler presence", () => {
    expect(hasBuiltInHandler("DEVICE", reducerRegistry)).toBe(true);
    expect(hasBuiltInHandler("UNKNOWN", reducerRegistry)).toBe(false);
  });
});
