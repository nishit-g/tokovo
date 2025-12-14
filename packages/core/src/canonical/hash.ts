/**
 * Stable Hashing for Determinism Verification
 *
 * PROBLEM: JSON.stringify key order isn't guaranteed across transforms that reorder keys.
 * SOLUTION: stableStringify with sorted keys, then SHA-256 hash.
 *
 * This enables:
 * - CI determinism checks (same DSL → same hash)
 * - Regression detection (hash changed = something broke)
 * - Bug report reproducibility
 *
 * @module @tokovo/core/canonical/hash
 */

// =============================================================================
// STABLE STRINGIFY
// =============================================================================

/**
 * Stable JSON stringify with sorted keys.
 *
 * Guarantees: same data → same string → same hash.
 *
 * IMPORTANT: This function:
 * - Sorts object keys alphabetically
 * - Handles nested objects recursively
 * - Does NOT support Map, Set, or circular references
 *
 * @example
 * ```ts
 * const a = { b: 1, a: 2 };
 * const b = { a: 2, b: 1 };
 *
 * JSON.stringify(a) // '{"b":1,"a":2}' - key order depends on insertion
 * stableStringify(a) // '{"a":2,"b":1}' - always sorted
 * stableStringify(b) // '{"a":2,"b":1}' - same!
 * ```
 */
export function stableStringify(obj: unknown): string {
    return JSON.stringify(obj, stableReplacer);
}

/**
 * Custom replacer that sorts object keys.
 */
function stableReplacer(_key: string, value: unknown): unknown {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        // Handle Date objects
        if (value instanceof Date) {
            return value.toISOString();
        }

        // Handle Map (convert to sorted array of entries)
        if (value instanceof Map) {
            const entries = Array.from(value.entries());
            entries.sort(([a], [b]) => String(a).localeCompare(String(b)));
            return { __type: "Map", entries };
        }

        // Handle Set (convert to sorted array)
        if (value instanceof Set) {
            const items = Array.from(value);
            items.sort((a, b) => String(a).localeCompare(String(b)));
            return { __type: "Set", items };
        }

        // Sort object keys
        const sorted: Record<string, unknown> = {};
        const keys = Object.keys(value as Record<string, unknown>).sort();
        for (const k of keys) {
            sorted[k] = (value as Record<string, unknown>)[k];
        }
        return sorted;
    }
    return value;
}

/**
 * Pretty-print stable stringify (for debugging).
 */
export function stableStringifyPretty(obj: unknown): string {
    return JSON.stringify(JSON.parse(stableStringify(obj)), null, 2);
}

// =============================================================================
// HASHING
// =============================================================================

/**
 * Compute a deterministic hash of any data.
 *
 * Uses stable stringify + SHA-256.
 *
 * @example
 * ```ts
 * const hash = await computeHash({ foo: "bar" });
 * // "7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b"
 * ```
 */
export async function computeHash(data: unknown): Promise<string> {
    const json = stableStringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(json);

    // Use Web Crypto API (works in browser and Node.js 15+)
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Synchronous hash using a simple non-cryptographic algorithm.
 *
 * Use this for quick comparisons where cryptographic strength isn't needed.
 * For CI/determinism verification, use computeHash instead.
 */
export function computeHashSync(data: unknown): string {
    const json = stableStringify(data);
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
        const char = json.charCodeAt(i);
        hash = ((hash << 5) - hash + char) | 0;
    }
    // Convert to hex and ensure positive
    return (hash >>> 0).toString(16).padStart(8, "0");
}

// =============================================================================
// TIMELINE HASHING
// =============================================================================

import type { CanonicalRuntimeEvent } from "./device-events";

/**
 * Data structure for timeline hashing.
 * Only includes stable fields (no timestamps, no random IDs).
 */
export interface TimelineHashInput {
    episodeId: string;
    fps: number;
    durationInFrames: number;
    actors: ReadonlyArray<{ id: string; displayName: string }>;
    opCount: number;
}

/**
 * Data structure for event hashing.
 * Only includes deterministic fields.
 */
export interface EventHashInput {
    at: number;
    kind: string;
    type?: string;
    trace: {
        episodeId: string;
        deviceId: string;
        beatName: string;
        opIndex: number;
    };
}

/**
 * Extract hashable data from events.
 */
export function extractEventHashData(
    events: ReadonlyArray<CanonicalRuntimeEvent>
): EventHashInput[] {
    return events.map((e) => ({
        at: e.at,
        kind: e.kind,
        type: "type" in e ? String(e.type) : undefined,
        trace: {
            episodeId: e.trace.episodeId,
            deviceId: e.trace.deviceId,
            beatName: e.trace.beatName,
            opIndex: e.trace.opIndex,
        },
    }));
}

/**
 * Compute determinism hash for a compiled episode.
 *
 * This is the main function for CI verification.
 *
 * @example
 * ```ts
 * const hash = await computeDeterminismHash(timeline, events);
 * // Store in golden/episode-name.hash
 * // CI compares against stored hash
 * ```
 */
export async function computeDeterminismHash(
    timelineInfo: TimelineHashInput,
    events: ReadonlyArray<CanonicalRuntimeEvent>
): Promise<string> {
    const hashInput = {
        timeline: timelineInfo,
        events: extractEventHashData(events),
    };

    return computeHash(hashInput);
}

/**
 * Compare two hashes and provide diagnostic info.
 */
export function compareHashes(
    expected: string,
    actual: string
): { match: boolean; expected: string; actual: string } {
    return {
        match: expected === actual,
        expected,
        actual,
    };
}
