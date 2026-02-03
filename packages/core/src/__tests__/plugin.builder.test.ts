import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { createPluginBuilder, definePlugin } from "../plugin/builder";
import { PluginManagerClass } from "../plugin/plugin";
import { createTokovoRegistries } from "../registries/runtime";

let tokovoRegistries: ReturnType<typeof createTokovoRegistries>;
let pluginManager: PluginManagerClass;

const pluginId = "app_builder";

beforeEach(() => {
  tokovoRegistries = createTokovoRegistries();
  pluginManager = new PluginManagerClass(tokovoRegistries.plugins);
});

afterEach(() => {
  tokovoRegistries.engine.lifecycle.destroyAll();
  tokovoRegistries.engine.eventHandlers.clear();
  tokovoRegistries.engine.middleware.clear();
});

describe("plugin builder", () => {
  it("builds plugin contracts and registers lifecycle/middleware", () => {
    const handler = vi.fn();
    const middleware = vi.fn((_e, _d, _c, next) => next());

    const builder = createPluginBuilder({
      id: pluginId,
      displayName: "Builder",
    })
      .withReducer(() => undefined, ["EVENT"])
      .withViews({ AppRoot: () => null })
      .withLifecycle({ onInit: vi.fn() })
      .withEventHandlers([{ kind: "EVENT", handler }])
      .withMiddleware([{ name: "mw", middleware }])
      .withAssets({ sounds: { ding: "ding.mp3" }, designWidth: 320 });

    const built = builder.build();
    expect(built.contract.id).toBe(pluginId);
    expect(built.contract.displayName).toBe("Builder");

    const unregister = builder.register(pluginManager, tokovoRegistries.engine);
    expect(tokovoRegistries.engine.lifecycle.hasPlugin(pluginId)).toBe(true);
    expect(tokovoRegistries.engine.eventHandlers.hasHandler("EVENT")).toBe(true);
    expect(
      tokovoRegistries.engine.middleware.getMiddlewares().length,
    ).toBeGreaterThan(0);

    unregister();
    expect(tokovoRegistries.engine.eventHandlers.hasHandler("EVENT")).toBe(
      false,
    );
    expect(tokovoRegistries.engine.middleware.getMiddlewares().length).toBe(0);

    pluginManager.unregister(pluginId);
  });

  it("exports definePlugin alias", () => {
    const builder = definePlugin({ id: "app_alias", displayName: "Alias" });
    const built = builder.build();
    expect(built.contract.id).toBe("app_alias");
  });
});
