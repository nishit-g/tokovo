import { parseTimeToFrames } from "@tokovo/dsl";
import type {
  InstagramComposerDraftPayload,
  InstagramDMMessagePayload,
  InstagramDMThreadPayload,
  InstagramEventPayloadMap,
  InstagramEventType,
  InstagramNavigatePayload,
  InstagramNotificationPayload,
  InstagramPostPayload,
  InstagramStoryReplyPayload,
  InstagramStorySetPayload,
  InstagramThemeMode,
  InstagramTrackEvent,
  InstagramUserPayload,
} from "../types/index.js";

type GetDeclarationOrder = () => number;

type PayloadInput<T extends InstagramEventType> =
  | InstagramEventPayloadMap[T]
  | ((order: number) => InstagramEventPayloadMap[T]);

function createPostId(frame: number, order: number): string {
  return `ig-post-${frame}-${order}`;
}

function createCommentId(frame: number, order: number): string {
  return `ig-comment-${frame}-${order}`;
}

function createStorySetId(frame: number, order: number): string {
  return `ig-story-set-${frame}-${order}`;
}

function createThreadId(frame: number, order: number): string {
  return `ig-thread-${frame}-${order}`;
}

function createMessageId(frame: number, order: number): string {
  return `ig-msg-${frame}-${order}`;
}

function createNotificationId(frame: number, order: number): string {
  return `ig-nt-${frame}-${order}`;
}

class InstagramPointBuilder {
  constructor(
    private readonly frame: number,
    private readonly deviceId: string,
    private readonly events: InstagramTrackEvent[],
    private readonly getOrder: GetDeclarationOrder,
  ) {}

  private push<T extends InstagramEventType>(type: T, payload: PayloadInput<T>): void {
    const order = this.getOrder();
    const resolved = typeof payload === "function" ? payload(order) : payload;
    this.events.push({
      at: this.frame,
      kind: "APP",
      appId: "app_instagram",
      type,
      payload: resolved,
      deviceId: this.deviceId,
      _declarationOrder: order,
    } as InstagramTrackEvent);
  }

  addUser(data: InstagramUserPayload): void {
    this.push("USER_ADD", data);
  }

  setCurrentUser(userId: string): void {
    this.push("SET_CURRENT_USER", { userId });
  }

  follow(followerId: string, followingId: string): void {
    this.push("FOLLOW_USER", { followerId, followingId });
  }

  addPost(data: Omit<InstagramPostPayload, "id"> & { id?: string }): void {
    this.push("POST_ADD", (order) => ({
      ...data,
      id: data.id ?? createPostId(this.frame, order),
    }));
  }

  likePost(postId: string, userId: string): void {
    this.push("POST_LIKE", { postId, userId });
  }

  commentOnPost(data: {
    id?: string;
    postId: string;
    authorId: string;
    text: string;
    createdAt?: number;
  }): void {
    this.push("POST_COMMENT", (order) => ({
      ...data,
      id: data.id ?? createCommentId(this.frame, order),
    }));
  }

  addStorySet(data: Omit<InstagramStorySetPayload, "id"> & { id?: string }): void {
    this.push("STORY_SET_ADD", (order) => ({
      ...data,
      id: data.id ?? createStorySetId(this.frame, order),
    }));
  }

  openStory(storySetId: string, storyId?: string): void {
    this.push("STORY_OPEN", { storySetId, storyId });
  }

  advanceStory(storySetId: string, direction: "next" | "prev" = "next"): void {
    this.push("STORY_ADVANCE", { storySetId, direction });
  }

  replyToStory(data: Omit<InstagramStoryReplyPayload, "id"> & { id?: string }): void {
    this.push("STORY_REPLY", (order) => ({
      ...data,
      id: data.id ?? createMessageId(this.frame, order),
    }));
  }

  addThread(data: Omit<InstagramDMThreadPayload, "id"> & { id?: string }): void {
    this.push("DM_THREAD_ADD", (order) => ({
      ...data,
      id: data.id ?? createThreadId(this.frame, order),
    }));
  }

  addDMMessage(data: Omit<InstagramDMMessagePayload, "id"> & { id?: string }): void {
    this.push("DM_MESSAGE_ADD", (order) => ({
      ...data,
      id: data.id ?? createMessageId(this.frame, order),
    }));
  }

  setThreadDraft(threadId: string, text: string): void {
    this.push("SET_THREAD_DRAFT", { threadId, text });
  }

  setThreadTyping(threadId: string, userId: string | null): void {
    this.push("SET_THREAD_TYPING", { threadId, userId });
  }

  notify(data: Omit<InstagramNotificationPayload, "id"> & { id?: string }): void {
    this.push("NOTIFICATION_ADD", (order) => ({
      ...data,
      id: data.id ?? createNotificationId(this.frame, order),
    }));
  }

  dismissNotification(id: string): void {
    this.push("NOTIFICATION_DISMISS", { id });
  }

  navigate(screen: InstagramNavigatePayload["screen"], options: Omit<InstagramNavigatePayload, "screen"> = {}): void {
    this.push("NAVIGATE", { screen, ...options });
  }

  goBack(): void {
    this.push("NAVIGATE_BACK", {});
  }

  setComposerDraft(data: InstagramComposerDraftPayload): void {
    this.push("SET_COMPOSER_DRAFT", data);
  }

  setProfileTab(tab: "posts" | "tagged"): void {
    this.push("SET_PROFILE_TAB", { tab });
  }

  setThemeMode(mode: InstagramThemeMode): void {
    this.push("SET_THEME_MODE", { mode });
  }
}

export class InstagramTrackBuilder {
  readonly _events: InstagramTrackEvent[] = [];

  constructor(
    private readonly fps: number,
    private readonly deviceId: string,
    private readonly getOrder: GetDeclarationOrder,
  ) {}

  at(time: string | number): InstagramPointBuilder {
    const frame = typeof time === "number" ? time : parseTimeToFrames(time, this.fps);
    return new InstagramPointBuilder(frame, this.deviceId, this._events, this.getOrder);
  }

  span(start: string | number, _end: string | number): InstagramPointBuilder {
    return this.at(start);
  }
}

export function createInstagramTrackBuilder(
  fps: number,
  deviceId: string,
  getOrder: GetDeclarationOrder,
): InstagramTrackBuilder {
  return new InstagramTrackBuilder(fps, deviceId, getOrder);
}
