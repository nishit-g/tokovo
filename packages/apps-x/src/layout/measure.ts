import type { XExperience } from "../experience/contract.js";
import type { XState, XNotification } from "../runtime/state.js";
import { measureBodyText } from "@tokovo/core";
import type { XTweet, XUser } from "../runtime/state.js";
import { xTextTokens, type XTextTokens } from "./tokens.js";
const defaults = xTextTokens();
const wrapped = new Map<string, string[]>();
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
export function wrapXText(
  text: string,
  width: number,
  size: number,
  family = defaults.fontFamily,
): string[] {
  const key = JSON.stringify([text, width, size, family]);
  const cached = wrapped.get(key);
  if (cached) return cached;
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/(\s+)/u)) {
      if (line && measureBodyText(line + word, size, family) > width) {
        lines.push(line.trimEnd());
        line = "";
      }
      if (!line && !word.trim()) continue;
      if (measureBodyText(word, size, family) <= width) {
        line += word;
        continue;
      }
      for (const { segment } of segmenter.segment(word)) {
        if (line && measureBodyText(line + segment, size, family) > width) {
          lines.push(line);
          line = "";
        }
        line += segment;
      }
    }
    lines.push(line.trimEnd());
  }
  const oldest = wrapped.keys().next().value;
  if (wrapped.size >= 2048 && oldest !== undefined) wrapped.delete(oldest);
  wrapped.set(key, lines);
  return lines;
}
export function xMediaHeight(
  tweet: XTweet,
  width: number,
  detail = false,
  tokens = defaults,
): number {
  if (tweet.media)
    return tweet.media.aspect === "square"
      ? Math.min(width, detail ? 340 : 280)
      : tweet.media.aspect === "tall"
        ? Math.min(width * 1.18, detail ? 420 : 330)
        : Math.round(width * 0.5625);
  if (tweet.linkPreview) return detail ? 188 : 168;
  if (tweet.poll) return tokens.smallLine + 16 + tweet.poll.options.length * (tokens.bodyLine + 18);
  return 0;
}
const posts = new WeakMap<XTweet, Map<string, XPostMeasurement>>();
export type XPostMeasurement = ReturnType<typeof computePost>;
export function measureXPost(
  tweet: XTweet,
  viewportWidth: number,
  detail = false,
  tokens = defaults,
): XPostMeasurement {
  let cache = posts.get(tweet);
  if (!cache) {
    cache = new Map();
    posts.set(tweet, cache);
  }
  const key = JSON.stringify([viewportWidth, detail, tokens]);
  const cached = cache.get(key);
  if (cached) return cached;
  const value = computePost(tweet, viewportWidth, detail, tokens);
  if (cache.size >= 8) cache.clear();
  cache.set(key, value);
  return value;
}
function computePost(tweet: XTweet, viewportWidth: number, detail: boolean, t: XTextTokens) {
  const contentWidth = Math.max(
    40,
    viewportWidth - t.page * 2 - (detail ? 0 : t.avatar + t.avatarGap),
  );
  const allLines = tweet.text
    ? wrapXText(tweet.text, contentWidth, detail ? t.detail : t.body, t.fontFamily)
    : [];
  const truncated = !detail && allLines.length > 8;
  const textLines = truncated ? allLines.slice(0, 8) : allLines;
  const bodyLines = textLines.length;
  const bodyHeight =
    bodyLines * (detail ? t.detailLine : t.bodyLine) + (truncated ? t.bodyLine : 0);
  const primaryAttachmentHeight = xMediaHeight(tweet, contentWidth, detail, t);
  const quoteHeight = tweet.quoteTweetId ? 138 : 0;
  const attachmentHeight =
    primaryAttachmentHeight + quoteHeight + (primaryAttachmentHeight && quoteHeight ? 10 : 0);
  const repostLabelHeight = tweet.repostOfId ? 24 : 0;
  const replyLabelHeight = tweet.replyToId && !detail ? t.smallLine + 2 : 0;
  const headerHeight = detail ? Math.max(52, t.bodyLine * 2) : Math.max(22, t.bodyLine);
  const metricsHeight = detail ? 114 : 34;
  const totalHeight =
    repostLabelHeight +
    replyLabelHeight +
    headerHeight +
    bodyHeight +
    attachmentHeight +
    metricsHeight +
    (bodyHeight ? 5 : 0) +
    (attachmentHeight ? 10 : 0) +
    (detail ? 24 : t.postPadding * 2) +
    1;
  return {
    totalHeight,
    contentWidth,
    repostLabelHeight,
    replyLabelHeight,
    headerHeight,
    bodyHeight,
    attachmentHeight,
    primaryAttachmentHeight,
    quoteHeight,
    metricsHeight,
    bodyLines,
    textLines,
    truncated,
  };
}
export function measureXMessage(
  text: string,
  viewportWidth: number,
  options: {
    hasReply?: boolean;
    hasReceipt?: boolean;
    reactionCount?: number;
    tokens?: XTextTokens;
  } = {},
) {
  const t = options.tokens ?? defaults;
  const maximumWidth = Math.min(viewportWidth * 0.76, viewportWidth - 68);
  const natural = Math.max(
    0,
    ...text.split("\n").map((line) => measureBodyText(line, t.message, t.fontFamily)),
  );
  const bubbleWidth = Math.min(
    maximumWidth,
    Math.max(options.hasReceipt ? 115 : 52, Math.ceil(natural + t.messagePadding * 2)),
  );
  const textLines = wrapXText(
    text,
    Math.max(20, bubbleWidth - t.messagePadding * 2),
    t.message,
    t.fontFamily,
  );
  const replyPreviewHeight = options.hasReply ? t.smallLine + 19 : 0;
  const receiptHeight = options.hasReceipt ? t.smallLine : 0;
  const bubbleHeight = Math.max(
    38,
    textLines.length * t.messageLine + 18 + replyPreviewHeight + receiptHeight,
  );
  const reactionsHeight =
    (options.reactionCount ?? 0)
      ? Math.ceil((options.reactionCount ?? 0) / Math.max(1, Math.floor(bubbleWidth / 44))) * 24
      : 0;
  return {
    height: bubbleHeight + reactionsHeight,
    bubbleHeight,
    lines: textLines.length,
    textLines,
    bubbleWidth,
    replyPreviewHeight,
    receiptHeight,
    reactionsHeight,
  };
}
export type XMessageMeasurement = ReturnType<typeof measureXMessage>;
export function measureXProfile(user: XUser, width: number, t = defaults, details: string[] = []) {
  const bioLines = user.bio ? wrapXText(user.bio, width - 32, t.body, t.fontFamily) : [];
  const detailLines = details.flatMap((text) => wrapXText(text, width - 52, t.small, t.fontFamily));
  const nameLines = wrapXText(user.name, width - 54, t.detail, t.fontFamily);
  const height =
    124 +
    68 +
    nameLines.length * t.detailLine +
    t.bodyLine +
    (bioLines.length ? 11 + bioLines.length * t.bodyLine : 0) +
    (detailLines.length ? 10 + detailLines.length * (t.smallLine + 4) : 0) +
    11 +
    t.smallLine +
    13;
  return { height, bioLines, detailLines, nameLines };
}
export function xComposerHeight(
  text: string,
  width: number,
  t = defaults,
  kind: "dm" | "reply" = "dm",
) {
  const fieldWidth = width - (kind === "dm" ? t.touchTarget + 96 : 150);
  const lines = Math.min(
    4,
    wrapXText(text, Math.max(40, fieldWidth), t.message, t.fontFamily).length,
  );
  return Math.max(58, lines * t.messageLine + (kind === "dm" ? 27 : 15));
}

export function measureXNotification(
  notification: XNotification,
  state: XState,
  width: number,
  experience: XExperience,
) {
  const key = {
    like: "notificationLike",
    repost: "notificationRepost",
    reply: "notificationReply",
    follow: "notificationFollow",
    mention: "notificationMention",
    verified: "notificationVerified",
  } as const;
  const actor = state.usersById[notification.actorId];
  const copy = notification.title ?? actor.name + " " + experience.t(key[notification.type]);
  const lines = wrapXText(
    copy,
    Math.max(40, width - 70),
    experience.text.body,
    experience.text.fontFamily,
  );
  const tweet = notification.tweetId ? state.tweetsById[notification.tweetId] : undefined;
  const preview = notification.body ?? tweet?.text;
  const previewLines = preview
    ? wrapXText(
        preview,
        Math.max(40, width - 70),
        experience.text.body,
        experience.text.fontFamily,
      ).slice(0, 2)
    : [];
  return {
    lines,
    previewLines,
    height:
      24 +
      34 +
      7 +
      lines.length * experience.text.bodyLine +
      (previewLines.length ? 5 + previewLines.length * experience.text.bodyLine : 0),
  };
}
