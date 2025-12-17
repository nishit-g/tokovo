/**
 * Behavior Registry
 *
 * Central registry for app-specific camera behaviors.
 * Apps self-register their behaviors at module load time.
 */

import type { ShotPresetId } from "./camera/presets";

// =============================================================================
// CAMERA INTENT TYPES (Re-exported for convenience)
// =============================================================================

import type { SemanticAnchorId } from "./anchors";

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
// BEHAVIOR REGISTRY
// =============================================================================

class BehaviorRegistryClass {
    private behaviors = new Map<string, AppBehavior>();

    /**
     * Register an app behavior
     */
    register(behavior: AppBehavior): void {
        this.behaviors.set(behavior.appId, behavior);
    }

    /**
     * Get behavior for an app
     */
    get(appId: string): AppBehavior | undefined {
        return this.behaviors.get(appId);
    }

    /**
     * Check if behavior exists
     */
    has(appId: string): boolean {
        return this.behaviors.has(appId);
    }

    /**
     * Get intent for an app event
     */
    getIntent(appId: string, eventType: string): CameraIntent | undefined {
        const behavior = this.behaviors.get(appId);
        return behavior?.eventMappings[eventType];
    }

    /**
     * Get all registered app IDs
     */
    getRegisteredApps(): string[] {
        return Array.from(this.behaviors.keys());
    }

    /**
     * Clear all registrations (for testing)
     */
    clear(): void {
        this.behaviors.clear();
    }
}

/** Global behavior registry */
export const BehaviorRegistry = new BehaviorRegistryClass();
