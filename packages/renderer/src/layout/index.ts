/**
 * Layout System - Plugin-agnostic layout computation
 *
 * Uses LayoutRegistry to delegate layout computation to plugins.
 * Provides fallbacks for common view kinds when no plugin is registered.
 */

import type { LayoutRegistryClass } from "@tokovo/react";
import { LayoutContext, LayoutState } from "./types.js";
import { defaultLayoutConfig } from "./config.js";
import { computeFeedLayout } from "./strategies/feed.js";
import { computeStoryLayout } from "./strategies/story.js";
import { computeLockscreenLayout } from "./strategies/lockscreen.js";
import { computeTransitionLayout } from "./strategies/transition.js";

export * from "./types.js";
export * from "./config.js";

const mergedConfigCache = new WeakMap<object, typeof defaultLayoutConfig>();

function resolveLayoutConfig(config?: Partial<typeof defaultLayoutConfig>) {
    if (!config) return defaultLayoutConfig;
    const cached = mergedConfigCache.get(config as object);
    if (cached) return cached;

    const merged = {
        ...defaultLayoutConfig,
        ...config,
        chat: { ...defaultLayoutConfig.chat, ...config.chat },
        feed: { ...defaultLayoutConfig.feed, ...config.feed },
        story: { ...defaultLayoutConfig.story, ...config.story },
        lockscreen: { ...defaultLayoutConfig.lockscreen, ...config.lockscreen },
        transition: { ...defaultLayoutConfig.transition, ...config.transition },
    };
    mergedConfigCache.set(config as object, merged);
    return merged;
}

/**
 * Compute layout using LayoutRegistry with fallbacks.
 *
 * Priority:
 * 1. App-specific layout from LayoutRegistry
 * 2. Generic viewKind layout from LayoutRegistry
 * 3. Built-in fallback layouts
 */
export function computeLayout(
    ctx: LayoutContext,
    registry: LayoutRegistryClass,
): LayoutState {
    // Deep merge provided config with defaults
    const config = resolveLayoutConfig(ctx.config);
    const fullCtx = { ...ctx, config };

    // 1. Try app-specific layout from registry
    const appStrategy = registry.get(ctx.activeAppId, ctx.viewKind);
    if (appStrategy) {
        return appStrategy.computeLayout(fullCtx);
    }

    // 2. Try generic viewKind layout from registry
    const viewStrategy = registry.getByViewKind(ctx.viewKind);
    if (viewStrategy) {
        return viewStrategy.computeLayout(fullCtx);
    }

    // 3. Fallback to built-in layouts
    switch (ctx.viewKind) {
        case "FEED":
            return computeFeedLayout(fullCtx);
        case "FULLSCREEN":
            return {
                kind: "FULLSCREEN",
                semantic: undefined,
                meta: {},
            };
        case "STORY":
            return computeStoryLayout(fullCtx);
        case "LOCKSCREEN":
            return computeLockscreenLayout(fullCtx);
        case "TRANSITION":
            return computeTransitionLayout(fullCtx);
        default:
            // Default fallback
            return {
                kind: "TRANSITION",
                deviceTranslateX: 0,
                deviceTranslateY: 0,
                deviceScale: 1,
                deviceRotation: 0,
                overlayOpacity: 0,
                meta: {}
            };
    }
}
