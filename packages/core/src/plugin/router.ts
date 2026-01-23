import { ReducerRegistry } from "../engine/registry";
import { SoundRegistry } from "../registries/sound";
import { AnchorRegistry, resolveAnchor, type Rect } from "../anchors/registry";
import { PluginManager } from "./plugin";
import type {
  TokovoPluginContract,
  PluginLayoutConstants,
} from "../types/plugin-contract";
import type { WorldState } from "../types";

export interface PluginAccessor {
  readonly id: string;
  readonly displayName: string;
  readonly version: string;

  getReducer(): ReturnType<typeof ReducerRegistry.getAppReducer>;
  getEventKinds(): string[];
  getSound(key: string): string | undefined;
  getAnchor(anchorId: string, world: WorldState, deviceId: string): Rect | null;
  getLayoutConstants(): PluginLayoutConstants | undefined;
  getInitialState(): unknown;
}

class PluginRouterClass {
  private accessorCache = new Map<string, PluginAccessor>();

  get(appId: string): PluginAccessor | undefined {
    if (this.accessorCache.has(appId)) {
      return this.accessorCache.get(appId);
    }

    const plugin = PluginManager.get(appId);
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

      getReducer: () => ReducerRegistry.getAppReducer(appId),

      getEventKinds: () => ReducerRegistry.getEventKindsForApp(appId),

      getSound: (key: string) => SoundRegistry.getNamespaced(appId, key),

      getAnchor: (anchorId: string, world: WorldState, deviceId: string) => {
        return resolveAnchor(anchorId, world, deviceId);
      },

      getLayoutConstants: () => plugin.layoutConstants,

      getInitialState: () => {
        const creator = PluginManager.getInitialStateCreator(appId);
        return creator?.();
      },
    };
  }

  getAll(): PluginAccessor[] {
    const appIds = ReducerRegistry.getRegisteredApps();
    return appIds
      .map((id) => this.get(id))
      .filter((p): p is PluginAccessor => p !== undefined);
  }

  has(appId: string): boolean {
    return PluginManager.has(appId);
  }

  clearCache(): void {
    this.accessorCache.clear();
  }
}

export const PluginRouter = new PluginRouterClass();
