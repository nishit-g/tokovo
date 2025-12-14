/**
 * Plugin Registry (Non-Singleton)
 *
 * Factory-based plugin registry for dependency injection.
 * No global singletons = testable, multi-composition safe.
 *
 * CORE OWNS:
 * - PluginSchema type (shape of schema)
 * - PluginRegistry interface
 * - createPluginRegistry factory
 *
 * PLUGINS OWN:
 * - Actual schema values (contentKinds, eventTypes, limits)
 * - Reducers, views, downgrade logic
 *
 * @module @tokovo/core/canonical/plugin-registry
 */

import type { AppReducer, WorldState, ReducerContext } from "./routing";
import type { ContentKind, SystemMessageType } from "./content";
import type { AppEventType } from "./events";

// =============================================================================
// PLUGIN SCHEMA (Core defines shape, plugins provide values)
// =============================================================================

/**
 * App capability categories.
 */
export type AppCapability =
    | "messaging"
    | "typing"
    | "read_receipts"
    | "reactions"
    | "voice"
    | "video"
    | "stickers"
    | "location"
    | "contacts"
    | "groups"
    | "stories"
    | "feed"
    | "calls"
    | "navigation"
    | "notifications";

/**
 * Plugin schema - defines what features an app supports.
 *
 * This enables compile-time validation:
 * - Can't send an image to an app that doesn't support images
 * - Can't add a reaction to an app that doesn't support reactions
 * - Can't use CUSTOM events not in the allowlist
 */
export interface PluginSchema {
    /** Which content kinds this app can render */
    readonly contentKinds: ReadonlyArray<ContentKind>;

    /** Which event types this app handles */
    readonly eventTypes: ReadonlyArray<AppEventType>;

    /** Which system message types are supported */
    readonly systemTypes?: ReadonlyArray<SystemMessageType>;

    /** Feed IDs if app supports feeds */
    readonly feedIds?: ReadonlyArray<string>;

    /** Limits for content */
    readonly limits?: PluginLimits;

    /** Allowed CUSTOM event names (must be namespaced: "app_xxx.event_name") */
    readonly allowedCustomEvents?: ReadonlyArray<string>;
}

/**
 * Content limits for validation.
 */
export interface PluginLimits {
    readonly maxTextLength?: number;
    readonly maxCaptionLength?: number;
    readonly maxReactions?: number;
    readonly maxFileSize?: number; // bytes
    readonly maxImageDimension?: number; // pixels
    readonly maxVideoDuration?: number; // seconds
}

/**
 * Default schema for apps that don't specify one.
 */
export const DEFAULT_PLUGIN_SCHEMA: PluginSchema = {
    contentKinds: ["text", "image", "video", "system"],
    eventTypes: ["MESSAGE", "TYPING", "NAVIGATE"],
};

// =============================================================================
// WIDGET TYPES
// =============================================================================

import { Platform } from "../tokens";
import { BackgroundAppState } from "../types";

/** Widget display modes */
export type WidgetMode =
    | "dynamicIsland"    // iOS Dynamic Island
    | "statusBar"        // Android status bar indicator
    | "lockscreen"       // Lock screen widget
    | "notification";    // Notification banner

/**
 * Props passed to widget components
 */
export interface WidgetProps {
    /** App-specific state from world.appState[appId] */
    appState: unknown;

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
export type WidgetComponent = (props: WidgetProps) => unknown;

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

// =============================================================================
// APP PLUGIN
// =============================================================================

/**
 * View component props (generic, works with React).
 */
export interface AppViewProps {
    readonly world: WorldState;
    readonly t?: number;
    readonly platform?: "ios" | "android";
    readonly deviceId?: string;
}

/**
 * App view component type.
 */
export type AppViewComponent = (props: AppViewProps) => unknown;

/**
 * Complete app plugin definition.
 */
export interface AppPlugin {
    /** Unique app ID (e.g., "app_whatsapp") */
    readonly id: string;

    /** Display name */
    readonly name: string;

    /** Plugin version */
    readonly version: string;

    /** Capability categories */
    readonly capabilities: ReadonlyArray<AppCapability>;

    /** Detailed schema support */
    readonly schema: PluginSchema;

    /** State reducer for APP events */
    readonly reducer: AppReducer;

    /** React component to render the app view */
    readonly view: AppViewComponent;

    /** App icon path */
    readonly icon?: string;

    /** Primary color for theming */
    readonly primaryColor?: string;

    /** Sound effect mappings */
    readonly sounds?: Readonly<Record<string, string>>;

    /** Notification sound */
    readonly notificationSound?: string;

    /** Default app state */
    readonly defaultState?: unknown;
}

// =============================================================================
// PLUGIN REGISTRY (Non-Singleton)
// =============================================================================

/**
 * Plugin registry interface.
 */
export interface PluginRegistry {
    /** Register an app plugin */
    register(plugin: AppPlugin): void;

    /** Get plugin by ID */
    get(id: string): AppPlugin | undefined;

    /** Check if plugin exists */
    has(id: string): boolean;

    /** Check if plugin has a capability */
    hasCapability(pluginId: string, capability: AppCapability): boolean;

    /** Check if plugin supports a content kind */
    supportsContentKind(pluginId: string, kind: ContentKind): boolean;

    /** Check if plugin supports an event type */
    supportsEventType(pluginId: string, eventType: AppEventType): boolean;

    /** Check if CUSTOM event is allowed */
    isCustomEventAllowed(pluginId: string, eventName: string): boolean;

    /** Get plugin schema */
    getSchema(pluginId: string): PluginSchema | undefined;

    /** Get all registered plugins */
    all(): ReadonlyArray<AppPlugin>;

    /** Get all plugin IDs */
    ids(): ReadonlyArray<string>;

    /** Get app reducers (for routing) */
    getReducers(): Readonly<Record<string, AppReducer>>;
}

/**
 * Create a new plugin registry.
 *
 * Use this instead of a global singleton.
 * Pass the registry to createEngine() for dependency injection.
 *
 * @example
 * ```ts
 * const plugins = createPluginRegistry();
 * plugins.register(WhatsAppPlugin);
 * plugins.register(InstagramPlugin);
 *
 * const engine = createEngine({ plugins, fps: 30 });
 * ```
 */
export function createPluginRegistry(): PluginRegistry {
    const plugins = new Map<string, AppPlugin>();

    return {
        register(plugin) {
            if (plugins.has(plugin.id)) {
                console.warn(`[PluginRegistry] Overwriting plugin: ${plugin.id}`);
            }
            plugins.set(plugin.id, plugin);
            console.log(`[PluginRegistry] Registered: ${plugin.name} (${plugin.id})`);
        },

        get(id) {
            return plugins.get(id);
        },

        has(id) {
            return plugins.has(id);
        },

        hasCapability(pluginId, capability) {
            const plugin = plugins.get(pluginId);
            return plugin?.capabilities.includes(capability) ?? false;
        },

        supportsContentKind(pluginId, kind) {
            const plugin = plugins.get(pluginId);
            return plugin?.schema.contentKinds.includes(kind) ?? false;
        },

        supportsEventType(pluginId, eventType) {
            const plugin = plugins.get(pluginId);
            return plugin?.schema.eventTypes.includes(eventType) ?? false;
        },

        isCustomEventAllowed(pluginId, eventName) {
            const plugin = plugins.get(pluginId);
            if (!plugin) return false;

            // Must be namespaced
            if (!eventName.startsWith(`${pluginId}.`)) {
                return false;
            }

            // Must be in allowlist (if defined)
            if (plugin.schema.allowedCustomEvents) {
                return plugin.schema.allowedCustomEvents.includes(eventName);
            }

            // If no allowlist, allow all namespaced events
            return true;
        },

        getSchema(pluginId) {
            return plugins.get(pluginId)?.schema;
        },

        all() {
            return Array.from(plugins.values());
        },

        ids() {
            return Array.from(plugins.keys());
        },

        getReducers() {
            const reducers: Record<string, AppReducer> = {};
            for (const [id, plugin] of plugins) {
                reducers[id] = plugin.reducer;
            }
            return reducers;
        },
    };
}

// =============================================================================
// PLUGIN BUILDER (Helper for creating plugins)
// =============================================================================

/**
 * Builder for creating app plugins with defaults.
 */
export interface PluginConfig {
    readonly id: string;
    readonly name: string;
    readonly version?: string;
    readonly capabilities: ReadonlyArray<AppCapability>;
    readonly schema?: Partial<PluginSchema>;
    readonly reducer: AppReducer;
    readonly view: AppViewComponent;
    readonly icon?: string;
    readonly primaryColor?: string;
    readonly sounds?: Readonly<Record<string, string>>;
    readonly notificationSound?: string;
    readonly defaultState?: unknown;
}

/**
 * Create an app plugin with sensible defaults.
 */
export function defineAppPlugin(config: PluginConfig): AppPlugin {
    const schema: PluginSchema = {
        contentKinds: config.schema?.contentKinds ?? DEFAULT_PLUGIN_SCHEMA.contentKinds,
        eventTypes: config.schema?.eventTypes ?? DEFAULT_PLUGIN_SCHEMA.eventTypes,
        systemTypes: config.schema?.systemTypes,
        feedIds: config.schema?.feedIds,
        limits: config.schema?.limits,
        allowedCustomEvents: config.schema?.allowedCustomEvents,
    };

    return {
        id: config.id,
        name: config.name,
        version: config.version ?? "1.0.0",
        capabilities: config.capabilities,
        schema,
        reducer: config.reducer,
        view: config.view,
        icon: config.icon,
        primaryColor: config.primaryColor,
        sounds: config.sounds,
        notificationSound: config.notificationSound,
        defaultState: config.defaultState,
    };
}
