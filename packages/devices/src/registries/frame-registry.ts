/**
 * Frame Registry
 * 
 * Registry for device frame components.
 * Allows custom device frames (Ghibli, Pixel, etc.) to be registered.
 * 
 * @example
 * ```typescript
 * const registry = createFrameRegistry();
 * registry.register("iphone16", iPhone16Frame);
 * const Frame = registry.get("iphone16");
 * ```
 */

import type React from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface FrameProps {
    children: React.ReactNode;
    width?: number;
    height?: number;
    scale?: number;
    showStatusBar?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export type FrameComponent = React.ComponentType<FrameProps>;

// =============================================================================
// REGISTRY IMPLEMENTATION
// =============================================================================

export class FrameRegistryClass {
    private frames = new Map<string, FrameComponent>();

    /**
     * Register a frame component for a device profile
     * @param profileId The device profile ID
     * @param component The frame React component
     */
    register(profileId: string, component: FrameComponent): void {
        if (this.frames.has(profileId)) {
            console.warn(`[FrameRegistry] Overwriting frame: ${profileId}`);
        }
        this.frames.set(profileId, component);
    }

    /**
     * Get a frame component by profile ID
     */
    get(profileId: string): FrameComponent | undefined {
        return this.frames.get(profileId);
    }

    /**
     * Get frame with fallback
     */
    getWithFallback(profileId: string, fallbackId: string = "iphone16"): FrameComponent | undefined {
        return this.frames.get(profileId) || this.frames.get(fallbackId);
    }

    /**
     * Check if a frame is registered
     */
    has(profileId: string): boolean {
        return this.frames.has(profileId);
    }

    /**
     * List all registered frame IDs
     */
    list(): string[] {
        return Array.from(this.frames.keys());
    }

    /**
     * Clear all frames (for testing)
     */
    clear(): void {
        this.frames.clear();
    }
}

export function createFrameRegistry(): FrameRegistryClass {
    return new FrameRegistryClass();
}
