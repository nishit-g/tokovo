/**
 * Deterministic Event Ordering
 *
 * Defines the stable sort order for canonical events.
 *
 * PROBLEM: Multiple events at the same `at` frame → undefined order → flaky renders.
 * SOLUTION: Deterministic sort key based on (at, kindPriority, typePriority, deviceId, appId, opIndex).
 *
 * This guarantees: Same events → Same order → Same hash → Reproducible renders.
 *
 * @module @tokovo/core/canonical/ordering
 */

import type { AppRuntimeEvent, AppEventType } from "./events";
import type { CanonicalRuntimeEvent } from "./device-events";

// =============================================================================
// KIND PRIORITY
// =============================================================================

/**
 * Event kind priority for deterministic ordering.
 * Lower number = processed first.
 *
 * RATIONALE:
 * - OS events (time, battery) set system state first
 * - DEVICE events (unlock, open app) establish context
 * - APP events are the main content
 * - CALL events overlay on apps
 * - CAMERA effects are applied after content is rendered
 * - AUDIO is last (doesn't block visual render)
 */
export const KIND_PRIORITY: Record<CanonicalRuntimeEvent["kind"], number> = {
    OS: 0,
    DEVICE: 1,
    APP: 2,
    CALL: 3,
    CAMERA: 4,
    AUDIO: 5,
    TOUCH: 6,
};

// =============================================================================
// APP TYPE PRIORITY
// =============================================================================

/**
 * App event type priority within APP kind.
 * Lower number = processed first.
 *
 * RATIONALE:
 * - NAVIGATE before content (must be on right screen)
 * - MESSAGE before TYPING (typing is a response indicator)
 * - READ/REACTION after messages (they reference existing messages)
 * - CUSTOM last (escape hatch, lowest priority)
 */
export const APP_TYPE_PRIORITY: Partial<Record<AppEventType, number>> = {
    // Navigation first
    NAVIGATE: 0,

    // Content events
    MESSAGE: 1,
    FEED_ITEM: 1,
    FEED_SCROLL: 1,
    STORY_ITEM: 1,
    COMMENT: 2,

    // Status/indicator events
    TYPING: 3,

    // Interaction events (on existing content)
    READ: 4,
    REACTION: 5,
    FEED_ACTION: 5,
    STORY_VIEW: 6,

    // Social events
    SOCIAL: 7,

    // Escape hatch (lowest priority)
    CUSTOM: 99,
};

// =============================================================================
// SORT KEY
// =============================================================================

/**
 * Compute a stable sort key for an event.
 *
 * Sort order: (at, kindPriority, appTypePriority, deviceId, appId, trace.opIndex)
 *
 * This guarantees: same events → same order → same hash → determinism.
 *
 * @example
 * ```ts
 * const key = eventSortKey(event);
 * // "0000000060_2_01_phone_app_whatsapp_000001"
 * ```
 */
export function eventSortKey(event: CanonicalRuntimeEvent): string {
    // Frame number (padded to 10 digits - supports up to 16 million frames = 148 hours at 30fps)
    const at = String(event.at).padStart(10, "0");

    // Kind priority
    const kindPriority = KIND_PRIORITY[event.kind] ?? 99;

    // Type priority (only for APP events)
    let typePriority = 0;
    if (event.kind === "APP") {
        typePriority = APP_TYPE_PRIORITY[event.type] ?? 99;
    }
    const typePriorityStr = String(typePriority).padStart(2, "0");

    // Device ID (for ordering within same frame/kind/type)
    let deviceId = "";
    if ("deviceId" in event && typeof event.deviceId === "string") {
        deviceId = event.deviceId;
    }

    // App ID (for ordering within same device)
    let appId = "";
    if (event.kind === "APP") {
        appId = event.appId;
    }

    // Operation index from trace (for ordering within same app)
    const opIndex = String(event.trace.opIndex).padStart(6, "0");

    return `${at}_${kindPriority}_${typePriorityStr}_${deviceId}_${appId}_${opIndex}`;
}

// =============================================================================
// SORTING
// =============================================================================

/**
 * Sort events deterministically.
 *
 * IMPORTANT: This creates a NEW array. Original is not modified.
 *
 * @example
 * ```ts
 * const sorted = sortEventsDeterministic(events);
 * // Events are now in stable, reproducible order
 * ```
 */
export function sortEventsDeterministic(
    events: ReadonlyArray<CanonicalRuntimeEvent>
): CanonicalRuntimeEvent[] {
    return [...events].sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)));
}

/**
 * Sort events in place (mutates the array).
 *
 * Use this only when you know the array is mutable and
 * performance matters (avoids array copy).
 */
export function sortEventsDeterministicInPlace(events: CanonicalRuntimeEvent[]): void {
    events.sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)));
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Check if events are in deterministic order.
 *
 * @returns true if events are sorted correctly
 */
export function isEventOrderValid(events: ReadonlyArray<CanonicalRuntimeEvent>): boolean {
    for (let i = 1; i < events.length; i++) {
        const prev = eventSortKey(events[i - 1]);
        const curr = eventSortKey(events[i]);
        if (prev.localeCompare(curr) > 0) {
            return false;
        }
    }
    return true;
}

/**
 * Find the first pair of events that are out of order.
 *
 * @returns [index, event1, event2] or null if properly sorted
 */
export function findOrderingViolation(
    events: ReadonlyArray<CanonicalRuntimeEvent>
): [number, CanonicalRuntimeEvent, CanonicalRuntimeEvent] | null {
    for (let i = 1; i < events.length; i++) {
        const prev = eventSortKey(events[i - 1]);
        const curr = eventSortKey(events[i]);
        if (prev.localeCompare(curr) > 0) {
            return [i, events[i - 1], events[i]];
        }
    }
    return null;
}
