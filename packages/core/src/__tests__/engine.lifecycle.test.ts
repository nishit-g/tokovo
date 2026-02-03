import { describe, expect, it, vi, afterEach } from "vitest";
import type { WorldState, TimelineEvent } from "../types";
import { LifecycleManager, defineLifecycle } from "../engine/lifecycle";

const world = {
  devices: {},
  appState: {},
  camera: { baseView: "APP_VIEW" },
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] },
} as WorldState;

afterEach(() => {
  LifecycleManager.destroyAll();
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

    const unregister = LifecycleManager.register("app", {
      onInit,
      onDestroy,
      onMount,
      onUnmount,
      onBeforeReplay,
      onAfterReplay,
      onEventProcessed,
      onError,
    });

    expect(LifecycleManager.hasPlugin("app")).toBe(true);

    await LifecycleManager.initializeAll();
    expect(onInit).toHaveBeenCalled();

    LifecycleManager.notifyMount("phone", "app");
    expect(onMount).toHaveBeenCalled();

    LifecycleManager.notifyUnmount("phone", "app");
    expect(onUnmount).toHaveBeenCalled();

    LifecycleManager.notifyBeforeReplay({ frame: 1, mode: "preview" });
    expect(onBeforeReplay).toHaveBeenCalled();

    LifecycleManager.notifyAfterReplay(world, { frame: 1, mode: "preview" });
    expect(onAfterReplay).toHaveBeenCalled();

    LifecycleManager.notifyEventProcessed({ kind: "APP", at: 0 } as TimelineEvent, world);
    expect(onEventProcessed).toHaveBeenCalled();

    LifecycleManager.notifyError(new Error("boom"));
    expect(onError).toHaveBeenCalled();

    unregister();
    expect(LifecycleManager.hasPlugin("app")).toBe(false);
  });

  it("handles errors in hooks without crashing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    LifecycleManager.register("bad", {
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

    await LifecycleManager.initializeAll();
    LifecycleManager.notifyBeforeReplay({ frame: 0, mode: "preview" });
    LifecycleManager.notifyAfterReplay(world, { frame: 0, mode: "preview" });
    LifecycleManager.notifyEventProcessed({ kind: "APP", at: 0 } as TimelineEvent, world);
    LifecycleManager.notifyError(new Error("boom"));
    LifecycleManager.destroyAll();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("handles errors in mount and unmount hooks", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    LifecycleManager.register("mount-bad", {
      onMount: () => {
        throw new Error("mount");
      },
      onUnmount: () => {
        throw new Error("unmount");
      },
    });

    LifecycleManager.notifyMount("phone", "mount-bad");
    LifecycleManager.notifyUnmount("phone", "mount-bad");

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("defines lifecycle hooks", () => {
    const hooks = defineLifecycle({ onInit: () => undefined });
    expect(hooks.onInit).toBeDefined();
  });

  it("skips missing hooks and lists registered plugins", () => {
    LifecycleManager.register("no-after", { onBeforeReplay: () => undefined });
    LifecycleManager.notifyAfterReplay(world, { frame: 0, mode: "preview" });
    expect(LifecycleManager.getRegisteredPlugins()).toContain("no-after");
  });

  it("continues when hooks are removed after registration", () => {
    LifecycleManager.register("mutated", {
      onBeforeReplay: () => undefined,
      onAfterReplay: () => undefined,
    });

    const manager = LifecycleManager as unknown as {
      beforeReplayHooks: Array<{ hooks: { onBeforeReplay?: () => void } }>;
      afterReplayHooks: Array<{ hooks: { onAfterReplay?: () => void } }>;
    };

    manager.beforeReplayHooks[0].hooks.onBeforeReplay = undefined;
    manager.afterReplayHooks[0].hooks.onAfterReplay = undefined;

    LifecycleManager.notifyBeforeReplay({ frame: 0, mode: "preview" });
    LifecycleManager.notifyAfterReplay(world, { frame: 0, mode: "preview" });
  });
});
