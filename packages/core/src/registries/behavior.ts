/**
 * Behavior Registry - App-specific camera behaviors
 *
 * @description Uses createRegistry factory for DRY pattern.
 * Apps self-register their behaviors at module load time.
 */

import { createRegistry } from "./factory";
import type { SemanticAnchorId } from "../types/anchor";

// ShotPresetId is now just a string (presets moved to device-camera)
type ShotPresetId = string;

// =============================================================================
// TYPES
// =============================================================================

export type CameraIntent =
    | { type: "FOCUS"; anchor: SemanticAnchorId; preset?: ShotPresetId }
    | { type: "RESET"; preset?: ShotPresetId }
    | { type: "HOLD" };

export interface AppBehavior {
    appId: string;
    eventMappings: Record<string, CameraIntent>;
    presetOverrides?: Partial<Record<ShotPresetId, Partial<{ scale: number; shake: number }>>>;
}

// =============================================================================
// REGISTRY
// =============================================================================

// Create the registry using factory
const _registry = createRegistry<string, AppBehavior>("Behavior");

/**
 * BehaviorRegistry - Maps app IDs to camera behaviors
 */
export const BehaviorRegistry = {
    /**
     * Register an app behavior
     */
    register(behavior: AppBehavior): void {
        _registry.register(behavior.appId, behavior);
    },

    /**
     * Get behavior for an app
     */
    get: _registry.get,

    /**
     * Check if behavior exists
     */
    has: _registry.has,

    /**
     * Get intent for an app event
     */
    getIntent(appId: string, eventType: string): CameraIntent | undefined {
        const behavior = _registry.get(appId);
        return behavior?.eventMappings[eventType];
    },

    /**
     * Get all registered app IDs
     */
    getRegisteredApps: _registry.keys,

    /**
     * Clear all registrations (for testing)
     */
    clear: _registry.clear,

    /**
     * Get count
     */
    get size() {
        return _registry.size;
    },
};
