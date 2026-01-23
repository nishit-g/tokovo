/**
 * App Registry - Maps app IDs to their React view components
 *
 * @description Uses createRegistry factory for DRY pattern.
 * Apps self-register their components here.
 */

import React from "react";
import { WorldState, LayoutState } from "../types";
import { createRegistry } from "./factory";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Props that all app view components receive
 */
export interface AppViewProps {
  world: WorldState;
  t?: number;
  layout?: LayoutState;
  platform?: "ios" | "android";
  deviceId?: string;
  width?: number;
  height?: number;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export type AppViewComponent = (
  props: AppViewProps,
) => React.ReactElement | null;

// =============================================================================
// REGISTRY
// =============================================================================

// Create the registry using factory
const _registry = createRegistry<string, AppViewComponent>("App");

/**
 * AppRegistry - Maps app IDs to React view components
 */
export const AppRegistry = {
  register(appId: string, component: AppViewComponent): void {
    _registry.register(appId, component);
  },

  unregister(appId: string): void {
    _registry.delete(appId);
  },

  getView: _registry.get,

  hasView: _registry.has,

  getRegisteredApps: _registry.keys,

  get views(): Record<string, AppViewComponent> {
    return _registry.entries() as Record<string, AppViewComponent>;
  },

  clear: _registry.clear,

  get size() {
    return _registry.size;
  },
};
