/**
 * Episodes Package
 * 
 * All episodes are defined using the DSL format inline in video-runner components.
 * Legacy JSON episodes have been removed.
 */

// Schema types
export * from "./schema";

// DSL-based episodes (inline defined)
export { notificationShowcaseEpisode } from "./notification-showcase.dsl";
