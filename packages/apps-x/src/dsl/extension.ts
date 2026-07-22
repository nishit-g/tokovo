import type { DslExtension } from "@tokovo/core";
import type {
  DMSendPayload,
  NotificationAddPayload,
  TweetCreatePayload,
  TweetReplyPayload,
} from "../types/index.js";

interface XBeatBuilder {
  ops: Array<Record<string, unknown>>;
}

export interface XDslApi {
  openTimeline(): void;
  openTweet(tweetId: string): void;
  openProfile(userId: string): void;
  openNotifications(tab?: "all" | "verified" | "mentions"): void;
  openMessages(): void;
  openThread(threadId: string): void;
  compose(text?: string): void;
  post(payload: TweetCreatePayload): void;
  reply(payload: TweetReplyPayload): void;
  notify(payload: NotificationAddPayload): void;
  dm(payload: DMSendPayload): void;
  setComposerStatus(status: "idle" | "sending" | "failed", error?: string): void;
  setMessageDelivery(messageId: string, delivery: "sending" | "sent" | "failed"): void;
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
  createApi(builderUnknown: unknown): XDslApi {
    const builder = builderUnknown as XBeatBuilder;
    const push = (type: string, payload: Record<string, unknown>): void => {
      builder.ops.push(appEvent(type, payload));
    };

    return {
      openTimeline: () => push("NAVIGATE", { screen: "timeline" }),
      openTweet: (tweetId) => push("NAVIGATE", { screen: "tweet", tweetId }),
      openProfile: (userId) => push("NAVIGATE", { screen: "profile", userId }),
      openNotifications: (tab = "all") => {
        push("NAVIGATE", { screen: "notifications" });
        push("SET_NOTIFICATIONS_TAB", { tab });
      },
      openMessages: () => push("NAVIGATE", { screen: "messages" }),
      openThread: (threadId) => push("NAVIGATE", { screen: "thread", threadId }),
      compose: (text = "") => {
        push("NAVIGATE", { screen: "compose" });
        push("SET_COMPOSE_DRAFT", { text });
      },
      setComposerStatus: (status, error) => push("SET_COMPOSER_STATUS", { status, error }),
      setMessageDelivery: (messageId, delivery) => push("DM_SET_DELIVERY", { messageId, delivery }),
      post: (payload) => push("TWEET_CREATE", { ...payload }),
      reply: (payload) => push("TWEET_REPLY", { ...payload }),
      notify: (payload) => push("NOTIFICATION_ADD", { ...payload }),
      dm: (payload) => push("DM_SEND", { ...payload }),
    };
  },
};
