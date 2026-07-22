/**
 * WhatsApp Layout Configuration
 *
 * Production-grade configurable message heights, spacing, and animations.
 * All values are in logical points on the canonical 393pt design surface.
 *
 * DESIGN PHILOSOPHY: "Pure Math"
 * - No multipliers.
 * - No heuristics.
 * - Exact pixel values defined in LAYOUT_CONSTANTS.
 * - Gaps are determined strictly by "Visual Runs" (see LAYOUT_LOGIC.md).
 */

// =============================================================================
// MESSAGE TYPE ENUMERATION
// =============================================================================

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "gif"
  | "voice"
  | "poll"
  | "link"
  | "sticker"
  | "document"
  | "contact"
  | "location"
  | "system"
  | "deleted"
  | "typing"
  | "screenshot_alert"
  | "call"
  | "call_missed";

export type MessageCategory = "text" | "media" | "audio" | "system" | "ephemeral";

// =============================================================================
// SPACING CONFIGURATION (SOURCE OF TRUTH)
// =============================================================================

/**
 * Authoritative logical-point metrics used by the headless layout estimator.
 * The renderer scales the 393pt design surface to the output resolution.
 */
export const LAYOUT_CONSTANTS = {
  BUBBLE_PADDING_V: 8,
  BUBBLE_PADDING_H: 12,
  LINE_HEIGHT: 22,
  FONT_SIZE: 16.5,
  TIMESTAMP_HEIGHT: 14,
  SENDER_NAME_HEIGHT: 18,
  BUBBLE_MARGIN: 12,

  // Spacing Tiers (The 3-Tier Model)
  GAP_MINIMAL: 2,
  GAP_RUN_BREAK: 7,
  GAP_NORMAL: 10,

  // System Spacing
  GAP_SYSTEM: 10,

  // Typography / Metrics
  AVG_CHAR_WIDTH: 8.2,

  // Typing Indicator
  TYPING_BUBBLE_HEIGHT: 24,
  TYPING_BUBBLE_PADDING_V: 8,
};

/**
 * UI Constants (Header, Input, etc.)
 * Source of Truth for both React Components and Layout Engine.
 */
export const UI_CONSTANTS = {
  // Header
  HEADER_CONTENT_HEIGHT: 60,
  HEADER_AVATAR_SIZE: 37,
  HEADER_AVATAR_MARGIN_RIGHT: 10,
  HEADER_PADDING_X: 10,
  HEADER_BACK_BUTTON_WIDTH: 24, // Approx

  // Input Area
  INPUT_MIN_HEIGHT: 60, // Standard single line
};

export function getChatChromeGeometry(contentInsets: { top: number; bottom: number }): {
  headerHeight: number;
  messageBottomInset: number;
} {
  return {
    headerHeight: contentInsets.top + UI_CONSTANTS.HEADER_CONTENT_HEIGHT,
    messageBottomInset: UI_CONSTANTS.INPUT_MIN_HEIGHT + contentInsets.bottom + 12,
  };
}

/**
 * Simplified Per-Message-Type Configuration
 */
export interface MessageTypeConfig {
  category: MessageCategory;
  gapBefore?: number; // Force specific gap (used for System messages)
  gapAfter?: number; // Force specific gap
}

export interface SpacingConfig {
  typeOverrides: Record<MessageType, MessageTypeConfig>;
  global: GlobalSpacing;
}

// =============================================================================
// HEIGHT & WIDTH CONFIGURATION
// =============================================================================

export interface MessageHeightConfig {
  /** Base height calculation */
  base: number;
  /** For text: Line height */
  lineHeight?: number;
  /** For text: Characters per line for wrapping */
  charsPerLine?: number;
  /** For media: Height with caption */
  withCaption?: number;
}

export interface MessageWidthConfig {
  /** Max width as percentage of viewport (0-1) */
  maxPercent: number;
  /** Minimum width in pixels */
  min: number;
  /** Fixed width (optional) */
  fixed?: number;
}

export interface MessageSchema {
  height: MessageHeightConfig;
  width: MessageWidthConfig;
}

// =============================================================================
// HEIGHT ADDITIONS (The "Legos")
// =============================================================================

export interface HeightAdditions {
  reaction: number;
  reply: number;
  linkPreview: number;
  senderName: number;
}

// =============================================================================
// SCROLL & ANIMATION
// =============================================================================

export type EasingFunction = "linear" | "easeOut" | "easeInOut" | "spring";

export interface ScrollConfig {
  lockToBottom: boolean;
  smoothScrollDuration: number;
  easing: EasingFunction;
  newMessageScrollDelay: number;
  overscanTop: number;
  overscanBottom: number;
  maxScrollSpeed: number;
}

export interface AnimationConfig {
  messageAppearDuration: number;
  messageAppearOffset: number;
  typingPulseDuration: number;
  voiceWaveformSpeed: number;
}

export interface GlobalSpacing {
  topPadding: number;
  bottomPadding: number;
  bubbleMargin: number;
}

// =============================================================================
// COMPLETE CONFIG STRUCT
// =============================================================================

export interface MessageLayoutConfig {
  messageTypes: Record<MessageType, MessageSchema>;
  additions: HeightAdditions;
  scroll: ScrollConfig;
  animation: AnimationConfig;
  spacing: SpacingConfig;
}

// =============================================================================
// DEFAULT CONFIGURATION (The Values)
// =============================================================================

const DEFAULT_TYPE_OVERRIDES: Record<MessageType, MessageTypeConfig> = {
  text: { category: "text" },
  image: { category: "media" },
  video: { category: "media" },
  gif: { category: "media" },
  voice: { category: "audio" },
  poll: { category: "text" },
  link: { category: "text" },
  sticker: { category: "media" },
  document: { category: "media" },
  contact: { category: "media" },
  location: { category: "media" },
  system: {
    category: "system",
    gapBefore: LAYOUT_CONSTANTS.GAP_SYSTEM,
    gapAfter: LAYOUT_CONSTANTS.GAP_SYSTEM,
  },
  deleted: { category: "text" },
  // Typing behaves like a sender run-break (e.g. interruption)
  typing: {
    category: "ephemeral",
    gapBefore: LAYOUT_CONSTANTS.GAP_RUN_BREAK,
    gapAfter: LAYOUT_CONSTANTS.GAP_RUN_BREAK,
  },
  screenshot_alert: {
    category: "system",
    gapBefore: LAYOUT_CONSTANTS.GAP_SYSTEM,
    gapAfter: LAYOUT_CONSTANTS.GAP_SYSTEM,
  },
  call: { category: "media" },
  call_missed: { category: "media" },
};

export const DEFAULT_LAYOUT_CONFIG: MessageLayoutConfig = {
  messageTypes: {
    text: {
      height: {
        base: LAYOUT_CONSTANTS.BUBBLE_PADDING_V * 2 + LAYOUT_CONSTANTS.TIMESTAMP_HEIGHT,
        lineHeight: LAYOUT_CONSTANTS.LINE_HEIGHT,
        // capacity dynamic via measureTextBlock (unitsPerLine)
      },
      width: {
        maxPercent: 0.78,
        min: 68,
      },
    },
    image: {
      height: { base: 202, withCaption: 238 },
      width: { fixed: 286, maxPercent: 0.78, min: 240 },
    },
    video: {
      height: { base: 202, withCaption: 238 },
      width: { fixed: 286, maxPercent: 0.78, min: 240 },
    },
    gif: {
      height: { base: 192 },
      width: { fixed: 286, maxPercent: 0.78, min: 240 },
    },
    voice: {
      height: { base: 68 },
      width: { fixed: 276, maxPercent: 0.78, min: 276 },
    },
    poll: {
      height: { base: 168 },
      width: { fixed: 310, maxPercent: 0.82, min: 280 },
    },
    link: {
      height: { base: 52 },
      width: { fixed: 310, maxPercent: 0.82, min: 240 },
    },
    sticker: {
      height: { base: 152 },
      width: { fixed: 152, maxPercent: 0.42, min: 152 },
    },
    document: {
      height: { base: 90 },
      width: { fixed: 310, maxPercent: 0.82, min: 280 },
    },
    contact: {
      height: { base: 112 },
      width: { fixed: 310, maxPercent: 0.82, min: 272 },
    },
    location: {
      height: { base: 194 },
      width: { fixed: 286, maxPercent: 0.82, min: 286 },
    },
    system: {
      height: { base: 34 },
      width: { maxPercent: 0.7, min: 112 },
    },
    deleted: {
      height: { base: 52 },
      width: { maxPercent: 0.78, min: 176 },
    },
    typing: {
      height: {
        base: LAYOUT_CONSTANTS.TYPING_BUBBLE_HEIGHT + LAYOUT_CONSTANTS.TYPING_BUBBLE_PADDING_V * 2,
      },
      width: { fixed: 150, maxPercent: 0.3, min: 150 },
    },
    screenshot_alert: {
      height: { base: 34 },
      width: { maxPercent: 0.7, min: 150 },
    },
    call: {
      height: { base: 70 },
      width: { maxPercent: 0.78, min: 244 },
    },
    call_missed: {
      height: { base: 70 },
      width: { maxPercent: 0.78, min: 244 },
    },
  },
  additions: {
    reaction: 14,
    reply: 54,
    linkPreview: 154,
    senderName: LAYOUT_CONSTANTS.SENDER_NAME_HEIGHT,
  },
  scroll: {
    lockToBottom: true,
    smoothScrollDuration: 15,
    easing: "easeOut",
    newMessageScrollDelay: 3,
    overscanTop: 200,
    overscanBottom: 200,
    maxScrollSpeed: 60,
  },
  animation: {
    messageAppearDuration: 12,
    messageAppearOffset: 30,
    typingPulseDuration: 45,
    voiceWaveformSpeed: 2,
  },
  spacing: {
    typeOverrides: DEFAULT_TYPE_OVERRIDES,
    global: {
      topPadding: 48,
      bottomPadding: 120,
      bubbleMargin: LAYOUT_CONSTANTS.BUBBLE_MARGIN,
    },
  },
};

// =============================================================================
// HEIGHT CALCULATION
// =============================================================================

export interface MessageForHeight {
  type?: MessageType;
  text?: string;
  caption?: string;
  systemType?: string;
  pollQuestion?: string;
  pollOptionCount?: number;
  locationName?: string;
  locationAddress?: string;
  from?: string;
  prevFrom?: string;
  isGroupChat?: boolean;
  isForwarded?: boolean;
  reactions?: unknown[];
  replyTo?: unknown;
  linkPreview?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  } | null;
}

export function calculateMessageHeight(
  msg: MessageForHeight,
  viewportWidth: number,
  config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): number {
  const msgType = (msg.type || "text") as MessageType;
  const typeConfig = config.messageTypes[msgType] || config.messageTypes.text;

  let height = 0;

  // Base height
  if (msgType === "text" || msgType === "deleted") {
    const text = msg.text || "";
    // Use unified measurement logic
    const { lines } = measureTextBlock(text, viewportWidth, config);
    height =
      typeConfig.height.base +
      lines * (typeConfig.height.lineHeight || LAYOUT_CONSTANTS.LINE_HEIGHT);
  } else if ((msgType === "image" || msgType === "video") && msg.caption) {
    const { lines } = measureTextBlock(msg.caption, viewportWidth, config);
    const captionHeight = lines * LAYOUT_CONSTANTS.LINE_HEIGHT;
    const captionPadding = 9;
    const metadataHeight = 17;
    height = typeConfig.height.base + captionHeight + captionPadding + metadataHeight;
  } else if (msgType === "voice") {
    height = 85;
  } else if (msgType === "document") {
    height = 97;
  } else if (msgType === "contact") {
    height = 115;
  } else if (msgType === "poll") {
    const optionCount = Math.max(2, Math.floor(msg.pollOptionCount ?? 2));
    const questionLines = (msg.pollQuestion?.length ?? 0) > 34 ? 2 : 1;
    height =
      LAYOUT_CONSTANTS.BUBBLE_PADDING_V * 2 +
      questionLines * 21 +
      10 +
      optionCount * 26 +
      Math.max(0, optionCount - 1) * 9 +
      10 +
      14 +
      17;
  } else if (msgType === "location") {
    const hasDetails = Boolean(msg.locationName || msg.locationAddress);
    height = hasDetails ? 219 : 160;
  } else if (msgType === "link" && msg.linkPreview) {
    const previewHeight =
      (msg.linkPreview.image ? 120 : 0) +
      16 +
      (msg.linkPreview.siteName ? 16 : 0) +
      (msg.linkPreview.title ? 42 : 0) +
      (msg.linkPreview.description ? 40 : 0) +
      18;
    const textHeight = msg.text
      ? measureTextBlock(msg.text, viewportWidth, config).lines * LAYOUT_CONSTANTS.LINE_HEIGHT
      : 0;
    height = LAYOUT_CONSTANTS.BUBBLE_PADDING_V * 2 + previewHeight + textHeight + 17;
  } else if (msgType === "system") {
    if (msg.systemType === "date_change") {
      height = 49;
    } else if (
      msg.systemType === "encryption_notice" ||
      msg.systemType === "business_notice" ||
      msg.systemType === "safety_code_changed"
    ) {
      const usableWidth = Math.max(120, viewportWidth * 0.7 - 78);
      const unitsPerLine = Math.max(1, Math.floor(usableWidth / LAYOUT_CONSTANTS.AVG_CHAR_WIDTH));
      const textUnits = Array.from(msg.text ?? "").reduce(
        (total, character) => total + (character.charCodeAt(0) > 255 ? 1.5 : 1),
        0,
      );
      const bodyLines = Math.max(1, Math.ceil(textUnits / unitsPerLine));
      height = 20 + 16 + 2 + bodyLines * 16;
    } else {
      height = typeConfig.height.base;
    }
  } else {
    height = typeConfig.height.base;
  }

  // Additions
  if (msg.reactions && msg.reactions.length > 0) height += config.additions.reaction;
  if (msg.replyTo) height += config.additions.reply;
  if (msg.linkPreview && msgType !== "link") {
    height += config.additions.linkPreview;
  }
  if (msg.isForwarded) height += 22;

  if (
    shouldShowSenderName({
      from: msg.from,
      type: msgType,
      isGroupChat: msg.isGroupChat,
      prevFrom: msg.prevFrom,
    })
  ) {
    height += config.additions.senderName;
  }

  return height;
}

// =============================================================================
// SMART GAP CALCULATION (THE TRUTH TABLE)
// =============================================================================

export interface MessageForGap {
  type?: MessageType;
  from?: string;
  at?: number;
  hasReply?: boolean;
  hasReactions?: boolean;
  hasLinkPreview?: boolean;
}

export interface GapContext {
  prevMessage: MessageForGap;
  nextMessage: MessageForGap;
}

export function calculateSmartGap(
  context: GapContext,
  config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): number {
  const { prevMessage, nextMessage } = context;
  const prevType = (prevMessage.type || "text") as MessageType;
  const nextType = (nextMessage.type || "text") as MessageType;

  // Check type-specific processing (only System messages act as special exceptions now)
  const prevOverride = config.spacing.typeOverrides[prevType];
  const nextOverride = config.spacing.typeOverrides[nextType];

  if (prevOverride?.gapAfter !== undefined && prevOverride.gapAfter !== null) {
    return prevOverride.gapAfter;
  }
  if (nextOverride?.gapBefore !== undefined && nextOverride.gapBefore !== null) {
    return nextOverride.gapBefore;
  }

  // Visual Run Logic
  const sameSender = prevMessage.from === nextMessage.from;
  const isVisualRun =
    sameSender &&
    prevType === "text" &&
    nextType === "text" &&
    !prevMessage.hasReply &&
    !nextMessage.hasReply &&
    !prevMessage.hasReactions &&
    !nextMessage.hasReactions &&
    !prevMessage.hasLinkPreview &&
    !nextMessage.hasLinkPreview;

  if (isVisualRun) return LAYOUT_CONSTANTS.GAP_MINIMAL;
  if (sameSender) return LAYOUT_CONSTANTS.GAP_RUN_BREAK;
  return LAYOUT_CONSTANTS.GAP_NORMAL;
}

// =============================================================================
// MEASUREMENT HELPERS (Deterministic constants)
// =============================================================================

export interface TextBlockMetrics {
  lines: number;
  bubbleWidth: number;
  unitsPerLine: number; // Renamed from charsPerLine to reflect weighted units
}

/* DESIGN PHILOSOPHY: "Pure Math"
 * - No multipliers.
 * - No runtime DOM measurement. Deterministic constants.
 * - Exact pixel values defined in LAYOUT_CONSTANTS.
 * - Gaps are determined strictly by "Visual Runs" (see LAYOUT_LOGIC.md).
 */

/**
 * Deterministic, no-DOM text measurement.
 * Key fix: bubble width uses the WIDEST wrapped line weight (maxLineWeight),
 * not the paragraph total weight or always-full-capacity width.
 *
 * Weighted units:
 * - space: 0.6
 * - ascii/basic: 1.0
 * - wide (CJK etc): 1.5
 * - emoji surrogate pair: 1.8
 */
export function measureTextBlock(
  text: string,
  viewportWidth: number = 393,
  config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): TextBlockMetrics {
  const typeConfig = config.messageTypes.text; // Text config is the source of truth for text metrics

  // 1) Constraints
  const maxBubbleWidth = viewportWidth * typeConfig.width.maxPercent;
  const horizontalPadding = LAYOUT_CONSTANTS.BUBBLE_PADDING_H * 2;

  // Safety clamp so we never divide by 0 / go negative on tiny screens
  const availableTextWidth = Math.max(1, maxBubbleWidth - horizontalPadding);

  // 2) Capacity (INTEGER, consistent everywhere)
  const avgCharWidth = LAYOUT_CONSTANTS.AVG_CHAR_WIDTH;
  const unitsPerLine = Math.max(1, Math.floor(availableTextWidth / avgCharWidth));

  // 3) Measure
  // Split paragraphs by explicit newline. Newline always forces a line break.
  const paragraphs = text.split("\n");

  let totalLines = 0;
  let maxLineUnits = 0; // the single most "wide" wrapped line across all paragraphs

  for (const paragraph of paragraphs) {
    // Explicit blank line => counts as 1 line
    if (paragraph.length === 0) {
      totalLines += 1;
      maxLineUnits = Math.max(maxLineUnits, 0);
      continue;
    }

    // Wrap simulation in weighted units
    let lineUnits = 0;
    let linesInParagraph = 1;

    for (let i = 0; i < paragraph.length; i++) {
      const code = paragraph.charCodeAt(i);

      // Weight function (deterministic)
      let w = 1.0;

      // space
      if (code === 32) {
        w = 0.6;
      } else if (code >= 65 && code <= 90) {
        // Uppercase A-Z
        w = 1.3;
      } else {
        // emoji surrogate pair
        const isHigh = code >= 0xd800 && code <= 0xdbff;
        if (isHigh && i + 1 < paragraph.length) {
          const next = paragraph.charCodeAt(i + 1);
          const isLow = next >= 0xdc00 && next <= 0xdfff;
          if (isLow) {
            w = 1.8;
            i++; // consume low surrogate
          } else if (code > 255) {
            w = 1.5;
          }
        } else if (code > 255) {
          // wide-ish (CJK etc.)
          w = 1.5;
        }
      }

      // If adding this char overflows the line => wrap
      // NOTE: If the char itself is heavier than capacity, we still place it on a new line
      // and clamp the recorded width to capacity (because bubble cannot exceed maxBubbleWidth).
      if (lineUnits > 0 && lineUnits + w > unitsPerLine) {
        maxLineUnits = Math.max(maxLineUnits, lineUnits);
        linesInParagraph += 1;
        lineUnits = w;
      } else {
        lineUnits += w;
      }

      // Track widest line as we go
      // We clamp width contribution to at most unitsPerLine because bubble width is clamped anyway.
      maxLineUnits = Math.max(maxLineUnits, Math.min(lineUnits, unitsPerLine));
    }

    // finalize paragraph
    totalLines += linesInParagraph;
    maxLineUnits = Math.max(maxLineUnits, Math.min(lineUnits, unitsPerLine));
  }

  // Ensure at least one line for empty string
  if (totalLines === 0) totalLines = 1;

  // 4) Convert widest line units -> pixels
  const computedWidth = maxLineUnits * avgCharWidth + horizontalPadding;

  // Clamp bubble width to: [minWidth, maxBubbleWidth]
  const bubbleWidth = Math.min(maxBubbleWidth, Math.max(computedWidth, typeConfig.width.min));

  return { lines: totalLines, bubbleWidth, unitsPerLine };
}

export function calculateBubbleWidth(
  msg: MessageForHeight,
  viewportWidth: number,
  config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): number {
  const msgType = (msg.type || "text") as MessageType;
  const typeConfig = config.messageTypes[msgType] || config.messageTypes.text;

  if (typeConfig.width.fixed) {
    return Math.min(typeConfig.width.fixed, viewportWidth * typeConfig.width.maxPercent);
  }

  if (msgType === "text" || msgType === "deleted") {
    const { bubbleWidth } = measureTextBlock(msg.text || "", viewportWidth, config);
    return bubbleWidth;
  }

  // Media & others: Use standard clamping
  // Calculates a width based on percentage, but ensures it's at least 'min'
  // and optionally upper-bounded if we strictly wanted to (not currently in config)
  const idealWidth = viewportWidth * typeConfig.width.maxPercent;
  return Math.max(typeConfig.width.min, idealWidth);
}

// =============================================================================
// ANIMATION & LAYOUT HELPERS
// =============================================================================

export function applyEasing(progress: number, easing: EasingFunction): number {
  switch (easing) {
    case "linear":
      return progress;
    case "easeOut":
      return 1 - Math.pow(1 - progress, 3);
    case "easeInOut":
      return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    case "spring": {
      const c4 = (2 * Math.PI) / 3;
      return progress === 0
        ? 0
        : progress === 1
          ? 1
          : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
    }
    default:
      return progress;
  }
}

export function isMessageCentered(
  type: MessageType,
  config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): boolean {
  const category = config.spacing.typeOverrides[type]?.category;
  return category === "system";
}

export function doesMessageBreakGrouping(
  type: MessageType,
  config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG,
): boolean {
  const category = config.spacing.typeOverrides[type]?.category;
  return category === "system" || category === "ephemeral"; // System & Typing break grouping
}

export interface SenderNameContext {
  from?: string;
  type?: string;
  isGroupChat?: boolean;
  prevFrom?: string;
}

export function shouldShowSenderName(ctx: SenderNameContext): boolean {
  if (!ctx.isGroupChat) return false;
  if (!ctx.from) return false;
  if (ctx.from === "me") return false;
  if (ctx.from === "system") return false;
  if (ctx.type === "system") return false;

  // Show if previous sender was different (or no previous sender, or generic BREAK token)
  return ctx.from !== ctx.prevFrom;
}
