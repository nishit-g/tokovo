/**
 * Tokovo Engine Factory for Video Runner
 * 
 * This module provides explicit plugin registration using the canonical system.
 * Legacy support maintained for backward compatibility.
 * 
 * MIGRATION STATUS: Phase 4 Complete
 * - All apps now export canonical AppPlugin objects
 * - Explicit plugin registration via createPluginRegistry()
 * - Legacy replay() still available but deprecated
 */

// =============================================================================
// CANONICAL PLUGIN REGISTRATION
// =============================================================================

import { canonical, createPluginRegistry } from "@tokovo/core";
import type { PluginRegistry } from "@tokovo/core";

// Import canonical plugins from each app package
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp";
import { TwitterPlugin } from "@tokovo/apps-twitter";
import { InstagramPlugin } from "@tokovo/apps-instagram";
import { PhonePluginCanonical } from "@tokovo/apps-phone";

// Import device package for device profiles (still needed)
import "@tokovo/devices";

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
// LEGACY SUPPORT (Deprecated)
// =============================================================================

// Import side-effect modules that register to legacy ReducerRegistry
// NOTE: This is for backward compatibility with existing video compositions
// Remove once all compositions migrate to createEngine().buildWorld()
import "@tokovo/apps-whatsapp";
import "@tokovo/apps-twitter";
import "@tokovo/apps-instagram";
import "@tokovo/apps-phone";

// Re-export legacy replay for compositions not yet migrated
export {
    replay,
    buildPluginRegistryFromLegacy,
    ReducerRegistry,
} from "@tokovo/core";

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
            "[Tokovo Engine] Phase 4 complete. " +
            "Using explicit plugin registration via createTokovoPluginRegistry()."
        );
        migrationLogged = true;
    }
}
