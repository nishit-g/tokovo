/**
 * WhatsApp Layout Configuration
 * 
 * Production-grade configurable message heights, spacing, and animations.
 * All values are in device pixels (3x scale for retina).
 * 
 * SPACING ARCHITECTURE:
 * - Base gaps: 5 levels of spacing (minimal → spacious)
 * - Contextual multipliers: Adjust gaps based on message context
 * - Time-based grouping: Messages within threshold are visually grouped
 * - Per-message-type overrides: Fine-grained control per message type
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

// Helper type for categorizing messages
export type MessageCategory =
    | "text"      // text, deleted
    | "media"     // image, video, gif
    | "audio"     // voice
    | "system"    // system, screenshot_alert, call_missed
    | "ephemeral"; // typing

// =============================================================================
// SPACING CONFIGURATION (THE CORE NEW SYSTEM)
// =============================================================================

/**
 * Authoritative Layout Constants.
 * These are the Source of Truth for both Calculation and Rendering.
 * All units in device pixels (3x retina).
 */
export const LAYOUT_CONSTANTS = {
    BUBBLE_PADDING_V: 24,     // Top/Bottom padding inside bubble
    BUBBLE_PADDING_H: 36,     // Left/Right padding inside bubble
    LINE_HEIGHT: 66,          // Text line height
    FONT_SIZE: 51,            // Text font size
    TIMESTAMP_HEIGHT: 36,     // Footer area height (roughly)
    SENDER_NAME_HEIGHT: 45,   // Height of sender name area
    GAP_MINIMAL: 6,           // 2px visual
    GAP_NORMAL: 36,           // 12px visual
};

/**
 * Base gap levels - the 5 tiers of spacing.
 * These are the raw pixel values at 3x retina scale.
 */
export interface BaseGaps {
    /** Tightest grouping - same sender within time threshold (6px visual, 18 @ 3x) */
    minimal: number;
    /** Same sender, outside time threshold (12px visual, 36 @ 3x) */
    compact: number;
    /** Different sender, same side (18px visual, 54 @ 3x) */
    normal: number;
    /** Side switch - conversation flow change (24px visual, 72 @ 3x) */
    relaxed: number;
    /** Maximum separation - after media/system (36px visual, 108 @ 3x) */
    spacious: number;
}

/**
 * Contextual multipliers - fine-tune gaps based on message context.
 * Applied on top of base gaps for specific situations.
 */
export interface GapMultipliers {
    /** After image/video/gif messages */
    afterMedia: number;
    /** Before image/video/gif messages */
    beforeMedia: number;
    /** After voice note */
    afterVoice: number;
    /** Before voice note */
    beforeVoice: number;
    /** After system messages (admin actions, member changes) */
    afterSystem: number;
    /** Before system messages */
    beforeSystem: number;
    /** Between different members in group chat */
    groupMemberSwitch: number;
    /** When time gap exceeds threshold (conversation pause) */
    timeBreak: number;
    /** After deleted message */
    afterDeleted: number;
    /** After typing indicator appears */
    afterTyping: number;
}

/**
 * Time-based grouping configuration.
 * Messages within these thresholds are considered part of the same "burst".
 */
export interface GroupingConfig {
    /** Frames within which messages are considered "grouped" (~30fps) */
    timeThresholdFrames: number;
    /** Maximum messages in a group before forcing visual break */
    maxGroupSize: number;
    /** Enable/disable time-based grouping entirely */
    enabled: boolean;
}

/**
 * Per-message-type gap overrides.
 * Override specific gap values for specific message types.
 */
export interface MessageTypeGapOverrides {
    /** Gap after this message type (null = use calculated value) */
    gapAfter?: number | null;
    /** Gap before this message type (null = use calculated value) */
    gapBefore?: number | null;
    /** Category for grouping calculations */
    category: MessageCategory;
    /** Whether this type breaks message grouping */
    breaksGrouping: boolean;
    /** Whether this type is centered (system messages) */
    isCentered: boolean;
}

/**
 * Complete spacing configuration.
 */
export interface SpacingConfig {
    /** Base gap values (5 tiers) */
    base: BaseGaps;
    /** Contextual multipliers */
    multipliers: GapMultipliers;
    /** Time-based grouping settings */
    grouping: GroupingConfig;
    /** Per-message-type overrides */
    typeOverrides: Record<MessageType, MessageTypeGapOverrides>;
    /** Global spacing (non-gap) */
    global: GlobalSpacing;
}

// =============================================================================
// HEIGHT CONFIGURATION (existing, enhanced)
// =============================================================================

export interface MessageHeightConfig {
    /** Base height of this message type */
    base: number;
    /** Line height for text-based content */
    lineHeight?: number;
    /** Characters per line for text wrapping calculation */
    charsPerLine?: number;
    /** Height when media has caption */
    withCaption?: number;
}

export interface MessageWidthConfig {
    /** Fixed width (for voice, typing, etc.) */
    fixed?: number;
    /** Maximum width as percentage of viewport (0-1) */
    maxPercent: number;
    /** Minimum width */
    min: number;
    /** Average character width for text bubble calculation */
    avgCharWidth?: number;
    /** Horizontal padding for text calculation */
    horizontalPadding?: number;
}

export interface MessageTypeConfig {
    height: MessageHeightConfig;
    width: MessageWidthConfig;
}

// =============================================================================
// HEIGHT ADDITIONS
// =============================================================================

export interface HeightAdditions {
    /** Additional height for reaction bar */
    reaction: number;
    /** Additional height for quoted/reply message */
    reply: number;
    /** Additional height for link preview */
    linkPreview: number;
    /** Additional height for sender name in groups */
    senderName: number;
    /** Height for timestamp row */
    timestamp: number;
}

// =============================================================================
// SCROLL CONFIGURATION
// =============================================================================

export type EasingFunction = "linear" | "easeOut" | "easeInOut" | "spring";

export interface ScrollConfig {
    /** Keep viewport at bottom (newest messages visible) */
    lockToBottom: boolean;
    /** Duration of scroll animation in frames */
    smoothScrollDuration: number;
    /** Easing function for scroll animation */
    easing: EasingFunction;
    /** Delay before scrolling to new message (frames) */
    newMessageScrollDelay: number;
    /** Extra pixels to render above viewport */
    overscanTop: number;
    /** Extra pixels to render below viewport */
    overscanBottom: number;
    /** Maximum scroll speed (pixels per frame) */
    maxScrollSpeed: number;
}

// =============================================================================
// ANIMATION CONFIGURATION
// =============================================================================

export interface AnimationConfig {
    /** Duration for message appear animation (frames) */
    messageAppearDuration: number;
    /** Slide offset for message appear (pixels) */
    messageAppearOffset: number;
    /** Typing bubble pulse duration (frames per cycle) */
    typingPulseDuration: number;
    /** Voice note waveform animation speed */
    voiceWaveformSpeed: number;
}

// =============================================================================
// GLOBAL SPACING
// =============================================================================

export interface GlobalSpacing {
    /** Padding at top of chat */
    topPadding: number;
    /** Padding at bottom of chat */
    bottomPadding: number;
    /** Horizontal margin for bubbles from screen edge */
    bubbleMargin: number;
}

// =============================================================================
// COMPLETE LAYOUT CONFIG
// =============================================================================

export interface MessageTypesConfig {
    text: MessageTypeConfig;
    image: MessageTypeConfig;
    video: MessageTypeConfig;
    gif: MessageTypeConfig;
    voice: MessageTypeConfig;
    system: MessageTypeConfig;
    deleted: MessageTypeConfig;
    typing: MessageTypeConfig;
    screenshot_alert: MessageTypeConfig;
    call_missed: MessageTypeConfig;
}

export interface MessageLayoutConfig {
    messageTypes: MessageTypesConfig;
    additions: HeightAdditions;
    scroll: ScrollConfig;
    animation: AnimationConfig;
    spacing: SpacingConfig;
}

// =============================================================================
// DEFAULT SPACING CONFIGURATION
// =============================================================================

const DEFAULT_BASE_GAPS: BaseGaps = {
    minimal: LAYOUT_CONSTANTS.GAP_MINIMAL,   // 2px visual
    compact: LAYOUT_CONSTANTS.GAP_MINIMAL,   // Alias
    normal: LAYOUT_CONSTANTS.GAP_NORMAL,     // 12px visual
    relaxed: LAYOUT_CONSTANTS.GAP_NORMAL,    // Alias
    spacious: 54,                            // 18px visual (System)
};

const DEFAULT_MULTIPLIERS: GapMultipliers = {
    afterMedia: 1.0,
    beforeMedia: 1.0,
    afterVoice: 1.0,
    beforeVoice: 1.0,
    afterSystem: 1.0,
    beforeSystem: 1.0,
    groupMemberSwitch: 1.0,
    timeBreak: 1.0,            // Logic handled in tier selection
    afterDeleted: 1.0,
    afterTyping: 1.0,
};

const DEFAULT_GROUPING: GroupingConfig = {
    timeThresholdFrames: 1800,  // ~60 seconds at 30fps - keep bursts together
    maxGroupSize: 10,           // Allow larger groups
    enabled: true,
};

const DEFAULT_TYPE_OVERRIDES: Record<MessageType, MessageTypeGapOverrides> = {
    text: {
        category: "text",
        breaksGrouping: false,
        isCentered: false,
    },
    image: {
        category: "media",
        breaksGrouping: false,     // Don't force larger gaps
        isCentered: false,
    },
    video: {
        category: "media",
        breaksGrouping: false,
        isCentered: false,
    },
    gif: {
        category: "media",
        breaksGrouping: false,
        isCentered: false,
    },
    voice: {
        category: "audio",
        breaksGrouping: false,     // Voice can be part of a conversation burst
        isCentered: false,
    },
    system: {
        category: "system",
        breaksGrouping: true,      // System messages stand alone
        isCentered: true,
        gapBefore: 9,
        gapAfter: 9,
    },
    deleted: {
        category: "text",
        breaksGrouping: false,
        isCentered: false,
    },
    typing: {
        category: "ephemeral",
        breaksGrouping: true,      // Typing indicator is special
        isCentered: false,
    },
    screenshot_alert: {
        category: "system",
        breaksGrouping: true,
        isCentered: true,
        gapBefore: 9,
        gapAfter: 9,
    },
    call_missed: {
        category: "system",
        breaksGrouping: true,
        isCentered: true,
        gapBefore: 9,
        gapAfter: 9,
    },
};

const DEFAULT_GLOBAL_SPACING: GlobalSpacing = {
    topPadding: 48,
    bottomPadding: 120,
    bubbleMargin: 36,
};

// =============================================================================
// DEFAULT MESSAGE TYPE CONFIGS (heights and widths)
// =============================================================================

export const DEFAULT_LAYOUT_CONFIG: MessageLayoutConfig = {
    messageTypes: {
        text: {
            height: {
                base: LAYOUT_CONSTANTS.BUBBLE_PADDING_V * 2 + LAYOUT_CONSTANTS.TIMESTAMP_HEIGHT, // Base = Padding + Footer
                lineHeight: LAYOUT_CONSTANTS.LINE_HEIGHT,
                charsPerLine: 13,
            },
            width: {
                maxPercent: 0.78,
                min: 150,
                avgCharWidth: 24,
                horizontalPadding: LAYOUT_CONSTANTS.BUBBLE_PADDING_H * 2,
            },
        },
        image: {
            height: {
                base: 600,
                withCaption: 700,
            },
            width: {
                maxPercent: 0.78,
                min: 300,
            },
        },
        video: {
            height: {
                base: 600,
                withCaption: 700,
            },
            width: {
                maxPercent: 0.78,
                min: 300,
            },
        },
        gif: {
            height: {
                base: 500,
            },
            width: {
                maxPercent: 0.78,
                min: 250,
            },
        },
        voice: {
            height: {
                base: 180,
            },
            width: {
                fixed: 450,
                maxPercent: 0.78,
                min: 450,
            },
        },
        system: {
            height: {
                base: 80,
            },
            width: {
                maxPercent: 0.6,
                min: 200,
            },
        },
        deleted: {
            height: {
                base: 100,
            },
            width: {
                maxPercent: 0.6,
                min: 200,
            },
        },
        typing: {
            height: {
                base: 120,
            },
            width: {
                fixed: 150,
                maxPercent: 0.3,
                min: 150,
            },
        },
        screenshot_alert: {
            height: {
                base: 80,
            },
            width: {
                maxPercent: 0.7,
                min: 250,
            },
        },
        call_missed: {
            height: {
                base: 120,
            },
            width: {
                maxPercent: 0.6,
                min: 200,
            },
        },
    },
    additions: {
        reaction: 36,
        reply: 90,
        linkPreview: 180,
        senderName: 45,
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
        base: DEFAULT_BASE_GAPS,
        multipliers: DEFAULT_MULTIPLIERS,
        grouping: DEFAULT_GROUPING,
        typeOverrides: DEFAULT_TYPE_OVERRIDES,
        global: DEFAULT_GLOBAL_SPACING,
    },
};

// =============================================================================
// LOGIC HELPERS (Shared between Layout and UI)
// =============================================================================

/**
 * structure for checking sender name visibility
 */
export interface SenderNameContext {
    from?: string;
    type?: string;
    isGroupChat?: boolean;
    prevFrom?: string;
}

/**
 * Unified logic for whether to display the sender name.
 * Used by both height calculation (layout) and component rendering (ui).
 * 
 * Rules:
 * 1. Must be a group chat
 * 2. Must not be "me" (my messages don't need my name)
 * 3. Must not be a system message
 * 4. Must be a different sender from the previous message (grouping)
 */
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
// HEIGHT CALCULATION FUNCTION
// =============================================================================

export interface MessageForHeight {
    type?: MessageType;
    text?: string;
    caption?: string;
    from?: string;
    /** Previous message sender - used to determine if sender name should be shown */
    prevFrom?: string;
    isGroupChat?: boolean; // Added for correct height calculation
    reactions?: unknown[];
    replyTo?: unknown;
    linkPreview?: unknown;
}

/**
 * Calculate the height of a message based on its type and content.
 */
export function calculateMessageHeight(
    msg: MessageForHeight,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    const msgType = (msg.type || "text") as MessageType;
    const typeConfig = config.messageTypes[msgType] || config.messageTypes.text;
    const { additions } = config;

    let height = 0;

    // Base height by type
    if (msgType === "text" || msgType === "deleted") {
        const text = msg.text || "";
        const charsPerLine = typeConfig.height.charsPerLine || 13;
        const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
        // Pure Math: PaddingTop + PaddingBottom + (Lines * LineHeight) + Footer
        // "base" in config is defined as (Padding * 2 + Footer)
        height = typeConfig.height.base + (lines * (typeConfig.height.lineHeight || LAYOUT_CONSTANTS.LINE_HEIGHT));
    } else if ((msgType === "image" || msgType === "video") && msg.caption) {
        height = typeConfig.height.withCaption || typeConfig.height.base;
    } else {
        height = typeConfig.height.base;
    }

    // Add-ons
    if (msg.reactions && msg.reactions.length > 0) {
        height += additions.reaction;
    }

    if (msg.replyTo) {
        height += additions.reply;
    }

    if (msg.linkPreview) {
        height += additions.linkPreview;
    }

    // Sender name calculation using unified logic
    if (shouldShowSenderName({
        from: msg.from,
        type: msgType,
        isGroupChat: msg.isGroupChat,
        prevFrom: msg.prevFrom
    })) {
        height += additions.senderName;
    }

    return height;
}

// =============================================================================
// SMART GAP CALCULATION (THE NEW SYSTEM)
// =============================================================================

/**
 * Context for calculating gap between two messages.
 */
export interface GapContext {
    /** Previous message in the list */
    prevMessage: MessageForGap;
    /** Next message in the list */
    nextMessage: MessageForGap;
    /** Index of previous message */
    prevIndex: number;
    /** Index of next message */
    nextIndex: number;
    /** Whether this is a group chat */
    isGroupChat: boolean;
    /** Frame delta between messages */
    timeDelta: number;
    /** Current group size (consecutive same-sender messages) */
    currentGroupSize: number;
}

export interface MessageForGap {
    type?: MessageType;
    from?: string;
    at?: number;
}

/**
 * Determine the base gap tier based on sender relationship.
 */
function getBaseGapTier(
    prev: MessageForGap,
    next: MessageForGap,
    isGroupChat: boolean,
    config: MessageLayoutConfig
): keyof BaseGaps {
    // 1. Same sender = minimal gap
    if (prev.from === next.from) {
        return "minimal";
    }

    // 2. Different sender = normal gap
    return "normal";
}

/**
 * Apply contextual multipliers based on message types.
 */
function applyMultipliers(
    baseGap: number,
    prev: MessageForGap,
    next: MessageForGap,
    context: GapContext,
    config: MessageLayoutConfig
): number {
    const { multipliers, grouping } = config.spacing;
    const prevType = (prev.type || "text") as MessageType;
    const nextType = (next.type || "text") as MessageType;
    const prevOverride = config.spacing.typeOverrides[prevType];
    const nextOverride = config.spacing.typeOverrides[nextType];

    let finalGap = baseGap;
    let maxMultiplier = 1.0;

    // After media
    if (prevOverride.category === "media") {
        maxMultiplier = Math.max(maxMultiplier, multipliers.afterMedia);
    }

    // Before media
    if (nextOverride.category === "media") {
        maxMultiplier = Math.max(maxMultiplier, multipliers.beforeMedia);
    }

    // After voice
    if (prevType === "voice") {
        maxMultiplier = Math.max(maxMultiplier, multipliers.afterVoice);
    }

    // Before voice
    if (nextType === "voice") {
        maxMultiplier = Math.max(maxMultiplier, multipliers.beforeVoice);
    }

    // After system messages
    if (prevOverride.category === "system") {
        maxMultiplier = Math.max(maxMultiplier, multipliers.afterSystem);
    }

    // Before system messages
    if (nextOverride.category === "system") {
        maxMultiplier = Math.max(maxMultiplier, multipliers.beforeSystem);
    }

    // Group member switch in group chat
    if (context.isGroupChat && prev.from !== next.from && prev.from !== "me" && next.from !== "me") {
        maxMultiplier = Math.max(maxMultiplier, multipliers.groupMemberSwitch);
    }

    // Time-based break
    if (grouping.enabled && context.timeDelta > grouping.timeThresholdFrames) {
        maxMultiplier = Math.max(maxMultiplier, multipliers.timeBreak);
    }

    // Max group size reached
    if (grouping.enabled && context.currentGroupSize >= grouping.maxGroupSize) {
        maxMultiplier = Math.max(maxMultiplier, 1.5);  // Force visual break
    }

    finalGap *= maxMultiplier;
    return Math.round(finalGap);
}

/**
 * Calculate the smart gap between two messages.
 * This is the main function to use for gap calculation.
 */
export function calculateSmartGap(
    context: GapContext,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    const { prevMessage, nextMessage } = context;
    const prevType = (prevMessage.type || "text") as MessageType;
    const nextType = (nextMessage.type || "text") as MessageType;
    const prevOverride = config.spacing.typeOverrides[prevType];
    const nextOverride = config.spacing.typeOverrides[nextType];

    // Priority 1: System constraints usually require specific spacing (e.g. Date headers)
    if (prevOverride.category === "system" && prevOverride.gapAfter != null) {
        return prevOverride.gapAfter;
    }
    if (nextOverride.category === "system" && nextOverride.gapBefore != null) {
        return nextOverride.gapBefore;
    }

    // Pure Logic: Same Sender = Burst, Diff Sender = Separate
    if (prevMessage.from === nextMessage.from) {
        return config.spacing.base.minimal; // 2px
    }

    return config.spacing.base.normal; // 12px
}

/**
 * Legacy function for backward compatibility.
 * Use calculateSmartGap for new code.
 */
export function calculateGapBetween(
    prev: MessageForGap,
    next: MessageForGap,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    // Create a minimal context for backward compatibility
    const context: GapContext = {
        prevMessage: prev,
        nextMessage: next,
        prevIndex: 0,
        nextIndex: 1,
        isGroupChat: false,
        timeDelta: 0,
        currentGroupSize: 1,
    };

    return calculateSmartGap(context, config);
}

// =============================================================================
// BUBBLE WIDTH CALCULATION
// =============================================================================

/**
 * Calculate bubble width based on message type and content.
 */
export function calculateBubbleWidth(
    msg: MessageForHeight,
    viewportWidth: number,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    const msgType = (msg.type || "text") as MessageType;
    const typeConfig = config.messageTypes[msgType] || config.messageTypes.text;
    const widthConfig = typeConfig.width;

    // Fixed width (voice, typing)
    if (widthConfig.fixed) {
        return widthConfig.fixed;
    }

    // Text messages: dynamic width based on content
    if (msgType === "text" || msgType === "deleted") {
        const textLength = msg.text?.length || 0;
        const avgCharWidth = widthConfig.avgCharWidth || 14;
        const horizontalPadding = widthConfig.horizontalPadding || 72;
        const charsPerLine = typeConfig.height.charsPerLine || 26;

        const maxCharsOnLine = Math.min(textLength, charsPerLine);
        const textWidth = maxCharsOnLine * avgCharWidth + horizontalPadding;

        return Math.min(
            viewportWidth * widthConfig.maxPercent,
            Math.max(textWidth, widthConfig.min)
        );
    }

    // Media and other types: use maxPercent
    return viewportWidth * widthConfig.maxPercent;
}

// =============================================================================
// EASING FUNCTIONS
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
        case "spring":
            const c4 = (2 * Math.PI) / 3;
            return progress === 0
                ? 0
                : progress === 1
                    ? 1
                    : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
        default:
            return progress;
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the category of a message type.
 */
export function getMessageCategory(
    type: MessageType,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): MessageCategory {
    return config.spacing.typeOverrides[type]?.category || "text";
}

/**
 * Check if a message type is centered (system messages).
 */
export function isMessageCentered(
    type: MessageType,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): boolean {
    return config.spacing.typeOverrides[type]?.isCentered || false;
}

/**
 * Check if a message type breaks grouping.
 */
export function doesMessageBreakGrouping(
    type: MessageType,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): boolean {
    return config.spacing.typeOverrides[type]?.breaksGrouping || false;
}
