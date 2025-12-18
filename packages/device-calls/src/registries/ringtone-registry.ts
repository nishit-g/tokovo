/**
 * Ringtone Registry
 * 
 * Registry for call ringtones and sounds.
 * 
 * @example
 * ```typescript
 * RingtoneRegistry.register("marimba", "/sounds/marimba.mp3");
 * const path = RingtoneRegistry.get("marimba");
 * ```
 */

import { SoundRegistry } from "@tokovo/core";

// =============================================================================
// REGISTRY IMPLEMENTATION
// =============================================================================

class RingtoneRegistryImpl {
    private ringtones = new Map<string, string>();

    /**
     * Register a ringtone
     * @param id Ringtone ID (e.g., "default", "marimba")
     * @param path Sound file path
     */
    register(id: string, path: string): void {
        if (this.ringtones.has(id)) {
            console.warn(`[RingtoneRegistry] Overwriting: ${id}`);
        }
        this.ringtones.set(id, path);

        // Also register with SoundRegistry
        try {
            SoundRegistry.register(`call.ringtone.${id}`, path);
        } catch (e) {
            // SoundRegistry might not be available
        }

        console.log(`[RingtoneRegistry] Registered: ${id}`);
    }

    /**
     * Get a ringtone path
     */
    get(id: string): string | undefined {
        return this.ringtones.get(id);
    }

    /**
     * Get ringtone with fallback
     */
    getOrDefault(id: string, fallback: string = "default"): string | undefined {
        return this.ringtones.get(id) || this.ringtones.get(fallback);
    }

    /**
     * List all ringtones
     */
    list(): string[] {
        return Array.from(this.ringtones.keys());
    }
}

export const RingtoneRegistry = new RingtoneRegistryImpl();
