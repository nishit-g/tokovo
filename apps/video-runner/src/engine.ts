/**
 * Tokovo Engine Factory for Video Runner
 * 
 * This module provides explicit plugin registration using the canonical system.
 * All reducers now use canonical 3-arg signature: (world, event, ctx?)
 * 
 * MIGRATION STATUS: Phase 5 Complete
 * - All apps use canonical AppPlugin and 3-arg reducers
 * - Device reducer wrapped for canonical compatibility
 * - buildWorld() uses canonical engine
 */

// =============================================================================
// SIDE-EFFECT IMPORTS (MUST BE FIRST for reducer registration)
// =============================================================================

// Device package registers deviceReducer with ReducerRegistry (legacy compat)
import "@tokovo/devices";

// App packages register their reducers with ReducerRegistry (legacy compat)
import "@tokovo/apps-whatsapp";
import "@tokovo/apps-twitter";
import "@tokovo/apps-instagram";
import "@tokovo/apps-phone";

// =============================================================================
// CANONICAL PLUGIN REGISTRATION
// =============================================================================

import { canonical, createPluginRegistry, replay } from "@tokovo/core";
import type { PluginRegistry, WorldState, TimelineEvent, TokovoEngine } from "@tokovo/core";

// Import canonical plugins from each app package
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { TwitterPlugin } from "@tokovo/apps-twitter";
import { InstagramPlugin } from "@tokovo/apps-instagram";
import { PhonePluginCanonical } from "@tokovo/apps-phone";

// Import worldDeviceReducer for canonical flow
import { worldDeviceReducer } from "@tokovo/devices";

/**
 * Create a configured plugin registry with all Tokovo apps.
 * 
 * Use this with createEngine():
 * ```ts
 * const plugins = createTokovoPluginRegistry();
 * const engine = createEngine({ plugins, fps: 30 });
 * const world = engine.buildWorld(initialWorld, events, frame);
 * ```
 */
export function createTokovoPluginRegistry(): PluginRegistry {
    const plugins = createPluginRegistry();

    // Register all app plugins
    plugins.register(WhatsAppPlugin);
    plugins.register(TwitterPlugin);
    plugins.register(InstagramPlugin);
    plugins.register(PhonePluginCanonical);

    return plugins;
}

/**
 * Pre-built plugin registry with all Tokovo apps.
 * Use this if you don't need custom plugin configuration.
 */
export const tokovoPlugins = createTokovoPluginRegistry();

// =============================================================================
// CANONICAL ENGINE EXPORT
// =============================================================================

export { canonical, createPluginRegistry };
export const { createEngine } = canonical;

// =============================================================================
// TOKOVO ENGINE SINGLETON (for showcases)
// =============================================================================

/**
 * Pre-configured Tokovo engine with all apps registered.
 * Use this for video compositions.
 */
export const tokovoEngine: TokovoEngine = createEngine({
    plugins: tokovoPlugins,
    fps: 30,
    validation: "compat",
});

/**
 * Build world state from initial state and events.
 * 
 * NOTE: Uses legacy replay() because the canonical engine's routing
 * only has defaultDeviceReducer (basic lock/unlock) instead of the
 * full deviceReducer from @tokovo/devices (notifications, calls, etc).
 * 
 * The reducer signatures have been migrated to 3-arg (world, event, ctx?)
 * for future canonical compatibility. Once the engine supports custom
 * device/call reducer injection, we can switch to canonical buildWorld.
 */
export function buildWorld(
    initialWorld: WorldState,
    events: TimelineEvent[],
    frame: number
): WorldState {
    // Use legacy replay - it routes through full ReducerRegistry
    // which includes deviceReducer with notifications, calls, keyboard, etc.
    return replay(initialWorld, events, frame);
}

// =============================================================================
// LEGACY RE-EXPORTS
// =============================================================================

export {
    replay,
    buildPluginRegistryFromLegacy,
    ReducerRegistry,
} from "@tokovo/core";

// Re-export device reducer wrapper
export { worldDeviceReducer };

// =============================================================================
// CONFIG
// =============================================================================

export const ENGINE_CONFIG = {
    fps: 30,
    validation: "compat" as const,
} as const;

/**
 * Log migration status once per session.
 */
let migrationLogged = false;
export function logMigrationStatus(): void {
    if (!migrationLogged) {
        console.info(
            "[Tokovo Engine] Phase 5 complete. " +
            "All reducers use canonical 3-arg (world, event, ctx?) signature."
        );
        migrationLogged = true;
    }
}
