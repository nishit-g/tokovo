import type { TrackEvent } from "@tokovo/ir";
import { getLoweringScratchpad, planTypedKeyboard, type RuntimeEvent } from "@tokovo/core";
import type { XTrackEvent } from "../types/index.js";

export interface XLoweringHandler {
  lower: (event: TrackEvent, ctx?: unknown) => RuntimeEvent[];
}

function isXTrackEvent(event: TrackEvent): event is XTrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_x"
  );
}

function getTimestamp(event: TrackEvent, override?: number): number {
  return typeof override === "number" ? override : event.at;
}

function createRuntimeEvent(
  event: TrackEvent,
  type: string,
  payload: unknown
): RuntimeEvent {
  return {
    at: event.at,
    kind: "APP",
    appId: "app_x",
    type,
    payload,
    deviceId: event.deviceId,
  };
}

type XLoweringScratchpad = {
  lastComposeOpenAtByDevice: Map<string, number>;
  lastThreadOpenAtByDeviceThread: Map<string, number>;
};

type TweetAddPayload = {
  id?: string;
  authorId: string;
  text?: string;
  createdAt?: number;
  media?: unknown;
  linkPreview?: unknown;
  poll?: unknown;
  hashtags?: string[];
  mentions?: string[];
  quoteTweetId?: string;
  viewCount?: number;
  bookmarkCount?: number;
  shareCount?: number;
  replyToId?: string;
  repostOfId?: string;
  typed?: boolean;
  charDelay?: number;
};

function buildAddTweetPayload(
  event: TrackEvent & { payload: TweetAddPayload },
  extra: Partial<TweetAddPayload> = {},
): Record<string, unknown> {
  const payload = { ...event.payload, ...extra };
  return {
    id: payload.id ?? `tw-${event.at}-${event._declarationOrder ?? 0}`,
    authorId: payload.authorId,
    text: payload.text ?? "",
    createdAt: getTimestamp(event, payload.createdAt),
    replyToId: payload.replyToId,
    repostOfId: payload.repostOfId,
    quoteTweetId: payload.quoteTweetId,
    media: payload.media,
    linkPreview: payload.linkPreview,
    poll: payload.poll,
    hashtags: payload.hashtags ?? [],
    mentions: payload.mentions ?? [],
    viewCount: payload.viewCount ?? 0,
    bookmarkCount: payload.bookmarkCount ?? 0,
    shareCount: payload.shareCount ?? 0,
  };
}

function lowerTweetWithOptionalTyping(
  event: TrackEvent & { payload: TweetAddPayload },
  deviceId: string,
  composeOpenedAt: number | undefined,
  addTweetPayload: Record<string, unknown>,
): RuntimeEvent[] {
  const text = event.payload.text ?? "";
  const addTweetEvent = createRuntimeEvent(event, "ADD_TWEET", addTweetPayload);
  if (!event.payload.typed) {
    return [addTweetEvent];
  }

  // Typed compose is only credible after an explicit compose-open beat.
  if (typeof composeOpenedAt !== "number" || composeOpenedAt > event.at) {
    return [addTweetEvent];
  }

  const plan = planTypedKeyboard({
    deviceId,
    submitAt: event.at,
    text,
    requestedCharDelay: event.payload.charDelay ?? 2,
    notBeforeFrame: composeOpenedAt,
    keyboardType: "default",
    returnKeyType: "send",
  });

  const after: RuntimeEvent[] = [
    createRuntimeEvent(event, "SET_COMPOSE_DRAFT", { text }),
    addTweetEvent,
    createRuntimeEvent(event, "SET_COMPOSE_DRAFT", { text: "" }),
  ];

  if (!plan.ok) {
    return after;
  }

  const [showEv, typeEv, pressEv, hideEv] = plan.events;
  return [showEv, typeEv, pressEv, ...after, hideEv];
}

export const xLowering: XLoweringHandler = {
  lower: (event: TrackEvent, ctx?: unknown): RuntimeEvent[] => {
    if (!isXTrackEvent(event)) return [];
    const deviceId = (event as { deviceId?: string }).deviceId;
    if (!deviceId) return [];
    const scratchpad = getLoweringScratchpad<XLoweringScratchpad>(
      ctx,
      "app_x.lowering",
      () => ({
        lastComposeOpenAtByDevice: new Map(),
        lastThreadOpenAtByDeviceThread: new Map(),
      }),
    );

    switch (event.type) {
      case "USER_CREATE":
        return [
          createRuntimeEvent(event, "ADD_USER", {
            id: event.payload.id,
            name: event.payload.name,
            handle: event.payload.handle,
            bio: event.payload.bio,
            avatarUrl: event.payload.avatarUrl,
            followers: event.payload.followers ?? 0,
            following: event.payload.following ?? 0,
            verified: event.payload.verified ?? null,
          }),
        ];
      case "SET_CURRENT_USER":
        return [
          createRuntimeEvent(event, "SET_CURRENT_USER", {
            userId: event.payload.userId,
          }),
        ];
      case "FOLLOW_USER":
        return [createRuntimeEvent(event, "FOLLOW_USER", event.payload)];
      case "UNFOLLOW_USER":
        return [createRuntimeEvent(event, "UNFOLLOW_USER", event.payload)];
      case "TWEET_CREATE":
        return lowerTweetWithOptionalTyping(
          event,
          deviceId,
          scratchpad.lastComposeOpenAtByDevice.get(deviceId),
          buildAddTweetPayload(event),
        );
      case "TWEET_REPLY":
        return lowerTweetWithOptionalTyping(
          event,
          deviceId,
          scratchpad.lastComposeOpenAtByDevice.get(deviceId),
          buildAddTweetPayload(event, { replyToId: event.payload.replyToId }),
        );
      case "TWEET_QUOTE":
        return lowerTweetWithOptionalTyping(
          event,
          deviceId,
          scratchpad.lastComposeOpenAtByDevice.get(deviceId),
          buildAddTweetPayload(event, { quoteTweetId: event.payload.quoteTweetId }),
        );
      case "TWEET_REPOST":
        return [
          createRuntimeEvent(event, "ADD_TWEET", {
            id: event.payload.id ?? `tw-${event.at}-${event._declarationOrder ?? 0}`,
            authorId: event.payload.authorId,
            text: event.payload.text ?? "",
            repostOfId: event.payload.repostOfId,
            createdAt: getTimestamp(event, event.payload.createdAt),
            hashtags: [],
            mentions: [],
          }),
        ];
      case "TWEET_LIKE":
        return [createRuntimeEvent(event, "LIKE_TWEET", event.payload)];
      case "TWEET_VIEW":
        return [createRuntimeEvent(event, "VIEW_TWEET", event.payload)];
      case "TWEET_BOOKMARK":
        return [createRuntimeEvent(event, "BOOKMARK_TWEET", event.payload)];
      case "TWEET_SHARE":
        return [createRuntimeEvent(event, "SHARE_TWEET", event.payload)];
      case "NAVIGATE": {
        {
          if (event.payload.screen === "compose") {
            scratchpad.lastComposeOpenAtByDevice.set(deviceId, event.at);
          }
          if (event.payload.screen === "thread" && event.payload.threadId) {
            scratchpad.lastThreadOpenAtByDeviceThread.set(
              `${deviceId}::${event.payload.threadId}`,
              event.at,
            );
          }
        }
        const events: RuntimeEvent[] = [
          createRuntimeEvent(event, "SET_SCREEN", {
            screen: event.payload.screen,
            tweetId: event.payload.tweetId,
            userId: event.payload.userId,
            threadId: event.payload.threadId,
          }),
        ];
        if (event.payload.tweetId) {
          events.push(
            createRuntimeEvent(event, "SET_ACTIVE_TWEET", {
              tweetId: event.payload.tweetId,
            })
          );
        }
        if (event.payload.userId) {
          events.push(
            createRuntimeEvent(event, "SET_ACTIVE_USER", {
              userId: event.payload.userId,
            })
          );
        }
        if (event.payload.threadId) {
          events.push(
            createRuntimeEvent(event, "SET_ACTIVE_THREAD", {
              threadId: event.payload.threadId,
            })
          );
        }
        return events;
      }
      case "NAVIGATE_BACK":
        return [createRuntimeEvent(event, "NAVIGATE_BACK", {})];
      case "SET_COMPOSE_DRAFT":
        return [
          createRuntimeEvent(event, "SET_COMPOSE_DRAFT", {
            text: event.payload.text ?? "",
          }),
        ];
      case "SET_NOTIFICATIONS_TAB":
        return [createRuntimeEvent(event, "SET_NOTIFICATIONS_TAB", event.payload)];
      case "NOTIFICATION_ADD":
        return [
          createRuntimeEvent(event, "ADD_NOTIFICATION", {
            id: event.payload.id ?? `nt-${event.at}-${event._declarationOrder ?? 0}`,
            type: event.payload.type,
            actorId: event.payload.actorId,
            tweetId: event.payload.tweetId,
            isMention: event.payload.isMention,
            createdAt: getTimestamp(event, event.payload.createdAt),
          }),
        ];
      case "DM_THREAD_CREATE":
        return [
          createRuntimeEvent(event, "ADD_DM_THREAD", {
            id: event.payload.id ?? `dm-${event.at}-${event._declarationOrder ?? 0}`,
            participantIds: event.payload.participantIds ?? [],
            messageIds: [],
          }),
        ];
      case "DM_SEND":
        if (event.payload?.typed) {
          const text = event.payload.text ?? "";
          const threadOpenedAt =
            scratchpad.lastThreadOpenAtByDeviceThread.get(
              `${deviceId}::${event.payload.threadId}`,
            ) ?? 0;

          const after: RuntimeEvent[] = [
            createRuntimeEvent(event, "ADD_DM_MESSAGE", {
              id: event.payload.id ?? `msg-${event.at}-${event._declarationOrder ?? 0}`,
              threadId: event.payload.threadId,
              senderId: event.payload.senderId,
              text,
              createdAt: getTimestamp(event, event.payload.createdAt),
            }),
          ];

          const plan = planTypedKeyboard({
            deviceId,
            submitAt: event.at,
            text,
            requestedCharDelay: event.payload.charDelay ?? 2,
            notBeforeFrame: threadOpenedAt,
            keyboardType: "default",
            returnKeyType: "send",
          });

          if (!plan.ok) return after;

          const [showEv, typeEv, pressEv, hideEv] = plan.events;
          return [showEv, typeEv, pressEv, ...after, hideEv];
        }

        return [
          createRuntimeEvent(event, "ADD_DM_MESSAGE", {
            id: event.payload.id ?? `msg-${event.at}-${event._declarationOrder ?? 0}`,
            threadId: event.payload.threadId,
            senderId: event.payload.senderId,
            text: event.payload.text ?? "",
            createdAt: getTimestamp(event, event.payload.createdAt),
          }),
        ];
      case "SET_THEME_MODE":
        return [
          createRuntimeEvent(event, "SET_THEME_MODE", {
            mode: event.payload.mode,
          }),
        ];
      default:
        return [];
    }
  },
};
