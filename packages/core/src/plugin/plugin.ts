/**
 * Plugin System - Self-contained app registration
 * 
 * Apps register themselves as plugins with all their dependencies:
 * - UI components / Screens
 * - State reducers  
 * - Sound effects
 * - Event types they handle
 * - Platform-specific widgets (Dynamic Island, status bar)
 * - Semantic Anchors (Framing)
 * - Metadata (Icon, Name)
 */

import { WorldState, Notification, BackgroundAppState } from "../types";
import { AppReducer, ReducerRegistry } from "../engine";
import { Platform } from "../tokens";
import type { NotificationAdapter } from "../notifications/adapter";
import { registerAnchors } from "../anchors";
import type { AnchorFraming, AnchorSnapshot } from "../types/anchor";
import { AppMetadata, AppMetadataRegistry } from "../registries/metadata";
import { AppRegistry } from "../registries/app";
import { SoundRegistry } from "../registries/sound";
import { NotificationAdapterRegistry } from "../notifications/adapter";
import { validatePlugin } from "../utils/validation";

export type { NotificationAdapter };

// =============================================================================
// PLUGIN TYPES
// =============================================================================

/**
 * Props passed to all app view components
 */
export interface AppViewProps {
    world: WorldState;
    t?: number;
    layout?: any;
    platform?: "ios" | "android";
    deviceId?: string;
    safeAreaInsets?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

/**
 * App view component type (generic, will be React.FC in renderer)
 */
export type AppViewComponent = (props: AppViewProps) => any;

/**
 * Screen Component Type (for Router)
 */
export type ScreenComponent = AppViewComponent;

// =============================================================================
// WIDGET TYPES
// =============================================================================

/** Widget display modes */
export type WidgetMode =
    | "dynamicIsland"    // iOS Dynamic Island
    | "statusBar"        // Android status bar indicator
    | "lockscreen"       // Lock screen widget
    | "notification";    // Notification banner

// Platform type is re-exported from tokens.ts

/**
 * Props passed to widget components
 */
export interface WidgetProps {
    /** App-specific state from world.appState[appId] */
    appState: any;

    /** Background app state (e.g., playing track info) */
    backgroundApp?: BackgroundAppState;

    /** Device profile for dimensions */
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

    /** Current frame */
    currentFrame: number;

    /** Widget expansion mode */
    expansionMode: "minimal" | "compact" | "expanded";

    /** Platform */
    platform: Platform;
}

/**
 * Widget component type
 */
export type WidgetComponent = (props: WidgetProps) => any;

/**
 * Widget slot definition - describes one widget an app provides
 */
export interface WidgetSlot {
    /** Widget rendering mode */
    mode: WidgetMode;

    /** Which platforms this widget supports */
    platforms: Platform[];

    /** Priority when multiple widgets compete (higher wins) */
    priority: number;

    /** React component to render */
    component: WidgetComponent;

    /** Optional: expansion modes this widget supports */
    expansionModes?: ("minimal" | "compact" | "expanded")[];
}




/**
 * Plugin definition - everything an app needs to function
 */
export interface TokovoPlugin {
    /** Unique app ID (e.g., "app_whatsapp") */
    id: string;

    /** 
     * Metadata used for Notifications, Home Screen, Library.
     * Replaces manual AppMetadataRegistry calls.
     */
    metadata?: Partial<AppMetadata> & { name: string };

    /** Plugin version */
    version: string;

    // --- DEPRECATED FIELDS (Moved to metadata) ---
    /** @deprecated Use metadata.icon */
    icon?: string;
    /** @deprecated Use metadata.themeColor */
    primaryColor?: string;
    /** @deprecated Use metadata.name */
    name: string;
    // ---------------------------------------------

    /** 
     * React component to render the MAIN app view.
     * If `screens` is provided, this can be omitted (Router will be used).
     */
    appView?: AppViewComponent;

    /**
     * Map of screen definitions for declarative routing.
     * Used by AppKit Router.
     */
    screens?: Record<string, ScreenComponent>;

    /** State reducer for APP events */
    reducer?: AppReducer;

    /** Event types this plugin handles */
    eventTypes?: string[];

    /** Sound effect mappings */
    sounds?: Record<string, string>;

    /** Notification sound */
    notificationSound?: string;

    /** Default app state */
    defaultState?: any;

    // === Widgets ===

    /** Platform-specific widgets this app provides */
    widgets?: WidgetSlot[];

    /** Notification adapter for formatting */
    notificationAdapter?: NotificationAdapter;

    // === Camera Anchors ===

    /** 
     * Semantic Framing Configuration.
     * Defines how looking at "lastMessage" or "input" works.
     */
    anchors?: Record<string, AnchorFraming>;

    /**
     * Dynamic Anchor Calculation Logic.
     * Optional: Provide a custom function to resolve anchor rects at runtime.
     * If omitted, a default layout-based fallback is used.
     */
    getAnchors?: (world: WorldState, layout: unknown, deviceId: string) => AnchorSnapshot;
}

// =============================================================================
// PLUGIN MANAGER
// =============================================================================

/**
 * PluginManager - Central registry for all app plugins
 */
export class PluginManagerClass {
    private plugins = new Map<string, TokovoPlugin>();
    private viewRegistry = new Map<string, AppViewComponent>();

    /**
     * Register a plugin
     */
    register(plugin: TokovoPlugin): void {
        // Enforce Enterprise Validation
        try {
            validatePlugin(plugin);
        } catch (e: any) {
            console.error(`[PluginManager] Failed to register plugin ${plugin.id}:`, e.message);
            console.warn("Continuing despite validation error (Migration Mode)");
        }

        if (this.plugins.has(plugin.id)) {
            console.warn(`[PluginManager] Overwriting plugin: ${plugin.id}`);
        }

        this.plugins.set(plugin.id, plugin);

        // 1. Auto-register Reducer
        if (plugin.reducer) {
            ReducerRegistry.registerAppReducer(plugin.id, plugin.reducer);
        }

        // 2. Auto-register View
        if (plugin.appView) {
            this.viewRegistry.set(plugin.id, plugin.appView);
            // Also register with legacy AppRegistry for compatibility
            AppRegistry.register(plugin.id, plugin.appView as any);
        } else if (plugin.screens) {
            // TODO: If we have AppKit Router, we could synthesize a view here.
            // For now, we expect consumers to use the Router manually or for the plugin to export a Router wrapper.
            console.log(`[PluginManager] Plugin ${plugin.name} has screens but no root appView. Router required.`);
        }

        // 3. Auto-register Widgets
        if (plugin.widgets && plugin.widgets.length > 0) {
            // Import at top level or use type-only to avoid circular dependency
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            import("../registries/widget").then(({ WidgetRegistry }) => {
                WidgetRegistry.register(plugin.id, plugin.widgets!);
                console.log(`[PluginManager] Registered ${plugin.widgets!.length} widgets for: ${plugin.id}`);
            });
        }

        // 4. Auto-register Metadata
        const meta: AppMetadata = {
            displayName: plugin.metadata?.name || plugin.name,
            themeColor: plugin.metadata?.themeColor || plugin.primaryColor || "#000000",
            icon: plugin.metadata?.icon || plugin.icon || "📱",
            viewStrategy: plugin.metadata?.viewStrategy
        };
        AppMetadataRegistry.register(plugin.id, meta);

        // 5. Auto-register Anchors
        if (plugin.anchors) {
            // Create a synthetic AnchorProvider
            registerAnchors(plugin.id, {
                appId: plugin.id,
                framing: plugin.anchors,
                getAnchors: plugin.getAnchors || ((world, layout, deviceId) => {
                    // Default generic anchor logic - can be enhanced later or overriden
                    // This is a simplified fallback if the app doesn't implement a complex provider.
                    // Ideally, we move the full AnchorProvider logic into an AppKit helper.

                    // For now, return basic device anchor + simple layout mapping
                    const anchors: any = {
                        device: { x: 0, y: 0, width: 430, height: 932 } // TODO: Get real device dims
                    };

                    // Access layout state safely
                    if (layout && typeof layout === 'object' && 'regions' in layout) {
                        const regions = (layout as any).regions;
                        if (regions) {
                            for (const [key, region] of Object.entries(regions)) {
                                if ((region as any).rect) {
                                    anchors[key] = (region as any).rect;
                                }
                            }
                        }
                    }

                    return { anchors, deviceId, appId: plugin.id };
                })
            });
            console.log(`[PluginManager] Auto-registered anchors for: ${plugin.id}`);
        }

        // 6. Auto-register Layouts
        if ((plugin as any).layouts && (plugin as any).layouts.length > 0) {
            import("../registries/layout").then(({ LayoutRegistry }) => {
                for (const layout of (plugin as any).layouts) {
                    LayoutRegistry.register({
                        appId: plugin.id,
                        viewKind: layout.viewKind,
                        platforms: layout.platforms,
                        computeLayout: layout.computeLayout,
                    });
                }
                console.log(`[PluginManager] Registered ${(plugin as any).layouts.length} layouts for: ${plugin.id}`);
            });
        }

        // 7. Auto-register Sounds
        if (plugin.sounds) {
            const soundMap: Record<string, string> = {};
            // Prefix keys with plugin ID to avoid collisions if registry is flat? 
            // SoundRegistry.registerMany usually takes flat keys. 
            // We should trust the plugin provides unique enough keys or we prefix them.
            // Current convention seems to be "whatsapp_sent".

            SoundRegistry.registerMany(plugin.sounds);
        }

        // 7. Auto-register Notification Adapter
        if (plugin.notificationAdapter) {
            NotificationAdapterRegistry.register(plugin.notificationAdapter);
        }

        console.log(`[PluginManager] Registered plugin: ${plugin.name} (${plugin.id})`);
    }

    /**
     * Get a plugin by ID
     */
    get(id: string): TokovoPlugin | undefined {
        return this.plugins.get(id);
    }

    /**
     * Get app view component
     */
    getView(id: string): AppViewComponent | undefined {
        return this.viewRegistry.get(id);
    }

    /**
     * Get all registered plugins
     */
    getAll(): TokovoPlugin[] {
        return Array.from(this.plugins.values());
    }

    /**
     * Get all registered app IDs
     */
    getAppIds(): string[] {
        return Array.from(this.plugins.keys());
    }

    /**
     * Check if plugin is registered
     */
    has(id: string): boolean {
        return this.plugins.has(id);
    }

    /**
     * Get plugin metadata for display
     */
    getMetadata(id: string): { name: string; icon?: string; color?: string } | undefined {
        const plugin = this.plugins.get(id);
        if (!plugin) return undefined;
        // Prefer metadata object
        return {
            name: plugin.metadata?.name || plugin.name,
            icon: plugin.metadata?.icon as string || plugin.icon,
            color: plugin.metadata?.themeColor || plugin.primaryColor,
        };
    }

    /**
     * Get sound for an event from plugin
     */
    getSound(pluginId: string, soundKey: string): string | undefined {
        const plugin = this.plugins.get(pluginId);
        return plugin?.sounds?.[soundKey];
    }
}

export const PluginManager = new PluginManagerClass();

// =============================================================================
// PLUGIN HELPERS
// =============================================================================

/**
 * Create a plugin definition with defaults
 */
export function definePlugin(config: Partial<TokovoPlugin> & { id: string; name: string }): TokovoPlugin {
    return {
        ...config,
        version: config.version ?? "1.0.0",
        eventTypes: config.eventTypes ?? [],
        sounds: config.sounds ?? {},
        // Ensure metadata is populated from deprecated fields if missing
        metadata: config.metadata ?? {
            name: config.name,
            icon: config.icon,
            themeColor: config.primaryColor
        }
    } as TokovoPlugin;
}

/**
 * Register multiple plugins at once
 */
export function registerPlugins(plugins: TokovoPlugin[]): void {
    plugins.forEach(plugin => PluginManager.register(plugin));
}
