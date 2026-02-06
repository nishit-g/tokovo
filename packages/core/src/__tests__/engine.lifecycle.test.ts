import { describe, expect, it, vi, afterEach } from "vitest";
import type { WorldState, TimelineEvent } from "../types.js";
import { createLifecycleManager, defineLifecycle } from "../engine/lifecycle.js";

const world = {
  devices: {},
  appState: {},
  camera: { baseView: "APP_VIEW" },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState;

let lifecycle = createLifecycleManager();

afterEach(() => {
  lifecycle.destroyAll();
  lifecycle = createLifecycleManager();
});

describe("lifecycle manager", () => {
  it("registers plugins and runs lifecycle hooks", async () => {
    const onInit = vi.fn();
    const onDestroy = vi.fn();
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const onBeforeReplay = vi.fn();
    const onAfterReplay = vi.fn();
    const onEventProcessed = vi.fn();
    const onError = vi.fn();

    const unregister = lifecycle.register("app", {
      onInit,
      onDestroy,
      onMount,
      onUnmount,
      onBeforeReplay,
      onAfterReplay,
      onEventProcessed,
      onError,
    });

    expect(lifecycle.hasPlugin("app")).toBe(true);

    await lifecycle.initializeAll();
    expect(onInit).toHaveBeenCalled();

    lifecycle.notifyMount("phone", "app");
    expect(onMount).toHaveBeenCalled();

    lifecycle.notifyUnmount("phone", "app");
    expect(onUnmount).toHaveBeenCalled();

    lifecycle.notifyBeforeReplay({ frame: 1, mode: "preview" });
    expect(onBeforeReplay).toHaveBeenCalled();

    lifecycle.notifyAfterReplay(world, { frame: 1, mode: "preview" });
    expect(onAfterReplay).toHaveBeenCalled();

    lifecycle.notifyEventProcessed({ kind: "APP", at: 0 } as TimelineEvent, world);
    expect(onEventProcessed).toHaveBeenCalled();

    lifecycle.notifyError(new Error("boom"));
    expect(onError).toHaveBeenCalled();

    unregister();
    expect(lifecycle.hasPlugin("app")).toBe(false);
  });

  it("handles errors in hooks without crashing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    lifecycle.register("bad", {
      onInit: () => {
        throw new Error("init");
      },
      onDestroy: () => {
        throw new Error("destroy");
      },
      onBeforeReplay: () => {
        throw new Error("before");
      },
      onAfterReplay: () => {
        throw new Error("after");
      },
      onEventProcessed: () => {
        throw new Error("event");
      },
      onError: () => {
        throw new Error("handler");
      },
    });

    await lifecycle.initializeAll();
    lifecycle.notifyBeforeReplay({ frame: 0, mode: "preview" });
    lifecycle.notifyAfterReplay(world, { frame: 0, mode: "preview" });
    lifecycle.notifyEventProcessed({ kind: "APP", at: 0 } as TimelineEvent, world);
    lifecycle.notifyError(new Error("boom"));
    lifecycle.destroyAll();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("handles errors in mount and unmount hooks", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    lifecycle.register("mount-bad", {
      onMount: () => {
        throw new Error("mount");
      },
      onUnmount: () => {
        throw new Error("unmount");
      },
    });

    lifecycle.notifyMount("phone", "mount-bad");
    lifecycle.notifyUnmount("phone", "mount-bad");

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("defines lifecycle hooks", () => {
    const hooks = defineLifecycle({ onInit: () => undefined });
    expect(hooks.onInit).toBeDefined();
  });

  it("skips missing hooks and lists registered plugins", () => {
    lifecycle.register("no-after", { onBeforeReplay: () => undefined });
    lifecycle.notifyAfterReplay(world, { frame: 0, mode: "preview" });
    expect(lifecycle.getRegisteredPlugins()).toContain("no-after");
  });

  it("continues when hooks are removed after registration", () => {
    lifecycle.register("mutated", {
      onBeforeReplay: () => undefined,
      onAfterReplay: () => undefined,
    });

    const manager = lifecycle as unknown as {
      beforeReplayHooks: Array<{ hooks: { onBeforeReplay?: () => void } }>;
      afterReplayHooks: Array<{ hooks: { onAfterReplay?: () => void } }>;
    };

    manager.beforeReplayHooks[0].hooks.onBeforeReplay = undefined;
    manager.afterReplayHooks[0].hooks.onAfterReplay = undefined;

    lifecycle.notifyBeforeReplay({ frame: 0, mode: "preview" });
    lifecycle.notifyAfterReplay(world, { frame: 0, mode: "preview" });
  });
});
