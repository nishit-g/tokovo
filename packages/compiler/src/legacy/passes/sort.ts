/**
 * Sort Pass
 * 
 * Sorts Timeline IR operations in canonical order.
 * Uses the ordering contract defined in @tokovo/ir.
 */

import { TimelineOp, sortOps } from "@tokovo/ir";

/**
 * Sort timeline operations in canonical order.
 */
export function sort(ops: TimelineOp[]): TimelineOp[] {
    return sortOps(ops);
}
