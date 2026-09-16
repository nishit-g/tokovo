import type { CinematicSubjectProvider } from "../types/cinematic-subject.js";
import type { LayoutState } from "../types/layout.js";

/**
 * Defines an app-owned subject provider backed by the exact semantic regions
 * emitted by that app's canonical headless layout.
 */
export function createLayoutCinematicSubjectProvider(input: {
  ownerId: string;
  semanticSubjectIds: readonly string[];
}): CinematicSubjectProvider {
  return {
    ownerId: input.ownerId,
    schema: {
      version: 1,
      ownerId: input.ownerId,
      semanticSubjectIds: [...input.semanticSubjectIds],
      entityRegions: {},
    },
    project(_world, layout, deviceId) {
      const semantic = (layout as LayoutState | undefined)?.semantic;
      if (!semantic) return [];
      return Object.values(semantic.regions).map((region) => ({
        ref: {
          kind: "semantic" as const,
          deviceId,
          appId: input.ownerId,
          subjectId: region.id,
        },
        rect: region.rect,
        ...(typeof region.metadata?.textSizePx === "number"
          ? { textSizePx: region.metadata.textSizePx }
          : {}),
        coordinateSpace: "app-logical" as const,
        visible: region.rect.width > 0 && region.rect.height > 0,
        sourceVersion: 1,
        provenance: { ownerId: input.ownerId, regionId: region.id },
      }));
    },
  };
}
