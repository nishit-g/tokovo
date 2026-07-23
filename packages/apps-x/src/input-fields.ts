export const xInputFields = {
  postComposer: "post",
  replyComposer: (tweetId: string): string => `tweet:${tweetId}:reply`,
  threadComposer: (threadId: string): string => `thread:${threadId}:composer`,
} as const;
