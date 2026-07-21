import type {
  CinematicSubjectProjection,
  CinematicSubjectProvider,
  LayoutState,
  SemanticRegion,
} from "@tokovo/core";

const APP_ID = "app_whatsapp";
const SUBJECT_VERSION = 1;

function entityRegion(region: SemanticRegion):
  | {
      entityId: string;
      region: "bubble" | "reply" | "media" | "reactions";
    }
  | undefined {
  const metadataMessageId = region.metadata?.messageId;
  if (
    region.tags.includes("message") &&
    !region.tags.includes("message_fragment")
  ) {
    return { entityId: region.id, region: "bubble" };
  }
  if (typeof metadataMessageId !== "string" || metadataMessageId.length === 0) {
    return undefined;
  }
  if (region.tags.includes("reply")) {
    return { entityId: metadataMessageId, region: "reply" };
  }
  if (region.tags.includes("media")) {
    return { entityId: metadataMessageId, region: "media" };
  }
  if (region.tags.includes("reactions")) {
    return { entityId: metadataMessageId, region: "reactions" };
  }
  return undefined;
}

function projectionForRegion(
  region: SemanticRegion,
  deviceId: string,
): CinematicSubjectProjection {
  const entity = entityRegion(region);
  return {
    ref: entity
      ? {
          kind: "entity",
          deviceId,
          appId: APP_ID,
          entityType: "message",
          entityId: entity.entityId,
          region: entity.region,
        }
      : {
          kind: "semantic",
          deviceId,
          appId: APP_ID,
          subjectId: region.id,
        },
    rect: region.rect,
    coordinateSpace: "app-logical",
    visible: region.rect.width > 0 && region.rect.height > 0,
    sourceVersion: SUBJECT_VERSION,
    provenance: { ownerId: APP_ID, regionId: region.id },
  };
}

function selectorProjection(input: {
  subjectId: string;
  region: SemanticRegion | undefined;
  deviceId: string;
}): CinematicSubjectProjection | undefined {
  if (!input.region) return undefined;
  return {
    ref: {
      kind: "semantic",
      deviceId: input.deviceId,
      appId: APP_ID,
      subjectId: input.subjectId,
    },
    rect: input.region.rect,
    coordinateSpace: "app-logical",
    visible: input.region.rect.width > 0 && input.region.rect.height > 0,
    sourceVersion: SUBJECT_VERSION,
    provenance: { ownerId: APP_ID, regionId: input.region.id },
  };
}

export const WhatsAppCinematicSubjects: CinematicSubjectProvider = {
  ownerId: APP_ID,
  schema: {
    version: SUBJECT_VERSION,
    ownerId: APP_ID,
    semanticSubjectIds: [
      "header",
      "profile",
      "input_area",
      "typing_indicator",
      "chat_thread",
      "reply_composer",
      "message_actions",
      "last-message",
      "last-media",
    ],
    entityRegions: {
      message: ["bubble", "reply", "media", "reactions"],
    },
  },
  project(_world, layout, deviceId) {
    const semantic = (layout as LayoutState | undefined)?.semantic;
    if (!semantic) return [];
    const regions = Object.values(semantic.regions);
    const projected = regions.map((region) =>
      projectionForRegion(region, deviceId),
    );
    const lastMessageRegionId = semantic.groups.message?.at(-1);
    const lastMediaRegionId = semantic.groups.media?.at(-1);
    const selectors = [
      selectorProjection({
        subjectId: "last-message",
        region: lastMessageRegionId
          ? semantic.regions[lastMessageRegionId]
          : undefined,
        deviceId,
      }),
      selectorProjection({
        subjectId: "last-media",
        region: lastMediaRegionId
          ? semantic.regions[lastMediaRegionId]
          : undefined,
        deviceId,
      }),
    ].filter(
      (subject): subject is CinematicSubjectProjection => subject !== undefined,
    );
    return [...projected, ...selectors];
  },
};
