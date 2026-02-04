import type { Rect } from "@tokovo/core";
import { PluginManagerClass } from "./plugin";
import type {
  TokovoPluginContract,
  PluginLayoutConstants,
} from "@tokovo/core";
import type { WorldState } from "@tokovo/core";
import type { PluginRegistries } from "./registries";

export interface PluginAccessor {
  readonly id: string;
  readonly displayName: string;
  readonly version: string;

  getReducer(): ReturnType<PluginRegistries["reducers"]["getAppReducer"]>;
  getEventKinds(): string[];
  getSound(key: string): string | undefined;
  getAnchor(anchorId: string, world: WorldState, deviceId: string): Rect | null;
  getLayoutConstants(): PluginLayoutConstants | undefined;
  getInitialState(): unknown;
}

export class PluginRouterClass {
  private accessorCache = new Map<string, PluginAccessor>();
  private pluginManager: PluginManagerClass;
  private registries: PluginRegistries;

  constructor(
    pluginManager: PluginManagerClass,
    registries: PluginRegistries,
  ) {
    this.pluginManager = pluginManager;
    this.registries = registries;
  }

  get(appId: string): PluginAccessor | undefined {
    if (this.accessorCache.has(appId)) {
      return this.accessorCache.get(appId);
    }

    const plugin = this.pluginManager.get(appId);
    if (!plugin) return undefined;

    const accessor = this.createAccessor(appId, plugin);
    this.accessorCache.set(appId, accessor);
    return accessor;
  }

  private createAccessor(
    appId: string,
    plugin: TokovoPluginContract,
  ): PluginAccessor {
    return {
      id: appId,
      displayName: plugin.displayName,
      version: plugin.version,

      getReducer: () => this.registries.reducers.getAppReducer(appId),

      getEventKinds: () =>
        this.registries.reducers.getEventKindsForApp(appId),

      getSound: (key: string) =>
        this.registries.sounds.getNamespaced(appId, key),

      getAnchor: (anchorId: string, world: WorldState, deviceId: string) => {
        return this.registries.anchors.resolveAnchor(
          anchorId,
          world,
          deviceId,
        );
      },

      getLayoutConstants: () => plugin.layoutConstants,

      getInitialState: () => {
        const creator = this.pluginManager.getInitialStateCreator(appId);
        return creator?.();
      },
    };
  }

  getAll(): PluginAccessor[] {
    const appIds = this.registries.reducers.getRegisteredApps();
    return appIds
      .map((id) => this.get(id))
      .filter((p): p is PluginAccessor => p !== undefined);
  }

  has(appId: string): boolean {
    return this.pluginManager.has(appId);
  }

  clearCache(): void {
    this.accessorCache.clear();
  }
}

export function createPluginRouter(
  pluginManager: PluginManagerClass,
  registries: PluginRegistries,
): PluginRouterClass {
  return new PluginRouterClass(pluginManager, registries);
}
