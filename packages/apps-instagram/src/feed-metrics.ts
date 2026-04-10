import type { InstagramPost } from "./runtime/state.js";

const DESIGN_WIDTH = 393;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function linesForText(text: string, charsPerLine: number): number {
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

export function getInstagramMediaHeight(post: InstagramPost, width = DESIGN_WIDTH): number {
  if (post.aspect === "square") return width;
  if (post.aspect === "landscape") return Math.round(width * 0.82);
  return Math.round(width * 1.23);
}

export function estimateInstagramPostHeight(
  post: InstagramPost,
  commentCount: number,
  width = DESIGN_WIDTH,
): number {
  const scale = width / DESIGN_WIDTH;
  const media = getInstagramMediaHeight(post, width);
  const captionLines = clamp(linesForText(post.caption, 42), 1, 3);
  const previewLines = clamp(commentCount, 0, 4);
  const viewAllRow = commentCount > 0 ? 20 : 0;
  const locationRow = post.location ? 14 : 0;

  const baseHeight =
    56 + // header
    media +
    58 + // actions + likes
    locationRow +
    captionLines * 18 +
    viewAllRow +
    previewLines * 18 +
    26; // timestamp + footer gap

  return Math.round(baseHeight * scale);
}

export function computeInstagramFeedScrollY(
  posts: InstagramPost[],
  commentCountsByPostId: Map<string, number>,
  activePostId: string | null,
  width = DESIGN_WIDTH,
): number {
  if (!activePostId) return 0;
  let offset = 0;
  for (const post of posts) {
    if (post.id === activePostId) break;
    offset += estimateInstagramPostHeight(post, commentCountsByPostId.get(post.id) ?? 0, width);
  }
  return Math.max(0, offset);
}
