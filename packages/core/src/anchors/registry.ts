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

function extractAppIdFromAnchor(anchorId: string): string | null {
  const parts = anchorId.split(":");
  if (parts.length >= 1 && parts[0].startsWith("app_")) {
    return parts[0];
  }
  return null;
}

export class AnchorRegistryClass {
  private providerRegistry = new Map<string, AnchorProvider>();

  register(provider: AnchorProvider): void {
    this.providerRegistry.set(provider.appId, provider);
  }

  unregister(appId: string): boolean {
    return this.providerRegistry.delete(appId);
  }

  get(appId: string): AnchorProvider | undefined {
    return this.providerRegistry.get(appId);
  }

  has(appId: string): boolean {
    return this.providerRegistry.has(appId);
  }

  getRegisteredApps(): string[] {
    return Array.from(this.providerRegistry.keys());
  }

  getProviderCount(): number {
    return this.providerRegistry.size;
  }

  getAnchorsForApp(
    appId: string,
    world: unknown,
    layout: unknown,
    deviceId: string,
  ): AnchorSnapshot {
    const provider = this.providerRegistry.get(appId);
    if (!provider) {
      return EMPTY_SNAPSHOT;
    }
    return provider.getAnchors(world, layout, deviceId);
  }

  getFraming(appId: string, anchorId: string): AnchorFraming {
    const provider = this.providerRegistry.get(appId);
    if (!provider) {
      return DEFAULT_FRAMING;
    }

    const anchorName = anchorId.includes(":")
      ? anchorId.split(":").slice(1).join(":")
      : anchorId;

    return provider.framing[anchorName] || DEFAULT_FRAMING;
  }

  clear(): void {
    this.providerRegistry.clear();
  }

  resolveAnchor(
    anchorId: string,
    world: WorldState,
    deviceId: string,
  ): Rect | null {
    const appId = extractAppIdFromAnchor(anchorId);
    if (!appId) return null;

    const provider = this.providerRegistry.get(appId);
    if (!provider) return null;

    const device = world.devices[deviceId];
    if (!device) return null;

    const snapshot = provider.getAnchors(world, device, deviceId);
    return snapshot?.anchors?.[anchorId] || null;
  }

  hasAnchor(anchorId: string): boolean {
    const appId = extractAppIdFromAnchor(anchorId);
    if (!appId) return false;
    return !!this.providerRegistry.get(appId);
  }
}

export function createAnchorRegistry(): AnchorRegistryClass {
  return new AnchorRegistryClass();
}
