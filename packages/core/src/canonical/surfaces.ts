/**
 * Canonical Surface Model (Minimal Contract)
 *
 * Core defines the SHAPE of surfaces.
 * Plugins interpret and extend per their UI.
 *
 * A "surface" is where the user is looking within an app:
 * - Chat screen, chat list, feed, stories, profile, etc.
 *
 * @module @tokovo/core/canonical/surfaces
 */

// =============================================================================
// SURFACE TYPES
// =============================================================================

/**
 * Generic screen types.
 *
 * Core defines common types. Apps can use string literals for custom screens.
 */
export type ScreenType =
    | "home"
    | "chat"
    | "chatList"
    | "feed"
    | "profile"
    | "explore"
    | "notifications"
    | "settings"
    | "compose"
    | "stories"
    | "reels"
    | "search"
    | "thread"
    | "calls"
    | string; // Extensible for app-specific screens

// =============================================================================
// SURFACE CONTRACT
// =============================================================================

/**
 * A surface represents the current view context.
 */
export interface Surface {
    /** Screen type */
    readonly type: ScreenType;
    /** Context ID (conversationId, postId, userId, etc.) */
    readonly id?: string;
}

/**
 * Surface state tracks navigation history.
 */
export interface SurfaceState {
    /** Current surface */
    readonly current: Surface;
    /** Navigation history (for back navigation) */
    readonly history: ReadonlyArray<Surface>;
}

// =============================================================================
// SURFACE HELPERS
// =============================================================================

/**
 * Create initial surface state.
 */
export function createSurfaceState(initial: Surface): SurfaceState {
    return {
        current: initial,
        history: [],
    };
}

/**
 * Navigate to a new surface (push to history).
 */
export function navigateTo(state: SurfaceState, surface: Surface): SurfaceState {
    return {
        current: surface,
        history: [...state.history, state.current].slice(-10), // Keep last 10
    };
}

/**
 * Go back to previous surface (pop from history).
 */
export function goBack(state: SurfaceState): SurfaceState {
    if (state.history.length === 0) {
        return state; // Nothing to go back to
    }

    const history = [...state.history];
    const previous = history.pop()!;

    return {
        current: previous,
        history,
    };
}

/**
 * Check if can go back.
 */
export function canGoBack(state: SurfaceState): boolean {
    return state.history.length > 0;
}
