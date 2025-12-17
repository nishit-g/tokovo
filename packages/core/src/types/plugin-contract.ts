/**
 * TokovoPlugin Contract - Enterprise Plugin Interface
 * 
 * Tier A (Runtime): reducer + views + assets
 * Tier B (Lowering): + lowering handlers
 * Tier C (Authoring): + DSL helpers
 * Tier D (Compiler): + compile validators
 * 
 * @see docs/FUCKING_MESS.md Section 6
 */

import { RuntimeEvent, AppEventPayloads } from "./runtime-event";
import type { Platform } from "../tokens";
// =============================================================================
// PLUGIN REDUCER
// =============================================================================

/**
 * Plugin reducer signature
 * Uses Immer draft pattern - mutate directly
 */
export type PluginReducer<AppId extends string = string> = (
    draft: import("../types").WorldState,
    event: RuntimeEvent & { kind: "APP"; appId: AppId }
) => void;

// =============================================================================
// PLUGIN VIEWS
// =============================================================================

/**
 * View component props
 */
export interface PluginViewProps {
    world: import("../types").WorldState;
    deviceId: string;
    platform?: "ios" | "android";
    t?: number;
}

/**
 * View component type (React.FC in practice)
 */
export type PluginViewComponent = (props: PluginViewProps) => JSX.Element | null;

/**
 * Platform-specific view strategies
 */
export interface ViewStrategies {
    ios?: Record<string, PluginViewComponent>;
    android?: Record<string, PluginViewComponent>;
}

/**
 * Plugin views configuration
 */
export interface PluginViews {
    /** Main app root component */
    AppRoot: PluginViewComponent;

    /** Platform-specific component overrides */
    strategies?: ViewStrategies;

    /** Additional named components */
    [key: string]: PluginViewComponent | ViewStrategies | undefined;
}

// =============================================================================
// TIER B: LOWERING
// =============================================================================

/**
 * Context provided during lowering
 */
export interface LowerContext {
    frame: number;
    fps: number;
    deviceId: string;
    conversationId?: string;
}

/**
 * Lowering handler - converts TimelineOp to RuntimeEvent[]
 */
export interface LoweringHandler {
    /** Which TimelineOp kinds this handler processes */
    handles: string[];

    /** Convert TimelineOp to RuntimeEvent(s) */
    lower: (
        op: import("@tokovo/ir").TimelineOp,
        ctx: LowerContext
    ) => RuntimeEvent[];
}

// =============================================================================
// TIER B: LAYOUTS
// =============================================================================

/**
 * Layout strategy - computes layout for a view
 */
export interface PluginLayoutStrategy {
    /** View kind this strategy handles (e.g., "CHAT", "FEED") */
    viewKind: string;

    /** Optional platform filter */
    platforms?: Platform[];

    /** Compute layout for the given context */
    computeLayout: (ctx: unknown) => unknown;
}

// =============================================================================
// TIER C: DSL
// =============================================================================

/**
 * DSL API factory - creates scoped API for beat builder
 * 
 * Usage: b.use("app_whatsapp").receive("Sarah", "Hi")
 */
export interface DslExtension<Api = unknown> {
    /** Create DSL API for a beat builder (NO prototype mutation) */
    createApi: (builder: unknown) => Api;
}

// =============================================================================
// ANCHORS
// =============================================================================

/**
 * Anchor bounding box (normalized 0-1 coordinates)
 */
export interface AnchorBounds {
    x: number;      // Center X (0-1)
    y: number;      // Center Y (0-1)
    width: number;  // Width (0-1)
    height: number; // Height (0-1)
}

/**
 * Anchor provider function
 */
export type PluginAnchorProvider = (
    world: import("../types").WorldState,
    deviceId: string
) => AnchorBounds | null;

/**
 * Anchor registry for a plugin
 */
export interface PluginAnchorRegistry {
    providers: Record<string, PluginAnchorProvider>;
}

// =============================================================================
// NOTIFICATION ADAPTER
// =============================================================================

export interface PluginFormattedNotification {
    icon: string;
    color: string;
    title: string;
    body: string;
    subtitle?: string;
}

export interface PluginNotificationAdapter {
    format: (event: RuntimeEvent & { kind: "DEVICE"; type: "SHOW_NOTIFICATION" }) => PluginFormattedNotification;
}

// =============================================================================
// AUDIO RULES
// =============================================================================

export interface PluginAutoSoundRule {
    match: {
        kind: string;
        type?: string;
        appId?: string;
        from?: string | "*";
    };
    action: "PLAY_ONE_SHOT" | "START_LOOP" | "STOP_SOUND";
    sound?: string;
    stopId?: string;
    bus?: "voice" | "sfx" | "ui" | "music";
    volume?: number;
    idTemplate?: string;
    duckMusic?: boolean;
    loop?: boolean;
    priority?: number;
}

// =============================================================================
// TOKOVO PLUGIN (TIERED)
// =============================================================================

/**
 * Complete plugin contract
 * 
 * Tier A: id, version, displayName, reducer, views (REQUIRED)
 * Tier B: lowering (optional, required for DSL compilation)
 * Tier C: dsl (optional, provides b.use() API)
 * Tier D: compileHandlers (optional, advanced)
 */
export interface TokovoPluginContract<AppId extends string = string> {
    // === TIER A: Identity (REQUIRED) ===
    id: AppId;
    version: string;
    displayName: string;

    // === TIER A: Runtime (REQUIRED) ===
    reducer: PluginReducer<AppId>;
    views: PluginViews;

    // === TIER A: Assets (RECOMMENDED) ===
    assets?: {
        sounds?: Record<string, string>;
        icons?: Record<string, string>;
        images?: Record<string, string>;
    };

    // === TIER A: Audio (RECOMMENDED) ===
    audioRules?: PluginAutoSoundRule[];

    // === TIER A: Initial State ===
    createInitialState?: () => unknown;

    // === TIER B: Lowering (OPTIONAL) ===
    lowering?: LoweringHandler;

    // === TIER B: Layouts (OPTIONAL) ===
    layouts?: PluginLayoutStrategy[];

    // === TIER C: DSL (OPTIONAL) ===
    dsl?: DslExtension;

    // === TIER D: Compiler (OPTIONAL) ===
    compileHandlers?: unknown;

    // === Camera Anchors ===
    anchors?: PluginAnchorRegistry;

    // === Notifications ===
    notificationAdapter?: PluginNotificationAdapter;
}

// =============================================================================
// TYPE HELPERS
// =============================================================================

/**
 * Extract plugin tier from interface
 */
export type PluginTier<P extends TokovoPluginContract> =
    P extends { compileHandlers: unknown } ? "D" :
    P extends { dsl: unknown } ? "C" :
    P extends { lowering: unknown } ? "B" :
    "A";

/**
 * Minimum viable plugin (Tier A only)
 */
export type MinimalPlugin<AppId extends string = string> = Pick<
    TokovoPluginContract<AppId>,
    "id" | "version" | "displayName" | "reducer" | "views"
>;
