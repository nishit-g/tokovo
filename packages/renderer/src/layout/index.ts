/**
 * Layout System - Plugin-agnostic layout computation
 *
 * Uses LayoutRegistry to delegate layout computation to plugins.
 * Provides fallbacks for common view kinds when no plugin is registered.
 */

import { LayoutRegistry } from "@tokovo/core";
import { LayoutContext, LayoutState } from "./types";
import { defaultLayoutConfig } from "./config";
import { computeFeedLayout } from "./strategies/feed";
import { computeStoryLayout } from "./strategies/story";
import { computeLockscreenLayout } from "./strategies/lockscreen";
import { computeTransitionLayout } from "./strategies/transition";

export * from "./types";
export * from "./config";

/**
 * Compute layout using LayoutRegistry with fallbacks.
 *
 * Priority:
 * 1. App-specific layout from LayoutRegistry
 * 2. Generic viewKind layout from LayoutRegistry
 * 3. Built-in fallback layouts
 */
export function computeLayout(ctx: LayoutContext): LayoutState {
    // Deep merge provided config with defaults
    const config = {
        ...defaultLayoutConfig,
        ...ctx.config,
        chat: { ...defaultLayoutConfig.chat, ...ctx.config?.chat },
        feed: { ...defaultLayoutConfig.feed, ...ctx.config?.feed },
        story: { ...defaultLayoutConfig.story, ...ctx.config?.story },
        lockscreen: { ...defaultLayoutConfig.lockscreen, ...ctx.config?.lockscreen },
        transition: { ...defaultLayoutConfig.transition, ...ctx.config?.transition },
    };
    const fullCtx = { ...ctx, config };

    // 1. Try app-specific layout from registry
    const appStrategy = LayoutRegistry.get(ctx.activeAppId, ctx.viewKind);
    if (appStrategy) {
        return appStrategy.computeLayout(fullCtx);
    }

    // 2. Try generic viewKind layout from registry
    const viewStrategy = LayoutRegistry.getByViewKind(ctx.viewKind);
    if (viewStrategy) {
        return viewStrategy.computeLayout(fullCtx);
    }

    // 3. Fallback to built-in layouts
    switch (ctx.viewKind) {
        case "FEED":
            return computeFeedLayout(fullCtx);
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
