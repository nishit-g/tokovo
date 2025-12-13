/**
 * Deterministic Ordering Contract
 * 
 * Same-frame operations are sorted by:
 *   (at, phase, priority, trackId, sceneOpIndex)
 * 
 * This guarantees:
 * - No randomness
 * - Stable refactors
 * - DirectorLite consistency
 */

import { TimelineOp } from "./timeline";

// =============================================================================
// PHASES
// =============================================================================

/**
 * Execution phases determine order within the same frame.
 * Lower phase number = earlier execution.
 */
export enum Phase {
    /** Device operations (unlock, lock) */
    DEVICE = 0,

    /** Navigation (open app, goto conversation) */
    NAV = 10,

    /** App operations (typing, messages, read, delete) */
    APP = 20,

    /** Effects (optional, reserved for future) */
    FX = 30,
}

/**
 * Get phase for a timeline operation.
 */
export function getPhase(op: TimelineOp): Phase {
    switch (op.kind) {
        case "DeviceUnlocked":
            return Phase.DEVICE;
        case "AppOpened":
        case "ConversationOpened":
            return Phase.NAV;
        case "TypingStarted":
        case "TypingEnded":
        case "MessageReceived":
        case "MessageSent":
        case "MessageRead":
        case "MessageDeleted":
            return Phase.APP;
        default:
            return Phase.FX;
    }
}

// =============================================================================
// PRIORITY WITHIN PHASE
// =============================================================================

/**
 * Get priority within phase.
 * Lower number = earlier execution.
 */
export function getPriority(op: TimelineOp): number {
    switch (op.kind) {
        case "TypingStarted":
            return 0;
        case "MessageReceived":
        case "MessageSent":
            return 10;
        case "TypingEnded":
            return 20;
        case "MessageRead":
            return 30;
        case "MessageDeleted":
            return 40;
        default:
            return 50;
    }
}

// =============================================================================
// CANONICAL SORT
// =============================================================================

/**
 * Compare function for deterministic ordering.
 * Sorts by: (at, phase, priority, trackId, sceneOpIndex)
 */
export function compareOps(a: TimelineOp, b: TimelineOp): number {
    // 1. By frame
    if (a.at !== b.at) return a.at - b.at;

    // 2. By phase
    const phaseA = getPhase(a);
    const phaseB = getPhase(b);
    if (phaseA !== phaseB) return phaseA - phaseB;

    // 3. By priority within phase
    const prioA = getPriority(a);
    const prioB = getPriority(b);
    if (prioA !== prioB) return prioA - prioB;

    // 4. By track ID (string comparison)
    if (a.trace.trackId !== b.trace.trackId) {
        return a.trace.trackId.localeCompare(b.trace.trackId);
    }

    // 5. By scene op index
    return a.trace.sceneOpIndex - b.trace.sceneOpIndex;
}

/**
 * Sort timeline operations in canonical order.
 * Returns a new sorted array.
 */
export function sortOps(ops: TimelineOp[]): TimelineOp[] {
    return [...ops].sort(compareOps);
}
