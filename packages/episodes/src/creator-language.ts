import type { IMessageTrackBuilder } from "@tokovo/apps-imessage";
import type { InstagramTrackBuilder } from "@tokovo/apps-instagram";
import type { LinkedInTrackBuilder } from "@tokovo/apps-linkedin";
import type { SnapchatTrackBuilder } from "@tokovo/apps-snapchat";
import type { TeamsMessageTarget, TeamsTrackBuilder } from "@tokovo/apps-teams";
import type { TypewriterTrackBuilder } from "@tokovo/apps-typewriter";
import type { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import type { XTrackBuilder } from "@tokovo/apps-x";
import {
  parseDurationToFrames,
  parseTimeToFrames,
  type AudioTrackBuilder,
  type DeviceTrackBuilderV2,
  type OverlayTrackBuilder,
} from "@tokovo/dsl";
import type { CinematicSubjectRefIR } from "@tokovo/ir";
import type { CodeFirstEpisodeBuilder } from "./code-first-episode.js";

export type BuiltInApp =
  | "whatsapp"
  | "imessage"
  | "instagram"
  | "x"
  | "linkedin"
  | "snapchat"
  | "teams"
  | "typewriter";

export interface ActorIdentity {
  id?: string;
  name?: string;
  handle?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface ActorProfile {
  name: string;
  avatar?: string;
  identities?: Partial<Record<BuiltInApp, ActorIdentity>>;
}

export interface ActorRef {
  readonly id: string;
  readonly name: string;
  readonly avatar?: string;
  identity(
    app: BuiltInApp,
  ): Required<Pick<ActorIdentity, "id" | "name">> & ActorIdentity;
}

export function actor(id: string, profile: ActorProfile): ActorRef {
  if (!id.trim()) throw new Error("Actor id must not be empty");
  if (!profile.name.trim()) throw new Error(`Actor "${id}" must have a name`);

  return Object.freeze({
    id,
    name: profile.name,
    avatar: profile.avatar,
    identity(app: BuiltInApp) {
      const identity = profile.identities?.[app] ?? {};
      return {
        ...identity,
        id: identity.id ?? id,
        name: identity.name ?? profile.name,
      };
    },
  });
}

export function cast<const T extends Record<string, ActorRef>>(
  actors: T,
): Readonly<T> {
  return Object.freeze({ ...actors });
}

export type StoryHandleKind = "message" | "post" | "comment" | "notification";

export interface StoryHandle<K extends StoryHandleKind = StoryHandleKind> {
  readonly id: string;
  readonly kind: K;
  readonly app: BuiltInApp;
  readonly appId: string;
  readonly deviceId: string;
  readonly subject: CinematicSubjectRefIR;
  readonly frame: number;
  region(subjectId: string): CinematicSubjectRefIR;
}

export type MessageHandle = StoryHandle<"message">;
export type PostHandle = StoryHandle<"post">;
export type CommentHandle = StoryHandle<"comment">;

export interface SceneOptions {
  at: string | number;
  duration?: string | number;
}

export interface ConversationMessageOptions {
  id?: string;
  silent?: boolean;
  replyTo?: MessageHandle;
  hold?: string | number;
}

export type ConversationOptions =
  | {
      app: "whatsapp" | "imessage" | "snapchat";
      deviceId: string;
      conversationId: string;
      currentActor?: ActorRef;
    }
  | {
      app: "teams";
      deviceId: string;
      conversationId: string;
      currentActor?: ActorRef;
      target?: TeamsMessageTarget;
    }
  | {
      app: "instagram" | "linkedin" | "x";
      deviceId: string;
      conversationId: string;
      currentActor: ActorRef;
    };

export interface SocialOptions {
  app: "instagram" | "linkedin" | "x";
  deviceId: string;
  currentActor: ActorRef;
}

export interface SocialPostOptions {
  id?: string;
  author?: ActorRef;
  createdAt?: number;
  mediaUrl?: string;
  hold?: string | number;
}

export interface SocialCommentOptions {
  id?: string;
  createdAt?: number;
  hold?: string | number;
}

type TimedTrack = {
  at(time: string | number): unknown;
  span(start: string | number, end: string | number): unknown;
};

function appId(app: BuiltInApp): string {
  return `app_${app}`;
}

function normalizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "");
}

function createHandle<K extends StoryHandleKind>(input: {
  id: string;
  kind: K;
  app: BuiltInApp;
  deviceId: string;
  frame: number;
}): StoryHandle<K> {
  const resolvedAppId = appId(input.app);
  const semanticSubjectByKind: Record<
    BuiltInApp,
    Partial<Record<StoryHandleKind, string>>
  > = {
    whatsapp: { message: "lastMessage" },
    imessage: { message: "imessage_last_message" },
    instagram: {
      message: "dm_message_latest",
      post: "feed_post_focus",
      comment: "feed_post_focus",
    },
    linkedin: {
      message: "li_dm_focus_message",
      post: "li_post_focus",
      comment: "li_post_focus",
    },
    snapchat: { message: "snapchat_last_message" },
    teams: { message: "teams_thread" },
    typewriter: { message: "textArea" },
    x: {
      message: "dm_message_latest",
      post: "tweet_card",
      comment: "tweet_card",
    },
  };
  const subject: CinematicSubjectRefIR =
    input.app === "whatsapp" && input.kind === "message"
      ? {
          kind: "entity",
          deviceId: input.deviceId,
          appId: resolvedAppId,
          entityType: "message",
          entityId: input.id,
          region: "bubble",
        }
      : {
          kind: "semantic",
          deviceId: input.deviceId,
          appId: resolvedAppId,
          subjectId: semanticSubjectByKind[input.app][input.kind] ?? "app",
        };
  return Object.freeze({
    ...input,
    appId: resolvedAppId,
    subject,
    region(subjectId: string): CinematicSubjectRefIR {
      return {
        kind: "semantic",
        deviceId: input.deviceId,
        appId: resolvedAppId,
        subjectId,
      };
    },
  });
}

function scopeTrack<T extends TimedTrack>(
  track: T,
  offset: number,
  fps: number,
): T {
  const absolute = (time: string | number) =>
    offset + (typeof time === "number" ? time : parseTimeToFrames(time, fps));

  return new Proxy(track, {
    get(target, property, receiver) {
      if (property === "at") {
        return (time: string | number) => target.at(absolute(time));
      }
      if (property === "span") {
        return (start: string | number, end: string | number) =>
          target.span(absolute(start), absolute(end));
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

function actorIdentity(
  value: ActorRef | string,
  app: BuiltInApp,
): { id: string; name: string } {
  return typeof value === "string"
    ? { id: value, name: value }
    : value.identity(app);
}

interface ConversationEmitter {
  app: ConversationOptions["app"];
  deviceId: string;
  open(frame: number): void;
  send(
    frame: number,
    id: string,
    text: string,
    options: ConversationMessageOptions,
  ): void;
  receive(
    frame: number,
    id: string,
    from: { id: string; name: string },
    text: string,
    options: ConversationMessageOptions,
  ): void;
}

export class SceneConversation {
  constructor(
    private readonly scene: SceneBuilder,
    private readonly emitter: ConversationEmitter,
  ) {}

  open(): this {
    this.emitter.open(this.scene.absoluteNow);
    return this;
  }

  at(time: string | number): this {
    this.scene.at(time);
    return this;
  }

  wait(duration: string | number): this {
    this.scene.wait(duration);
    return this;
  }

  send(text: string, options: ConversationMessageOptions = {}): MessageHandle {
    const id = options.id ?? this.scene.nextId("message");
    const frame = this.scene.absoluteNow;
    this.emitter.send(frame, id, text, options);
    const handle = createHandle({
      id,
      kind: "message",
      app: this.emitter.app,
      deviceId: this.emitter.deviceId,
      frame,
    });
    if (options.hold !== undefined) this.wait(options.hold);
    return handle;
  }

  receive(
    from: ActorRef | string,
    text: string,
    options: ConversationMessageOptions = {},
  ): MessageHandle {
    const id = options.id ?? this.scene.nextId("message");
    const frame = this.scene.absoluteNow;
    this.emitter.receive(
      frame,
      id,
      actorIdentity(from, this.emitter.app),
      text,
      options,
    );
    const handle = createHandle({
      id,
      kind: "message",
      app: this.emitter.app,
      deviceId: this.emitter.deviceId,
      frame,
    });
    if (options.hold !== undefined) this.wait(options.hold);
    return handle;
  }

  reply(
    text: string,
    to: MessageHandle,
    options: ConversationMessageOptions = {},
  ): MessageHandle {
    if (to.app !== this.emitter.app || to.deviceId !== this.emitter.deviceId) {
      throw new Error(
        `Cannot reply on ${this.emitter.app}/${this.emitter.deviceId} to a handle from ${to.app}/${to.deviceId}`,
      );
    }
    return this.send(text, { ...options, replyTo: to });
  }
}

interface SocialEmitter {
  app: SocialOptions["app"];
  deviceId: string;
  post(
    frame: number,
    id: string,
    actor: { id: string; name: string },
    text: string,
    options: SocialPostOptions,
  ): void;
  comment(
    frame: number,
    id: string,
    post: PostHandle,
    actor: { id: string; name: string },
    text: string,
    options: SocialCommentOptions,
  ): void;
  open(frame: number, handle: PostHandle): void;
}

export class SceneSocial {
  constructor(
    private readonly scene: SceneBuilder,
    private readonly emitter: SocialEmitter,
    private readonly currentActor: ActorRef,
  ) {}

  at(time: string | number): this {
    this.scene.at(time);
    return this;
  }

  wait(duration: string | number): this {
    this.scene.wait(duration);
    return this;
  }

  post(text: string, options: SocialPostOptions = {}): PostHandle {
    const id = options.id ?? this.scene.nextId("post");
    const frame = this.scene.absoluteNow;
    const author = actorIdentity(
      options.author ?? this.currentActor,
      this.emitter.app,
    );
    this.emitter.post(frame, id, author, text, options);
    const handle = createHandle({
      id,
      kind: "post",
      app: this.emitter.app,
      deviceId: this.emitter.deviceId,
      frame,
    });
    if (options.hold !== undefined) this.wait(options.hold);
    return handle;
  }

  comment(
    post: PostHandle,
    from: ActorRef,
    text: string,
    options: SocialCommentOptions = {},
  ): CommentHandle {
    this.assertPostBelongsHere(post);
    const id = options.id ?? this.scene.nextId("comment");
    const frame = this.scene.absoluteNow;
    this.emitter.comment(
      frame,
      id,
      post,
      actorIdentity(from, this.emitter.app),
      text,
      options,
    );
    const handle = createHandle({
      id,
      kind: "comment",
      app: this.emitter.app,
      deviceId: this.emitter.deviceId,
      frame,
    });
    if (options.hold !== undefined) this.wait(options.hold);
    return handle;
  }

  open(post: PostHandle): this {
    this.assertPostBelongsHere(post);
    this.emitter.open(this.scene.absoluteNow, post);
    return this;
  }

  private assertPostBelongsHere(post: PostHandle): void {
    if (
      post.app !== this.emitter.app ||
      post.deviceId !== this.emitter.deviceId
    ) {
      throw new Error(
        `Cannot use a ${post.app}/${post.deviceId} post handle on ${this.emitter.app}/${this.emitter.deviceId}`,
      );
    }
  }
}

export class SceneBuilder {
  private cursor = 0;
  private idCounter = 0;

  constructor(
    private readonly episode: CodeFirstEpisodeBuilder,
    readonly id: string,
    readonly startFrame: number,
    private readonly fps: number,
    private readonly durationFrames?: number,
  ) {}

  get now(): number {
    return this.cursor;
  }

  get absoluteNow(): number {
    return this.startFrame + this.cursor;
  }

  at(time: string | number): this {
    this.cursor =
      typeof time === "number" ? time : parseTimeToFrames(time, this.fps);
    this.assertInBounds();
    return this;
  }

  wait(duration: string | number): this {
    this.cursor +=
      typeof duration === "number"
        ? duration
        : parseDurationToFrames(duration, this.fps);
    this.assertInBounds();
    return this;
  }

  nextId(kind: StoryHandleKind): string {
    return normalizeId(`${this.id}-${kind}-${this.idCounter++}`);
  }

  private assertInBounds(): void {
    if (this.cursor < 0)
      throw new Error(`Scene "${this.id}" cannot seek before its start`);
    if (
      this.durationFrames !== undefined &&
      this.cursor > this.durationFrames
    ) {
      throw new Error(
        `Scene "${this.id}" cursor ${this.cursor} exceeds its ${this.durationFrames}-frame duration`,
      );
    }
  }

  private scoped<T extends TimedTrack>(track: T): T {
    return scopeTrack(track, this.startFrame, this.fps);
  }

  whatsapp(
    deviceId: string,
    conversationId: string,
    fn: (track: WhatsAppTrackBuilder) => void,
  ): this {
    this.episode.whatsapp(deviceId, conversationId, (track) =>
      fn(this.scoped(track)),
    );
    return this;
  }

  imessage(
    deviceId: string,
    conversationId: string,
    fn: (track: IMessageTrackBuilder) => void,
  ): this {
    this.episode.imessage(deviceId, conversationId, (track) =>
      fn(this.scoped(track)),
    );
    return this;
  }

  snapchat(
    deviceId: string,
    conversationId: string,
    fn: (track: SnapchatTrackBuilder) => void,
  ): this {
    this.episode.snapchat(deviceId, conversationId, (track) =>
      fn(this.scoped(track)),
    );
    return this;
  }

  instagram(
    deviceId: string,
    fn: (track: InstagramTrackBuilder) => void,
  ): this {
    this.episode.instagram(deviceId, (track) => fn(this.scoped(track)));
    return this;
  }

  linkedin(deviceId: string, fn: (track: LinkedInTrackBuilder) => void): this {
    this.episode.linkedin(deviceId, (track) => fn(this.scoped(track)));
    return this;
  }

  teams(
    deviceId: string,
    fn: (track: InstanceType<typeof TeamsTrackBuilder>) => void,
  ): this {
    this.episode.teams(deviceId, (track) => fn(this.scoped(track)));
    return this;
  }

  x(deviceId: string, fn: (track: XTrackBuilder) => void): this {
    this.episode.x(deviceId, (track) => fn(this.scoped(track)));
    return this;
  }

  typewriter(
    deviceId: string,
    fn: (track: TypewriterTrackBuilder) => void,
  ): this {
    this.episode.typewriter(deviceId, (track) => fn(this.scoped(track)));
    return this;
  }

  audio(fn: (track: AudioTrackBuilder) => void): this {
    this.episode.audio((track) => fn(this.scoped(track)));
    return this;
  }

  overlay(fn: (track: OverlayTrackBuilder) => void): this {
    this.episode.overlay((track) => fn(this.scoped(track)));
    return this;
  }

  deviceTrack(
    deviceId: string,
    fn: (track: DeviceTrackBuilderV2) => void,
  ): this {
    this.episode.deviceTrack(deviceId, (track) => fn(this.scoped(track)));
    return this;
  }

  conversation(
    options: ConversationOptions,
    fn: (conversation: SceneConversation) => void,
  ): this {
    const current = options.currentActor ?? actor("me", { name: "Me" });
    const currentIdentity = actorIdentity(current, options.app);
    const common = {
      app: options.app,
      deviceId: options.deviceId,
    } as const;

    if (options.app === "whatsapp") {
      this.episode.whatsapp(
        options.deviceId,
        options.conversationId,
        (track) => {
          fn(
            new SceneConversation(this, {
              ...common,
              open: (frame) => track.switchTo(options.conversationId, frame),
              send: (frame, id, text, message) =>
                track.at(frame).send(text, {
                  messageId: id,
                  silent: message.silent,
                  replyTo: message.replyTo
                    ? { messageId: message.replyTo.id }
                    : undefined,
                }),
              receive: (frame, id, from, text, message) =>
                track.at(frame).receive(from.name, text, {
                  messageId: id,
                  silent: message.silent,
                  replyTo: message.replyTo
                    ? { messageId: message.replyTo.id }
                    : undefined,
                }),
            }),
          );
        },
      );
    } else if (options.app === "imessage") {
      this.episode.imessage(
        options.deviceId,
        options.conversationId,
        (track) => {
          fn(
            new SceneConversation(this, {
              ...common,
              open: (frame) =>
                track.at(frame).openConversation(options.conversationId),
              send: (frame, id, text, message) =>
                track.at(frame).send(text, {
                  ...message,
                  messageId: id,
                  replyTo: message.replyTo
                    ? { id: message.replyTo.id }
                    : undefined,
                }),
              receive: (frame, id, from, text, message) =>
                track.at(frame).receive(from.name, text, {
                  ...message,
                  messageId: id,
                  replyTo: message.replyTo
                    ? { id: message.replyTo.id }
                    : undefined,
                }),
            }),
          );
        },
      );
    } else if (options.app === "snapchat") {
      this.episode.snapchat(
        options.deviceId,
        options.conversationId,
        (track) => {
          fn(
            new SceneConversation(this, {
              ...common,
              open: (frame) =>
                track.at(frame).openConversation(options.conversationId),
              send: (frame, id, text, message) =>
                track.at(frame).send(text, { ...message, messageId: id }),
              receive: (frame, id, from, text, message) =>
                track
                  .at(frame)
                  .receive(from.name, text, { ...message, messageId: id }),
            }),
          );
        },
      );
    } else if (options.app === "teams") {
      const target = options.target ?? {
        kind: "dm",
        dmId: options.conversationId,
      };
      this.episode.teams(options.deviceId, (track) => {
        fn(
          new SceneConversation(this, {
            ...common,
            open: (frame) => track.at(frame).openDm(options.conversationId),
            send: (frame, id, text, message) =>
              track.at(frame).sendMessage({
                target,
                text,
                messageId: id,
                senderId: currentIdentity.id,
                senderName: currentIdentity.name,
                replyToMessageId: message.replyTo?.id,
              }),
            receive: (frame, id, from, text, message) =>
              track.at(frame).receiveMessage({
                target,
                text,
                messageId: id,
                senderId: from.id,
                senderName: from.name,
                replyToMessageId: message.replyTo?.id,
              }),
          }),
        );
      });
    } else if (options.app === "instagram") {
      this.episode.instagram(options.deviceId, (track) => {
        fn(
          new SceneConversation(this, {
            ...common,
            open: (frame) =>
              track
                .at(frame)
                .navigate("thread", { threadId: options.conversationId }),
            send: (frame, id, text, message) =>
              track.at(frame).addDMMessage({
                id,
                threadId: options.conversationId,
                senderId: currentIdentity.id,
                text,
              }),
            receive: (frame, id, from, text, message) =>
              track.at(frame).addDMMessage({
                id,
                threadId: options.conversationId,
                senderId: from.id,
                text,
              }),
          }),
        );
      });
    } else if (options.app === "linkedin") {
      this.episode.linkedin(options.deviceId, (track) => {
        fn(
          new SceneConversation(this, {
            ...common,
            open: (frame) =>
              track
                .at(frame)
                .navigate("thread", { threadId: options.conversationId }),
            send: (frame, id, text, message) =>
              track.at(frame).sendDM({
                id,
                threadId: options.conversationId,
                senderId: currentIdentity.id,
                text,
              }),
            receive: (frame, id, from, text, message) =>
              track.at(frame).sendDM({
                id,
                threadId: options.conversationId,
                senderId: from.id,
                text,
              }),
          }),
        );
      });
    } else {
      this.episode.x(options.deviceId, (track) => {
        fn(
          new SceneConversation(this, {
            ...common,
            open: (frame) =>
              track
                .at(frame)
                .navigate("thread", { threadId: options.conversationId }),
            send: (frame, id, text, message) =>
              track.at(frame).sendMessage({
                id,
                threadId: options.conversationId,
                senderId: currentIdentity.id,
                text,
              }),
            receive: (frame, id, from, text, message) =>
              track.at(frame).sendMessage({
                id,
                threadId: options.conversationId,
                senderId: from.id,
                text,
              }),
          }),
        );
      });
    }

    return this;
  }

  social(options: SocialOptions, fn: (social: SceneSocial) => void): this {
    const common = {
      app: options.app,
      deviceId: options.deviceId,
    } as const;

    if (options.app === "instagram") {
      this.episode.instagram(options.deviceId, (track) =>
        fn(
          new SceneSocial(
            this,
            {
              ...common,
              post: (frame, id, authorRef, text, post) =>
                track.at(frame).addPost({
                  id,
                  authorId: authorRef.id,
                  caption: text,
                  imageUrl: post.mediaUrl ?? "/placeholders/media.svg",
                  createdAt: post.createdAt,
                }),
              comment: (frame, id, post, authorRef, text, comment) =>
                track.at(frame).commentOnPost({
                  id,
                  postId: post.id,
                  authorId: authorRef.id,
                  text,
                  createdAt: comment.createdAt,
                }),
              open: (frame, post) =>
                track.at(frame).navigate("home", { postId: post.id }),
            },
            options.currentActor,
          ),
        ),
      );
    } else if (options.app === "linkedin") {
      this.episode.linkedin(options.deviceId, (track) =>
        fn(
          new SceneSocial(
            this,
            {
              ...common,
              post: (frame, id, authorRef, text, post) =>
                track.at(frame).post({
                  id,
                  authorId: authorRef.id,
                  text,
                  createdAt: post.createdAt,
                }),
              comment: (frame, id, post, authorRef, text, comment) =>
                track.at(frame).comment({
                  id,
                  postId: post.id,
                  authorId: authorRef.id,
                  text,
                  createdAt: comment.createdAt,
                }),
              open: (frame, post) =>
                track.at(frame).navigate("post", { postId: post.id }),
            },
            options.currentActor,
          ),
        ),
      );
    } else {
      this.episode.x(options.deviceId, (track) =>
        fn(
          new SceneSocial(
            this,
            {
              ...common,
              post: (frame, id, authorRef, text, post) =>
                track.at(frame).postTweet({
                  id,
                  authorId: authorRef.id,
                  text,
                  createdAt: post.createdAt,
                }),
              comment: (frame, id, post, authorRef, text, comment) =>
                track.at(frame).replyTweet({
                  id,
                  replyToId: post.id,
                  authorId: authorRef.id,
                  text,
                  createdAt: comment.createdAt,
                }),
              open: (frame, post) =>
                track.at(frame).navigate("tweet", { tweetId: post.id }),
            },
            options.currentActor,
          ),
        ),
      );
    }
    return this;
  }
}

export function createScene(
  episode: CodeFirstEpisodeBuilder,
  id: string,
  options: SceneOptions,
  fps: number,
  fn: (scene: SceneBuilder) => void,
): void {
  if (!id.trim()) throw new Error("Scene id must not be empty");
  const startFrame =
    typeof options.at === "number"
      ? options.at
      : parseTimeToFrames(options.at, fps);
  const durationFrames =
    options.duration === undefined
      ? undefined
      : typeof options.duration === "number"
        ? options.duration
        : parseDurationToFrames(options.duration, fps);

  if (startFrame < 0)
    throw new Error(`Scene "${id}" cannot start before frame 0`);
  if (durationFrames !== undefined && durationFrames <= 0) {
    throw new Error(`Scene "${id}" duration must be greater than 0`);
  }

  if (durationFrames === undefined) episode.mark(id, startFrame);
  else episode.section(id, startFrame, startFrame + durationFrames);

  fn(new SceneBuilder(episode, id, startFrame, fps, durationFrames));
}
