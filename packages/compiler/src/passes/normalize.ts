/**
 * Normalize Pass
 * 
 * Expands sugar syntax in Scene IR:
 * - typing.for("2s") is already expanded by DSL
 * - Future: other sugar transformations
 * 
 * This pass is a pure transformation.
 */

import { SceneOp, ConcurrentOp } from "@tokovo/ir";

/**
 * Normalize a list of scene operations.
 * Currently a pass-through since DSL handles expansion.
 */
export function normalize(ops: SceneOp[]): SceneOp[] {
    return ops.map(normalizeOp);
}

/**
 * Normalize a single operation.
 */
function normalizeOp(op: SceneOp): SceneOp {
    if (op.kind === "Concurrent") {
        // Recursively normalize tracks
        return {
            ...op,
            tracks: op.tracks.map(track => normalize(track)),
        };
    }

    // All other ops pass through unchanged
    return op;
}
