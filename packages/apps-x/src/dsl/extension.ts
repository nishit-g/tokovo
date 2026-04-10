import type { DslExtension } from "@tokovo/core";

interface XBeatBuilder {
  ops: Array<Record<string, unknown>>;
}

export interface XDslApi {
  openTimeline(): void;
  openTweet(tweetId: string): void;
  openProfile(userId: string): void;
  openNotifications(tab?: "all" | "mentions"): void;
  openMessages(): void;
  openThread(threadId: string): void;
  compose(text?: string): void;
  post(authorId: string, text: string): void;
  reply(authorId: string, replyToId: string, text: string): void;
  notify(type: "like" | "repost" | "reply" | "follow" | "mention", actorId: string, tweetId?: string): void;
  dm(threadId: string, senderId: string, text: string): void;
}

function appEvent(type: string, payload: Record<string, unknown>): Record<string, unknown> {
  return {
    kind: "AppEvent",
    appId: "app_x",
    type,
    payload,
  };
}

export const xDsl: DslExtension<XDslApi> = {
  createApi: (builderUnknown: unknown): XDslApi => {
    const builder = builderUnknown as XBeatBuilder;

    return {
      openTimeline: () => {
        builder.ops.push(appEvent("NAVIGATE", { screen: "timeline" }));
      },
      openTweet: (tweetId: string) => {
        builder.ops.push(appEvent("NAVIGATE", { screen: "tweet", tweetId }));
      },
      openProfile: (userId: string) => {
        builder.ops.push(appEvent("NAVIGATE", { screen: "profile", userId }));
      },
      openNotifications: (tab = "all") => {
        builder.ops.push(appEvent("NAVIGATE", { screen: "notifications" }));
        builder.ops.push(appEvent("SET_NOTIFICATIONS_TAB", { tab }));
      },
      openMessages: () => {
        builder.ops.push(appEvent("NAVIGATE", { screen: "messages" }));
      },
      openThread: (threadId: string) => {
        builder.ops.push(appEvent("NAVIGATE", { screen: "thread", threadId }));
      },
      compose: (text = "") => {
        builder.ops.push(appEvent("NAVIGATE", { screen: "compose" }));
        if (text.length > 0) {
          builder.ops.push(appEvent("SET_COMPOSE_DRAFT", { text }));
        }
      },
      post: (authorId: string, text: string) => {
        builder.ops.push(
          appEvent("TWEET_CREATE", {
            id: `dsl_tweet_${builder.ops.length}`,
            authorId,
            text,
          }),
        );
      },
      reply: (authorId: string, replyToId: string, text: string) => {
        builder.ops.push(
          appEvent("TWEET_REPLY", {
            id: `dsl_reply_${builder.ops.length}`,
            authorId,
            replyToId,
            text,
          }),
        );
      },
      notify: (type, actorId, tweetId) => {
        builder.ops.push(
          appEvent("NOTIFICATION_ADD", {
            id: `dsl_notification_${builder.ops.length}`,
            type,
            actorId,
            tweetId,
          }),
        );
      },
      dm: (threadId, senderId, text) => {
        builder.ops.push(
          appEvent("DM_SEND", {
            id: `dsl_dm_${builder.ops.length}`,
            threadId,
            senderId,
            text,
          }),
        );
      },
    };
  },
};
