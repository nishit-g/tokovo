/**
 * WhatsApp Layout Configuration
 * 
 * Production-grade configurable message heights, spacing, and animations.
 * All values are in device pixels (3x scale for retina).
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

// =============================================================================
// PER-MESSAGE-TYPE CONFIGURATION
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

export interface MessageGapConfig {
    /** Gap after this message when next is same sender */
    sameSender: number;
    /** Gap after this message when next is same side but diff sender */
    sameSide: number;
    /** Gap after this message when next is opposite side */
    oppositeSide: number;
}

export interface MessageTypeConfig {
    height: MessageHeightConfig;
    width: MessageWidthConfig;
    gap: MessageGapConfig;
}

// =============================================================================
// COMPLETE MESSAGE TYPES CONFIG
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

// =============================================================================
// HEIGHT ADDITIONS (for reactions, replies, etc.)
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
// GLOBAL SPACING (non-message-specific)
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

export interface MessageLayoutConfig {
    messageTypes: MessageTypesConfig;
    additions: HeightAdditions;
    scroll: ScrollConfig;
    animation: AnimationConfig;
    spacing: GlobalSpacing;
}

// =============================================================================
// DEFAULT CONFIGURATION (iOS WhatsApp Authentic)
// =============================================================================

const DEFAULT_GAP: MessageGapConfig = {
    sameSender: 3,      // Tight grouping for consecutive same-sender messages
    sameSide: 8,        // Slight separation for same side, different sender
    oppositeSide: 16,   // Clear visual break when switching sides
};

const SYSTEM_GAP: MessageGapConfig = {
    sameSender: 12,     // System messages always have consistent gap
    sameSide: 12,
    oppositeSide: 12,
};

export const DEFAULT_LAYOUT_CONFIG: MessageLayoutConfig = {
    messageTypes: {
        text: {
            height: {
                base: 88,           // Padding + timestamp
                lineHeight: 66,     // 22px * 3 for retina
                charsPerLine: 26,
            },
            width: {
                maxPercent: 0.78,
                min: 150,
                avgCharWidth: 14,
                horizontalPadding: 72,
            },
            gap: DEFAULT_GAP,
        },
        image: {
            height: {
                base: 600,          // Match maxHeight in MediaBubbles.tsx
                withCaption: 700,   // + caption area (~100px)
            },
            width: {
                maxPercent: 0.78,
                min: 300,
            },
            gap: { ...DEFAULT_GAP, sameSender: 8 },  // More gap for media
        },
        video: {
            height: {
                base: 600,          // Match maxHeight in MediaBubbles.tsx
                withCaption: 700,   // + caption area
            },
            width: {
                maxPercent: 0.78,
                min: 300,
            },
            gap: { ...DEFAULT_GAP, sameSender: 8 },
        },
        gif: {
            height: {
                base: 500,          // Match maxHeight in GifBubble
            },
            width: {
                maxPercent: 0.78,
                min: 250,
            },
            gap: { ...DEFAULT_GAP, sameSender: 8 },
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
            gap: DEFAULT_GAP,
        },
        system: {
            height: {
                base: 80,
            },
            width: {
                maxPercent: 0.6,
                min: 200,
            },
            gap: SYSTEM_GAP,
        },
        deleted: {
            height: {
                base: 100,
            },
            width: {
                maxPercent: 0.6,
                min: 200,
            },
            gap: DEFAULT_GAP,
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
            gap: DEFAULT_GAP,
        },
        screenshot_alert: {
            height: {
                base: 80,
            },
            width: {
                maxPercent: 0.7,
                min: 250,
            },
            gap: SYSTEM_GAP,
        },
        call_missed: {
            height: {
                base: 120,
            },
            width: {
                maxPercent: 0.6,
                min: 200,
            },
            gap: SYSTEM_GAP,
        },
    },
    additions: {
        reaction: 36,       // One row of reactions
        reply: 90,          // Quoted message preview
        linkPreview: 180,   // Link preview card
        senderName: 45,     // Group sender name
        timestamp: 40,      // Timestamp row
    },
    scroll: {
        lockToBottom: true,
        smoothScrollDuration: 15,    // 0.5s at 30fps
        easing: "easeOut",
        newMessageScrollDelay: 3,    // 0.1s delay
        overscanTop: 200,
        overscanBottom: 200,
        maxScrollSpeed: 60,          // 2px per frame at 30fps
    },
    animation: {
        messageAppearDuration: 12,   // 0.4s at 30fps
        messageAppearOffset: 30,     // Slide 30px
        typingPulseDuration: 45,     // 1.5s per cycle
        voiceWaveformSpeed: 2,
    },
    spacing: {
        topPadding: 48,
        bottomPadding: 120,
        bubbleMargin: 36,
    },
};

// =============================================================================
// HEIGHT CALCULATION FUNCTION
// =============================================================================

export interface MessageForHeight {
    type?: MessageType;
    text?: string;
    caption?: string;
    from?: string;
    reactions?: unknown[];
    replyTo?: unknown;
    linkPreview?: unknown;
}

/**
 * Calculate the height of a message based on its type and content.
 * Uses per-message-type configuration for accurate height calculation.
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
        const charsPerLine = typeConfig.height.charsPerLine || 26;
        const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
        height = typeConfig.height.base + (lines * (typeConfig.height.lineHeight || 66));
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

    // Sender name for group chats (non-"me" senders)
    if (msg.from && msg.from !== "me" && msg.from !== "system" && msgType !== "system") {
        height += additions.senderName;
    }

    return height;
}

// =============================================================================
// SMART GAP CALCULATION
// =============================================================================

export interface MessageForGap {
    type?: MessageType;
    from?: string;
}

/**
 * Calculate the gap between two messages using smart contextual logic.
 * Takes into account sender, side, and message types.
 */
export function calculateGapBetween(
    prev: MessageForGap,
    next: MessageForGap,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    const prevType = (prev.type || "text") as MessageType;
    const prevConfig = config.messageTypes[prevType] || config.messageTypes.text;

    const prevIsMe = prev.from === "me";
    const nextIsMe = next.from === "me";

    // Same sender = tightest grouping
    if (prev.from === next.from) {
        return prevConfig.gap.sameSender;
    }

    // Same side but different sender
    if (prevIsMe === nextIsMe) {
        return prevConfig.gap.sameSide;
    }

    // Opposite sides = clear separation
    return prevConfig.gap.oppositeSide;
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
            // Slight overshoot
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
