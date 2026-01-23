/**
 * Reducer Registry - Manages app and device reducers
 *
 * @description Registry for plugin reducers. Apps self-register their handlers.
 */

import type { WorldState, TimelineEvent, DeviceState } from "../types";
import { EngineLogger } from "./logger";

// =============================================================================
// REDUCER TYPES
// =============================================================================

/** Device reducer type */
export type DeviceReducer = (
  state: Record<string, DeviceState>,
  event: TimelineEvent,
) => Record<string, DeviceState>;

/** App reducer type (mutates draft via Immer) */
export type AppReducer = (draft: WorldState, event: TimelineEvent) => void;

/** Feature reducer type */
export type FeatureReducer = (
  draft: WorldState,
  event: TimelineEvent,
  index?: number,
) => void;

// =============================================================================
// REDUCER REGISTRY
// =============================================================================

/**
 * ReducerRegistry - Manages app and device reducers.
 *
 * Apps self-register their event handlers via this registry.
 * The engine dispatches events to the appropriate registered reducers.
 */
class ReducerRegistryClass {
  private _deviceReducer: DeviceReducer | null = null;
  private _appReducers = new Map<string, AppReducer>();
  private _featureReducers = new Map<string, FeatureReducer>();
  private _eventKindToAppId = new Map<string, string>();

  /**
   * Register a device reducer (handles DEVICE events)
   */
  registerDeviceReducer(reducer: DeviceReducer): void {
    this._deviceReducer = reducer;
  }

  /**
   * Register an app reducer (handles APP events for a specific appId)
   */
  registerAppReducer(appId: string, reducer: AppReducer): void {
    if (this._appReducers.has(appId)) {
      EngineLogger.warn(`Overwriting reducer for ${appId}`);
    }
    this._appReducers.set(appId, reducer);
  }

  /**
   * Register a generic feature reducer (handles specific event kinds like KEYBOARD, AUDIO)
   */
  registerFeatureReducer(kind: string, reducer: FeatureReducer): void {
    this._featureReducers.set(kind, reducer);
  }

  /**
   * Get the device reducer
   */
  get deviceReducer(): DeviceReducer | null {
    return this._deviceReducer;
  }

  /**
   * Get an app reducer by appId
   */
  getAppReducer(appId: string): AppReducer | undefined {
    return this._appReducers.get(appId);
  }

  /**
   * Get a feature reducer by kind
   */
  getFeatureReducer(kind: string): FeatureReducer | undefined {
    return this._featureReducers.get(kind);
  }

  /**
   * Check if an app reducer is registered
   */
  hasAppReducer(appId: string): boolean {
    return this._appReducers.has(appId);
  }

  /**
   * Get all registered app IDs
   */
  getRegisteredApps(): string[] {
    return Array.from(this._appReducers.keys());
  }

  /**
   * Register event kinds for an app (used by engine to route events)
   */
  registerEventKinds(appId: string, kinds: readonly string[]): void {
    for (const kind of kinds) {
      if (this._eventKindToAppId.has(kind)) {
        const existingApp = this._eventKindToAppId.get(kind);
        EngineLogger.warn(
          `Event kind "${kind}" already registered by ${existingApp}, overwriting with ${appId}`,
        );
      }
      this._eventKindToAppId.set(kind, appId);
    }
  }

  /**
   * Check if an event kind is registered to any app
   */
  isAppEventKind(kind: string): boolean {
    return this._eventKindToAppId.has(kind);
  }

  /**
   * Get the app ID that handles a given event kind
   */
  getAppIdForEventKind(kind: string): string | undefined {
    return this._eventKindToAppId.get(kind);
  }

  /**
   * Get all registered event kinds for an app
   */
  getEventKindsForApp(appId: string): string[] {
    const kinds: string[] = [];
    for (const [kind, id] of this._eventKindToAppId) {
      if (id === appId) kinds.push(kind);
    }
    return kinds;
  }

  /**
   * Legacy compatibility - access appReducers as object
   */
  get appReducers(): Record<string, AppReducer> {
    return Object.fromEntries(this._appReducers);
  }
}

export const ReducerRegistry = new ReducerRegistryClass();
