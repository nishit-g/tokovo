import type { XTweet } from "../runtime/state.js";

export const X_PROFILE_HEADER_HEIGHT = 368;

export interface XPostMeasurement {
  totalHeight: number;
  repostLabelHeight: number;
  headerHeight: number;
  bodyHeight: number;
  attachmentHeight: number;
  metricsHeight: number;
  bodyLines: number;
}

function estimatedLineCount(
  text: string,
  width: number,
  fontSize: number,
  maxLines: number,
): number {
  if (!text.trim()) return 0;
  const charactersPerLine = Math.max(8, Math.floor(width / (fontSize * 0.56)));
  const paragraphs = text.split("\n");
  const lines = paragraphs.reduce(
    (total, paragraph) =>
      total +
      Math.max(1, Math.ceil(Array.from(paragraph).length / charactersPerLine)),
    0,
  );
  return Math.min(maxLines, lines);
}

function attachmentHeight(
  tweet: XTweet,
  contentWidth: number,
  detail: boolean,
): number {
  if (tweet.media) {
    if (tweet.media.aspect === "square")
      return Math.min(contentWidth, detail ? 340 : 280);
    if (tweet.media.aspect === "tall")
      return Math.min(contentWidth * 1.18, detail ? 420 : 330);
    return Math.round(contentWidth * 0.5625);
  }
  if (tweet.linkPreview) return detail ? 188 : 168;
  if (tweet.poll) return 44 + tweet.poll.options.length * 38;
  if (tweet.quoteTweetId) return detail ? 154 : 138;
  return 0;
}

export function measureXPost(
  tweet: XTweet,
  viewportWidth: number,
  detail = false,
): XPostMeasurement {
  const horizontalPadding = detail ? 32 : 76;
  const contentWidth = Math.max(180, viewportWidth - horizontalPadding);
  const fontSize = detail ? 20 : 15;
  const lineHeight = detail ? 25 : 20;
  const bodyLines = estimatedLineCount(
    tweet.text,
    contentWidth,
    fontSize,
    detail ? 12 : 8,
  );
  const bodyHeight = bodyLines * lineHeight;
  const mediaHeight = attachmentHeight(tweet, contentWidth, detail);
  const repostLabelHeight = tweet.repostOfId ? 24 : 0;
  const headerHeight = detail ? 52 : 22;
  const metricsHeight = detail ? 114 : 34;
  const gaps = (bodyHeight > 0 ? 5 : 0) + (mediaHeight > 0 ? 10 : 0);
  const verticalPadding = detail ? 24 : 22;
  return {
    totalHeight:
      repostLabelHeight +
      headerHeight +
      bodyHeight +
      mediaHeight +
      metricsHeight +
      gaps +
      verticalPadding,
    repostLabelHeight,
    headerHeight,
    bodyHeight,
    attachmentHeight: mediaHeight,
    metricsHeight,
    bodyLines,
  };
}

export interface XMessageMeasurement {
  height: number;
  bubbleHeight: number;
  lines: number;
  bubbleWidth: number;
  replyPreviewHeight: number;
  receiptHeight: number;
  reactionsHeight: number;
}

export function measureXMessage(
  text: string,
  viewportWidth: number,
  options: {
    hasReply?: boolean;
    hasReceipt?: boolean;
    reactionCount?: number;
  } = {},
): XMessageMeasurement {
  const maximumWidth = Math.min(Math.round(viewportWidth * 0.76), 292);
  const estimatedTextWidth = Math.ceil(
    Math.min(
      34,
      Math.max(1, ...text.split("\n").map((line) => Array.from(line).length)),
    ) *
      7.25 +
      28,
  );
  const bubbleWidth = Math.max(72, Math.min(maximumWidth, estimatedTextWidth));
  const lines = estimatedLineCount(text, bubbleWidth - 28, 15, 20);
  const replyPreviewHeight = options.hasReply ? 38 : 0;
  const receiptHeight = options.hasReceipt ? 15 : 0;
  const bubbleHeight = Math.max(
    38,
    lines * 20 + 20 + replyPreviewHeight + receiptHeight,
  );
  const reactionsHeight = (options.reactionCount ?? 0) > 0 ? 22 : 0;
  return {
    height: bubbleHeight + reactionsHeight,
    bubbleHeight,
    lines,
    bubbleWidth,
    replyPreviewHeight,
    receiptHeight,
    reactionsHeight,
  };
}
