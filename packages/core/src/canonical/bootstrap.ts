/**
 * Remotion Bootstrap Contract
 *
 * Rules for Remotion compatibility:
 * 1. No side effects on import (Remotion imports files multiple times)
 * 2. Deterministic engine creation (same inputs → same outputs)
 * 3. SSR-safe views (no window/document access at module level)
 *
 * @module @tokovo/core/canonical/bootstrap
 */

import type { AppPlugin } from "./plugin-registry";

// =============================================================================
// BOOTSTRAP RULES
// =============================================================================

/**
 * Bootstrap rules that all plugins must follow.
 */
export interface BootstrapRules {
    /** No side effects on import */
    readonly noSideEffects: boolean;
    /** All state is derived from inputs */
    readonly deterministicCreation: boolean;
    /** No browser-only APIs at module level */
    readonly ssrSafe: boolean;
}

export const BOOTSTRAP_RULES: BootstrapRules = {
    noSideEffects: true,
    deterministicCreation: true,
    ssrSafe: true,
};

// =============================================================================
// BOOTSTRAP VALIDATION
// =============================================================================

/**
 * Bootstrap validation result.
 */
export interface BootstrapValidationResult {
    readonly valid: boolean;
    readonly warnings: string[];
    readonly errors: string[];
}

/**
 * Validate a plugin follows bootstrap contract.
 *
 * This is a best-effort check. Some violations can only be detected at runtime.
 */
export function validatePluginBootstrap(plugin: AppPlugin): BootstrapValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check required fields
    if (!plugin.id) {
        errors.push("Plugin missing required 'id' field");
    }

    if (!plugin.name) {
        errors.push("Plugin missing required 'name' field");
    }

    if (!plugin.reducer) {
        errors.push("Plugin missing required 'reducer' field");
    }

    if (!plugin.view) {
        errors.push("Plugin missing required 'view' field");
    }

    if (!plugin.schema) {
        warnings.push("Plugin missing 'schema' - will use default schema");
    }

    // Check ID format
    if (plugin.id && !plugin.id.startsWith("app_")) {
        warnings.push(`Plugin ID "${plugin.id}" should start with "app_" prefix`);
    }

    // Check version format
    if (plugin.version && !/^\d+\.\d+\.\d+/.test(plugin.version)) {
        warnings.push(`Plugin version "${plugin.version}" should be semver format`);
    }

    // Check for dangerous patterns in reducer (basic heuristics)
    if (plugin.reducer) {
        const reducerStr = plugin.reducer.toString();

        if (reducerStr.includes("Math.random")) {
            errors.push("Reducer contains Math.random() - breaks determinism");
        }

        if (reducerStr.includes("Date.now")) {
            errors.push("Reducer contains Date.now() - breaks determinism");
        }

        if (reducerStr.includes("window.") || reducerStr.includes("document.")) {
            warnings.push("Reducer references window/document - may break SSR");
        }
    }

    return {
        valid: errors.length === 0,
        warnings,
        errors,
    };
}

// =============================================================================
// BOOTSTRAP DOCUMENTATION
// =============================================================================

/**
 * Documentation for plugin authors.
 */
export const BOOTSTRAP_DOCS = `
# Tokovo Plugin Bootstrap Contract

Your plugin must follow these rules for Remotion compatibility:

## 1. No Side Effects on Import

❌ DON'T:
\`\`\`typescript
// Top-level side effect
console.log("Plugin loaded");
const startTime = Date.now();
\`\`\`

✅ DO:
\`\`\`typescript
// Pure exports
export const MyPlugin = defineAppPlugin({ ... });
\`\`\`

## 2. Deterministic Creation

❌ DON'T:
\`\`\`typescript
const id = Math.random().toString(36);
const timestamp = Date.now();
\`\`\`

✅ DO:
\`\`\`typescript
const id = idGenerator.messageId(deviceId, convId, opIndex);
const timestamp = event.trace.opIndex; // from trace
\`\`\`

## 3. SSR-Safe Views

❌ DON'T:
\`\`\`typescript
// At module level
const width = window.innerWidth;
\`\`\`

✅ DO:
\`\`\`typescript
// Inside component
function MyView() {
  const [width, setWidth] = useState(0);
  useEffect(() => setWidth(window.innerWidth), []);
}
\`\`\`

## Why These Rules?

Remotion:
- Imports files multiple times during render
- Renders on server (Node.js) for video encoding
- Needs deterministic output for caching

Breaking these rules will cause:
- Different renders on each run
- SSR crashes
- Broken video encoding
`;

// =============================================================================
// BOOTSTRAP HELPERS
// =============================================================================

/**
 * Create a safe ID using deterministic inputs.
 */
export function safeId(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}_${parts.join("_")}`;
}

/**
 * Get current time from context (not Date.now).
 */
export function getTimeFromContext(trace: { opIndex: number }, fps: number): number {
    return trace.opIndex / fps;
}

/**
 * Check if running in browser (for SSR-safe code).
 */
export function isBrowser(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * SSR-safe window access.
 */
export function safeWindow<T>(accessor: () => T, fallback: T): T {
    if (isBrowser()) {
        try {
            return accessor();
        } catch {
            return fallback;
        }
    }
    return fallback;
}
