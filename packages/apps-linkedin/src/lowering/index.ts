import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import type { LITrackEvent } from "../types/index.js";

export interface LILoweringHandler {
  lower: (event: TrackEvent) => RuntimeEvent[];
}

function isLITrackEvent(event: TrackEvent): event is LITrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === "app_linkedin"
  );
}

function clampFrame(frame: number): number {
  return Math.max(0, Math.round(frame));
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

function expandTypedText(params: {
  at: number;
  deviceId: string;
  text: string;
  charDelay?: number;
  returnKeyType?: string;
  after: () => RuntimeEvent[];
  clearDraftEvents?: () => RuntimeEvent[];
}): RuntimeEvent[] {
  const {
    at,
    deviceId,
    text,
    charDelay = 2,
    returnKeyType = "send",
    after,
    clearDraftEvents,
  } = params;

  if (!text) return after();

  const typeDuration = text.length * charDelay;
  const keyboardShowAt = clampFrame(at - typeDuration - 20);
  const typeStartAt = clampFrame(at - typeDuration - 5);
  const returnPressAt = clampFrame(at - 3);
  const keyboardHideAt = clampFrame(at + 15);

  const result: RuntimeEvent[] = [];

  result.push({
    at: keyboardShowAt,
    kind: "DEVICE",
    type: "KEYBOARD_SHOW",
    deviceId,
    payload: { returnKeyType },
  } as unknown as RuntimeEvent);

  result.push({
    at: typeStartAt,
    kind: "DEVICE",
    type: "KEYBOARD_TYPE",
    deviceId,
    payload: { text, charDelay },
  } as unknown as RuntimeEvent);

  result.push({
    at: returnPressAt,
    kind: "DEVICE",
    type: "KEYBOARD_KEY_PRESS",
    deviceId,
    payload: { key: "return", duration: 4 },
  } as unknown as RuntimeEvent);

  result.push(...after());

  if (clearDraftEvents) {
    result.push(...clearDraftEvents());
  }

  result.push({
    at: keyboardHideAt,
    kind: "DEVICE",
    type: "KEYBOARD_HIDE",
    deviceId,
    payload: {},
  } as unknown as RuntimeEvent);

  return result;
}

export const linkedInLowering: LILoweringHandler = {
  lower: (event: TrackEvent): RuntimeEvent[] => {
    if (!isLITrackEvent(event)) return [];
    const deviceId = (event as { deviceId?: string }).deviceId;
    if (!deviceId) return [];

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
          return expandTypedText({
            at: event.at,
            deviceId,
            text,
            charDelay: event.payload.charDelay,
            returnKeyType: "post",
            after: () => [
              createRuntimeEvent(event, "LINKEDIN_SET_COMPOSE_DRAFT", { text }),
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
            ],
            clearDraftEvents: () => [createRuntimeEvent(event, "LINKEDIN_SET_COMPOSE_DRAFT", { text: "" })],
          });
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
          return expandTypedText({
            at: event.at,
            deviceId,
            text,
            charDelay: event.payload.charDelay,
            returnKeyType: "send",
            after: () => [
              createRuntimeEvent(event, "LINKEDIN_ADD_COMMENT", {
                id: event.payload.id ?? `li-c-${event.at}-${event._declarationOrder ?? 0}`,
                postId: event.payload.postId,
                authorId: event.payload.authorId,
                text,
                createdAt: typeof event.payload.createdAt === "number" ? event.payload.createdAt : event.at,
              }),
            ],
          });
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
          return expandTypedText({
            at: event.at,
            deviceId,
            text,
            charDelay: event.payload.charDelay,
            returnKeyType: "send",
            after: () => [
              createRuntimeEvent(event, "LINKEDIN_ADD_DM_MESSAGE", {
                id: event.payload.id ?? `li-msg-${event.at}-${event._declarationOrder ?? 0}`,
                threadId: event.payload.threadId,
                senderId: event.payload.senderId,
                text,
                createdAt: typeof event.payload.createdAt === "number" ? event.payload.createdAt : event.at,
              }),
            ],
          });
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
