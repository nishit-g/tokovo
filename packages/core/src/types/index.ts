/**
 * Types Index - Enterprise Types
 * 
 * @description Central export for all core types.
 * Domain-organized type files for maintainability.
 */

// =============================================================================
// DOMAIN TYPES (New - Split from types.ts)
// =============================================================================

// Notification system
export * from "./notification.js";

// Device, OS, Keyboard, Call
export * from "./device.js";

// Camera effects and transforms
export * from "./camera.js";

// Audio system
export * from "./audio.js";

// Layout system
export * from "./layout.js";

// WorldState
export * from "./world-state.js";

// =============================================================================
// ENTERPRISE TYPES (Existing)
// =============================================================================

// RuntimeEvent - Payload-based event system
export * from "./runtime-event.js";

// CompiledEpisode - The only runtime input
export * from "./compiled-episode.js";

// Plugin Contract - Tiered plugin system
export * from "./plugin-contract.js";
export * from "./asset-ref.js";

// Anchor types - V2 camera positioning
export * from "./anchor.js";

// StatusBar theming
export * from "./statusbar-theme.js";
