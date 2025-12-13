/**
 * WhatsApp Layout Configuration
 * 
 * Production-grade configurable message heights, spacing, and animations.
 * All values are in device pixels (3x scale for retina).
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
    | "system"
    | "deleted"
    | "typing"
    | "screenshot_alert"
    | "call_missed";

export type MessageCategory = "text" | "media" | "audio" | "system" | "ephemeral";

// =============================================================================
// SPACING CONFIGURATION (SOURCE OF TRUTH)
// =============================================================================

/**
 * Authoritative Layout Constants.
 * These are the Source of Truth for both Calculation and Rendering.
 * All units in device pixels (3x retina).
 */
export const LAYOUT_CONSTANTS = {
    BUBBLE_PADDING_V: 24,     // Top/Bottom padding inside bubble (8px visual)
    BUBBLE_PADDING_H: 36,     // Left/Right padding inside bubble
    LINE_HEIGHT: 66,          // Text line height (22px visual)
    FONT_SIZE: 51,            // Text font size
    TIMESTAMP_HEIGHT: 36,     // Footer area height
    SENDER_NAME_HEIGHT: 45,   // Height of sender name area

    // Spacing Tiers (The 3-Tier Model)
    GAP_MINIMAL: 6,           // 2px visual (Visual Run / Burst)
    GAP_RUN_BREAK: 18,        // 6px visual (Same Sender, New Block/Reply)
    GAP_NORMAL: 36,           // 12px visual (Sender Switch)

    // System Spacing
    GAP_SYSTEM: 27,           // 9px visual

    // Typography / Metrics
    AVG_CHAR_WIDTH: 24,       // Average character width for wrapping calculation

    // Typing Indicator
    TYPING_BUBBLE_HEIGHT: 72, // Inner height
    TYPING_BUBBLE_PADDING_V: 27, // Vertical padding
};

/**
 * Simplified Per-Message-Type Configuration
 */
export interface MessageTypeConfig {
    category: MessageCategory;
    gapBefore?: number; // Force specific gap (used for System messages)
    gapAfter?: number;  // Force specific gap
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
    timestamp: number;
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
    system: { category: "system", gapBefore: 9, gapAfter: 9 },
    deleted: { category: "text" },
    typing: { category: "ephemeral" },
    screenshot_alert: { category: "system", gapBefore: 9, gapAfter: 9 },
    call_missed: { category: "system", gapBefore: 9, gapAfter: 9 },
};

export const DEFAULT_LAYOUT_CONFIG: MessageLayoutConfig = {
    messageTypes: {
        text: {
            height: {
                base: LAYOUT_CONSTANTS.BUBBLE_PADDING_V * 2 + LAYOUT_CONSTANTS.TIMESTAMP_HEIGHT,
                lineHeight: LAYOUT_CONSTANTS.LINE_HEIGHT,
                charsPerLine: 13,
            },
            width: {
                maxPercent: 0.78,
                min: 150,
            },
        },
        image: {
            height: { base: 600, withCaption: 700 },
            width: { maxPercent: 0.78, min: 300 },
        },
        video: {
            height: { base: 600, withCaption: 700 },
            width: { maxPercent: 0.78, min: 300 },
        },
        gif: {
            height: { base: 500 },
            width: { maxPercent: 0.78, min: 250 },
        },
        voice: {
            height: { base: 180 },
            width: { fixed: 450, maxPercent: 0.78, min: 450 },
        },
        system: {
            height: { base: 80 },
            width: { maxPercent: 0.6, min: 200 },
        },
        deleted: {
            height: { base: 100 },
            width: { maxPercent: 0.6, min: 200 },
        },
        typing: {
            height: { base: 120 },
            width: { fixed: 150, maxPercent: 0.3, min: 150 },
        },
        screenshot_alert: {
            height: { base: 80 },
            width: { maxPercent: 0.7, min: 250 },
        },
        call_missed: {
            height: { base: 120 },
            width: { maxPercent: 0.6, min: 200 },
        },
    },
    additions: {
        reaction: 36,
        reply: 90,
        linkPreview: 180,
        senderName: LAYOUT_CONSTANTS.SENDER_NAME_HEIGHT,
        timestamp: 40,
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
            bubbleMargin: 36,
        },
    },
};

// =============================================================================
// LOGIC HELPERS
// =============================================================================

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

    // Show if previous sender was different (or no previous sender)
    return ctx.from !== ctx.prevFrom;
}

// =============================================================================
// HEIGHT CALCULATION
// =============================================================================

export interface MessageForHeight {
    type?: MessageType;
    text?: string;
    caption?: string;
    from?: string;
    prevFrom?: string;
    isGroupChat?: boolean;
    reactions?: unknown[];
    replyTo?: unknown;
    linkPreview?: unknown;
}

export function calculateMessageHeight(
    msg: MessageForHeight,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    const msgType = (msg.type || "text") as MessageType;
    const typeConfig = config.messageTypes[msgType] || config.messageTypes.text;

    let height = 0;

    // Base height
    if (msgType === "text" || msgType === "deleted") {
        const text = msg.text || "";
        const charsPerLine = typeConfig.height.charsPerLine || 13;
        const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
        height = typeConfig.height.base + (lines * (typeConfig.height.lineHeight || LAYOUT_CONSTANTS.LINE_HEIGHT));
    } else if ((msgType === "image" || msgType === "video") && msg.caption) {
        height = typeConfig.height.withCaption || typeConfig.height.base;
    } else {
        height = typeConfig.height.base;
    }

    // Additions
    if (msg.reactions && msg.reactions.length > 0) height += config.additions.reaction;
    if (msg.replyTo) height += config.additions.reply;
    if (msg.linkPreview) height += config.additions.linkPreview;

    if (shouldShowSenderName({
        from: msg.from,
        type: msgType,
        isGroupChat: msg.isGroupChat,
        prevFrom: msg.prevFrom
    })) {
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
}

export interface GapContext {
    prevMessage: MessageForGap;
    nextMessage: MessageForGap;
}

export function calculateSmartGap(
    context: GapContext,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    const { prevMessage, nextMessage } = context;
    const prevType = (prevMessage.type || "text") as MessageType;
    const nextType = (nextMessage.type || "text") as MessageType;

    // Check type-specific processing (only System messages act as special exceptions now)
    const prevOverride = config.spacing.typeOverrides[prevType];
    const nextOverride = config.spacing.typeOverrides[nextType];

    if (prevOverride?.gapAfter != null) return prevOverride.gapAfter;
    if (nextOverride?.gapBefore != null) return nextOverride.gapBefore;

    // Visual Run Logic
    // Visual Run Logic
    const sameSender = prevMessage.from === nextMessage.from;
    const isVisualRun = sameSender &&
        prevType === "text" &&
        nextType === "text" &&
        !prevMessage.hasReply &&
        !nextMessage.hasReply &&
        !prevMessage.hasReactions &&
        !nextMessage.hasReactions;

    if (isVisualRun) return LAYOUT_CONSTANTS.GAP_MINIMAL;
    if (sameSender) return LAYOUT_CONSTANTS.GAP_RUN_BREAK;
    return LAYOUT_CONSTANTS.GAP_NORMAL;
}

// Compatibility Shim
export function calculateGapBetween(prev: MessageForGap, next: MessageForGap): number {
    return calculateSmartGap({ prevMessage: prev, nextMessage: next });
}

export function calculateBubbleWidth(
    msg: MessageForHeight,
    viewportWidth: number,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    const msgType = (msg.type || "text") as MessageType;
    const typeConfig = config.messageTypes[msgType] || config.messageTypes.text;

    if (typeConfig.width.fixed) return typeConfig.width.fixed;

    // Simplified width logic
    if (msgType === "text" || msgType === "deleted") {
        const textLength = msg.text?.length || 0;
        const avgCharWidth = LAYOUT_CONSTANTS.AVG_CHAR_WIDTH;
        const horizontalPadding = LAYOUT_CONSTANTS.BUBBLE_PADDING_H * 2;

        // Dynamic wrap wrap limit
        const maxBubbleWidth = viewportWidth * typeConfig.width.maxPercent;
        const availableTextWidth = maxBubbleWidth - horizontalPadding;
        const charsPerLine = Math.floor(availableTextWidth / avgCharWidth);

        const textWidth = Math.min(textLength, charsPerLine) * avgCharWidth + horizontalPadding;
        return Math.min(maxBubbleWidth, Math.max(textWidth, typeConfig.width.min));
    }

    return viewportWidth * typeConfig.width.maxPercent;
}

// =============================================================================
// ANIMATION & LAYOUT HELPERS
// =============================================================================

export function applyEasing(progress: number, easing: EasingFunction): number {
    switch (easing) {
        case "linear": return progress;
        case "easeOut": return 1 - Math.pow(1 - progress, 3);
        case "easeInOut": return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        case "spring":
            const c4 = (2 * Math.PI) / 3;
            return progress === 0 ? 0 : progress === 1 ? 1 : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
        default: return progress;
    }
}

export function isMessageCentered(
    type: MessageType,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): boolean {
    const category = config.spacing.typeOverrides[type]?.category;
    return category === "system";
}

export function doesMessageBreakGrouping(
    type: MessageType,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): boolean {
    const category = config.spacing.typeOverrides[type]?.category;
    return category === "system" || category === "ephemeral"; // System & Typing break grouping
}
