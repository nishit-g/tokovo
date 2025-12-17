/**
 * Plugin Module Index
 * 
 * @description Consolidated plugin system exports.
 */

// Plugin contract types
export type {
    TokovoPluginContract,
    PluginReducer,
    PluginViews,
    LoweringHandler,
    DslExtension,
    PluginAnchorRegistry,
    PluginNotificationAdapter,
    PluginTier,
} from "../types/plugin-contract";

// Plugin registration and utilities
export * from "../plugin";
