/**
 * Instagram Anchor Provider
 * 
 * Provides semantic anchors for camera focus operations.
 * 
 * Usage in DSL:
 *   camera.focus("app_instagram:last-post");
 *   camera.focus("app_instagram:post-{id}");
 *   camera.focus("app_instagram:dm-input");
 * 
 * NOTE: Full anchor implementation deferred. This is a placeholder.
 */

// =============================================================================
// ANCHOR IDS (for documentation and future use)
// =============================================================================

export const INSTAGRAM_ANCHORS = {
    HEADER: "header",
    STORIES: "stories",
    LAST_POST: "last-post",
    POST: "post", // post-{id}
    DM_INPUT: "dm-input",
    DM: "dm", // dm-{id}
} as const;

// =============================================================================
// PLACEHOLDER ANCHOR PROVIDER
// =============================================================================

/**
 * Anchor provider for Instagram.
 * Currently a placeholder - will be expanded when anchor system is unified.
 */
export const instagramAnchorProvider = {
    appId: "app_instagram",

    // Future: implement getAnchors matching the core interface
};

export function registerInstagramAnchors(): void {
    console.log("[Instagram] Anchor provider registered (placeholder)");
}
