import type { LIPost } from "./runtime/state.js";

export const LINKEDIN_FEED_METRICS = {
  baseCardHeight: 470,
  focusedCardHeight: 560,
  gap: 8,
  feedTop: 182,
  viewportHeight: 640,
  focusPaddingTop: 60,
} as const;

export function getLinkedInFeedLayoutMetrics(
  postCount: number,
  focusedIndex: number,
  scale = 1,
  viewportHeight = LINKEDIN_FEED_METRICS.viewportHeight * scale,
) {
  const safePostCount = Math.max(1, postCount);
  const safeFocusedIndex = Math.max(0, Math.min(safePostCount - 1, focusedIndex));
  const baseCardHeight = LINKEDIN_FEED_METRICS.baseCardHeight * scale;
  const focusedCardHeight = LINKEDIN_FEED_METRICS.focusedCardHeight * scale;
  const gap = LINKEDIN_FEED_METRICS.gap * scale;
  const feedTop = LINKEDIN_FEED_METRICS.feedTop * scale;

  let offset = feedTop;
  for (let index = 0; index < safeFocusedIndex; index += 1) {
    offset += baseCardHeight + gap;
  }

  const contentHeight =
    feedTop +
    safeFocusedIndex * (baseCardHeight + gap) +
    focusedCardHeight +
    Math.max(0, safePostCount - safeFocusedIndex - 1) * (baseCardHeight + gap);
  const scrollTarget = Math.max(0, offset - LINKEDIN_FEED_METRICS.focusPaddingTop * scale);
  const scrollY = Math.max(0, Math.min(scrollTarget, contentHeight - viewportHeight));

  return {
    baseCardHeight,
    focusedCardHeight,
    gap,
    feedTop,
    contentHeight,
    scrollY,
  };
}

export function computeLinkedInFeedScrollY(posts: LIPost[], focusedPostId: string | null): number {
  if (posts.length <= 1 || !focusedPostId) return 0;
  const focusIndex = posts.findIndex((post) => post.id === focusedPostId);
  if (focusIndex <= 0) return 0;
  return getLinkedInFeedLayoutMetrics(posts.length, focusIndex).scrollY;
}
