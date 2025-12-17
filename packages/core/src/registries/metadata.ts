/**
 * App Metadata Registry - Stores static metadata for applications
 * 
 * @description Uses createRegistry factory for DRY pattern.
 * Used by OS components (Notifications, App Library, Home Screen).
 */

import React from "react";
import { createRegistry } from "./factory";
import type { ViewKind } from "../types";

// =============================================================================
// TYPES
// =============================================================================

export interface AppMetadata {
    /** Display name (e.g. "WhatsApp") */
    displayName: string;

    /** Primary brand color (e.g. "#25D366") */
    themeColor: string;

    /** 
     * App Icon - string (URL/emoji) or React Component
     */
    icon: React.ReactNode | string;

    /** Short name for tight spaces */
    shortName?: string;

    /** Layout Strategy */
    viewStrategy?: ViewKind;

    /** Design Width (default: 393) */
    designWidth?: number;
}

// =============================================================================
// DEFAULT FALLBACK
// =============================================================================

const DEFAULT_METADATA: AppMetadata = {
    displayName: "Unknown App",
    themeColor: "#8E8E93",
    icon: "[App]",
};

// =============================================================================
// REGISTRY
// =============================================================================

// Create the registry using factory
const _registry = createRegistry<string, AppMetadata>("AppMetadata");

/**
 * AppMetadataRegistry - Maps app IDs to their metadata
 */
export const AppMetadataRegistry = {
    /**
     * Register metadata for an app
     */
    register: _registry.register,

    /**
     * Get metadata for an app (with fallback)
     */
    get(appId: string): AppMetadata {
        return _registry.get(appId) || {
            ...DEFAULT_METADATA,
            displayName: appId,
        };
    },

    /**
     * Check if metadata exists
     */
    has: _registry.has,

    /**
     * Get all app IDs
     */
    keys: _registry.keys,

    /**
     * Get all metadata entries
     */
    entries: _registry.entries,

    /**
     * Clear all metadata (for testing)
     */
    clear: _registry.clear,

    /**
     * Get count
     */
    get size() {
        return _registry.size;
    },
};

// =============================================================================
// NOTE: Apps should register themselves via side effects when imported.
// DO NOT add app-specific registrations here!
// =============================================================================
