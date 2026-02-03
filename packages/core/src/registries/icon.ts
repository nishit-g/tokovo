import React from "react";
import { createRegistry } from "./factory";

export type IconVariant = "default" | "dark" | "light" | "monochrome";
export type IconSize = "small" | "medium" | "large" | "xlarge";

export interface IconMetadata {
  default: React.ReactNode | string;
  dark?: React.ReactNode | string;
  light?: React.ReactNode | string;
  monochrome?: React.ReactNode | string;
  badgeColor?: string;
  backgroundColor?: string;
  cornerRadius?: number;
}

const DEFAULT_ICON: IconMetadata = {
  default: "📱",
};

export interface IconRegistryAPI {
  register(appId: string, metadata: IconMetadata): void;
  get(appId: string, variant?: IconVariant): React.ReactNode | string;
  getMetadata(appId: string): IconMetadata;
  has(appId: string): boolean;
  keys(): string[];
  entries(): Record<string, IconMetadata>;
  clear(): void;
  readonly size: number;
}

export function createIconRegistry(): IconRegistryAPI {
  const registry = createRegistry<string, IconMetadata>("Icon");

  return {
    register: registry.register,

    get(
      appId: string,
      variant: IconVariant = "default",
    ): React.ReactNode | string {
      const meta = registry.get(appId);
      if (!meta) return DEFAULT_ICON.default;
      return meta[variant] ?? meta.default;
    },

    getMetadata(appId: string): IconMetadata {
      return registry.get(appId) ?? DEFAULT_ICON;
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

export function getAppIcon(
  registry: IconRegistryAPI,
  appId: string,
  options: { variant?: IconVariant; size?: IconSize } = {},
): React.ReactNode | string {
  const { variant = "default" } = options;
  return registry.get(appId, variant);
}
