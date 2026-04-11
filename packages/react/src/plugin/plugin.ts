/**
 * Plugin System - Self-contained app registration
 *
 * Apps register themselves as plugins with all their dependencies:
 * - UI components / Views
 * - State reducers
 * - Sound effects
 * - Audio rules
 * - Platform-specific layouts
 * - Semantic Anchors (Framing)
 * - Notification adapters
 */

import type { ReactElement } from "react";
import type {
  WorldState,
  BackgroundAppState,
  Notification,
  AppReducer,
  Platform,
  NotificationAdapter,
  PluginNotificationAdapter,
  PluginAnchorRegistry,
  AnchorProvider,
  TokovoPluginContract,
  PluginViews,
  PluginReducer,
} from "@tokovo/core";
import { createScopedLogger } from "@tokovo/core";
import type { AppMetadata } from "../registries/metadata.js";
import { validatePlugin } from "../utils/validation.js";
import type { PluginRegistries } from "./registries.js";

const log = createScopedLogger("plugin");

export type { NotificationAdapter };

// =============================================================================
// RE-EXPORT CANONICAL PLUGIN TYPES
// =============================================================================

export type { TokovoPluginContract, PluginReducer, PluginViews };

export type TokovoPlugin = TokovoPluginContract<string>;

// =============================================================================
// VIEW COMPONENT TYPES
// =============================================================================

export interface AppViewProps {
  world: WorldState;
  t?: number;
  layout?: unknown;
  platform?: "ios" | "android";
  deviceId?: string;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export type AppViewComponent = (props: AppViewProps) => ReactElement | null;

export type ScreenComponent = AppViewComponent;

// =============================================================================
// WIDGET TYPES
// =============================================================================

export type WidgetMode = "dynamicIsland" | "statusBar" | "lockscreen" | "notification";

export interface WidgetProps {
  appState: unknown;
  backgroundApp?: BackgroundAppState;
  deviceProfile: {
    dynamicIsland?: {
      centerX: number;
      topY: number;
      collapsedWidth: number;
      collapsedHeight: number;
      expandedWidth: number;
      expandedHeight: number;
      cornerRadius: number;
    };
    statusBarWidget?: {
      rightX: number;
      topY: number;
      maxWidth: number;
      height: number;
    };
  };
  currentFrame: number;
  expansionMode: "minimal" | "compact" | "expanded";
  platform: Platform;
}

export type WidgetComponent = (props: WidgetProps) => ReactElement | null;

export interface WidgetSlot {
  mode: WidgetMode;
  platforms: Platform[];
  priority: number;
  component: WidgetComponent;
  expansionModes?: ("minimal" | "compact" | "expanded")[];
}

// =============================================================================
// PLUGIN MANAGER
// =============================================================================

export class PluginManagerClass {
  private plugins = new Map<string, TokovoPlugin>();
  private viewRegistry = new Map<string, AppViewComponent>();
  private initialStateCreators = new Map<string, () => unknown>();
  private cleanupFunctions = new Map<string, Array<() => void>>();
  private registries: PluginRegistries;

  constructor(registries: PluginRegistries) {
    this.registries = registries;
  }

  register<AppId extends string>(plugin: TokovoPluginContract<AppId>): () => void {
    try {
      validatePlugin(plugin);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      log.error(
        `Failed to register plugin ${plugin.id}`,
        e instanceof Error ? e : new Error(message),
      );
      throw e instanceof Error ? e : new Error(message);
    }

    if (this.plugins.has(plugin.id)) {
      log.warn(`Overwriting plugin: ${plugin.id}`);
      this.unregister(plugin.id);
    }

    const cleanups: Array<() => void> = [];
    const storedPlugin = plugin as unknown as TokovoPlugin;

    const rollback = () => {
      for (let i = cleanups.length - 1; i >= 0; i--) {
        try {
          cleanups[i]();
        } catch (cleanupErr) {
          log.error(`Rollback cleanup failed for ${plugin.id}`, cleanupErr);
        }
      }
      this.plugins.delete(plugin.id);
    };

    try {
      this.plugins.set(plugin.id, storedPlugin);

      if (plugin.reducer) {
        this.registries.reducers.registerAppReducer(plugin.id, plugin.reducer as AppReducer);
        cleanups.push(() => this.registries.reducers.unregisterAppReducer(plugin.id));
      }

      if (plugin.eventKinds && plugin.eventKinds.length > 0) {
        this.registries.reducers.registerEventKinds(plugin.id, plugin.eventKinds);
        cleanups.push(() => this.registries.reducers.unregisterEventKinds(plugin.id));
      }

      if (plugin.createInitialState) {
        this.initialStateCreators.set(plugin.id, plugin.createInitialState as () => unknown);
        cleanups.push(() => this.initialStateCreators.delete(plugin.id));
      }

      if (plugin.views?.AppRoot) {
        const appView = plugin.views.AppRoot as unknown as AppViewComponent;
        this.viewRegistry.set(plugin.id, appView);
        this.registries.apps.register(plugin.id, appView);
        cleanups.push(() => {
          this.viewRegistry.delete(plugin.id);
          this.registries.apps.unregister(plugin.id);
        });
      }

      const meta: AppMetadata = {
        displayName: plugin.displayName,
        themeColor: plugin.themeColor ?? "#000000",
        icon: plugin.icon ?? "📱",
      };
      this.registries.metadata.register(plugin.id, meta);
      cleanups.push(() => this.registries.metadata.unregister(plugin.id));

      if (plugin.anchorProvider) {
        // Prefer full layout-aware anchor providers when available.
        this.registries.anchors.register(plugin.anchorProvider as unknown as AnchorProvider);
        cleanups.push(() => this.registries.anchors.unregister(plugin.id));
      } else if (plugin.anchors && "providers" in plugin.anchors) {
        const anchorRegistry = plugin.anchors as PluginAnchorRegistry;
        const defaultFraming = {
          anchorPoint: { x: 0.5, y: 0.5 },
          paddingPx: 50,
        };
        // Merge framing keys from BOTH providers and framing. Many plugins only
        // ship a `default` provider but define framing for many semantic anchors.
        const framingKeys = new Set<string>([
          ...Object.keys(anchorRegistry.providers ?? {}),
          ...Object.keys(anchorRegistry.framing ?? {}),
        ]);
        const mergedFraming = Object.fromEntries(
          Array.from(framingKeys).map((anchorName) => [
            anchorName,
            anchorRegistry.framing?.[anchorName] ?? defaultFraming,
          ]),
        );

        this.registries.anchors.register({
          appId: plugin.id,
          framing: mergedFraming,
          getAnchors: (world: WorldState, _layout: unknown, deviceId: string, context) => {
            const device = world.devices?.[deviceId];
            const profileDims = context?.getDeviceProfile?.(device?.profileId)?.dimensions;
            const dims = profileDims ??
              device?.screenDimensions ?? {
                width: 430,
                height: 932,
              };

            const anchors: Record<string, { x: number; y: number; width: number; height: number }> =
              {};
            for (const [anchorName, provider] of Object.entries(anchorRegistry.providers)) {
              const bounds = provider(world, deviceId);
              if (!bounds) continue;
              anchors[anchorName] = {
                x: bounds.x * dims.width,
                y: bounds.y * dims.height,
                width: bounds.width * dims.width,
                height: bounds.height * dims.height,
              };
            }

            return {
              anchors,
              deviceId,
              appId: plugin.id,
            };
          },
        });
        cleanups.push(() => this.registries.anchors.unregister(plugin.id));
      }

      const layouts = plugin.layouts ?? [];
      if (layouts.length > 0) {
        for (const layout of layouts) {
          this.registries.layouts.register({
            appId: plugin.id,
            viewKind: layout.viewKind,
            platforms: layout.platforms ?? [],
            computeLayout: layout.computeLayout as (
              ctx: import("@tokovo/core").LayoutContext,
            ) => import("@tokovo/core").LayoutState,
          });
        }
        cleanups.push(() => {
          this.registries.layouts.unregisterApp(plugin.id);
        });
      }

      if (plugin.assets?.sounds) {
        this.registries.sounds.registerNamespaced(plugin.id, plugin.assets.sounds);
        cleanups.push(() => this.registries.sounds.unregisterNamespaced(plugin.id));
      }

      if (plugin.audioRules) {
        const rulesWithAppId = plugin.audioRules.map((rule) => ({
          ...rule,
          match: { ...rule.match, appId: rule.match.appId ?? plugin.id },
        }));
        this.registries.autoSounds.register(rulesWithAppId);
        cleanups.push(() => this.registries.autoSounds.unregisterByAppId(plugin.id));
      }

      if (plugin.notificationAdapter) {
        const pluginAdapter = plugin.notificationAdapter as PluginNotificationAdapter;
        this.registries.notifications.register({
          appId: plugin.id,
          format: (notification: Notification) => {
            const formatted = pluginAdapter.format(notification);
            return {
              title: formatted.title,
              body: formatted.body,
              icon: formatted.icon,
              accentColor: formatted.color,
            };
          },
        });
        cleanups.push(() => this.registries.notifications.unregister(plugin.id));
      }

      this.cleanupFunctions.set(plugin.id, cleanups);

      log.info(`Registered plugin: ${plugin.displayName} (${plugin.id})`, {
        hasReducer: !!plugin.reducer,
        hasViews: !!plugin.views?.AppRoot,
        hasLayouts: !!(plugin.layouts && plugin.layouts.length > 0),
        hasSounds: !!plugin.assets?.sounds,
        hasNotificationAdapter: !!plugin.notificationAdapter,
      });

      return () => this.unregister(plugin.id);
    } catch (error) {
      log.error(
        `Failed during plugin registration: ${plugin.id}`,
        error instanceof Error ? error : new Error(String(error)),
      );
      rollback();
      throw error;
    }
  }

  unregister(id: string): void {
    const cleanups = this.cleanupFunctions.get(id);
    if (cleanups) {
      for (const cleanup of cleanups) {
        try {
          cleanup();
        } catch (e) {
          log.error(
            `Cleanup failed for plugin ${id}`,
            e instanceof Error ? e : new Error(String(e)),
          );
        }
      }
      this.cleanupFunctions.delete(id);
    }
    this.plugins.delete(id);
    log.debug(`Unregistered plugin: ${id}`);
  }

  get(id: string): TokovoPluginContract<string> | undefined {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      log.debug(`Plugin lookup missed: ${id}`, {
        event: "plugin.lookup.miss",
        pluginId: id,
      });
      return undefined;
    }

    log.debug(`Plugin lookup hit: ${id}`, {
      event: "plugin.lookup.hit",
      pluginId: id,
    });
    return plugin;
  }

  getView(id: string): AppViewComponent | undefined {
    return this.viewRegistry.get(id);
  }

  getAll(): TokovoPluginContract<string>[] {
    return Array.from(this.plugins.values());
  }

  getAppIds(): string[] {
    return Array.from(this.plugins.keys());
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  getMetadata(id: string): { name: string; icon?: string; color?: string } | undefined {
    const plugin = this.plugins.get(id);
    if (!plugin) return undefined;
    return {
      name: plugin.displayName,
      icon: plugin.assets?.icons?.app,
      color: undefined,
    };
  }

  getSound(pluginId: string, soundKey: string): string | undefined {
    const plugin = this.plugins.get(pluginId);
    return plugin?.assets?.sounds?.[soundKey];
  }

  getInitialStateCreator(appId: string): (() => unknown) | undefined {
    return this.initialStateCreators.get(appId);
  }

  createInitialAppState(): Record<string, unknown> {
    const appState: Record<string, unknown> = {};
    for (const [appId, creator] of this.initialStateCreators) {
      appState[appId] = creator();
    }
    log.debug("Built initial app state snapshot", {
      event: "plugin.initial_state.created",
      appIds: Object.keys(appState),
    });
    return appState;
  }
}

// =============================================================================
// PLUGIN HELPERS
// =============================================================================

export function definePlugin<AppId extends string>(
  config: TokovoPluginContract<AppId>,
): TokovoPluginContract<AppId> {
  return config;
}

export function registerPlugins(
  pluginManager: PluginManagerClass,
  plugins: TokovoPluginContract<string>[],
): void {
  plugins.forEach((plugin) => pluginManager.register(plugin));
}
