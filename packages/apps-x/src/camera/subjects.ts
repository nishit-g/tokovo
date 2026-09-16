import type {
  CinematicSubjectProjection,
  CinematicSubjectProvider,
  LayoutState,
  SemanticRegion,
} from "@tokovo/core";

const APP_ID = "app_x";
const VERSION = 2;

const semanticIds = [
  "x.app",
  "x.nav.primary",
  "x.timeline.header",
  "x.timeline.tabs",
  "x.timeline.feed",
  "x.compose.fab",
  "x.tweet.header",
  "x.tweet.conversation",
  "x.reply.composer",
  "x.notifications.header",
  "x.notifications.tabs",
  "x.notifications.list",
  "x.messages.header",
  "x.messages.list",
  "x.profile.app-header",
  "x.profile.tabs",
  "x.profile.feed",
  "x.thread.header",
  "x.thread.messages",
  "x.thread.composer",
  "x.thread.typing",
  "x.compose.header",
  "x.composer.editor",
  "x.composer.audience",
  "x.composer.actions",
] as const;

function projection(region: SemanticRegion, deviceId: string): CinematicSubjectProjection {
  const entityType = region.metadata?.entityType;
  const entityId = region.metadata?.entityId;
  const entityRegion = region.metadata?.entityRegion;
  const isEntity =
    typeof entityType === "string" &&
    typeof entityId === "string" &&
    typeof entityRegion === "string";
  return {
    ref: isEntity
      ? {
          kind: "entity",
          deviceId,
          appId: APP_ID,
          entityType,
          entityId,
          region: entityRegion,
        }
      : {
          kind: "semantic",
          deviceId,
          appId: APP_ID,
          subjectId: region.id,
        },
    rect: region.rect,
    coordinateSpace: "app-logical",
    visible: region.metadata?.visible !== false && region.rect.width > 0 && region.rect.height > 0,
    sourceVersion: VERSION,
    provenance: { ownerId: APP_ID, regionId: region.id },
  };
}

export const XCinematicSubjects: CinematicSubjectProvider = {
  ownerId: APP_ID,
  schema: {
    version: VERSION,
    ownerId: APP_ID,
    semanticSubjectIds: [...semanticIds],
    entityRegions: {
      tweet: ["card", "author", "body", "media", "poll", "quote", "link", "metrics"],
      notification: ["row"],
      profile: ["header", "banner", "avatar"],
      "dm-thread": ["row"],
      message: ["bubble"],
    },
  },
  project(_world, layout, deviceId) {
    const semanticLayout = (layout as LayoutState | undefined)?.semantic;
    if (!semanticLayout) return [];
    return Object.values(semanticLayout.regions).map((region) => projection(region, deviceId));
  },
};
