import { describe, expect, it } from "vitest";
import { replay, createInitialWorld } from "../engine.js";
import { createEngineRegistries } from "../engine/registries.js";
import { createConfig } from "../config/index.js";

describe("replay APP event routing", () => {
  it("routes APP events by appId to the registered reducer", () => {
    const registries = createEngineRegistries();
    registries.reducers.registerAppReducer("app_test", (draft, event) => {
      if (event.kind !== "APP") return;
      if (event.appId !== "app_test") return;

      const payload = (event.payload ?? {}) as { delta?: number };
      const current = (draft.appState as { app_test?: { value: number } })
        .app_test?.value;
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
    expect((state.appState as { app_test?: { value: number } }).app_test?.value)
      .toBe(2);
  });
});
