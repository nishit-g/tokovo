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

const _registry = createRegistry<string, IconMetadata>("Icon");

export const IconRegistry = {
  register: _registry.register,

  get(
    appId: string,
    variant: IconVariant = "default",
  ): React.ReactNode | string {
    const meta = _registry.get(appId);
    if (!meta) return DEFAULT_ICON.default;
    return meta[variant] ?? meta.default;
  },

  getMetadata(appId: string): IconMetadata {
    return _registry.get(appId) ?? DEFAULT_ICON;
  },

  has: _registry.has,
  keys: _registry.keys,
  entries: _registry.entries,
  clear: _registry.clear,
  get size() {
    return _registry.size;
  },
};

export function getAppIcon(
  appId: string,
  options: { variant?: IconVariant; size?: IconSize } = {},
): React.ReactNode | string {
  const { variant = "default" } = options;
  return IconRegistry.get(appId, variant);
}
