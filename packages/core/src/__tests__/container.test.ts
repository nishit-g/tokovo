import { describe, expect, it } from "vitest";
import { createContainer, globalContainer, resetGlobalContainer } from "../container/container";

describe("Tokovo container", () => {
  it("creates isolated containers", () => {
    const container = createContainer();
    container.sounds.register("tone", "tone.mp3");
    container.layouts.register("app:layout", {
      appId: "app",
      viewKind: "HOME",
      computeLayout: () => ({ kind: "layout" } as any),
    });

    expect(container.sounds.has("tone")).toBe(true);
    expect(container.layouts.has("app:layout")).toBe(true);
    expect(container.layouts.size).toBe(1);

    container.reset();
    expect(container.sounds.size).toBe(0);
    expect(container.layouts.size).toBe(0);
  });

  it("resets global container", () => {
    globalContainer.sounds.register("tone", "tone.mp3");
    expect(globalContainer.sounds.size).toBeGreaterThan(0);
    resetGlobalContainer();
    expect(globalContainer.sounds.size).toBe(0);
  });

  it("supports sound registry helpers", () => {
    const container = createContainer();
    container.sounds.registerMany({ beep: "beep.mp3", boop: "boop.mp3" });
    container.sounds.registerNamespaced("app", { ding: "ding.mp3" });

    expect(container.sounds.getPath("beep")).toBe("beep.mp3");
    expect(container.sounds.getNamespaced("app", "ding")).toBe("ding.mp3");
    expect(container.sounds.keys()).toContain("boop");
    expect(Object.keys(container.sounds.getAll())).toContain("app:ding");
  });

  it("warns on layout overwrites", () => {
    const container = createContainer();
    container.layouts.register("app:layout", {
      appId: "app",
      viewKind: "HOME",
      computeLayout: () => ({ kind: "layout" } as any),
    });
    container.layouts.register("app:layout", {
      appId: "app",
      viewKind: "HOME",
      computeLayout: () => ({ kind: "layout" } as any),
    });
    expect(container.layouts.size).toBe(1);
  });
});
