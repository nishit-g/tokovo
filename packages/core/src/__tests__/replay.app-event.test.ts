import { describe, expect, it } from "vitest";
import { replayIncremental, createInitialWorld } from "../engine.js";
import { createEngineRegistries } from "../engine/registries.js";
import { createConfig } from "../config/index.js";
import { appInstanceId } from "../types/world-state.js";

describe("replay APP event routing", () => {
  it("routes APP events by appId to the registered reducer", () => {
    const registries = createEngineRegistries();
    registries.reducers.registerAppReducer("app_test", (draft, event) => {
      if (event.kind !== "APP") return;
      if (event.appId !== "app_test") return;

      const payload = (event.payload ?? {}) as { delta?: number };
      const key = appInstanceId(event.deviceId, event.appId);
      const current = (draft.appInstances[key] as { value: number }).value;
      const next = (current ?? 0) + (payload.delta ?? 1);

      draft.appInstances[key] = { value: next };
    });

    const initial = createInitialWorld({
      devices: { phone: { id: "phone" } as never },
      appInstances: { "phone:app_test": { value: 0 } },
    });

    const events = [
      {
        at: 10,
        kind: "APP" as const,
        appId: "app_test",
        deviceId: "phone",
        type: "TEST",
        payload: { delta: 2 },
      },
    ];

    const state = replayIncremental(initial, events, 10, {
      mode: "preview",
      registries,
      config: createConfig(),
    });
    expect(state.appInstances["phone:app_test"]).toEqual({ value: 2 });
  });

  it("routes same-app events to independent device instances", () => {
    const registries = createEngineRegistries();
    registries.reducers.registerAppReducer("app_test", (draft, event) => {
      const payload = (event.payload ?? {}) as { delta?: number };
      if (event.kind !== "APP") throw new Error("expected APP event");
      const state = draft.appInstances[appInstanceId(event.deviceId, event.appId)] as {
        value: number;
      };
      state.value += payload.delta ?? 1;
    });

    const initial = createInitialWorld({
      devices: {
        left: { id: "left" },
        right: { id: "right" },
      } as any,
      appInstances: {
        "left:app_test": { value: 1 },
        "right:app_test": { value: 10 },
      },
    });

    const state = replayIncremental(
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

    expect(state.appInstances["left:app_test"]).toEqual({ value: 3 });
    expect(state.appInstances["right:app_test"]).toEqual({ value: 15 });
  });
});
