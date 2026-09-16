import { z } from "zod";
import type { XEventPayloadMap, XEventType } from "../types/events.js";

const MIN_AUTHORED_EPOCH_MS = Date.UTC(2000, 0, 1);
const MAX_AUTHORED_EPOCH_MS = Date.UTC(2100, 0, 1);

export const xIdSchema = z.string().trim().min(1);
export const xCountSchema = z.number().int().nonnegative().finite();
export const xEpochMsSchema = z
  .number()
  .int()
  .min(MIN_AUTHORED_EPOCH_MS, "must be epoch milliseconds on or after 2000-01-01")
  .max(MAX_AUTHORED_EPOCH_MS, "must be epoch milliseconds before 2100-01-01")
  .finite();

export const xLocaleSchema = z.enum(["en-US", "ar-SA", "hi-IN"]);
export const xScreenSchema = z.enum([
  "timeline",
  "tweet",
  "compose",
  "profile",
  "notifications",
  "messages",
  "thread",
]);
export const xTimelineTabSchema = z.enum(["forYou", "following"]);
export const xProfileTabSchema = z.enum(["posts", "replies", "media", "likes"]);
export const xNotificationsTabSchema = z.enum(["all", "verified", "mentions"]);
export const xNotificationTypeSchema = z.enum([
  "like",
  "repost",
  "reply",
  "follow",
  "mention",
  "verified",
]);

export const xUserInputSchema = z
  .object({
    id: xIdSchema,
    name: z.string().trim().min(1),
    handle: z
      .string()
      .trim()
      .min(1)
      .regex(/^[A-Za-z0-9_]+$/),
    bio: z.string().max(240).optional(),
    avatarUrl: z.string().trim().min(1).optional(),
    bannerUrl: z.string().trim().min(1).optional(),
    location: z.string().trim().min(1).optional(),
    website: z.string().trim().min(1).optional(),
    joinedAt: xEpochMsSchema.optional(),
    followers: xCountSchema.optional(),
    following: xCountSchema.optional(),
    verified: z.enum(["blue", "gold", "grey"]).nullable().optional(),
  })
  .strict();

export const xMediaInputSchema = z
  .object({
    type: z.enum(["image", "video"]),
    urls: z.array(z.string().trim().min(1)).min(1).max(4),
    aspect: z.enum(["square", "wide", "tall"]),
    alt: z.string().max(1_000).optional(),
    posterUrl: z.string().trim().min(1).optional(),
    durationSeconds: z.number().positive().finite().optional(),
    sensitive: z.boolean().optional(),
  })
  .strict()
  .superRefine((media, context) => {
    if (media.type === "video" && !media.posterUrl && media.urls.length === 0) {
      context.addIssue({
        code: "custom",
        message: "video media requires a source or poster",
        path: ["posterUrl"],
      });
    }
  });

export const xLinkPreviewInputSchema = z
  .object({
    url: z.string().trim().min(1),
    domain: z.string().trim().min(1),
    title: z.string().trim().min(1),
    description: z.string().max(280).optional(),
    imageUrl: z.string().trim().min(1).optional(),
  })
  .strict();

export const xPollInputSchema = z
  .object({
    options: z
      .array(
        z
          .object({
            id: xIdSchema,
            label: z.string().trim().min(1).max(80),
            votes: xCountSchema,
          })
          .strict(),
      )
      .min(2)
      .max(4),
    totalVotes: xCountSchema.optional(),
    endsAt: xEpochMsSchema.optional(),
    selectedOptionId: xIdSchema.optional(),
  })
  .strict()
  .superRefine((poll, context) => {
    const optionIds = new Set<string>();
    let calculatedTotal = 0;
    poll.options.forEach((option, index) => {
      if (optionIds.has(option.id)) {
        context.addIssue({
          code: "custom",
          message: `duplicates option id "${option.id}"`,
          path: ["options", index, "id"],
        });
      }
      optionIds.add(option.id);
      calculatedTotal += option.votes;
    });
    if (poll.totalVotes !== undefined && poll.totalVotes < calculatedTotal) {
      context.addIssue({
        code: "custom",
        message: "must be greater than or equal to the sum of option votes",
        path: ["totalVotes"],
      });
    }
    if (poll.selectedOptionId && !optionIds.has(poll.selectedOptionId)) {
      context.addIssue({
        code: "custom",
        message: `references unknown option "${poll.selectedOptionId}"`,
        path: ["selectedOptionId"],
      });
    }
  });

export const xTweetInputSchema = z
  .object({
    id: xIdSchema,
    authorId: xIdSchema,
    text: z.string().max(25_000),
    createdAt: xEpochMsSchema,
    replyToId: xIdSchema.optional(),
    repostOfId: xIdSchema.optional(),
    quoteTweetId: xIdSchema.optional(),
    media: xMediaInputSchema.optional(),
    linkPreview: xLinkPreviewInputSchema.optional(),
    poll: xPollInputSchema.optional(),
    hashtags: z.array(z.string().trim().min(1)).optional(),
    mentions: z.array(z.string().trim().min(1)).optional(),
    likeCount: xCountSchema.optional(),
    repostCount: xCountSchema.optional(),
    viewCount: xCountSchema.optional(),
    bookmarkCount: xCountSchema.optional(),
    shareCount: xCountSchema.optional(),
    likedBy: z.array(xIdSchema).optional(),
    bookmarkedBy: z.array(xIdSchema).optional(),
    sharedBy: z.array(xIdSchema).optional(),
  })
  .strict()
  .superRefine((tweet, context) => {
    const attachmentCount =
      Number(Boolean(tweet.media)) +
      Number(Boolean(tweet.linkPreview)) +
      Number(Boolean(tweet.poll));
    if (attachmentCount > 1) {
      context.addIssue({
        code: "custom",
        message: "a post may declare only one of media, linkPreview, or poll",
      });
    }
    if (!tweet.text.trim() && attachmentCount === 0 && !tweet.repostOfId && !tweet.quoteTweetId) {
      context.addIssue({
        code: "custom",
        message: "a post requires text, an attachment, or repostOfId",
        path: ["text"],
      });
    }
  });

export const xNotificationInputSchema = z
  .object({
    id: xIdSchema,
    type: xNotificationTypeSchema,
    actorId: xIdSchema,
    tweetId: xIdSchema.optional(),
    isMention: z.boolean().optional(),
    createdAt: xEpochMsSchema,
    title: z.string().trim().min(1).optional(),
    body: z.string().trim().min(1).optional(),
    read: z.boolean().optional(),
  })
  .strict();

export const xThreadInputSchema = z
  .object({
    id: xIdSchema,
    participantIds: z.array(xIdSchema).min(2),
    title: z.string().trim().min(1).optional(),
    unreadCount: xCountSchema.optional(),
    pinned: z.boolean().optional(),
  })
  .strict();

export const xMessageInputSchema = z
  .object({
    id: xIdSchema,
    threadId: xIdSchema,
    senderId: xIdSchema,
    text: z.string().trim().min(1).max(25_000),
    createdAt: xEpochMsSchema,
    replyToMessageId: xIdSchema.optional(),
    reactions: z
      .array(
        z
          .object({
            emoji: z.string().trim().min(1).max(16),
            userIds: z.array(xIdSchema).min(1),
          })
          .strict(),
      )
      .optional(),
    delivery: z.enum(["sending", "sent", "delivered", "read", "failed"]).optional(),
  })
  .strict()
  .superRefine((message, context) => {
    const emoji = new Set<string>();
    message.reactions?.forEach((reaction, index) => {
      if (emoji.has(reaction.emoji)) {
        context.addIssue({
          code: "custom",
          message: `duplicates reaction ${JSON.stringify(reaction.emoji)}`,
          path: ["reactions", index, "emoji"],
        });
      }
      emoji.add(reaction.emoji);
      if (new Set(reaction.userIds).size !== reaction.userIds.length) {
        context.addIssue({
          code: "custom",
          message: "userIds contains duplicates",
          path: ["reactions", index, "userIds"],
        });
      }
    });
  });

export const xPollVoteInputSchema = z
  .object({
    tweetId: xIdSchema,
    userId: xIdSchema,
    optionId: xIdSchema,
  })
  .strict();

export const xMediaPlaybackInputSchema = z
  .object({
    tweetId: xIdSchema,
    state: z.enum(["idle", "playing", "paused", "complete"]),
    progress: z.number().finite().min(0).max(1),
  })
  .strict()
  .superRefine((playback, context) => {
    if (playback.state === "idle" && playback.progress !== 0) {
      context.addIssue({
        code: "custom",
        message: "idle playback requires progress 0",
        path: ["progress"],
      });
    }
    if (playback.state === "complete" && playback.progress !== 1) {
      context.addIssue({
        code: "custom",
        message: "complete playback requires progress 1",
        path: ["progress"],
      });
    }
  });

export const xComposerStatusInputSchema = z
  .object({
    status: z.enum(["idle", "sending", "failed"]),
    error: z.string().trim().min(1).max(280).optional(),
  })
  .strict()
  .superRefine((composer, context) => {
    if (composer.status === "failed" && !composer.error) {
      context.addIssue({
        code: "custom",
        message: "failed composer status requires error",
        path: ["error"],
      });
    }
    if (composer.status !== "failed" && composer.error) {
      context.addIssue({
        code: "custom",
        message: `${composer.status} composer status cannot include error`,
        path: ["error"],
      });
    }
  });

export const xDMDeliveryInputSchema = z
  .object({
    messageId: xIdSchema,
    delivery: z.enum(["sending", "sent", "delivered", "read", "failed"]),
  })
  .strict();

const xSetCurrentUserEventSchema = z.object({ userId: xIdSchema }).strict();
const xFollowEventSchema = z
  .object({
    followerId: xIdSchema,
    followingId: xIdSchema,
  })
  .strict();
const xTweetCreateEventSchema = xTweetInputSchema.superRefine((tweet, context) => {
  for (const field of ["replyToId", "repostOfId", "quoteTweetId"] as const) {
    if (tweet[field] !== undefined) {
      context.addIssue({
        code: "custom",
        message: `is not valid for TWEET_CREATE`,
        path: [field],
      });
    }
  }
});
const xTweetReplyEventSchema = xTweetInputSchema.superRefine((tweet, context) => {
  if (!tweet.replyToId) {
    context.addIssue({
      code: "custom",
      message: "is required for TWEET_REPLY",
      path: ["replyToId"],
    });
  }
  for (const field of ["repostOfId", "quoteTweetId"] as const) {
    if (tweet[field] !== undefined) {
      context.addIssue({
        code: "custom",
        message: `is not valid for TWEET_REPLY`,
        path: [field],
      });
    }
  }
});
const xTweetRepostEventSchema = z
  .object({
    id: xIdSchema,
    authorId: xIdSchema,
    repostOfId: xIdSchema,
    text: z.string().max(25_000).optional(),
    createdAt: xEpochMsSchema,
  })
  .strict();
const xTweetQuoteEventSchema = xTweetInputSchema.superRefine((tweet, context) => {
  if (!tweet.quoteTweetId) {
    context.addIssue({
      code: "custom",
      message: "is required for TWEET_QUOTE",
      path: ["quoteTweetId"],
    });
  }
  for (const field of ["replyToId", "repostOfId"] as const) {
    if (tweet[field] !== undefined) {
      context.addIssue({
        code: "custom",
        message: `is not valid for TWEET_QUOTE`,
        path: [field],
      });
    }
  }
});
const xTweetActorEventSchema = z
  .object({
    tweetId: xIdSchema,
    userId: xIdSchema,
  })
  .strict();
const xTweetReferenceEventSchema = z.object({ tweetId: xIdSchema }).strict();
const xNavigateEventSchema = z
  .object({
    screen: xScreenSchema,
    tweetId: xIdSchema.optional(),
    userId: xIdSchema.optional(),
    threadId: xIdSchema.optional(),
  })
  .strict()
  .superRefine((navigation, context) => {
    const expectedTarget =
      navigation.screen === "tweet"
        ? "tweetId"
        : navigation.screen === "profile"
          ? "userId"
          : navigation.screen === "thread"
            ? "threadId"
            : null;
    if (expectedTarget && !navigation[expectedTarget]) {
      context.addIssue({
        code: "custom",
        message: `${navigation.screen} screen requires ${expectedTarget}`,
        path: [expectedTarget],
      });
    }
    for (const target of ["tweetId", "userId", "threadId"] as const) {
      if (navigation[target] && target !== expectedTarget) {
        context.addIssue({
          code: "custom",
          message: `${target} is not valid for ${navigation.screen} screen`,
          path: [target],
        });
      }
    }
  });
const xEmptyEventSchema = z.object({}).strict();
const xComposeDraftEventSchema = z.object({ text: z.string().max(25_000) }).strict();
const xThreadDraftEventSchema = z
  .object({
    threadId: xIdSchema,
    text: z.string().max(25_000),
  })
  .strict();
const xScrollEventSchema = z
  .object({
    surface: z.enum(["timeline", "tweet", "notifications", "messages", "profile", "thread"]),
    offset: z.number().finite().nonnegative(),
    durationFrames: z.number().int().min(0).max(600).optional(),
    targetId: xIdSchema.optional(),
  })
  .strict();
const xDMActorEventSchema = z
  .object({
    threadId: xIdSchema,
    userId: xIdSchema,
  })
  .strict();
const xTimelineTabEventSchema = z.object({ tab: xTimelineTabSchema }).strict();
const xProfileTabEventSchema = z.object({ tab: xProfileTabSchema }).strict();
const xNotificationsTabEventSchema = z.object({ tab: xNotificationsTabSchema }).strict();
const xAuthoredDMMessageSchema = z
  .object({
    id: xIdSchema,
    threadId: xIdSchema,
    senderId: xIdSchema,
    text: z.string().trim().min(1).max(25_000),
    createdAt: xEpochMsSchema,
    replyToMessageId: xIdSchema.optional(),
    delivery: z.enum(["sending", "sent", "delivered", "read", "failed"]).optional(),
  })
  .strict();
const xReceivedDMMessageSchema = xAuthoredDMMessageSchema.omit({
  delivery: true,
});
const xDMReactionEventSchema = z
  .object({
    messageId: xIdSchema,
    userId: xIdSchema,
    emoji: z.string().trim().min(1).max(16),
  })
  .strict();

/**
 * The canonical authored X event contract. Compiler lowering, runtime
 * preparation, and package tests all validate through this table so an event
 * cannot be accepted by one surface and rejected by another.
 */
export const xAuthoringEventPayloadSchemas = {
  USER_CREATE: xUserInputSchema,
  SET_CURRENT_USER: xSetCurrentUserEventSchema,
  FOLLOW_USER: xFollowEventSchema,
  UNFOLLOW_USER: xFollowEventSchema,
  TWEET_CREATE: xTweetCreateEventSchema,
  TWEET_REPLY: xTweetReplyEventSchema,
  TWEET_REPOST: xTweetRepostEventSchema,
  TWEET_QUOTE: xTweetQuoteEventSchema,
  TWEET_LIKE: xTweetActorEventSchema,
  TWEET_UNLIKE: xTweetActorEventSchema,
  TWEET_VIEW: xTweetReferenceEventSchema,
  TWEET_BOOKMARK: xTweetActorEventSchema,
  TWEET_UNBOOKMARK: xTweetActorEventSchema,
  TWEET_SHARE: xTweetActorEventSchema,
  TWEET_POLL_VOTE: xPollVoteInputSchema,
  TWEET_MEDIA_PLAYBACK: xMediaPlaybackInputSchema,
  NAVIGATE: xNavigateEventSchema,
  NAVIGATE_BACK: xEmptyEventSchema,
  SET_COMPOSE_DRAFT: xComposeDraftEventSchema,
  SET_COMPOSER_STATUS: xComposerStatusInputSchema,
  SET_THREAD_DRAFT: xThreadDraftEventSchema,
  SET_SCROLL: xScrollEventSchema,
  DM_TYPING_START: xDMActorEventSchema,
  DM_TYPING_STOP: xDMActorEventSchema,
  SET_TIMELINE_TAB: xTimelineTabEventSchema,
  SET_PROFILE_TAB: xProfileTabEventSchema,
  SET_NOTIFICATIONS_TAB: xNotificationsTabEventSchema,
  NOTIFICATION_ADD: xNotificationInputSchema,
  MARK_NOTIFICATION_READ: z.object({ id: xIdSchema, badgeCount: xCountSchema.optional() }).strict(),
  DM_THREAD_CREATE: xThreadInputSchema,
  DM_SEND: xAuthoredDMMessageSchema,
  DM_RECEIVE: xReceivedDMMessageSchema,
  DM_REACT: xDMReactionEventSchema,
  DM_UNREACT: xDMReactionEventSchema,
  DM_SET_DELIVERY: xDMDeliveryInputSchema,
} satisfies Record<XEventType, z.ZodType>;

export function parseXAuthoringEventPayload<T extends XEventType>(
  type: T,
  payload: unknown,
): XEventPayloadMap[T] {
  const schema = (xAuthoringEventPayloadSchemas as Partial<Record<string, z.ZodType>>)[type];
  if (!schema) {
    throw new Error(`X_TRACK_TYPE_UNSUPPORTED: "${type}"`);
  }
  const result = schema.safeParse(payload);
  if (!result.success) {
    const detail = formatXSchemaIssues(result.error, `track.${type}.payload`).join("; ");
    throw new Error(`X_TRACK_PAYLOAD_INVALID: ${detail}`);
  }
  return result.data as XEventPayloadMap[T];
}

export const xSnapshotSchema = z
  .object({
    schemaVersion: z.literal(2),
    locale: xLocaleSchema.optional(),
    postCharacterLimit: z.union([z.literal(280), z.literal(25000)]).optional(),
    currentUserId: xIdSchema.optional(),
    users: z.array(xUserInputSchema),
    tweets: z.array(xTweetInputSchema).optional(),
    notifications: z.array(xNotificationInputSchema).optional(),
    threads: z.array(xThreadInputSchema).optional(),
    messages: z.array(xMessageInputSchema).optional(),
    follows: z
      .array(z.object({ followerId: xIdSchema, followingId: xIdSchema }).strict())
      .optional(),
  })
  .strict();

export const xInitialViewSchema = z
  .object({
    schemaVersion: z.literal(2),
    screen: xScreenSchema,
    tweetId: xIdSchema.optional(),
    userId: xIdSchema.optional(),
    threadId: xIdSchema.optional(),
    composer: z
      .object({
        draft: z.string().max(25_000),
        status: z.enum(["idle", "sending", "failed"]).optional(),
        error: z.string().trim().min(1).max(280).optional(),
      })
      .strict()
      .superRefine((composer, context) => {
        const status = composer.status ?? "idle";
        if (status === "failed" && !composer.error) {
          context.addIssue({
            code: "custom",
            message: "failed composer status requires error",
            path: ["error"],
          });
        }
        if (status !== "failed" && composer.error) {
          context.addIssue({
            code: "custom",
            message: `${status} composer status cannot include error`,
            path: ["error"],
          });
        }
      })
      .optional(),
    timelineTab: xTimelineTabSchema.optional(),
    profileTab: xProfileTabSchema.optional(),
    notificationsTab: xNotificationsTabSchema.optional(),
    scrollY: z.number().finite().nonnegative().optional(),
  })
  .strict()
  .superRefine((view, context) => {
    const expectedTarget =
      view.screen === "tweet"
        ? "tweetId"
        : view.screen === "profile"
          ? "userId"
          : view.screen === "thread"
            ? "threadId"
            : null;
    if (expectedTarget && !view[expectedTarget]) {
      context.addIssue({
        code: "custom",
        message: `${view.screen} screen requires ${expectedTarget}`,
        path: [expectedTarget],
      });
    }
    for (const target of ["tweetId", "userId", "threadId"] as const) {
      if (view[target] && target !== expectedTarget) {
        context.addIssue({
          code: "custom",
          message: `${target} is not valid for ${view.screen} screen`,
          path: [target],
        });
      }
    }
  });

export type XSnapshotInput = z.infer<typeof xSnapshotSchema>;
export type XInitialViewInput = z.infer<typeof xInitialViewSchema>;

export function formatXSchemaIssues(error: z.ZodError, root: string): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${root}.${issue.path.join(".")}` : root;
    return `${path}: ${issue.message}`;
  });
}
