import { describe, expect, it, vi, afterEach } from "vitest";
import type { WorldState } from "../types";
import {
  hasBuiltInHandler,
  getBuiltInHandler,
} from "../engine/built-in-handlers";
import { ReducerRegistry } from "../engine/registry";
import * as handlers from "../engine/handlers";

const baseWorld = (): WorldState => ({
  devices: { phone: { id: "phone" } },
  appState: {},
  camera: { baseView: "APP_VIEW" },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState);

afterEach(() => {
  ReducerRegistry.reset();
});

describe("built-in handlers", () => {
  it("registers device and feature reducers", () => {
    const world = baseWorld();
    ReducerRegistry.registerDeviceReducer((devices) => {
      return { ...devices, phone: { ...devices.phone, touched: true } } as any;
    });
    ReducerRegistry.registerFeatureReducer("NOTIFICATION", (draft) => {
      (draft as any).notifHandled = true;
    });
    ReducerRegistry.registerFeatureReducer("KEYBOARD", (draft) => {
      (draft as any).keyboardHandled = true;
    });

    const handler = getBuiltInHandler("DEVICE");
    expect(handler).toBeDefined();
    handler?.(world, { kind: "DEVICE", type: "SHOW_NOTIFICATION" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });

    expect((world.devices as any).phone.touched).toBe(true);
    expect((world as any).notifHandled).toBe(true);

    handler?.(world, { kind: "DEVICE", type: "KEYBOARD_OPEN" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect((world as any).keyboardHandled).toBe(true);
  });

  it("dispatches to handler modules", () => {
    const world = baseWorld();

    const cameraSpy = vi
      .spyOn(handlers, "processCameraEvent")
      .mockImplementation(() => undefined);
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

    getBuiltInHandler("CAMERA")?.(world, { kind: "CAMERA", type: "CUT" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(cameraSpy).toHaveBeenCalled();

    getBuiltInHandler("AUDIO")?.(world, { kind: "AUDIO", type: "PLAY" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(audioSpy).toHaveBeenCalled();

    getBuiltInHandler("OS")?.(world, { kind: "OS", type: "SET_TIME" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(osSpy).toHaveBeenCalled();

    getBuiltInHandler("CALL")?.(world, { kind: "CALL", type: "INCOMING" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(callSpy).toHaveBeenCalled();

    getBuiltInHandler("VOICE")?.(world, { kind: "VOICE", type: "STOP_VOICE" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect(voiceSpy).toHaveBeenCalled();

    ReducerRegistry.registerFeatureReducer("KEYBOARD", (draft) => {
      (draft as any).keyboard = true;
    });
    getBuiltInHandler("KEYBOARD")?.(world, { kind: "KEYBOARD", type: "OPEN" } as any, 0, {
      frame: 0,
      eventIndex: 0,
      mode: "preview",
      fps: 30,
    });
    expect((world as any).keyboard).toBe(true);

    cameraSpy.mockRestore();
    audioSpy.mockRestore();
    osSpy.mockRestore();
    callSpy.mockRestore();
    voiceSpy.mockRestore();
  });

  it("exposes handler presence", () => {
    expect(hasBuiltInHandler("DEVICE")).toBe(true);
    expect(hasBuiltInHandler("UNKNOWN")).toBe(false);
  });
});
