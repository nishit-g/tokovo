import type { WorldState, TimelineEvent } from "../types.js";
import { createScopedLogger } from "../logger/index.js";

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

export class LifecycleManagerClass {
  private plugins = new Map<string, RegisteredPlugin>();
  private initialized = new Set<string>();
  private beforeReplayHooks: RegisteredPlugin[] = [];
  private afterReplayHooks: RegisteredPlugin[] = [];

  register(pluginId: string, hooks: PluginLifecycleHooks): () => void {
    const plugin = { id: pluginId, hooks };
    this.plugins.set(pluginId, plugin);

    if (hooks.onBeforeReplay) {
      this.beforeReplayHooks.push(plugin);
    }
    if (hooks.onAfterReplay) {
      this.afterReplayHooks.push(plugin);
    }

    log.debug(`Registered lifecycle hooks for plugin: ${pluginId}`);

    return () => {
      this.plugins.delete(pluginId);
      this.initialized.delete(pluginId);
      this.beforeReplayHooks = this.beforeReplayHooks.filter(
        (p) => p.id !== pluginId,
      );
      this.afterReplayHooks = this.afterReplayHooks.filter(
        (p) => p.id !== pluginId,
      );
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
    this.beforeReplayHooks = [];
    this.afterReplayHooks = [];
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
    for (const plugin of this.beforeReplayHooks) {
      const hook = plugin.hooks.onBeforeReplay;
      if (!hook) {
        continue;
      }
      try {
        hook(ctx);
      } catch (error) {
        log.error(`onBeforeReplay failed for plugin: ${plugin.id}`, error);
      }
    }
  }

  notifyAfterReplay(state: WorldState, ctx: LifecycleContext): void {
    for (const plugin of this.afterReplayHooks) {
      const hook = plugin.hooks.onAfterReplay;
      if (!hook) {
        continue;
      }
      try {
        hook(state, ctx);
      } catch (error) {
        log.error(`onAfterReplay failed for plugin: ${plugin.id}`, error);
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

export function createLifecycleManager(): LifecycleManagerClass {
  return new LifecycleManagerClass();
}

export function defineLifecycle(
  hooks: PluginLifecycleHooks,
): PluginLifecycleHooks {
  return hooks;
}
