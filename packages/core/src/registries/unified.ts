import { ReducerRegistry, createReducerRegistry } from "../engine/registry";
import { AppRegistry } from "./app";
import { SoundRegistry } from "./sound";
import { LayoutRegistry } from "./layout";
import { AutoSoundRegistry } from "../audio/auto-sound";
import { AnchorRegistry } from "../anchors";
import { createRuntimeContext, type TokovoRuntimeContext } from "./context";
import { MiddlewareRegistry } from "../engine/middleware";
import { EventHandlerRegistry } from "../engine/event-handlers";
import { LifecycleManager } from "../engine/lifecycle";
import { resetConfig } from "../config";

export interface UnifiedRegistryState {
  plugins: Set<string>;
  context: TokovoRuntimeContext;
}

class UnifiedPluginRegistryClass {
  private registeredPlugins = new Set<string>();

  isRegistered(pluginId: string): boolean {
    return this.registeredPlugins.has(pluginId);
  }

  markRegistered(pluginId: string): void {
    this.registeredPlugins.add(pluginId);
  }

  markUnregistered(pluginId: string): void {
    this.registeredPlugins.delete(pluginId);
  }

  getRegisteredPlugins(): string[] {
    return Array.from(this.registeredPlugins);
  }

  getRegisteredCount(): number {
    return this.registeredPlugins.size;
  }

  resetAll(): void {
    ReducerRegistry.reset();
    AppRegistry.clear();
    SoundRegistry.clear();
    LayoutRegistry.clear();
    AutoSoundRegistry.clear();
    AnchorRegistry.clear();
    MiddlewareRegistry.clear();
    EventHandlerRegistry.clear();
    LifecycleManager.destroyAll();
    resetConfig();
    this.registeredPlugins.clear();
  }

  createIsolatedContext(): TokovoRuntimeContext {
    return createRuntimeContext();
  }

  getRegistryStats(): Record<string, number> {
    return {
      plugins: this.registeredPlugins.size,
      apps: AppRegistry.size,
      sounds: SoundRegistry.size,
      layouts: LayoutRegistry.size,
      anchors: AnchorRegistry.getRegisteredApps().length,
    };
  }
}

export const UnifiedPluginRegistry = new UnifiedPluginRegistryClass();

export function createIsolatedPluginRegistry(): {
  registry: UnifiedPluginRegistryClass;
  context: TokovoRuntimeContext;
  reducers: ReturnType<typeof createReducerRegistry>;
} {
  return {
    registry: new UnifiedPluginRegistryClass(),
    context: createRuntimeContext(),
    reducers: createReducerRegistry(),
  };
}
