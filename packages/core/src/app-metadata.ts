/**
 * App Metadata Registry
 * 
 * Stores static metadata for applications (Icon, Color, Name).
 * Used by OS components (Notifications, App Library, Home Screen) to render app identity.
 * 
 * This decouples "Branding" from the "Renderer".
 */

import React from "react";

export interface AppMetadata {
    /** Display name (e.g. "WhatsApp") */
    displayName: string;

    /** Primary brand color (e.g. "#25D366") */
    themeColor: string;

    /** 
     * App Icon
     * Can be a string (asset URL/emoji) or a React Component.
     * Recommendation: Use React Component for SVG consistency.
     */
    icon: React.ReactNode | string;

    /**
     * Optional: Short name for tight spaces (e.g. "Messages")
     */
    shortName?: string;
}

class AppMetadataRegistryClass {
    private _metadata = new Map<string, AppMetadata>();

    /**
     * Register metadata for an app
     */
    register(appId: string, metadata: AppMetadata) {
        this._metadata.set(appId, metadata);
    }

    /**
     * Get metadata for an app.
     * Returns a default fallback if not found.
     */
    get(appId: string): AppMetadata {
        const data = this._metadata.get(appId);
        if (!data) {
            // Fallback for unknown apps
            return {
                displayName: appId,
                themeColor: "#8E8E93",
                icon: "📱",
            };
        }
        return data;
    }

    /**
     * Check if metadata exists
     */
    has(appId: string): boolean {
        return this._metadata.has(appId);
    }
}

export const AppMetadataRegistry = new AppMetadataRegistryClass();
