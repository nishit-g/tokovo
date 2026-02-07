import type { TrackEvent } from "@tokovo/ir";
import { getLoweringScratchpad, planTypedKeyboard, type RuntimeEvent } from "@tokovo/core";
import type { LITrackEvent } from "../types/index.js";

export interface LILoweringHandler {
  lower: (event: TrackEvent, ctx?: unknown) => RuntimeEvent[];
}

function isLITrackEvent(event: TrackEvent): event is LITrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_linkedin"
  );
}

function createRuntimeEvent(event: TrackEvent, type: string, payload: unknown): RuntimeEvent {
  return {
    at: event.at,
    kind: "APP",
    appId: "app_linkedin",
    type,
    payload,
    deviceId: event.deviceId,
  } as RuntimeEvent;
}

type LinkedInLoweringScratchpad = {
  lastComposeOpenAtByDevice: Map<string, number>;
  lastPostOpenAtByDevice: Map<string, number>;
  lastThreadOpenAtByDeviceThread: Map<string, number>;
};

export const linkedInLowering: LILoweringHandler = {
  lower: (event: TrackEvent, ctx?: unknown): RuntimeEvent[] => {
    if (!isLITrackEvent(event)) return [];
    const deviceId = (event as { deviceId?: string }).deviceId;
    if (!deviceId) return [];
    const scratchpad = getLoweringScratchpad<LinkedInLoweringScratchpad>(
      ctx,
      "app_linkedin.lowering",
      () => ({
        lastComposeOpenAtByDevice: new Map(),
        lastPostOpenAtByDevice: new Map(),
        lastThreadOpenAtByDeviceThread: new Map(),
      }),
    );

    switch (event.type) {
      case "USER_CREATE":
        return [
          createRuntimeEvent(event, "LINKEDIN_ADD_USER", {
            id: event.payload.id,
            name: event.payload.name,
            handle: event.payload.handle,
            headline: event.payload.headline,
            avatarUrl: event.payload.avatarUrl,
            connections: event.payload.connections ?? 0,
            followers: event.payload.followers ?? 0,
          }),
        ];
      case "SET_CURRENT_USER":
        return [createRuntimeEvent(event, "LINKEDIN_SET_CURRENT_USER", { userId: event.payload.userId })];
      case "CONNECT_USERS":
        return [createRuntimeEvent(event, "LINKEDIN_CONNECT_USERS", event.payload)];
      case "DISCONNECT_USERS":
        return [createRuntimeEvent(event, "LINKEDIN_DISCONNECT_USERS", event.payload)];

      case "POST_CREATE": {
        const typed = Boolean(event.payload.typed);
        const text = event.payload.text ?? "";
        if (typed) {
          const composeOpenedAt =
            scratchpad.lastComposeOpenAtByDevice.get(deviceId) ?? 0;

          const after: RuntimeEvent[] = [
            createRuntimeEvent(event, "LINKEDIN_SET_COMPOSE_DRAFT", { text }),
            createRuntimeEvent(event, "LINKEDIN_ADD_POST", {
              id: event.payload.id ?? `li-${event.at}-${event._declarationOrder ?? 0}`,
              authorId: event.payload.authorId,
              text,
              createdAt:
                typeof event.payload.createdAt === "number"
                  ? event.payload.createdAt
                  : event.at,
              visibility: event.payload.visibility ?? "public",
              media: event.payload.media,
              linkPreview: event.payload.linkPreview,
              hashtags: event.payload.hashtags ?? [],
              mentions: event.payload.mentions ?? [],
            }),
          ];
          const clearDraft: RuntimeEvent[] = [
            createRuntimeEvent(event, "LINKEDIN_SET_COMPOSE_DRAFT", { text: "" }),
          ];

          const plan = planTypedKeyboard({
            deviceId,
            submitAt: event.at,
            text,
            requestedCharDelay: event.payload.charDelay ?? 2,
            notBeforeFrame: composeOpenedAt,
            keyboardType: "default",
            returnKeyType: "post",
          });

          if (!plan.ok) return [...after, ...clearDraft];

          const [showEv, typeEv, pressEv, hideEv] = plan.events;
          return [showEv, typeEv, pressEv, ...after, ...clearDraft, hideEv];
        }
        return [
          createRuntimeEvent(event, "LINKEDIN_ADD_POST", {
            id: event.payload.id ?? `li-${event.at}-${event._declarationOrder ?? 0}`,
            authorId: event.payload.authorId,
            text,
            createdAt: typeof event.payload.createdAt === "number" ? event.payload.createdAt : event.at,
            visibility: event.payload.visibility ?? "public",
            media: event.payload.media,
            linkPreview: event.payload.linkPreview,
            hashtags: event.payload.hashtags ?? [],
            mentions: event.payload.mentions ?? [],
          }),
        ];
      }

      case "POST_REPOST":
        return [
          createRuntimeEvent(event, "LINKEDIN_REPOST_POST", {
            id: event.payload.id ?? `li-repost-${event.at}-${event._declarationOrder ?? 0}`,
            authorId: event.payload.authorId,
            repostOfId: event.payload.repostOfId,
            text: event.payload.text ?? "",
            createdAt: typeof event.payload.createdAt === "number" ? event.payload.createdAt : event.at,
          }),
        ];

      case "POST_REACT":
        return [createRuntimeEvent(event, "LINKEDIN_REACT_POST", event.payload)];

      case "POST_COMMENT": {
        const typed = Boolean(event.payload.typed);
        const text = event.payload.text ?? "";
        if (typed) {
          const postOpenedAt =
            scratchpad.lastPostOpenAtByDevice.get(deviceId) ?? 0;
          const after: RuntimeEvent[] = [
            createRuntimeEvent(event, "LINKEDIN_ADD_COMMENT", {
              id: event.payload.id ?? `li-c-${event.at}-${event._declarationOrder ?? 0}`,
              postId: event.payload.postId,
              authorId: event.payload.authorId,
              text,
              createdAt:
                typeof event.payload.createdAt === "number"
                  ? event.payload.createdAt
                  : event.at,
            }),
          ];

          const plan = planTypedKeyboard({
            deviceId,
            submitAt: event.at,
            text,
            requestedCharDelay: event.payload.charDelay ?? 2,
            notBeforeFrame: postOpenedAt,
            keyboardType: "default",
            returnKeyType: "send",
          });

          if (!plan.ok) return after;

          const [showEv, typeEv, pressEv, hideEv] = plan.events;
          return [showEv, typeEv, pressEv, ...after, hideEv];
        }
        return [
          createRuntimeEvent(event, "LINKEDIN_ADD_COMMENT", {
            id: event.payload.id ?? `li-c-${event.at}-${event._declarationOrder ?? 0}`,
            postId: event.payload.postId,
            authorId: event.payload.authorId,
            text,
            createdAt: typeof event.payload.createdAt === "number" ? event.payload.createdAt : event.at,
          }),
        ];
      }

      case "POST_VIEW":
        return [createRuntimeEvent(event, "LINKEDIN_VIEW_POST", event.payload)];

      case "NAVIGATE": {
        if (event.payload.screen === "compose") {
          scratchpad.lastComposeOpenAtByDevice.set(deviceId, event.at);
        }
        if (event.payload.screen === "post") {
          scratchpad.lastPostOpenAtByDevice.set(deviceId, event.at);
        }
        if (event.payload.screen === "thread" && event.payload.threadId) {
          scratchpad.lastThreadOpenAtByDeviceThread.set(
            `${deviceId}::${event.payload.threadId}`,
            event.at,
          );
        }
        const evs: RuntimeEvent[] = [
          createRuntimeEvent(event, "LINKEDIN_SET_SCREEN", {
            screen: event.payload.screen,
            postId: event.payload.postId,
            userId: event.payload.userId,
            threadId: event.payload.threadId,
          }),
        ];
        if (event.payload.postId) evs.push(createRuntimeEvent(event, "LINKEDIN_SET_ACTIVE_POST", { postId: event.payload.postId }));
        if (event.payload.userId) evs.push(createRuntimeEvent(event, "LINKEDIN_SET_ACTIVE_USER", { userId: event.payload.userId }));
        if (event.payload.threadId) evs.push(createRuntimeEvent(event, "LINKEDIN_SET_ACTIVE_THREAD", { threadId: event.payload.threadId }));
        return evs;
      }

      case "NAVIGATE_BACK":
        return [createRuntimeEvent(event, "LINKEDIN_NAVIGATE_BACK", {})];

      case "SET_COMPOSE_DRAFT":
        return [createRuntimeEvent(event, "LINKEDIN_SET_COMPOSE_DRAFT", { text: event.payload.text ?? "" })];

      case "SET_THEME_MODE":
        return [createRuntimeEvent(event, "LINKEDIN_SET_THEME_MODE", { mode: event.payload.mode })];

      case "NOTIFICATION_ADD":
        return [
          createRuntimeEvent(event, "LINKEDIN_ADD_NOTIFICATION", {
            id: event.payload.id ?? `li-nt-${event.at}-${event._declarationOrder ?? 0}`,
            type: event.payload.type,
            actorId: event.payload.actorId,
            postId: event.payload.postId,
            createdAt: typeof event.payload.createdAt === "number" ? event.payload.createdAt : event.at,
          }),
        ];

      case "DM_THREAD_CREATE":
        return [
          createRuntimeEvent(event, "LINKEDIN_ADD_DM_THREAD", {
            id: event.payload.id ?? `li-dm-${event.at}-${event._declarationOrder ?? 0}`,
            participantIds: event.payload.participantIds ?? [],
          }),
        ];

      case "DM_SEND": {
        const typed = Boolean(event.payload.typed);
        const text = event.payload.text ?? "";
        if (typed) {
          const threadOpenedAt =
            scratchpad.lastThreadOpenAtByDeviceThread.get(
              `${deviceId}::${event.payload.threadId}`,
            ) ?? 0;

          const after: RuntimeEvent[] = [
            createRuntimeEvent(event, "LINKEDIN_ADD_DM_MESSAGE", {
              id: event.payload.id ?? `li-msg-${event.at}-${event._declarationOrder ?? 0}`,
              threadId: event.payload.threadId,
              senderId: event.payload.senderId,
              text,
              createdAt:
                typeof event.payload.createdAt === "number"
                  ? event.payload.createdAt
                  : event.at,
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
          createRuntimeEvent(event, "LINKEDIN_ADD_DM_MESSAGE", {
            id: event.payload.id ?? `li-msg-${event.at}-${event._declarationOrder ?? 0}`,
            threadId: event.payload.threadId,
            senderId: event.payload.senderId,
            text,
            createdAt: typeof event.payload.createdAt === "number" ? event.payload.createdAt : event.at,
          }),
        ];
      }

      default:
        return [];
    }
  },
};
