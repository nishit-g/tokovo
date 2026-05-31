/**
 * TokovoPlugin Contract - Production Plugin Interface
 *
 * Tier A (Runtime): reducer + views + assets
 * Tier B (Lowering): + lowering handlers
 * Tier C (Authoring): + DSL helpers
 * Tier D (Compiler): + compile validators
 *
 * @see docs/architecture/core-runtime.md
 */

import { RuntimeEvent } from "./runtime-event.js";
import type { Platform } from "../tokens.js";
import type { AnchorFraming } from "./anchor.js";
import type { LayoutContext, LayoutState, ViewKind } from "./layout.js";
import type { AnchorProvider } from "./anchor.js";
import type { PluginAssetCollector } from "./asset-ref.js";

export interface PluginBootstrapValidationResult {
  errors?: string[];
  warnings?: string[];
}

export interface PluginBootstrapMigrationResult<TValue = unknown> {
  version: number;
  value: TValue;
}

export interface PluginBootstrapSchemaContext<AppId extends string = string> {
  appId: AppId;
  version: number;
  value: unknown;
  context: PluginBootstrapContext<AppId>;
}

export interface PluginBootstrapSchemaContract<AppId extends string = string> {
  currentVersion: number;
  migrate?: (
    input: PluginBootstrapSchemaContext<AppId>,
  ) => PluginBootstrapMigrationResult;
  validate?: (
    input: PluginBootstrapSchemaContext<AppId>,
  ) => PluginBootstrapValidationResult;
}

export interface PluginBootstrapContext<AppId extends string = string> {
  appId: AppId;
  deviceId: string;
  device: import("@tokovo/ir").DeviceConfig;
  ir: import("@tokovo/ir").TrackEpisodeIR;
  baseState: InitialStateForApp<AppId>;
  snapshot?: import("@tokovo/ir").AppSnapshotEntry<AppId>;
  initialView?: import("@tokovo/ir").AppInitialViewEntry<AppId>;
}

export interface PluginBootstrapContract<AppId extends string = string> {
  snapshot?: PluginBootstrapSchemaContract<AppId>;
  view?: PluginBootstrapSchemaContract<AppId>;
  hydrate: (
    context: PluginBootstrapContext<AppId>,
  ) => InitialStateForApp<AppId>;
  validate?: (
    context: PluginBootstrapContext<AppId>,
  ) => PluginBootstrapValidationResult;
}
// =============================================================================
// LAYOUT CONSTANTS - App-specific UI metrics
// =============================================================================

export interface PluginLayoutConstants {
  headerHeight?: number;
  footerHeight?: number;
  safeAreaInsets?: { top: number; bottom: number };
  statusBarHeight?: number;
  navigationBarHeight?: number;
}

// =============================================================================
// EVENT KIND REGISTRY - Extensible via module augmentation
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppEventKindRegistry {
  // Plugins augment this: app_whatsapp: "MessageReceived" | "MessageSent" | ...
}

type EventKindsForApp<AppId extends string> =
  AppId extends keyof AppEventKindRegistry
    ? readonly AppEventKindRegistry[AppId][]
    : readonly string[];

// =============================================================================
// APP STATE REGISTRY - Extensible via module augmentation
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppInitialStateRegistry {
  // Plugins augment this: app_whatsapp: WhatsAppState
}

type InitialStateForApp<AppId extends string> =
  AppId extends keyof AppInitialStateRegistry
    ? AppInitialStateRegistry[AppId]
    : unknown;

// =============================================================================
// PLUGIN REDUCER
// =============================================================================

/**
 * Plugin reducer signature
 * Uses Immer draft pattern - mutate directly
 */
export type PluginReducer<AppId extends string = string> = (
  draft: import("../types").WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: AppId },
) => void;

// =============================================================================
// PLUGIN VIEWS
// =============================================================================

/**
 * View component props
 */
export interface PluginViewProps {
  world: import("../types").WorldState;
  deviceId?: string;
  platform?: "ios" | "android";
  t?: number;
}

/**
 * View component type (UI component in practice)
 */
export type UIComponent<Props = unknown> = (props: Props) => unknown;

export type PluginViewComponent = UIComponent<PluginViewProps>;

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
 * Lowering handler - converts TrackEvent to RuntimeEvent[]
 */
export interface LoweringHandler {
  /** Which TrackEvent kinds this handler processes */
  handles: string[];

  /** Convert TrackEvent to RuntimeEvent(s) */
  lower: (
    op: import("@tokovo/ir").TrackEvent,
    ctx: LowerContext,
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
  viewKind: ViewKind;

  /** Optional platform filter */
  platforms?: Platform[];

  /** Compute layout for the given context */
  computeLayout: (ctx: LayoutContext) => LayoutState;
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
  x: number; // Center X (0-1)
  y: number; // Center Y (0-1)
  width: number; // Width (0-1)
  height: number; // Height (0-1)
}

/**
 * Anchor provider function
 */
export type PluginAnchorProvider = (
  world: import("../types").WorldState,
  deviceId: string,
) => AnchorBounds | null;

/**
 * Anchor registry for a plugin
 */
export interface PluginAnchorRegistry {
  providers: Record<string, PluginAnchorProvider>;
  framing?: Record<string, AnchorFraming>;
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
  format: (
    notification: import("../types/notification").Notification,
  ) => PluginFormattedNotification;
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
  bus?: "voice" | "sfx" | "ui" | "music" | "master";
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
  themeColor?: string;
  icon?: string;

  // === TIER A: Runtime (REQUIRED) ===
  reducer: PluginReducer<AppId>;
  views: PluginViews;

  // === TIER A: Event Routing (REQUIRED for v2 apps) ===
  eventKinds?: EventKindsForApp<AppId>;

  // === TIER A: Assets (RECOMMENDED) ===
  assets?: {
    sounds?: Record<string, string>;
    icons?: Record<string, string>;
    images?: Record<string, string>;
    designWidth?: number;
  };

  // === TIER A: Audio (RECOMMENDED) ===
  audioRules?: PluginAutoSoundRule[];

  // === TIER A: Layout Constants (RECOMMENDED) ===
  layoutConstants?: PluginLayoutConstants;

  // === TIER A: Initial State ===
  createInitialState?: () => InitialStateForApp<AppId>;
  bootstrap?: PluginBootstrapContract<AppId>;

  // === TIER B: Lowering (OPTIONAL) ===
  lowering?: LoweringHandler;

  // === TIER B: Layouts (OPTIONAL) ===
  layouts?: PluginLayoutStrategy[];

  // === TIER C: DSL (OPTIONAL) ===
  dsl?: DslExtension;

  // === TIER D: Compiler (OPTIONAL) ===
  compileHandlers?: unknown;
  collectAssetRefs?: PluginAssetCollector<AppId>;

  // === Camera Anchors ===
  anchors?: PluginAnchorRegistry;
  /**
   * Full anchor provider (layout-aware). Prefer this over `anchors` when you
   * need semantic/layout-driven anchor rects (not just normalized bounds).
   */
  anchorProvider?: AnchorProvider;

  // === Notifications ===
  notificationAdapter?: PluginNotificationAdapter;
}

// =============================================================================
// TYPE HELPERS
// =============================================================================

/**
 * Extract plugin tier from interface
 */
export type PluginTier<P extends TokovoPluginContract> = P extends {
  compileHandlers: unknown;
}
  ? "D"
  : P extends { dsl: unknown }
    ? "C"
    : P extends { lowering: unknown }
      ? "B"
      : "A";

/**
 * Minimum viable plugin (Tier A only)
 */
export type MinimalPlugin<AppId extends string = string> = Pick<
  TokovoPluginContract<AppId>,
  "id" | "version" | "displayName" | "reducer" | "views"
>;
