import { describe, expect, it } from "vitest";
import { replay, createInitialWorld } from "../engine.js";
import { createEngineRegistries } from "../engine/registries.js";
import { createConfig } from "../config/index.js";
import { projectWorldForDevice } from "../utils/app-state.js";

describe("replay APP event routing", () => {
  it("routes APP events by appId to the registered reducer", () => {
    const registries = createEngineRegistries();
    registries.reducers.registerAppReducer("app_test", (draft, event) => {
      if (event.kind !== "APP") return;
      if (event.appId !== "app_test") return;

      const payload = (event.payload ?? {}) as { delta?: number };
      const current = (draft.appState as { app_test?: { value: number } }).app_test?.value;
      const next = (current ?? 0) + (payload.delta ?? 1);

      (draft.appState as { app_test?: { value: number } }).app_test = {
        value: next,
      };
    });

    const initial = createInitialWorld({
      appState: {
        app_test: { value: 0 },
      },
    });

    const events = [
      {
        at: 10,
        kind: "APP" as const,
        appId: "app_test",
        type: "TEST",
        payload: { delta: 2 },
      },
    ];

    const state = replay(initial, events, 10, {
      mode: "preview",
      registries,
      config: createConfig(),
    });
    expect((state.appState as { app_test?: { value: number } }).app_test?.value).toBe(2);
  });

  it("routes same-app events to independent device instances", () => {
    const registries = createEngineRegistries();
    registries.reducers.registerAppReducer("app_test", (draft, event) => {
      const payload = (event.payload ?? {}) as { delta?: number };
      const state = draft.appState.app_test as { value: number };
      state.value += payload.delta ?? 1;
    });

    const initial = createInitialWorld({
      devices: {
        left: { id: "left" },
        right: { id: "right" },
      } as any,
      appState: {},
      appStateByDevice: {
        left: { app_test: { value: 1 } },
        right: { app_test: { value: 10 } },
      },
    });

    const state = replay(
      initial,
      [
        {
          at: 1,
          kind: "APP" as const,
          appId: "app_test",
          deviceId: "left",
          type: "TEST",
          payload: { delta: 2 },
        },
        {
          at: 2,
          kind: "APP" as const,
          appId: "app_test",
          deviceId: "right",
          type: "TEST",
          payload: { delta: 5 },
        },
      ],
      2,
      {
        mode: "preview",
        registries,
        config: createConfig(),
      },
    );

    expect(state.appState.app_test).toBeUndefined();
    expect(state.appStateByDevice?.left?.app_test).toEqual({ value: 3 });
    expect(state.appStateByDevice?.right?.app_test).toEqual({ value: 15 });

    const leftWorld = projectWorldForDevice(state, "left");
    const rightWorld = projectWorldForDevice(state, "right");
    expect(leftWorld.appState.app_test).toEqual({ value: 3 });
    expect(rightWorld.appState.app_test).toEqual({ value: 15 });
    expect(state.appState.app_test).toBeUndefined();
  });
});
