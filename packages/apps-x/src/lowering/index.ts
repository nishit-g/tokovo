import type { RuntimeEvent } from "@tokovo/core";
import type { NotificationIntentEmitter, TrackEvent } from "@tokovo/ir";
import { parseXAuthoringEventPayload } from "../contract/schemas.js";
import type { XTrackEvent } from "../types/index.js";

export interface XLoweringHandler {
  lower: (event: TrackEvent, context: NotificationIntentEmitter) => RuntimeEvent[];
}

function isXEvent(event: TrackEvent): event is XTrackEvent {
  return event.kind === "APP" && event.appId === "app_x";
}

function runtimeEvent(event: XTrackEvent, type: string, payload: unknown): RuntimeEvent {
  if (!event.deviceId) {
    throw new Error("X_EVENT_DEVICE_REQUIRED: lowered X events require deviceId");
  }
  return {
    at: event.at,
    kind: "APP",
    appId: "app_x",
    type,
    payload,
    deviceId: event.deviceId,
  };
}

function notificationCopy(type: string): string {
  switch (type) {
    case "mention":
      return "You were mentioned in a post";
    case "reply":
      return "New reply to your post";
    case "follow":
      return "You have a new follower";
    case "repost":
      return "Your post was reposted";
    case "like":
      return "Your post was liked";
    case "verified":
      return "New activity from a verified account";
    default:
      throw new Error(`X_NOTIFICATION_TYPE_UNSUPPORTED: "${type}"`);
  }
}

export const xLowering: XLoweringHandler = {
  lower(event: TrackEvent, context: NotificationIntentEmitter): RuntimeEvent[] {
    if (!isXEvent(event)) return [];
    if (!event.deviceId) {
      throw new Error("X_EVENT_DEVICE_REQUIRED: lowered X events require deviceId");
    }
    parseXAuthoringEventPayload(event.type, event.payload);

    switch (event.type) {
      case "USER_CREATE":
        return [runtimeEvent(event, "ADD_USER", event.payload)];
      case "MARK_NOTIFICATION_READ": {
        const { id, badgeCount } = event.payload;
        if (badgeCount !== undefined) {
          context.emitNotificationInteraction({
            deviceId: event.deviceId,
            atFrame: event.at,
            type: "markRead",
            notificationId: id,
            badgeCount,
            readTarget: { appId: "app_x", type: "MARK_NOTIFICATION_READ", payload: { id } },
          });
          return [];
        }
        return [runtimeEvent(event, "MARK_NOTIFICATION_READ", { id })];
      }
      case "SET_CURRENT_USER":
        return [runtimeEvent(event, "SET_CURRENT_USER", event.payload)];
      case "FOLLOW_USER":
        return [runtimeEvent(event, "FOLLOW_USER", event.payload)];
      case "UNFOLLOW_USER":
        return [runtimeEvent(event, "UNFOLLOW_USER", event.payload)];
      case "TWEET_CREATE":
      case "TWEET_REPLY":
      case "TWEET_QUOTE":
        return [runtimeEvent(event, "ADD_TWEET", event.payload)];
      case "TWEET_REPOST":
        return [
          runtimeEvent(event, "ADD_TWEET", {
            ...event.payload,
            text: event.payload.text ?? "",
          }),
        ];
      case "TWEET_LIKE":
        return [runtimeEvent(event, "LIKE_TWEET", event.payload)];
      case "TWEET_UNLIKE":
        return [runtimeEvent(event, "UNLIKE_TWEET", event.payload)];
      case "TWEET_VIEW":
        return [runtimeEvent(event, "VIEW_TWEET", event.payload)];
      case "TWEET_BOOKMARK":
        return [runtimeEvent(event, "BOOKMARK_TWEET", event.payload)];
      case "TWEET_UNBOOKMARK":
        return [runtimeEvent(event, "UNBOOKMARK_TWEET", event.payload)];
      case "TWEET_SHARE":
        return [runtimeEvent(event, "SHARE_TWEET", event.payload)];
      case "TWEET_POLL_VOTE":
        return [runtimeEvent(event, "VOTE_POLL", event.payload)];
      case "TWEET_MEDIA_PLAYBACK":
        return [runtimeEvent(event, "SET_MEDIA_PLAYBACK", event.payload)];
      case "NAVIGATE":
        return [runtimeEvent(event, "SET_SCREEN", event.payload)];
      case "NAVIGATE_BACK":
        return [runtimeEvent(event, "NAVIGATE_BACK", {})];
      case "SET_COMPOSE_DRAFT":
        return [runtimeEvent(event, "SET_COMPOSE_DRAFT", event.payload)];
      case "SET_COMPOSER_STATUS":
        return [runtimeEvent(event, "SET_COMPOSER_STATUS", event.payload)];
      case "SET_THREAD_DRAFT":
        return [runtimeEvent(event, "SET_THREAD_DRAFT", event.payload)];
      case "SET_SCROLL":
        return [runtimeEvent(event, "SET_SCROLL", event.payload)];
      case "DM_TYPING_START":
        return [runtimeEvent(event, "START_DM_TYPING", event.payload)];
      case "DM_TYPING_STOP":
        return [runtimeEvent(event, "STOP_DM_TYPING", event.payload)];
      case "SET_TIMELINE_TAB":
        return [runtimeEvent(event, "SET_TIMELINE_TAB", event.payload)];
      case "SET_PROFILE_TAB":
        return [runtimeEvent(event, "SET_PROFILE_TAB", event.payload)];
      case "SET_NOTIFICATIONS_TAB":
        return [runtimeEvent(event, "SET_NOTIFICATIONS_TAB", event.payload)];
      case "NOTIFICATION_ADD": {
        const payload = event.payload;
        const body = payload.body ?? notificationCopy(payload.type);
        const threadId = payload.tweetId ? `tweet:${payload.tweetId}` : `user:${payload.actorId}`;
        context.emitNotification({
          id: payload.id,
          deviceId: event.deviceId,
          appId: "app_x",
          deliverAtFrame: event.at,
          sequence: event._declarationOrder,
          content: { title: payload.title ?? "X", body },
          category: "social",
          threadId,
          groupId: threadId,
          interruption:
            payload.type === "mention" || payload.type === "reply" ? "timeSensitive" : "active",
          privacy: "public",
          metadata: {
            kind: payload.type,
            tweetId: payload.tweetId,
            actorId: payload.actorId,
            route: payload.tweetId ? "tweet" : "notifications",
          },
        });
        return [runtimeEvent(event, "ADD_NOTIFICATION", payload)];
      }
      case "DM_THREAD_CREATE":
        return [runtimeEvent(event, "ADD_DM_THREAD", event.payload)];
      case "DM_SEND":
        return [runtimeEvent(event, "ADD_DM_MESSAGE_OUTGOING", event.payload)];
      case "DM_RECEIVE":
        return [runtimeEvent(event, "ADD_DM_MESSAGE_INCOMING", event.payload)];
      case "DM_REACT":
        return [runtimeEvent(event, "ADD_DM_REACTION", event.payload)];
      case "DM_UNREACT":
        return [runtimeEvent(event, "REMOVE_DM_REACTION", event.payload)];
      case "DM_SET_DELIVERY":
        return [runtimeEvent(event, "SET_DM_DELIVERY", event.payload)];
      default:
        throw new Error(`X_TRACK_TYPE_UNSUPPORTED: "${(event as { type: string }).type}"`);
    }
  },
};
