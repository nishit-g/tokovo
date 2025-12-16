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

    /**
     * Layout Strategy
     * Tells the OS what kind of strategy logic to use.
     */
    viewStrategy?: import("./types").ViewKind;

    /**
     * Design Width (Logical Resolution)
     * The width this app was designed for (e.g. 393 for iPhone 14/15/16 Pro).
     * The Renderer will automatically scale the app to fit the physical target width.
     * Default: 393
     */
    designWidth?: number;
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

// Register Default Apps
AppMetadataRegistry.register("app_whatsapp", {
    displayName: "WhatsApp",
    themeColor: "#25D366",
    icon: "💬",
    viewStrategy: "CHAT"
});

AppMetadataRegistry.register("app_instagram", {
    displayName: "Instagram",
    themeColor: "#E1306C", // Instagram Gradient-ish
    icon: "📸",
    viewStrategy: "FEED" // Default to FEED, though logic might checking state
});

AppMetadataRegistry.register("app_gmail", {
    displayName: "Gmail",
    themeColor: "#EA4335",
    icon: "📧",
    viewStrategy: "FEED" // Warning: Gmail is list-based, effectively FEED layout structure
});

AppMetadataRegistry.register("app_twitter", {
    displayName: "X",
    themeColor: "#000000",
    icon: "✖️",
    viewStrategy: "FEED"
});
