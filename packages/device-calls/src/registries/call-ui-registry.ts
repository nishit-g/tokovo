/**
 * Call UI Strategy Registry
 * 
 * Registry for call UI visual strategies (iOS, Android, Ghibli, etc.)
 * 
 * @example
 * ```typescript
 * CallUIStrategyRegistry.register("ghibli", GhibliCallUI);
 * const Strategy = CallUIStrategyRegistry.get("ghibli");
 * ```
 */

import type React from "react";
import type { CallUIStrategyProps } from "../types/ui";

// =============================================================================
// TYPES
// =============================================================================

export type CallUIStrategyComponent = React.FC<CallUIStrategyProps>;

// =============================================================================
// REGISTRY IMPLEMENTATION
// =============================================================================

class CallUIStrategyRegistryImpl {
    private strategies = new Map<string, CallUIStrategyComponent>();

    /**
     * Register a call UI strategy
     * @param variant The variant ID (e.g., "ios", "android", "ghibli")
     * @param component The strategy React component
     */
    register(variant: string, component: CallUIStrategyComponent): void {
        if (this.strategies.has(variant)) {
            console.warn(`[CallUIStrategyRegistry] Overwriting strategy: ${variant}`);
        }
        this.strategies.set(variant, component);
        console.log(`[CallUIStrategyRegistry] Registered: ${variant}`);
    }

    /**
     * Get a strategy by variant
     */
    get(variant: string): CallUIStrategyComponent | undefined {
        return this.strategies.get(variant);
    }

    /**
     * Get strategy with fallback
     */
    getWithFallback(variant: string, fallback: string = "ios"): CallUIStrategyComponent | undefined {
        return this.strategies.get(variant) || this.strategies.get(fallback);
    }

    /**
     * Check if a strategy is registered
     */
    has(variant: string): boolean {
        return this.strategies.has(variant);
    }

    /**
     * List all registered variant IDs
     */
    list(): string[] {
        return Array.from(this.strategies.keys());
    }

    /**
     * Clear all strategies (for testing)
     */
    clear(): void {
        this.strategies.clear();
    }
}

export const CallUIStrategyRegistry = new CallUIStrategyRegistryImpl();
