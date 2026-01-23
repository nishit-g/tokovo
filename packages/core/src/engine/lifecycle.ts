import type { WorldState, TimelineEvent } from "../types";
import { createScopedLogger } from "../logger";

const log = createScopedLogger("lifecycle");

export interface LifecycleContext {
  frame: number;
  mode: "preview" | "render";
}

export interface PluginLifecycleHooks {
  onInit?(): void | Promise<void>;
  onDestroy?(): void;
  onMount?(deviceId: string, appId: string): void;
  onUnmount?(deviceId: string, appId: string): void;
  onBeforeReplay?(ctx: LifecycleContext): void;
  onAfterReplay?(state: WorldState, ctx: LifecycleContext): void;
  onEventProcessed?(event: TimelineEvent, state: WorldState): void;
  onError?(error: Error, event?: TimelineEvent): void;
}

interface RegisteredPlugin {
  id: string;
  hooks: PluginLifecycleHooks;
}

class LifecycleManagerClass {
  private plugins = new Map<string, RegisteredPlugin>();
  private initialized = new Set<string>();

  register(pluginId: string, hooks: PluginLifecycleHooks): () => void {
    this.plugins.set(pluginId, { id: pluginId, hooks });
    log.debug(`Registered lifecycle hooks for plugin: ${pluginId}`);

    return () => {
      this.plugins.delete(pluginId);
      this.initialized.delete(pluginId);
    };
  }

  async initializeAll(): Promise<void> {
    for (const [id, plugin] of this.plugins) {
      if (!this.initialized.has(id) && plugin.hooks.onInit) {
        try {
          await plugin.hooks.onInit();
          this.initialized.add(id);
          log.info(`Initialized plugin: ${id}`);
        } catch (error) {
          log.error(`Failed to initialize plugin: ${id}`, error);
        }
      }
    }
  }

  destroyAll(): void {
    for (const [id, plugin] of this.plugins) {
      if (plugin.hooks.onDestroy) {
        try {
          plugin.hooks.onDestroy();
          log.debug(`Destroyed plugin: ${id}`);
        } catch (error) {
          log.error(`Failed to destroy plugin: ${id}`, error);
        }
      }
    }
    this.plugins.clear();
    this.initialized.clear();
  }

  notifyMount(deviceId: string, appId: string): void {
    const plugin = this.plugins.get(appId);
    if (plugin?.hooks.onMount) {
      try {
        plugin.hooks.onMount(deviceId, appId);
      } catch (error) {
        log.error(`onMount failed for plugin: ${appId}`, error);
      }
    }
  }

  notifyUnmount(deviceId: string, appId: string): void {
    const plugin = this.plugins.get(appId);
    if (plugin?.hooks.onUnmount) {
      try {
        plugin.hooks.onUnmount(deviceId, appId);
      } catch (error) {
        log.error(`onUnmount failed for plugin: ${appId}`, error);
      }
    }
  }

  notifyBeforeReplay(ctx: LifecycleContext): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks.onBeforeReplay) {
        try {
          plugin.hooks.onBeforeReplay(ctx);
        } catch (error) {
          log.error(`onBeforeReplay failed for plugin: ${plugin.id}`, error);
        }
      }
    }
  }

  notifyAfterReplay(state: WorldState, ctx: LifecycleContext): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks.onAfterReplay) {
        try {
          plugin.hooks.onAfterReplay(state, ctx);
        } catch (error) {
          log.error(`onAfterReplay failed for plugin: ${plugin.id}`, error);
        }
      }
    }
  }

  notifyEventProcessed(event: TimelineEvent, state: WorldState): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks.onEventProcessed) {
        try {
          plugin.hooks.onEventProcessed(event, state);
        } catch (error) {
          log.error(`onEventProcessed failed for plugin: ${plugin.id}`, error);
        }
      }
    }
  }

  notifyError(error: Error, event?: TimelineEvent): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.hooks.onError) {
        try {
          plugin.hooks.onError(error, event);
        } catch (e) {
          log.error(`onError handler failed for plugin: ${plugin.id}`, e);
        }
      }
    }
  }

  getRegisteredPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }
}

export const LifecycleManager = new LifecycleManagerClass();

export function defineLifecycle(
  hooks: PluginLifecycleHooks,
): PluginLifecycleHooks {
  return hooks;
}
