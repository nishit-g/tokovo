/**
 * App Metadata Registry - Stores static metadata for applications
 *
 * @description Uses createRegistry factory for DRY pattern.
 * Used by OS components (Notifications, App Library, Home Screen).
 */

import React from "react";
import { createRegistry } from "@tokovo/core";
import type { ViewKind } from "@tokovo/core";

// =============================================================================
// TYPES
// =============================================================================

export interface AppMetadata {
  /** Display name (e.g. "WhatsApp") */
  displayName: string;

  /** Primary brand color (e.g. "#25D366") */
  themeColor: string;

  /**
   * App Icon - string (URL/emoji) or React Component
   */
  icon: React.ReactNode | string;

  /** Short name for tight spaces */
  shortName?: string;

  /** Layout Strategy */
  viewStrategy?: ViewKind;

  /** Design Width (default: 393) */
  designWidth?: number;
}

// =============================================================================
// REGISTRY
// =============================================================================

export interface AppMetadataRegistryAPI {
  register(appId: string, metadata: AppMetadata): void;
  unregister(appId: string): void;
  get(appId: string): AppMetadata;
  has(appId: string): boolean;
  keys(): string[];
  entries(): Record<string, AppMetadata>;
  clear(): void;
  readonly size: number;
}

export function createAppMetadataRegistry(): AppMetadataRegistryAPI {
  const registry = createRegistry<string, AppMetadata>("AppMetadata");

  return {
    register: registry.register,

    unregister(appId: string): void {
      registry.delete(appId);
    },

    get(appId: string): AppMetadata {
      const metadata = registry.get(appId);
      if (!metadata) {
        throw new Error(`APP_METADATA_MISSING: app "${appId}" is not registered.`);
      }
      return metadata;
    },

    has: registry.has,

    keys: registry.keys,

    entries: registry.entries,

    clear: registry.clear,

    get size() {
      return registry.size;
    },
  };
}
