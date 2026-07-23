export const xAnchor = {
  app: () => "x.app",
  nav: () => "x.nav.primary",
  timeline: {
    header: () => "x.timeline.header",
    feed: () => "x.timeline.feed",
  },
  conversation: () => "x.tweet.conversation",
  replyComposer: () => "x.reply.composer",
  post: (
    tweetId: string,
    region:
      | "card"
      | "author"
      | "body"
      | "media"
      | "poll"
      | "quote"
      | "link"
      | "metrics" = "card",
  ) =>
    region === "card" ? `x.post.${tweetId}` : `x.post.${tweetId}.${region}`,
  notification: (notificationId: string) => `x.notification.${notificationId}`,
  profile: (
    userId: string,
    region: "header" | "banner" | "avatar" = "header",
  ) => `x.profile.${userId}.${region}`,
  thread: (threadId: string) => `x.dm.${threadId}`,
  message: (threadId: string, messageId: string) =>
    `x.dm.${threadId}.message.${messageId}`,
  composer: {
    editor: () => "x.composer.editor",
    actions: () => "x.composer.actions",
  },
} as const;
