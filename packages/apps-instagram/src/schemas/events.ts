import type { TrackEvent } from "@tokovo/ir";
import type {
  InstagramDMMessagePayload,
  InstagramEventType,
  InstagramNotificationPayload,
  InstagramPostPayload,
  InstagramStoryItemPayload,
  InstagramTrackEvent,
} from "../types/index.js";

const EVENT_TYPES: readonly InstagramEventType[] = [
  "USER_ADD",
  "SET_CURRENT_USER",
  "FOLLOW_USER",
  "POST_ADD",
  "POST_LIKE",
  "POST_COMMENT",
  "STORY_SET_ADD",
  "STORY_OPEN",
  "STORY_ADVANCE",
  "STORY_REPLY",
  "DM_THREAD_ADD",
  "DM_MESSAGE_ADD",
  "SET_THREAD_DRAFT",
  "SET_THREAD_TYPING",
  "NOTIFICATION_ADD",
  "NOTIFICATION_DISMISS",
  "NAVIGATE",
  "NAVIGATE_BACK",
  "SET_COMPOSER_DRAFT",
  "SET_PROFILE_TAB",
  "SET_THEME_MODE",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === "number" && Number.isFinite(value));
}

function isPostPayload(value: unknown): value is InstagramPostPayload {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.authorId) &&
    isString(value.imageUrl) &&
    typeof value.caption === "string" &&
    isOptionalString(value.location) &&
    isOptionalNumber(value.createdAt)
  );
}

function isStoryItem(value: unknown): value is InstagramStoryItemPayload {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.authorId) &&
    isString(value.mediaUrl) &&
    isOptionalNumber(value.createdAt)
  );
}

function isDMMessagePayload(value: unknown): value is InstagramDMMessagePayload {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.threadId) &&
    isString(value.senderId) &&
    typeof value.text === "string" &&
    isOptionalNumber(value.createdAt) &&
    isOptionalString(value.storyId)
  );
}

function isNotificationPayload(value: unknown): value is InstagramNotificationPayload {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.actorId) &&
    isString(value.type) &&
    ["like", "comment", "follow", "dm", "story_reply"].includes(value.type) &&
    isOptionalString(value.postId) &&
    isOptionalString(value.threadId) &&
    isOptionalString(value.storyId) &&
    isOptionalString(value.title) &&
    (value.body === undefined || typeof value.body === "string")
  );
}

export function isInstagramTrackEvent(event: TrackEvent): event is InstagramTrackEvent {
  if ((event as { kind?: string }).kind !== "APP") return false;
  if ((event as { appId?: string }).appId !== "app_instagram") return false;
  if (!EVENT_TYPES.includes((event as { type?: InstagramEventType }).type as InstagramEventType)) {
    return false;
  }

  const payload = (event as { payload?: unknown }).payload;
  switch ((event as { type: InstagramEventType }).type) {
    case "USER_ADD":
      return (
        isRecord(payload) &&
        isString(payload.id) &&
        isString(payload.username) &&
        isString(payload.displayName)
      );
    case "SET_CURRENT_USER":
      return isRecord(payload) && isString(payload.userId);
    case "FOLLOW_USER":
      return isRecord(payload) && isString(payload.followerId) && isString(payload.followingId);
    case "POST_ADD":
      return isPostPayload(payload);
    case "POST_LIKE":
      return isRecord(payload) && isString(payload.postId) && isString(payload.userId);
    case "POST_COMMENT":
      return (
        isRecord(payload) &&
        isString(payload.id) &&
        isString(payload.postId) &&
        isString(payload.authorId) &&
        typeof payload.text === "string"
      );
    case "STORY_SET_ADD":
      return (
        isRecord(payload) &&
        isString(payload.id) &&
        isString(payload.userId) &&
        Array.isArray(payload.items) &&
        payload.items.every(isStoryItem)
      );
    case "STORY_OPEN":
      return isRecord(payload) && isString(payload.storySetId);
    case "STORY_ADVANCE":
      return isRecord(payload) && isString(payload.storySetId);
    case "STORY_REPLY":
      return (
        isRecord(payload) &&
        isString(payload.id) &&
        isString(payload.storyId) &&
        isString(payload.threadId) &&
        isString(payload.senderId) &&
        typeof payload.text === "string"
      );
    case "DM_THREAD_ADD":
      return (
        isRecord(payload) &&
        isString(payload.id) &&
        isStringArray(payload.participantIds)
      );
    case "DM_MESSAGE_ADD":
      return isDMMessagePayload(payload);
    case "SET_THREAD_DRAFT":
      return isRecord(payload) && isString(payload.threadId) && typeof payload.text === "string";
    case "SET_THREAD_TYPING":
      return isRecord(payload) && isString(payload.threadId) && (payload.userId === null || isString(payload.userId));
    case "NOTIFICATION_ADD":
      return isNotificationPayload(payload);
    case "NOTIFICATION_DISMISS":
      return isRecord(payload) && isString(payload.id);
    case "NAVIGATE":
      return isRecord(payload) && isString(payload.screen);
    case "NAVIGATE_BACK":
      return isRecord(payload);
    case "SET_COMPOSER_DRAFT":
      return isRecord(payload) && typeof payload.caption === "string";
    case "SET_PROFILE_TAB":
      return isRecord(payload) && ["posts", "tagged"].includes(String(payload.tab));
    case "SET_THEME_MODE":
      return isRecord(payload) && ["light", "dark", "ghibli"].includes(String(payload.mode));
    default:
      return false;
  }
}
