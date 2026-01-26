import type {
  AnchorProvider,
  AnchorSnapshot,
  AnchorFraming,
  Rect,
  ResolvedAnchor,
} from "../types/anchor";
import { DEFAULT_FRAMING, EMPTY_SNAPSHOT } from "../types/anchor";
import type { WorldState } from "../types";

export type {
  AnchorProvider,
  AnchorSnapshot,
  AnchorFraming,
  Rect,
  ResolvedAnchor,
};
export { DEFAULT_FRAMING, EMPTY_SNAPSHOT };

const providerRegistry = new Map<string, AnchorProvider>();

export function registerAnchorProvider(provider: AnchorProvider): void {
  providerRegistry.set(provider.appId, provider);
}

export function unregisterAnchorProvider(appId: string): boolean {
  return providerRegistry.delete(appId);
}

export function getAnchorProvider(appId: string): AnchorProvider | undefined {
  return providerRegistry.get(appId);
}

export function hasAnchorProvider(appId: string): boolean {
  return providerRegistry.has(appId);
}

export function getRegisteredAppIds(): string[] {
  return Array.from(providerRegistry.keys());
}

export function getProviderCount(): number {
  return providerRegistry.size;
}

export function getAnchorsForApp(
  appId: string,
  world: unknown,
  layout: unknown,
  deviceId: string,
): AnchorSnapshot {
  const provider = providerRegistry.get(appId);
  if (!provider) {
    return EMPTY_SNAPSHOT;
  }
  return provider.getAnchors(world, layout, deviceId);
}

export function getAnchorFraming(
  appId: string,
  anchorId: string,
): AnchorFraming {
  const provider = providerRegistry.get(appId);
  if (!provider) {
    return DEFAULT_FRAMING;
  }

  const anchorName = anchorId.includes(":")
    ? anchorId.split(":").slice(1).join(":")
    : anchorId;

  return provider.framing[anchorName] || DEFAULT_FRAMING;
}

export function clearAnchorProviders(): void {
  providerRegistry.clear();
}

export function clearAnchors(): void {
  clearAnchorProviders();
}

export function resolveAnchor(
  anchorId: string,
  world: WorldState,
  deviceId: string,
): Rect | null {
  const appId = extractAppIdFromAnchor(anchorId);
  if (!appId) return null;

  const provider = getAnchorProvider(appId);
  if (!provider) return null;

  const device = world.devices[deviceId];
  if (!device) return null;

  const snapshot = provider.getAnchors(world, device, deviceId);
  return snapshot?.anchors?.[anchorId] || null;
}

function extractAppIdFromAnchor(anchorId: string): string | null {
  const parts = anchorId.split(":");
  if (parts.length >= 1 && parts[0].startsWith("app_")) {
    return parts[0];
  }
  return null;
}

export function hasAnchor(anchorId: string): boolean {
  const appId = extractAppIdFromAnchor(anchorId);
  if (!appId) return false;
  return !!getAnchorProvider(appId);
}

export const AnchorRegistry = {
  register: registerAnchorProvider,
  unregister: unregisterAnchorProvider,
  get: getAnchorProvider,
  has: hasAnchorProvider,
  getRegisteredApps: getRegisteredAppIds,
  getFraming: getAnchorFraming,
  clear: clearAnchorProviders,
} as const;
