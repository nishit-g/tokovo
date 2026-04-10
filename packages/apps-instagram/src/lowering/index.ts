import type { TrackEvent } from "@tokovo/ir";
import { getLoweringScratchpad, planTypedKeyboard, type RuntimeEvent } from "@tokovo/core";
import type { InstagramDMMessagePayload, InstagramPostPayload, InstagramTrackEvent } from "../types/index.js";
import { lowerInstagramInitialView, lowerInstagramSnapshot } from "../bootstrap.js";
import { isInstagramTrackEvent } from "../schemas/index.js";

type Scratchpad = {
  lastComposerOpenAtByDevice: Map<string, number>;
  lastThreadOpenAtByDeviceThread: Map<string, number>;
};

function createRuntimeEvent(
  event: TrackEvent,
  type: string,
  payload: unknown,
): RuntimeEvent {
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

function lowerTypedPost(
  event: InstagramTrackEvent & { type: "POST_ADD"; payload: InstagramPostPayload },
  deviceId: string,
  notBeforeFrame: number | undefined,
): RuntimeEvent[] {
  const addEvent = createRuntimeEvent(event, "ADD_POST", {
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

  if (!event.payload.typed || typeof notBeforeFrame !== "number" || notBeforeFrame > event.at) {
    return [addEvent];
  }

  const plan = planTypedKeyboard({
    deviceId,
    submitAt: event.at,
    text: event.payload.caption,
    requestedCharDelay: event.payload.charDelay ?? 2,
    notBeforeFrame,
    keyboardType: "default",
    returnKeyType: "send",
  });

  const after: RuntimeEvent[] = [
    createRuntimeEvent(event, "SET_COMPOSER_DRAFT", {
      caption: event.payload.caption,
      imageUrl: event.payload.imageUrl,
      location: event.payload.location,
    }),
    addEvent,
    createRuntimeEvent(event, "SET_COMPOSER_DRAFT", { caption: "", imageUrl: undefined }),
  ];

  if (!plan.ok) return after;
  const [showEv, typeEv, pressEv, hideEv] = plan.events;
  return [showEv, typeEv, pressEv, ...after, hideEv];
}

function lowerTypedDM(
  event: InstagramTrackEvent & {
    type: "DM_MESSAGE_ADD" | "STORY_REPLY";
    payload: InstagramDMMessagePayload;
  },
  deviceId: string,
  notBeforeFrame: number | undefined,
): RuntimeEvent[] {
  const addEvent = createRuntimeEvent(event, "ADD_DM_MESSAGE", {
    id: event.payload.id ?? `ig-msg-${event.at}-${event._declarationOrder ?? 0}`,
    threadId: event.payload.threadId,
    senderId: event.payload.senderId,
    text: event.payload.text,
    createdAt: timestamp(event, event.payload.createdAt),
    storyId: event.payload.storyId,
  });

  if (!event.payload.typed || typeof notBeforeFrame !== "number" || notBeforeFrame > event.at) {
    return [addEvent];
  }

  const plan = planTypedKeyboard({
    deviceId,
    submitAt: event.at,
    text: event.payload.text,
    requestedCharDelay: event.payload.charDelay ?? 2,
    notBeforeFrame,
    keyboardType: "default",
    returnKeyType: "send",
  });

  const after: RuntimeEvent[] = [
    createRuntimeEvent(event, "SET_THREAD_DRAFT", {
      threadId: event.payload.threadId,
      text: event.payload.text,
    }),
    addEvent,
    createRuntimeEvent(event, "SET_THREAD_DRAFT", {
      threadId: event.payload.threadId,
      text: "",
    }),
  ];
  if (!plan.ok) return after;
  const [showEv, typeEv, pressEv, hideEv] = plan.events;
  return [showEv, typeEv, pressEv, ...after, hideEv];
}

export const instagramLowering = {
  lower(event: TrackEvent, ctx?: unknown): RuntimeEvent[] {
    if ((event as { kind?: string }).kind !== "APP" || (event as { appId?: string }).appId !== "app_instagram") {
      return [];
    }

    if ((event as { type?: string }).type === "__SNAPSHOT__") {
      return lowerInstagramSnapshot(
        (event as { payload?: unknown }).payload,
        event.at,
        event.deviceId,
      );
    }

    if ((event as { type?: string }).type === "__VIEW__") {
      return lowerInstagramInitialView(
        (event as { payload?: unknown }).payload,
        event.at,
        event.deviceId,
      );
    }

    if (!isInstagramTrackEvent(event)) return [];
    const deviceId = event.deviceId;
    if (!deviceId) return [];
    const scratchpad = getLoweringScratchpad<Scratchpad>(
      ctx,
      "app_instagram.lowering",
      () => ({
        lastComposerOpenAtByDevice: new Map(),
        lastThreadOpenAtByDeviceThread: new Map(),
      }),
    );

    switch (event.type) {
      case "USER_ADD":
        return [createRuntimeEvent(event, "ADD_USER", event.payload)];
      case "SET_CURRENT_USER":
        return [createRuntimeEvent(event, "SET_CURRENT_USER", event.payload)];
      case "FOLLOW_USER":
        return [createRuntimeEvent(event, "FOLLOW_USER", event.payload)];
      case "POST_ADD":
        return lowerTypedPost(
          event,
          deviceId,
          scratchpad.lastComposerOpenAtByDevice.get(deviceId),
        );
      case "POST_LIKE":
        return [createRuntimeEvent(event, "LIKE_POST", event.payload)];
      case "POST_COMMENT":
        return [createRuntimeEvent(event, "ADD_COMMENT", {
          ...event.payload,
          createdAt: timestamp(event, event.payload.createdAt),
        })];
      case "STORY_SET_ADD":
        return [createRuntimeEvent(event, "ADD_STORY_SET", {
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
          createRuntimeEvent(event, "SET_SCREEN", {
            screen: "story",
            storySetId: event.payload.storySetId,
            storyId: event.payload.storyId,
          }),
          createRuntimeEvent(event, "OPEN_STORY", event.payload),
        ];
      case "STORY_ADVANCE":
        return [createRuntimeEvent(event, "ADVANCE_STORY", event.payload)];
      case "STORY_REPLY": {
        scratchpad.lastThreadOpenAtByDeviceThread.set(
          `${deviceId}::${event.payload.threadId}`,
          event.at,
        );
        const openEvents: RuntimeEvent[] = [
          createRuntimeEvent(event, "SET_SCREEN", {
            screen: "thread",
            threadId: event.payload.threadId,
          }),
          createRuntimeEvent(event, "SET_ACTIVE_THREAD", {
            threadId: event.payload.threadId,
          }),
        ];
        return [
          ...openEvents,
          ...lowerTypedDM(
            {
              ...event,
              payload: {
                id: event.payload.id,
                threadId: event.payload.threadId,
                senderId: event.payload.senderId,
                text: event.payload.text,
                createdAt: event.payload.createdAt,
                storyId: event.payload.storyId,
                typed: event.payload.typed,
                charDelay: event.payload.charDelay,
              } as InstagramDMMessagePayload,
            } as InstagramTrackEvent & { type: "STORY_REPLY"; payload: InstagramDMMessagePayload },
            deviceId,
            event.at,
          ),
        ];
      }
      case "DM_THREAD_ADD":
        return [createRuntimeEvent(event, "ADD_DM_THREAD", {
          ...event.payload,
          messageIds: [],
          typingUserId: null,
          lastMessageAt: null,
        })];
      case "DM_MESSAGE_ADD":
        return lowerTypedDM(
          event,
          deviceId,
          scratchpad.lastThreadOpenAtByDeviceThread.get(
            `${deviceId}::${event.payload.threadId}`,
          ),
        );
      case "SET_THREAD_DRAFT":
        return [createRuntimeEvent(event, "SET_THREAD_DRAFT", event.payload)];
      case "SET_THREAD_TYPING":
        return [createRuntimeEvent(event, "SET_THREAD_TYPING", event.payload)];
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
        return [
          createRuntimeEvent(event, "ADD_NOTIFICATION", {
            ...event.payload,
            id,
            createdAt: timestamp(event, event.payload.createdAt),
          }),
          {
            at: event.at,
            kind: "DEVICE",
            type: "SHOW_NOTIFICATION",
            deviceId,
            payload: {
              id,
              appId: "app_instagram",
              title: event.payload.title ?? "Instagram",
              body,
              threadKey:
                event.payload.threadId ??
                event.payload.postId ??
                event.payload.storyId ??
                event.payload.actorId,
              priority:
                event.payload.type === "dm" || event.payload.type === "story_reply"
                  ? "HIGH"
                  : "DEFAULT",
            },
          } as RuntimeEvent,
        ];
      }
      case "NOTIFICATION_DISMISS":
        return [
          createRuntimeEvent(event, "DISMISS_NOTIFICATION", event.payload),
          {
            at: event.at,
            kind: "DEVICE",
            type: "DISMISS_NOTIFICATION",
            deviceId,
            payload: { id: event.payload.id },
          } as RuntimeEvent,
        ];
      case "NAVIGATE": {
        if (event.payload.screen === "composer") {
          scratchpad.lastComposerOpenAtByDevice.set(deviceId, event.at);
        }
        if (event.payload.screen === "thread" && event.payload.threadId) {
          scratchpad.lastThreadOpenAtByDeviceThread.set(
            `${deviceId}::${event.payload.threadId}`,
            event.at,
          );
        }
        const events: RuntimeEvent[] = [createRuntimeEvent(event, "SET_SCREEN", event.payload)];
        if (event.payload.postId) {
          events.push(createRuntimeEvent(event, "SET_ACTIVE_POST", { postId: event.payload.postId }));
        }
        if (event.payload.profileId) {
          events.push(createRuntimeEvent(event, "SET_ACTIVE_PROFILE", { profileId: event.payload.profileId }));
        }
        if (event.payload.threadId) {
          events.push(createRuntimeEvent(event, "SET_ACTIVE_THREAD", { threadId: event.payload.threadId }));
        }
        if (event.payload.storySetId) {
          events.push(createRuntimeEvent(event, "SET_ACTIVE_STORY_SET", { storySetId: event.payload.storySetId }));
        }
        if (event.payload.storyId) {
          events.push(createRuntimeEvent(event, "SET_ACTIVE_STORY", { storyId: event.payload.storyId }));
        }
        return events;
      }
      case "NAVIGATE_BACK":
        return [createRuntimeEvent(event, "NAVIGATE_BACK", {})];
      case "SET_COMPOSER_DRAFT":
        return [createRuntimeEvent(event, "SET_COMPOSER_DRAFT", event.payload)];
      case "SET_PROFILE_TAB":
        return [createRuntimeEvent(event, "SET_PROFILE_TAB", event.payload)];
      case "SET_THEME_MODE":
        return [createRuntimeEvent(event, "SET_THEME_MODE", event.payload)];
      default:
        return [];
    }
  },
};
