/**
 * Registry Factory - Generic registry pattern
 *
 * @description Single factory for all registries. DRY principle.
 * Used by app, sound, widget, behavior, and metadata registries.
 */

/**
 * Creates a type-safe registry with standard operations.
 *
 * @param name - Name of the registry (for logging)
 * @returns Registry with register, get, has, keys, values, clear methods
 *
 * @example
 * const AppRegistry = createRegistry<string, AppConfig>("App");
 * AppRegistry.register("whatsapp", config);
 * const app = AppRegistry.get("whatsapp");
 */
export function createRegistry<K extends string | symbol, V>(name: string) {
  const items = new Map<K, V>();

  return {
    /**
     * Register an item
     */
    register(key: K, value: V): void {
      if (items.has(key)) {
        console.warn(`[${name}Registry] Overwriting ${String(key)}`);
      }
      items.set(key, value);
    },

    /**
     * Get an item by key
     */
    get(key: K): V | undefined {
      return items.get(key);
    },

    /**
     * Check if key exists
     */
    has(key: K): boolean {
      return items.has(key);
    },

    delete(key: K): boolean {
      return items.delete(key);
    },

    keys(): K[] {
      return Array.from(items.keys());
    },

    /**
     * Get all values
     */
    values(): V[] {
      return Array.from(items.values());
    },

    /**
     * Get all entries as record
     */
    entries(): Record<string, V> {
      return Object.fromEntries(items) as Record<string, V>;
    },

    /**
     * Clear all items
     */
    clear(): void {
      items.clear();
    },

    /**
     * Get count of registered items
     */
    get size(): number {
      return items.size;
    },
  };
}

/**
 * Type helper for registry return type
 */
export type Registry<K extends string | symbol, V> = ReturnType<
  typeof createRegistry<K, V>
>;
