/**
 * Widget Registry - Manages platform-specific widgets from plugins
 * 
 * @description Resolves which widget to render based on priority and platform.
 * Note: Complex resolution logic - not using createRegistry factory.
 */

import type { WidgetSlot, WidgetMode, WidgetComponent } from "../plugin/plugin.js";
import type { Platform } from "@tokovo/core";

// =============================================================================
// WIDGET REGISTRY
// =============================================================================

export class WidgetRegistryClass {
    private slots = new Map<string, WidgetSlot[]>();

    /**
     * Register widgets for an app
     */
    register(appId: string, widgets: WidgetSlot[]): void {
        if (this.slots.has(appId)) {
            console.warn(`[WidgetRegistry] Overwriting widgets for: ${appId}`);
        }
        this.slots.set(appId, widgets);
    }

    /**
     * Get widget for mode + platform with priority resolution
     */
    resolve(
        mode: WidgetMode,
        platform: Platform,
        activeAppIds: string[]
    ): { appId: string; widget: WidgetSlot } | null {
        let best: { appId: string; widget: WidgetSlot; priority: number } | null = null;

        for (const appId of activeAppIds) {
            const appWidgets = this.slots.get(appId);
            if (!appWidgets) continue;

            for (const widget of appWidgets) {
                if (widget.mode !== mode) continue;
                if (!widget.platforms.includes(platform)) continue;

                if (!best || widget.priority > best.priority) {
                    best = { appId, widget, priority: widget.priority };
                }
            }
        }

        return best ? { appId: best.appId, widget: best.widget } : null;
    }

    /**
     * Get all widgets for a mode (for stacking multiple)
     */
    getAll(
        mode: WidgetMode,
        platform: Platform,
        activeAppIds: string[]
    ): Array<{ appId: string; widget: WidgetSlot }> {
        const results: Array<{ appId: string; widget: WidgetSlot }> = [];

        for (const appId of activeAppIds) {
            const appWidgets = this.slots.get(appId);
            if (!appWidgets) continue;

            for (const widget of appWidgets) {
                if (widget.mode === mode && widget.platforms.includes(platform)) {
                    results.push({ appId, widget });
                }
            }
        }

        return results.sort((a, b) => b.widget.priority - a.widget.priority);
    }

    /**
     * Get widgets for a specific app
     */
    getForApp(appId: string): WidgetSlot[] {
        return this.slots.get(appId) || [];
    }

    /**
     * Check if an app has widgets registered
     */
    hasWidgets(appId: string): boolean {
        return this.slots.has(appId);
    }

    /**
     * Get all registered app IDs with widgets
     */
    getRegisteredApps(): string[] {
        return Array.from(this.slots.keys());
    }

    /**
     * Clear all registered widgets (for testing)
     */
    clear(): void {
        this.slots.clear();
    }

    /**
     * Get count
     */
    get size(): number {
        return this.slots.size;
    }
}

export function createWidgetRegistry(): WidgetRegistryClass {
    return new WidgetRegistryClass();
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get the Dynamic Island widget for the current context
 */
export function getDynamicIslandWidget(
    registry: WidgetRegistryClass,
    platform: Platform,
    backgroundAppIds: string[]
): { appId: string; component: WidgetComponent } | null {
    const result = registry.resolve("dynamicIsland", platform, backgroundAppIds);
    if (!result) return null;
    return { appId: result.appId, component: result.widget.component };
}

/**
 * Get notification widgets for display
 */
export function getNotificationWidgets(
    registry: WidgetRegistryClass,
    platform: Platform,
    appIds: string[]
): Array<{ appId: string; component: WidgetComponent }> {
    return registry.getAll("notification", platform, appIds).map(r => ({
        appId: r.appId,
        component: r.widget.component,
    }));
}
