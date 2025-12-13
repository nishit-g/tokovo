/**
 * WhatsApp Layout Configuration
 * 
 * Configurable message heights, scroll behavior, and animations.
 * All values are in device pixels (3x scale for retina).
 */

// =============================================================================
// MESSAGE HEIGHT CONFIGURATION
// =============================================================================

export interface TextHeightConfig {
    /** Base height (padding + timestamp) */
    base: number;
    /** Height per line of text */
    lineHeight: number;
    /** Characters per line before wrap */
    charsPerLine: number;
}

export interface MediaHeightConfig {
    /** Default height without caption */
    default: number;
    /** Height when caption is present */
    withCaption: number;
}

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

export interface HeightConfig {
    text: TextHeightConfig;
    image: MediaHeightConfig;
    video: MediaHeightConfig;
    gif: { default: number };
    voice: { default: number };
    system: { default: number };
    deleted: { default: number };
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
// SPACING CONFIGURATION
// =============================================================================

export interface SpacingConfig {
    /** Gap between messages */
    gap: number;
    /** Padding at top of chat */
    topPadding: number;
    /** Padding at bottom of chat */
    bottomPadding: number;
    /** Horizontal margin for bubbles */
    bubbleMargin: number;
    /** Maximum bubble width as percentage of viewport */
    bubbleMaxWidth: number;
}

// =============================================================================
// COMPLETE LAYOUT CONFIG
// =============================================================================

export interface MessageLayoutConfig {
    heights: HeightConfig;
    additions: HeightAdditions;
    scroll: ScrollConfig;
    animation: AnimationConfig;
    spacing: SpacingConfig;
}

// =============================================================================
// DEFAULT CONFIGURATION (iOS WhatsApp)
// =============================================================================

export const DEFAULT_LAYOUT_CONFIG: MessageLayoutConfig = {
    heights: {
        text: {
            base: 88,           // Padding + timestamp
            lineHeight: 66,     // 22px * 3 for retina
            charsPerLine: 26,   // Characters before wrap
        },
        image: {
            default: 400,
            withCaption: 480,
        },
        video: {
            default: 400,
            withCaption: 480,
        },
        gif: {
            default: 300,
        },
        voice: {
            default: 180,
        },
        system: {
            default: 80,
        },
        deleted: {
            default: 100,
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
        gap: 12,
        topPadding: 48,
        bottomPadding: 120,
        bubbleMargin: 36,
        bubbleMaxWidth: 0.78,
    },
};

// =============================================================================
// HEIGHT CALCULATION FUNCTION
// =============================================================================

export interface MessageForHeight {
    type?: "text" | "image" | "video" | "gif" | "voice" | "system" | "deleted";
    text?: string;
    caption?: string;
    from?: string;
    reactions?: unknown[];
    replyTo?: unknown;
    linkPreview?: unknown;
}

/**
 * Calculate the height of a message based on its type and content.
 * All message types are handled with configurable values.
 */
export function calculateMessageHeight(
    msg: MessageForHeight,
    config: MessageLayoutConfig = DEFAULT_LAYOUT_CONFIG
): number {
    const { heights, additions } = config;

    let height = 0;
    const msgType = msg.type || "text";

    // Base height by type
    switch (msgType) {
        case "text":
            const text = msg.text || "";
            const lines = Math.max(1, Math.ceil(text.length / heights.text.charsPerLine));
            height = heights.text.base + (lines * heights.text.lineHeight);
            break;

        case "image":
            height = msg.caption ? heights.image.withCaption : heights.image.default;
            break;

        case "video":
            height = msg.caption ? heights.video.withCaption : heights.video.default;
            break;

        case "gif":
            height = heights.gif.default;
            break;

        case "voice":
            height = heights.voice.default;
            break;

        case "system":
            height = heights.system.default;
            break;

        case "deleted":
            height = heights.deleted.default;
            break;

        default:
            // Unknown type - use text formula
            const unknownText = msg.text || "";
            const unknownLines = Math.max(1, Math.ceil(unknownText.length / heights.text.charsPerLine));
            height = heights.text.base + (unknownLines * heights.text.lineHeight);
    }

    // Add-ons for future features
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
