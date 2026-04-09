// Re-export base DSL for convenience (single import for creators).
export * from "@tokovo/dsl";

export { episode } from "./creator-episode.js";
export type { CreatorEpisodeBuilder } from "./creator-episode.js";

export { storyEpisode } from "./story-episode.js";
export type {
  StoryEpisodeBuilder,
  StoryPackUsage,
  StoryLintInput,
} from "./story-episode.js";

export type {
  CastEntry,
  CastMap,
  StoryStyleOverrides,
  StoryDeviceOverride,
  StoryKitConfig,
  StoryKitPackRefs,
  StoryKitStudioConfig,
  ResolvedActor,
  ResolvedStyle,
  ResolvedDevice,
  ResolvedStoryKit,
  StoryProjectionHelpers,
  StoryLinkedInUserProjection,
  StoryXUserProjectionOverrides,
  StoryLinkedInUserProjectionOverrides,
  StoryConversationProjection,
  StoryWhatsAppConversationProjection,
  StoryProjectedDeviceConfig,
  StoryDeviceProjectionOverrides,
} from "./story-kit.js";
export { KNOWN_APP_IDS, resolveStoryKit } from "./story-kit.js";
