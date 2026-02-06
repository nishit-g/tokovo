/**
 * Behavior Registry - App-specific camera behaviors
 *
 * @description Uses createRegistry factory for DRY pattern.
 * Apps self-register their behaviors at module load time.
 */

import { createRegistry } from "./factory.js";
import type { SemanticAnchorId } from "../types/anchor.js";

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

export interface BehaviorRegistryAPI {
    register(behavior: AppBehavior): void;
    get(appId: string): AppBehavior | undefined;
    has(appId: string): boolean;
    getIntent(appId: string, eventType: string): CameraIntent | undefined;
    getRegisteredApps(): string[];
    clear(): void;
    readonly size: number;
}

export function createBehaviorRegistry(): BehaviorRegistryAPI {
    const registry = createRegistry<string, AppBehavior>("Behavior");

    return {
        /**
         * Register an app behavior
         */
        register(behavior: AppBehavior): void {
            registry.register(behavior.appId, behavior);
        },

        /**
         * Get behavior for an app
         */
        get: registry.get,

        /**
         * Check if behavior exists
         */
        has: registry.has,

        /**
         * Get intent for an app event
         */
        getIntent(appId: string, eventType: string): CameraIntent | undefined {
            const behavior = registry.get(appId);
            return behavior?.eventMappings[eventType];
        },

        /**
         * Get all registered app IDs
         */
        getRegisteredApps: registry.keys,

        /**
         * Clear all registrations (for testing)
         */
        clear: registry.clear,

        /**
         * Get count
         */
        get size() {
            return registry.size;
        },
    };
}
