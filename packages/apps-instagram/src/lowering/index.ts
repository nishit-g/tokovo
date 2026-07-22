import type { NotificationIntentEmitter, TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { InstagramDMMessagePayload, InstagramPostPayload, InstagramTrackEvent } from "../types/index.js";
import { isInstagramTrackEvent } from "../schemas/index.js";

function createRuntimeEvent(
  event: TrackEvent,
  type: string,
  payload: unknown,
): RuntimeEvent {
  if (!event.deviceId) {
    throw new Error("INSTAGRAM_EVENT_DEVICE_REQUIRED: lowered app events require deviceId");
  }
  return {
    at: event.at,
    kind: "APP",
    appId: "app_instagram",
    type,
    payload,
    deviceId: event.deviceId,
  };
}

function timestamp(event: TrackEvent, override?: number): number {
  return typeof override === "number" ? override : event.at;
}

function lowerPost(
  event: InstagramTrackEvent & { type: "POST_ADD"; payload: InstagramPostPayload },
): RuntimeEvent[] {
  const addEvent = createRuntimeEvent(event, "INSTAGRAM_ADD_POST", {
    id: event.payload.id ?? `ig-post-${event.at}-${event._declarationOrder ?? 0}`,
    authorId: event.payload.authorId,
    imageUrl: event.payload.imageUrl,
    caption: event.payload.caption,
    createdAt: timestamp(event, event.payload.createdAt),
    location: event.payload.location,
    aspect: event.payload.aspect ?? "portrait",
    likeCount: event.payload.likeCount ?? 0,
    commentCount: event.payload.commentCount ?? 0,
  });

  return [addEvent];
}

function lowerDM(
  event: InstagramTrackEvent & {
    type: "DM_MESSAGE_ADD" | "STORY_REPLY";
    payload: InstagramDMMessagePayload;
  },
): RuntimeEvent[] {
  const addEvent = createRuntimeEvent(event, "INSTAGRAM_ADD_DM_MESSAGE", {
    id: event.payload.id ?? `ig-msg-${event.at}-${event._declarationOrder ?? 0}`,
    threadId: event.payload.threadId,
    senderId: event.payload.senderId,
    text: event.payload.text,
    createdAt: timestamp(event, event.payload.createdAt),
    storyId: event.payload.storyId,
  });

  return [addEvent];
}

export const instagramLowering = {
  lower(event: TrackEvent, ctx: NotificationIntentEmitter): RuntimeEvent[] {
    if ((event as { kind?: string }).kind !== "APP" || (event as { appId?: string }).appId !== "app_instagram") {
      return [];
    }

    if (!isInstagramTrackEvent(event)) return [];
    const deviceId = event.deviceId;
    if (!deviceId) return [];
    switch (event.type) {
      case "USER_ADD":
        return [createRuntimeEvent(event, "INSTAGRAM_ADD_USER", event.payload)];
      case "SET_CURRENT_USER":
        return [createRuntimeEvent(event, "INSTAGRAM_SET_CURRENT_USER", event.payload)];
      case "FOLLOW_USER":
        return [createRuntimeEvent(event, "INSTAGRAM_FOLLOW_USER", event.payload)];
      case "POST_ADD":
        return lowerPost(event);
      case "POST_LIKE":
        return [createRuntimeEvent(event, "INSTAGRAM_LIKE_POST", event.payload)];
      case "POST_COMMENT":
        return [createRuntimeEvent(event, "INSTAGRAM_ADD_COMMENT", {
          ...event.payload,
          createdAt: timestamp(event, event.payload.createdAt),
        })];
      case "STORY_SET_ADD":
        return [createRuntimeEvent(event, "INSTAGRAM_ADD_STORY_SET", {
          id: event.payload.id,
          userId: event.payload.userId,
          storyIds: event.payload.items.map((item) => item.id),
          stories: event.payload.items.map((item) => ({
            id: item.id,
            authorId: item.authorId,
            mediaUrl: item.mediaUrl,
            createdAt: timestamp(event, item.createdAt),
            durationFrames: item.durationFrames ?? 90,
            accentColor: item.accentColor,
          })),
        })];
      case "STORY_OPEN":
        return [
          createRuntimeEvent(event, "INSTAGRAM_SET_SCREEN", {
            screen: "story",
            storySetId: event.payload.storySetId,
            storyId: event.payload.storyId,
          }),
          createRuntimeEvent(event, "INSTAGRAM_OPEN_STORY", event.payload),
        ];
      case "STORY_ADVANCE":
        return [createRuntimeEvent(event, "INSTAGRAM_ADVANCE_STORY", event.payload)];
      case "STORY_REPLY": {
        const openEvents: RuntimeEvent[] = [
          createRuntimeEvent(event, "INSTAGRAM_SET_SCREEN", {
            screen: "thread",
            threadId: event.payload.threadId,
          }),
          createRuntimeEvent(event, "INSTAGRAM_SET_ACTIVE_THREAD", {
            threadId: event.payload.threadId,
          }),
        ];
        return [
          ...openEvents,
          ...lowerDM(
            {
              ...event,
              payload: {
                id: event.payload.id,
                threadId: event.payload.threadId,
                senderId: event.payload.senderId,
                text: event.payload.text,
                createdAt: event.payload.createdAt,
                storyId: event.payload.storyId,
              } as InstagramDMMessagePayload,
            } as InstagramTrackEvent & { type: "STORY_REPLY"; payload: InstagramDMMessagePayload },
          ),
        ];
      }
      case "DM_THREAD_ADD":
        return [createRuntimeEvent(event, "INSTAGRAM_ADD_DM_THREAD", {
          ...event.payload,
          messageIds: [],
          typingUserId: null,
          lastMessageAt: null,
        })];
      case "DM_MESSAGE_ADD":
        return lowerDM(event);
      case "SET_THREAD_DRAFT":
        return [createRuntimeEvent(event, "INSTAGRAM_SET_THREAD_DRAFT", event.payload)];
      case "SET_THREAD_TYPING":
        return [createRuntimeEvent(event, "INSTAGRAM_SET_THREAD_TYPING", event.payload)];
      case "NOTIFICATION_ADD": {
        const id = event.payload.id ?? `ig-nt-${event.at}-${event._declarationOrder ?? 0}`;
        const body =
          event.payload.body ??
          (event.payload.type === "follow"
            ? "started following you"
            : event.payload.type === "dm"
              ? "sent you a new message"
              : event.payload.type === "story_reply"
                ? "replied to your story"
                : "interacted with your post");
        const threadId =
          event.payload.threadId ??
          event.payload.postId ??
          event.payload.storyId ??
          event.payload.actorId;
        ctx.emitNotification({
          id,
          deviceId,
          appId: "app_instagram",
          deliverAtFrame: event.at,
          sequence: event._declarationOrder,
          content: {
            title: event.payload.title ?? "Instagram",
            body,
          },
          category: event.payload.type === "dm" ? "message" : "social",
          threadId,
          groupId: threadId,
          interruption:
            event.payload.type === "dm" || event.payload.type === "story_reply"
              ? "timeSensitive"
              : "active",
          privacy: event.payload.type === "dm" ? "private" : "public",
          metadata: {
            kind: event.payload.type,
            route:
              event.payload.type === "dm"
                ? "thread"
                : event.payload.type === "follow"
                  ? "profile"
                  : "notifications",
          },
        });
        return [
          createRuntimeEvent(event, "INSTAGRAM_ADD_NOTIFICATION", {
            ...event.payload,
            id,
            createdAt: timestamp(event, event.payload.createdAt),
          }),
        ];
      }
      case "NOTIFICATION_DISMISS":
        ctx.emitNotificationInteraction({
          deviceId,
          atFrame: event.at,
          type: "dismiss",
          notificationId: event.payload.id,
          sequence: event._declarationOrder,
        });
        return [
          createRuntimeEvent(event, "INSTAGRAM_DISMISS_NOTIFICATION", event.payload),
        ];
      case "NAVIGATE": {
        const events: RuntimeEvent[] = [createRuntimeEvent(event, "INSTAGRAM_SET_SCREEN", event.payload)];
        if (event.payload.postId) {
          events.push(createRuntimeEvent(event, "INSTAGRAM_SET_ACTIVE_POST", { postId: event.payload.postId }));
        }
        if (event.payload.profileId) {
          events.push(createRuntimeEvent(event, "INSTAGRAM_SET_ACTIVE_PROFILE", { profileId: event.payload.profileId }));
        }
        if (event.payload.threadId) {
          events.push(createRuntimeEvent(event, "INSTAGRAM_SET_ACTIVE_THREAD", { threadId: event.payload.threadId }));
        }
        if (event.payload.storySetId) {
          events.push(createRuntimeEvent(event, "INSTAGRAM_SET_ACTIVE_STORY_SET", { storySetId: event.payload.storySetId }));
        }
        if (event.payload.storyId) {
          events.push(createRuntimeEvent(event, "INSTAGRAM_SET_ACTIVE_STORY", { storyId: event.payload.storyId }));
        }
        return events;
      }
      case "NAVIGATE_BACK":
        return [createRuntimeEvent(event, "INSTAGRAM_NAVIGATE_BACK", {})];
      case "SET_COMPOSER_DRAFT":
        return [createRuntimeEvent(event, "INSTAGRAM_SET_COMPOSER_DRAFT", event.payload)];
      case "SET_PROFILE_TAB":
        return [createRuntimeEvent(event, "INSTAGRAM_SET_PROFILE_TAB", event.payload)];
      case "SET_THEME_MODE":
        return [createRuntimeEvent(event, "INSTAGRAM_SET_THEME_MODE", event.payload)];
      default:
        return [];
    }
  },
};
