import type { DslExtension } from "@tokovo/core";

interface BeatBuilderLike {
  ops: Array<Record<string, unknown>>;
}

function appEvent(type: string, payload: Record<string, unknown>): Record<string, unknown> {
  return {
    kind: "AppEvent",
    appId: "app_instagram",
    type,
    payload,
  };
}

export interface InstagramDslApi {
  openHome(): void;
  openProfile(profileId: string): void;
  openInbox(): void;
  openThread(threadId: string): void;
  openNotifications(): void;
  openStory(storySetId: string, storyId?: string): void;
  compose(caption?: string, imageUrl?: string): void;
  post(authorId: string, imageUrl: string, caption: string): void;
  like(postId: string, userId: string): void;
  dm(threadId: string, senderId: string, text: string): void;
  notify(type: "like" | "comment" | "follow" | "dm" | "story_reply", actorId: string, opts?: { postId?: string; threadId?: string; storyId?: string }): void;
}

export const instagramDsl: DslExtension<InstagramDslApi> = {
  createApi(builderUnknown: unknown): InstagramDslApi {
    const builder = builderUnknown as BeatBuilderLike;
    return {
      openHome: () => builder.ops.push(appEvent("NAVIGATE", { screen: "home" })),
      openProfile: (profileId) => builder.ops.push(appEvent("NAVIGATE", { screen: "profile", profileId })),
      openInbox: () => builder.ops.push(appEvent("NAVIGATE", { screen: "inbox" })),
      openThread: (threadId) => builder.ops.push(appEvent("NAVIGATE", { screen: "thread", threadId })),
      openNotifications: () => builder.ops.push(appEvent("NAVIGATE", { screen: "notifications" })),
      openStory: (storySetId, storyId) => builder.ops.push(appEvent("STORY_OPEN", { storySetId, storyId })),
      compose: (caption = "", imageUrl) => {
        builder.ops.push(appEvent("NAVIGATE", { screen: "composer" }));
        builder.ops.push(appEvent("SET_COMPOSER_DRAFT", { caption, imageUrl }));
      },
      post: (authorId, imageUrl, caption) => {
        builder.ops.push(appEvent("POST_ADD", {
          id: `dsl_ig_post_${builder.ops.length}`,
          authorId,
          imageUrl,
          caption,
        }));
      },
      like: (postId, userId) => builder.ops.push(appEvent("POST_LIKE", { postId, userId })),
      dm: (threadId, senderId, text) => builder.ops.push(appEvent("DM_MESSAGE_ADD", {
        id: `dsl_ig_dm_${builder.ops.length}`,
        threadId,
        senderId,
        text,
      })),
      notify: (type, actorId, opts = {}) => builder.ops.push(appEvent("NOTIFICATION_ADD", {
        id: `dsl_ig_nt_${builder.ops.length}`,
        type,
        actorId,
        ...opts,
      })),
    };
  },
};
