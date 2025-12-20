/**
 * Instagram Plugin - Enterprise Contract
 * 
 * Self-contained plugin following WhatsApp pattern:
 * - Tier A: id, version, displayName, reducer, views
 * - Tier B: lowering handler, layouts
 * - Tier C: DSL extension (b.use() pattern)
 */

import React from "react";
import { PluginManager } from "@tokovo/core";
import type { TokovoPluginContract } from "@tokovo/core/src/types/plugin-contract";

// Runtime Layer
import { instagramReducer } from "./runtime/reducer";
import { createInstagramInitialState } from "./runtime/initial-state";

// Views Layer
import { InstagramApp } from "./views";

// Lowering Layer
import { instagramV2Lowering } from "./lowering";

// DSL Layer
import { InstagramTrackBuilder } from "./dsl";

// =============================================================================
// PLUGIN ASSETS
// =============================================================================

const instagramAssets = {
    sounds: {
        "dm_in": "plugins/instagram/dm_received.wav",
        "dm_out": "plugins/instagram/dm_sent.wav",
        "like": "plugins/instagram/like.wav",
    },
    icons: {
        "app_icon": "/icons/instagram.svg",
    },
};

// =============================================================================
// ENTERPRISE PLUGIN CONTRACT
// =============================================================================

export const InstagramPlugin: TokovoPluginContract<"app_instagram"> & {
    appView: React.FC<any>;
    name: string;
    v2Lowering: typeof instagramV2Lowering;
    sounds: Record<string, string>;
} = {
    // === TIER A: Identity ===
    id: "app_instagram" as const,
    version: "1.0.0",
    displayName: "Instagram",
    name: "Instagram",

    // === TIER A: Runtime ===
    reducer: instagramReducer as any,
    views: {
        AppRoot: InstagramApp,
        strategies: {
            ios: {
                HomeScreen: InstagramApp,
            },
        },
    } as any,
    appView: InstagramApp,
    createInitialState: createInstagramInitialState,

    // === SOUNDS ===
    sounds: {
        "app_instagram.dm_in": "plugins/instagram/dm_received.wav",
        "app_instagram.dm_out": "plugins/instagram/dm_sent.wav",
        "app_instagram.like": "plugins/instagram/like.wav",
    },

    // === TIER A: Assets ===
    assets: instagramAssets,

    // === TIER B: Lowering ===
    v2Lowering: instagramV2Lowering,

    // === TIER C: DSL ===
    dsl: {
        TrackBuilder: InstagramTrackBuilder,
    } as any,
};

// =============================================================================
// EXPORTS
// =============================================================================

export function registerInstagramPlugin(): void {
    PluginManager.register(InstagramPlugin as any);
    console.log("[InstagramPlugin] Registered");
}

export default InstagramPlugin;
