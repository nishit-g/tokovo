/**
 * @tokovo/core - Core Types, Engine, and Canonical System
 * 
 * PRIMARY API (use these):
 * - `canonical.createEngine()` - Factory-based engine with DI
 * - `canonical.createPluginRegistry()` - Plugin registry
 * - `canonical.defineAppPlugin()` - Create app plugins
 * 
 * LEGACY (deprecated, will be removed):
 * - `legacy.*` - Old singleton-based engine
 */

// =============================================================================
// TYPES (stable, used by all)
// =============================================================================

export * from "./types";
export * from "./tokens";
export * from "./sounds";
export * from "./constants";
export * from "./typeGuards";
export * from "./eventUtils";
export * from "./transitions";

// =============================================================================
// CORE SYSTEMS (stable)
// =============================================================================

export * from "./camera";
export * from "./audio";
export * from "./director-lite";
export * from "./widget-registry";
export * from "./notification-adapter";
export * from "./notification-dsl";

// =============================================================================
// CANONICAL (PRIMARY - the new engine)
// =============================================================================

export * as canonical from "./canonical";

// Re-export key canonical APIs at top level for convenience
export {
    createEngine,
    createReplayCache,
    buildWorldCached,
    createPluginRegistry,
    defineAppPlugin,
    createActorRegistry,
    sortEventsDeterministic,
    eventSortKey,
    stableStringify,
    computeDeterminismHash,
} from "./canonical";

export type {
    TokovoEngine,
    EngineConfig,
    ReplayCache,
    PluginRegistry,
    AppPlugin,
    PluginSchema,
    ActorRegistry,
    ActorRef,
    ActorId,
    CanonicalRuntimeEvent,
    AppRuntimeEvent,
    CanonicalContent,
    CanonicalMessage,
    // Widget types
    WidgetSlot,
    WidgetMode,
    WidgetComponent,
    WidgetProps,
    // Reducer types
    AppReducer,
    WorldState as CanonicalWorldState,
    ReducerContext,
} from "./canonical";

// =============================================================================
// LEGACY (deprecated - for backward compatibility only)
// =============================================================================

/**
 * @deprecated Use canonical API instead.
 * 
 * Legacy exports kept for backward compatibility:
 * - `replay()` - Use `createEngine().buildWorld()` instead
 * - `ReducerRegistry` - Use `createPluginRegistry()` instead
 * - `PluginManager` - Use `createPluginRegistry()` instead
 * - `definePlugin` - Use `defineAppPlugin()` instead
 */
export * as legacy from "./legacy";

// Also export legacy items at top level for compat (will show deprecation warnings)
export {
    replay,
    ReducerRegistry,
    buildPluginRegistryFromLegacy,
} from "./legacy/engine";

export {
    PluginManager,
    definePlugin,
} from "./legacy/plugin";

export type {
    TokovoPlugin,
    AppViewComponent,
    AppViewProps,
    WidgetSlot as LegacyWidgetSlot,
    WidgetMode as LegacyWidgetMode,
    WidgetComponent as LegacyWidgetComponent,
    WidgetProps as LegacyWidgetProps,
} from "./legacy/plugin";
