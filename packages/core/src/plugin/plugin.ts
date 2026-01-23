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

import { WorldState, BackgroundAppState, Notification } from "../types";
import { AppReducer, ReducerRegistry } from "../engine";
import { Platform } from "../tokens";
import type { NotificationAdapter } from "../notifications/adapter";
import type { RuntimeEvent } from "../types/runtime-event";
import type {
  PluginNotificationAdapter,
  PluginAnchorRegistry,
  TokovoPluginContract,
  PluginViews,
  PluginLayoutStrategy,
  PluginReducer,
} from "../types/plugin-contract";
import {
  registerAnchorProvider,
  type AnchorFraming,
  type AnchorSnapshot,
} from "../anchors";
import { AppMetadata, AppMetadataRegistry } from "../registries/metadata";
import { AppRegistry } from "../registries/app";
import { SoundRegistry } from "../registries/sound";
import { NotificationAdapterRegistry } from "../notifications/adapter";
import { validatePlugin } from "../utils/validation";

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

export type AppViewComponent = (
  props: AppViewProps,
) => React.ReactElement | null;

export type ScreenComponent = AppViewComponent;

// =============================================================================
// WIDGET TYPES
// =============================================================================

export type WidgetMode =
  | "dynamicIsland"
  | "statusBar"
  | "lockscreen"
  | "notification";

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

export type WidgetComponent = (props: WidgetProps) => React.ReactElement | null;

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

  register<AppId extends string>(plugin: TokovoPluginContract<AppId>): void {
    try {
      validatePlugin(plugin);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(
        `[PluginManager] Failed to register plugin ${plugin.id}:`,
        message,
      );
      console.warn("Continuing despite validation error (Migration Mode)");
    }

    if (this.plugins.has(plugin.id)) {
      console.warn(`[PluginManager] Overwriting plugin: ${plugin.id}`);
    }

    const storedPlugin = plugin as unknown as TokovoPlugin;
    this.plugins.set(plugin.id, storedPlugin);

    // 1. Auto-register Reducer
    if (plugin.reducer) {
      ReducerRegistry.registerAppReducer(
        plugin.id,
        plugin.reducer as AppReducer,
      );
    }

    // 1b. Auto-register Event Kinds (for engine routing)
    if (plugin.eventKinds && plugin.eventKinds.length > 0) {
      ReducerRegistry.registerEventKinds(plugin.id, plugin.eventKinds);
    }

    // 1c. Store initial state creator for later use
    if (plugin.createInitialState) {
      this.initialStateCreators.set(
        plugin.id,
        plugin.createInitialState as () => unknown,
      );
    }

    // 2. Auto-register Views
    if (plugin.views?.AppRoot) {
      const appView = plugin.views.AppRoot as unknown as AppViewComponent;
      this.viewRegistry.set(plugin.id, appView);
      AppRegistry.register(plugin.id, appView);
    }

    // 3. Auto-register Metadata
    const meta: AppMetadata = {
      displayName: plugin.displayName,
      themeColor: "#000000",
      icon: "📱",
    };
    AppMetadataRegistry.register(plugin.id, meta);

    // 4. Auto-register Anchors
    if (plugin.anchors && "providers" in plugin.anchors) {
      const anchorRegistry = plugin.anchors as PluginAnchorRegistry;
      for (const [anchorName, provider] of Object.entries(
        anchorRegistry.providers,
      )) {
        registerAnchorProvider({
          appId: plugin.id,
          framing: {
            [anchorName]: {
              anchorPoint: { x: 0.5, y: 0.5 },
              paddingPx: 50,
            },
          },
          getAnchors: (
            world: WorldState,
            _layout: unknown,
            deviceId: string,
          ) => {
            const bounds = provider(world, deviceId);
            if (!bounds) {
              return { anchors: {}, deviceId, appId: plugin.id };
            }
            const device = world.devices?.[deviceId];
            const dims = device?.screenDimensions ?? {
              width: 430,
              height: 932,
            };
            return {
              anchors: {
                [anchorName]: {
                  x: bounds.x * dims.width,
                  y: bounds.y * dims.height,
                  width: bounds.width * dims.width,
                  height: bounds.height * dims.height,
                },
              },
              deviceId,
              appId: plugin.id,
            };
          },
        });
      }
    }

    // 5. Auto-register Layouts
    if (plugin.layouts && plugin.layouts.length > 0) {
      import("../registries/layout").then(({ LayoutRegistry }) => {
        for (const layout of plugin.layouts!) {
          LayoutRegistry.register({
            appId: plugin.id,
            viewKind: layout.viewKind,
            platforms: layout.platforms ?? [],
            computeLayout: layout.computeLayout as (
              ctx: import("../types/layout").LayoutContext,
            ) => import("../types/layout").LayoutState,
          });
        }
      });
    }

    // 6. Auto-register Sounds (namespaced to prevent collisions)
    if (plugin.assets?.sounds) {
      SoundRegistry.registerNamespaced(plugin.id, plugin.assets.sounds);
    }

    // 7. Auto-register Notification Adapter
    if (plugin.notificationAdapter) {
      const pluginAdapter =
        plugin.notificationAdapter as PluginNotificationAdapter;
      NotificationAdapterRegistry.register({
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
    }

    console.log(
      `[PluginManager] Registered plugin: ${plugin.displayName} (${plugin.id})`,
    );
  }

  get(id: string): TokovoPluginContract<string> | undefined {
    return this.plugins.get(id);
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

  getMetadata(
    id: string,
  ): { name: string; icon?: string; color?: string } | undefined {
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
    return appState;
  }
}

export const PluginManager = new PluginManagerClass();

// =============================================================================
// PLUGIN HELPERS
// =============================================================================

export function definePlugin<AppId extends string>(
  config: TokovoPluginContract<AppId>,
): TokovoPluginContract<AppId> {
  return config;
}

export function registerPlugins(plugins: TokovoPluginContract<string>[]): void {
  plugins.forEach((plugin) => PluginManager.register(plugin));
}
