/**
 * Anchor Types - Semantic camera targeting
 * 
 * @module device-camera/anchors/types
 */

// =============================================================================
// CORE TYPES
// =============================================================================

/**
 * A rectangle in pixel coordinates relative to device viewport.
 */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Framing configuration for how to frame an anchor in the camera view.
 */
export interface AnchorFraming {
    /** Where in the rect to focus (0-1 normalized). Default: (0.5, 0.5) = center */
    anchorPoint: { x: number; y: number };

    /** Padding around target in pixels */
    paddingPx?: number;

    /** How much of the viewport the target should fill (0-1). Default: 0.6 */
    targetFill?: number;
}

/**
 * Snapshot of all anchors available at a point in time.
 */
export interface AnchorSnapshot {
    /** Map of anchor name to its current rect */
    anchors: Record<string, Rect>;

    /** Device ID this snapshot is for */
    deviceId: string;

    /** App ID that provided these anchors */
    appId: string;
}

/**
 * Resolved anchor with fallback handling.
 */
export interface ResolvedAnchor {
    /** The resolved rectangle */
    rect: Rect;

    /** Which anchor was actually used (may differ from requested if fallback) */
    anchor: string;

    /** Whether this is a fallback */
    isFallback: boolean;
}

// =============================================================================
// ANCHOR PROVIDER INTERFACE
// =============================================================================

/**
 * Interface that apps implement to provide camera anchors.
 * 
 * Each app (WhatsApp, Twitter, etc.) implements this to expose
 * semantic regions that the camera can focus on.
 */
export interface AnchorProvider {
    /** App ID */
    appId: string;

    /** Static framing configuration per anchor type */
    framing: Record<string, AnchorFraming>;

    /**
     * Extract anchors from current world state and layout.
     * Called every frame during rendering.
     */
    getAnchors(
        world: unknown,
        layout: unknown,
        deviceId: string
    ): AnchorSnapshot;
}

// =============================================================================
// SEMANTIC ANCHOR IDS
// =============================================================================

/**
 * Well-known semantic anchor IDs used across applications.
 * Apps can define their own but these are standardized.
 */
export type SemanticAnchorId =
    | "device"           // Full device frame
    | "app"              // Current app (full screen minus status bar)
    | "header"           // App header/navigation bar
    | "content"          // Main content area
    | "inputArea"        // Text input area
    | "lastMessage"      // Most recent message in chat
    | "typingIndicator"  // Typing indicator area
    | "notification"     // Notification region
    | string;            // Custom anchors

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULT_FRAMING: AnchorFraming = {
    anchorPoint: { x: 0.5, y: 0.5 },
    paddingPx: 20,
    targetFill: 0.6,
};

export const EMPTY_SNAPSHOT: AnchorSnapshot = {
    anchors: {},
    deviceId: "",
    appId: "",
};
