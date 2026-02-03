import { describe, expect, it } from "vitest";
import {
  defineReducer,
  defineViews,
  defineAnchors,
  defineLayouts,
  defineAudioRules,
  defineNotificationAdapter,
  defineInitialState,
  composePlugin,
  getCapability,
  hasCapability,
} from "../plugin/composables";

describe("plugin composables", () => {
  it("builds capability descriptors", () => {
    const reducer = defineReducer("app", () => undefined, ["EVENT"]);
    const views = defineViews("app", { AppRoot: () => null });
    const anchors = defineAnchors("app", { anchor: () => null });
    const layouts = defineLayouts("app", [
      { viewKind: "HOME", computeLayout: () => ({ kind: "layout" } as any) },
    ]);
    const audio = defineAudioRules("app", [
      { match: { kind: "APP" }, action: "PLAY_ONE_SHOT", sound: "ding" },
    ]);
    const notifications = defineNotificationAdapter("app", () => ({
      title: "T",
      body: "B",
    }));
    const initialState = defineInitialState("app", () => ({ ok: true }));

    expect(reducer._type).toBe("reducer");
    expect(views._type).toBe("views");
    expect(anchors._type).toBe("anchors");
    expect(layouts._type).toBe("layouts");
    expect(audio._type).toBe("audio");
    expect(notifications._type).toBe("notifications");
    expect(initialState._type).toBe("initialState");
  });

  it("composes plugins and queries capabilities", () => {
    const reducer = defineReducer("app", () => undefined);
    const views = defineViews("app", { AppRoot: () => null });

    const plugin = composePlugin("app", "1.0.0", "App", [reducer, views]);
    expect(plugin.id).toBe("app");

    const found = getCapability(plugin.capabilities, "views");
    expect(found?._type).toBe("views");
    expect(hasCapability(plugin.capabilities, "reducer")).toBe(true);
  });
});
