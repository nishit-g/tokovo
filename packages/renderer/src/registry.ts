/**
 * AppRegistry - Maps app IDs to their React view components
 * 
 * Apps self-register their components here.
 * The renderer uses this registry to display the correct app view.
 */

import React from "react";
import { WorldState, APP_IDS } from "@tokovo/core";
import { WhatsappChatView } from "@tokovo/apps-whatsapp";
import { InstagramApp } from "@tokovo/apps-instagram";

import { LayoutState } from "./layout/types";

/**
 * Props that all app view components receive
 */
export interface AppViewProps {
    world: WorldState;
    t?: number;
    layout?: LayoutState;
    platform?: string;
    deviceId?: string;
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

    constructor() {
        // Register built-in apps
        this.register(APP_IDS.WHATSAPP, WhatsappChatView as AppViewComponent);
        this.register(APP_IDS.INSTAGRAM, InstagramApp as AppViewComponent);
    }

    /**
     * Register an app view component
     */
    register(appId: string, component: AppViewComponent): void {
        if (this._views.has(appId)) {
            console.warn(`[AppRegistry] Overwriting view for ${appId}`);
        }
        this._views.set(appId, component);
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
