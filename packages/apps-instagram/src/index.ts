/**
 * @tokovo/apps-instagram
 * 
 * Instagram app plugin for Tokovo.
 */

// Plugin
export { InstagramPlugin, registerInstagramPlugin } from "./plugin";

// Types
export * from "./types";

// Runtime
export * from "./runtime";

// DSL
export * from "./dsl";

// Views
export * from "./views";

// Anchors
export { instagramAnchorProvider, INSTAGRAM_ANCHORS } from "./anchors";

// Config
export { instagramTheme } from "./config";
