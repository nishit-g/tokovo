/**
 * App Registry - Maps app IDs to their React view components
 * 
 * Apps self-register their components here.
 * The renderer uses this registry to display the correct app view.
 * 
 * MOVED TO CORE: To allow apps to register themselves without depending on renderer.
 */

import React from "react";
import { WorldState, AppId } from "../types";
import { LayoutState } from "../types";

/**
 * Props that all app view components receive
 */
export interface AppViewProps {
    world: WorldState;
    t?: number;
    layout?: LayoutState; // Now imported from core types
    platform?: string;
    deviceId?: string;
    /** Physical width of the screen */
    width?: number;
    /** Physical height of the screen */
    height?: number;
    /** Safe area insets (physical pixels) */
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

/**
 * AppRegistry class - manages app view components
 */
class AppRegistryClass {
    private _views = new Map<string, AppViewComponent>();

    /**
     * Register an app view component
     */
    register(appId: string, component: AppViewComponent): void {
        if (this._views.has(appId)) {
            console.warn(`[AppRegistry] Overwriting view for ${appId}`);
        }
        this._views.set(appId, component);
        console.log(`[AppRegistry] Registered view for: ${appId}`);
    }

    /**
     * Get an app view component by ID
     */
    getView(appId: string): AppViewComponent | undefined {
        return this._views.get(appId);
    }

    /**
     * Check if an app view is registered
     */
    hasView(appId: string): boolean {
        return this._views.has(appId);
    }

    /**
     * Get all registered app IDs
     */
    getRegisteredApps(): string[] {
        return Array.from(this._views.keys());
    }

    // Legacy compatibility - access views as object
    get views(): Record<string, AppViewComponent> {
        return Object.fromEntries(this._views);
    }
}

export const AppRegistry = new AppRegistryClass();
