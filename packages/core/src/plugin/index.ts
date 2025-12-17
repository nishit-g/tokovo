/**
 * Plugin Module - Plugin system
 * 
 * @description Plugin registration and contracts.
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
export * from "./plugin";
