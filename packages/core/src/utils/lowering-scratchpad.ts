/**
 * Lowering Scratchpad
 *
 * Shared helper for plugin lowerers to keep per-compilation state.
 *
 * Why:
 * - Prevent cross-episode leaks (WeakMap keyed by lowering context object)
 * - Avoid duplicating "WeakMap boilerplate" across app packages
 * - Keeps state scoped to compilation, not process lifetime
 */

const storeByCtx = new WeakMap<object, Map<string, unknown>>();
const fallbackStore = new Map<string, unknown>();

function getStore(ctx: unknown): Map<string, unknown> {
  if (!ctx || typeof ctx !== "object") return fallbackStore;
  const key = ctx as object;
  const existing = storeByCtx.get(key);
  if (existing) return existing;
  const created = new Map<string, unknown>();
  storeByCtx.set(key, created);
  return created;
}

export function getLoweringScratchpad<T extends object>(
  ctx: unknown,
  namespace: string,
  init: () => T,
): T {
  const store = getStore(ctx);
  const existing = store.get(namespace) as T | undefined;
  if (existing) return existing;
  const created = init();
  store.set(namespace, created);
  return created;
}

