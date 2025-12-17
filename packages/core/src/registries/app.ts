/**
 * App Registry - Maps app IDs to their React view components
 * 
 * @description Uses createRegistry factory for DRY pattern.
 * Apps self-register their components here.
 */

import React from "react";
import { WorldState, LayoutState } from "../types";
import { createRegistry } from "./factory";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Props that all app view components receive
 */
export interface AppViewProps {
    world: WorldState;
    t?: number;
    layout?: LayoutState;
    platform?: string;
    deviceId?: string;
    width?: number;
    height?: number;
    safeAreaInsets?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

/**
 * Type for app view components
 */
export type AppViewComponent = React.FC<AppViewProps>;

// =============================================================================
// REGISTRY
// =============================================================================

// Create the registry using factory
const _registry = createRegistry<string, AppViewComponent>("App");

/**
 * AppRegistry - Maps app IDs to React view components
 */
export const AppRegistry = {
    /**
     * Register an app view component
     */
    register(appId: string, component: AppViewComponent): void {
        _registry.register(appId, component);
        console.log(`[AppRegistry] Registered view for: ${appId}`);
    },

    /**
     * Get an app view component by ID
     */
    getView: _registry.get,

    /**
     * Check if an app view is registered
     */
    hasView: _registry.has,

    /**
     * Get all registered app IDs
     */
    getRegisteredApps: _registry.keys,

    /**
     * Legacy compatibility - access views as object
     */
    get views(): Record<string, AppViewComponent> {
        return _registry.entries() as Record<string, AppViewComponent>;
    },

    /**
     * Clear all apps (for testing)
     */
    clear: _registry.clear,

    /**
     * Get count of registered apps
     */
    get size() {
        return _registry.size;
    },
};
