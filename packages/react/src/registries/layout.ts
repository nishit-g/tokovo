/**
 * Layout Registry - Plugins register layout computation strategies
 *
 * @description Resolves which layout strategy to use based on appId and viewKind.
 * Follows the same pattern as WidgetRegistry.
 *
 * @example
 * // Plugin registers layout
 * LayoutRegistry.register({
 *   appId: "app_whatsapp",
 *   viewKind: "CHAT",
 *   computeLayout: computeChatLayout,
 * });
 *
 * // Renderer uses registry
 * const strategy = LayoutRegistry.get(ctx.activeAppId, ctx.viewKind);
 * return strategy?.computeLayout(ctx) ?? defaultLayout(ctx);
 */

import type { Platform, LayoutContext, LayoutState, ViewKind } from "@tokovo/core";

// Re-export types for convenience
export type { LayoutContext, LayoutState };

// =============================================================================
// LAYOUT STRATEGY
// =============================================================================

/**
 * Layout strategy registered by a plugin.
 */
export interface LayoutStrategy {
  /** App ID (e.g., "app_whatsapp") */
  appId: string;

  /** View kind (e.g., "CHAT", "FEED", "STORY") */
  viewKind: ViewKind;

  /** Optional platform filter - if not set, applies to all platforms */
  platforms?: Platform[];

  /** Layout computation function */
  computeLayout: (ctx: LayoutContext) => LayoutState;
}

// =============================================================================
// LAYOUT REGISTRY
// =============================================================================

export class LayoutRegistryClass {
  private strategies = new Map<string, LayoutStrategy>();

  /**
   * Register a layout strategy for an app + viewKind combination.
   */
  register(strategy: LayoutStrategy): void {
    const key = `${strategy.appId}:${strategy.viewKind}`;
    if (this.strategies.has(key)) {
      console.warn(`[LayoutRegistry] Overwriting layout for: ${key}`);
    }
    this.strategies.set(key, strategy);
  }

  /**
   * Get layout strategy for specific appId + viewKind.
   */
  get(appId: string, viewKind: ViewKind): LayoutStrategy | undefined {
    return this.strategies.get(`${appId}:${viewKind}`);
  }

  /**
   * Get first layout strategy matching a viewKind (any app).
   * Useful for generic fallbacks.
   */
  getByViewKind(viewKind: ViewKind): LayoutStrategy | undefined {
    for (const strategy of this.strategies.values()) {
      if (strategy.viewKind === viewKind) {
        return strategy;
      }
    }
    return undefined;
  }

  /**
   * Get all strategies for a viewKind.
   */
  getAllForViewKind(viewKind: ViewKind): LayoutStrategy[] {
    return Array.from(this.strategies.values()).filter(
      (s) => s.viewKind === viewKind,
    );
  }

  /**
   * Get all strategies for an app.
   */
  getForApp(appId: string): LayoutStrategy[] {
    return Array.from(this.strategies.values()).filter(
      (s) => s.appId === appId,
    );
  }

  /**
   * Check if a strategy exists.
   */
  has(appId: string, viewKind: ViewKind): boolean {
    return this.strategies.has(`${appId}:${viewKind}`);
  }

  /**
   * Get all registered app IDs.
   */
  getRegisteredApps(): string[] {
    const apps = new Set<string>();
    for (const strategy of this.strategies.values()) {
      apps.add(strategy.appId);
    }
    return Array.from(apps);
  }

  /**
   * Unregister all strategies for a specific app.
   * Used for plugin cleanup on re-registration.
   */
  unregisterApp(appId: string): void {
    const keysToDelete: string[] = [];
    for (const [key, strategy] of this.strategies.entries()) {
      if (strategy.appId === appId) {
        keysToDelete.push(key);
      }
    }
    for (const key of keysToDelete) {
      this.strategies.delete(key);
    }
    if (keysToDelete.length > 0) {
      console.warn(
        `[LayoutRegistry] Unregistered ${keysToDelete.length} layouts for app: ${appId}`,
      );
    }
  }

  /**
   * Clear all registered strategies (for testing).
   */
  clear(): void {
    this.strategies.clear();
  }

  /**
   * Get count of registered strategies.
   */
  get size(): number {
    return this.strategies.size;
  }
}

export function createLayoutRegistry(): LayoutRegistryClass {
  return new LayoutRegistryClass();
}
