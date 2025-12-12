/**
 * Plugin System - Self-contained app registration
 * 
 * Apps register themselves as plugins with all their dependencies:
 * - UI components
 * - State reducers  
 * - Sound effects
 * - Event types they handle
 */

import { WorldState } from "./types";
import { AppReducer, ReducerRegistry } from "./engine";

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
}

/**
 * App view component type (generic, will be React.FC in renderer)
 */
export type AppViewComponent = (props: AppViewProps) => any;

/**
 * Plugin definition - everything an app needs to function
 */
export interface TokovoPlugin {
    /** Unique app ID (e.g., "app_whatsapp") */
    id: string;

    /** Display name */
    name: string;

    /** Plugin version */
    version: string;

    /** App icon for notifications/home screen */
    icon?: string;

    /** Primary color for theming */
    primaryColor?: string;

    /** React component to render the app view */
    appView?: AppViewComponent;

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
}

// =============================================================================
// PLUGIN MANAGER
// =============================================================================

/**
 * PluginManager - Central registry for all app plugins
 */
class PluginManagerClass {
    private plugins = new Map<string, TokovoPlugin>();
    private viewRegistry = new Map<string, AppViewComponent>();

    /**
     * Register a plugin
     */
    register(plugin: TokovoPlugin): void {
        if (this.plugins.has(plugin.id)) {
            console.warn(`[PluginManager] Overwriting plugin: ${plugin.id}`);
        }

        this.plugins.set(plugin.id, plugin);

        // Auto-register reducer
        if (plugin.reducer) {
            ReducerRegistry.registerAppReducer(plugin.id, plugin.reducer);
        }

        // Store view component
        if (plugin.appView) {
            this.viewRegistry.set(plugin.id, plugin.appView);
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
        return {
            name: plugin.name,
            icon: plugin.icon,
            color: plugin.primaryColor,
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
    } as TokovoPlugin;
}

/**
 * Register multiple plugins at once
 */
export function registerPlugins(plugins: TokovoPlugin[]): void {
    plugins.forEach(plugin => PluginManager.register(plugin));
}
