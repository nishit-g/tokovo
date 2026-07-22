/**
 * Layout System - Plugin-agnostic layout computation
 *
 * Uses LayoutRegistry to delegate layout computation to plugins.
 */

import type { LayoutRegistryClass } from "@tokovo/react";
import { LayoutContext, LayoutState } from "./types.js";

export * from "./types.js";

/**
 * Compute layout using explicit plugin registration.
 *
 * Priority:
 * 1. App-specific layout from LayoutRegistry
 * 2. Generic viewKind layout from LayoutRegistry
 */
export function computeLayout(ctx: LayoutContext, registry: LayoutRegistryClass): LayoutState {
  // 1. Try app-specific layout from registry
  const appStrategy = registry.get(ctx.activeAppId, ctx.viewKind);
  if (appStrategy) {
    return appStrategy.computeLayout(ctx);
  }

  // 2. Try generic viewKind layout from registry
  const viewStrategy = registry.getByViewKind(ctx.viewKind);
  if (viewStrategy) {
    return viewStrategy.computeLayout(ctx);
  }

  throw new Error(
    `APP_LAYOUT_STRATEGY_MISSING: app "${ctx.activeAppId}" has no ${ctx.viewKind} layout strategy.`,
  );
}
