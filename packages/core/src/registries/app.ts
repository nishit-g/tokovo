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

export interface AppRegistryAPI {
  register(appId: string, component: AppViewComponent): void;
  unregister(appId: string): void;
  getView(appId: string): AppViewComponent | undefined;
  hasView(appId: string): boolean;
  getRegisteredApps(): string[];
  readonly views: Record<string, AppViewComponent>;
  clear(): void;
  readonly size: number;
}

export function createAppRegistry(): AppRegistryAPI {
  const registry = createRegistry<string, AppViewComponent>("App");

  return {
    register(appId: string, component: AppViewComponent): void {
      registry.register(appId, component);
    },

    unregister(appId: string): void {
      registry.delete(appId);
    },

    getView: registry.get,

    hasView: registry.has,

    getRegisteredApps: registry.keys,

    get views(): Record<string, AppViewComponent> {
      return registry.entries() as Record<string, AppViewComponent>;
    },

    clear: registry.clear,

    get size() {
      return registry.size;
    },
  };
}

/**
 * AppRegistry - Maps app IDs to React view components
 */
