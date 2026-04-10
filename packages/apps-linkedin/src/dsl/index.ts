import { parseTimeToFrames } from "@tokovo/dsl";
import type {
  LITrackEvent,
  LIEventType,
  LIEventPayloadMap,
  LIScreen,
  LIReactionType,
} from "../types/index.js";

type GetDeclarationOrder = () => number;

type PayloadInput<T extends LIEventType> =
  | LIEventPayloadMap[T]
  | ((order: number) => LIEventPayloadMap[T]);

function createUserId(frame: number, order: number): string {
  return `li-user-${frame}-${order}`;
}

function createPostId(frame: number, order: number): string {
  return `li-post-${frame}-${order}`;
}

function createCommentId(frame: number, order: number): string {
  return `li-c-${frame}-${order}`;
}

function createNotificationId(frame: number, order: number): string {
  return `li-nt-${frame}-${order}`;
}

function createThreadId(frame: number, order: number): string {
  return `li-dm-${frame}-${order}`;
}

function createMessageId(frame: number, order: number): string {
  return `li-msg-${frame}-${order}`;
}

type UserInput = Omit<LIEventPayloadMap["USER_CREATE"], "id"> & { id?: string };
type PostInput = Omit<LIEventPayloadMap["POST_CREATE"], "id"> & { id?: string };
type CommentInput = Omit<LIEventPayloadMap["POST_COMMENT"], "id"> & { id?: string };
type NotificationInput = Omit<LIEventPayloadMap["NOTIFICATION_ADD"], "id"> & { id?: string };
type MessageInput = Omit<LIEventPayloadMap["DM_SEND"], "id"> & { id?: string };

class LIPointBuilder {
  constructor(
    private _frame: number,
    private _deviceId: string,
    private _events: LITrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) { }

  private _push<T extends LIEventType>(
    type: T,
    payload: PayloadInput<T>,
    duration?: number,
  ): void {
    const order = this._getOrder();
    const resolvedPayload = typeof payload === "function" ? payload(order) : payload;
    this._events.push({
      at: this._frame,
      duration,
      kind: "APP",
      appId: "app_linkedin",
      type,
      payload: resolvedPayload,
      deviceId: this._deviceId,
      _declarationOrder: order,
    } as unknown as LITrackEvent);
  }

  createUser(data: UserInput): void {
    this._push("USER_CREATE", (order) => ({
      id: data.id ?? createUserId(this._frame, order),
      name: data.name,
      handle: data.handle,
      headline: data.headline,
      avatarUrl: data.avatarUrl,
      connections: data.connections,
      followers: data.followers,
    }));
  }

  setCurrentUser(userId: string): void {
    this._push("SET_CURRENT_USER", { userId });
  }

  connect(a: string, b: string): void {
    this._push("CONNECT_USERS", { a, b });
  }

  disconnect(a: string, b: string): void {
    this._push("DISCONNECT_USERS", { a, b });
  }

  post(data: PostInput): void {
    this._push("POST_CREATE", (order) => ({
      id: data.id ?? createPostId(this._frame, order),
      authorId: data.authorId,
      text: data.text,
      createdAt: data.createdAt,
      visibility: data.visibility,
      media: data.media,
      linkPreview: data.linkPreview,
      hashtags: data.hashtags,
      mentions: data.mentions,
      typed: data.typed,
      charDelay: data.charDelay,
    }));
  }

  repost(authorId: string, repostOfId: string, opts: { id?: string; text?: string; createdAt?: number } = {}): void {
    this._push("POST_REPOST", (order) => ({
      id: opts.id ?? createPostId(this._frame, order),
      authorId,
      repostOfId,
      text: opts.text,
      createdAt: opts.createdAt,
    }));
  }

  react(postId: string, userId: string, reaction: LIReactionType = "like"): void {
    this._push("POST_REACT", { postId, userId, reaction });
  }

  comment(data: CommentInput): void {
    this._push("POST_COMMENT", (order) => ({
      id: data.id ?? createCommentId(this._frame, order),
      postId: data.postId,
      authorId: data.authorId,
      text: data.text,
      createdAt: data.createdAt,
      typed: data.typed,
      charDelay: data.charDelay,
    }));
  }

  view(postId: string): void {
    this._push("POST_VIEW", { postId });
  }

  navigate(
    screen: LIScreen,
    opts: { postId?: string; userId?: string; threadId?: string } = {},
  ): void {
    this._push("NAVIGATE", { screen, ...opts });
  }

  goBack(): void {
    this._push("NAVIGATE_BACK", {});
  }

  setComposeDraft(text: string): void {
    this._push("SET_COMPOSE_DRAFT", { text });
  }

  addNotification(data: NotificationInput): void {
    this._push("NOTIFICATION_ADD", (order) => ({
      id: data.id ?? createNotificationId(this._frame, order),
      type: data.type,
      actorId: data.actorId,
      postId: data.postId,
      createdAt: data.createdAt,
    }));
  }

  createThread(participantIds: string[], id?: string): void {
    this._push("DM_THREAD_CREATE", (order) => ({
      id: id ?? createThreadId(this._frame, order),
      participantIds,
    }));
  }

  sendDM(params: { id?: string; threadId: string; senderId: string; text: string; createdAt?: number; typed?: boolean; charDelay?: number }): void {
    this._push("DM_SEND", (order) => ({
      id: params.id ?? createMessageId(this._frame, order),
      threadId: params.threadId,
      senderId: params.senderId,
      text: params.text,
      createdAt: params.createdAt,
      typed: params.typed,
      charDelay: params.charDelay,
    }));
  }

  setThemeMode(mode: "light" | "dark"): void {
    this._push("SET_THEME_MODE", { mode });
  }
}

class LISpanBuilder {
  constructor(
    private _frame: number,
    private _duration: number,
    private _deviceId: string,
    private _events: LITrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) { }

  private _push<T extends LIEventType>(
    type: T,
    payload: PayloadInput<T>,
  ): void {
    const order = this._getOrder();
    const resolvedPayload = typeof payload === "function" ? payload(order) : payload;
    this._events.push({
      at: this._frame,
      duration: this._duration,
      kind: "APP",
      appId: "app_linkedin",
      type,
      payload: resolvedPayload,
      deviceId: this._deviceId,
      _declarationOrder: order,
    } as unknown as LITrackEvent);
  }

  setComposeDraft(text: string): void {
    this._push("SET_COMPOSE_DRAFT", { text });
  }
}

export class LinkedInTrackBuilder {
  _events: LITrackEvent[] = [];

  constructor(
    private _fps: number,
    private _deviceId: string,
    private _getOrder: GetDeclarationOrder,
  ) { }

  at(time: string | number): LIPointBuilder {
    const frame = typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new LIPointBuilder(frame, this._deviceId, this._events, this._getOrder);
  }

  span(start: string | number, end: string | number): LISpanBuilder {
    const startFrame = typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    const endFrame = typeof end === "number" ? end : parseTimeToFrames(end, this._fps);
    const duration = Math.max(0, endFrame - startFrame);
    return new LISpanBuilder(startFrame, duration, this._deviceId, this._events, this._getOrder);
  }
}
