/**
 * Twitter/X Layout Configuration
 * 
 * Height calculations and layout constants for tweets and media.
 */

import { twitterTypography, twitterSpacing, twitterLayout } from "./twitter-theme";

// =============================================================================
// MESSAGE HEIGHT CALCULATIONS
// =============================================================================

export interface TweetForHeight {
    text?: string;
    hasMedia?: boolean;
    mediaCount?: number;
    hasQuote?: boolean;
    hasPoll?: boolean;
    isThread?: boolean;
}

/**
 * Calculate tweet height based on content.
 */
export function calculateTweetHeight(tweet: TweetForHeight): number {
    const { spacing, typography } = { spacing: twitterSpacing, typography: twitterTypography };

    let height = 0;

    // Base padding (top + bottom)
    height += spacing.tweetPaddingVertical * 2;

    // Header (name, handle, timestamp) - single line
    height += typography.sizes.displayName + 12;

    // Tweet text
    if (tweet.text) {
        const charsPerLine = 45;  // Approximate
        const lines = Math.ceil(tweet.text.length / charsPerLine);
        height += lines * typography.lineHeights.tweetText;
    }

    // Media
    if (tweet.hasMedia) {
        const mediaHeight = tweet.mediaCount === 1 ? 600 : 450;
        height += mediaHeight + 24;  // + gap
    }

    // Quote tweet
    if (tweet.hasQuote) {
        height += 300;  // Fixed quote height
    }

    // Poll
    if (tweet.hasPoll) {
        height += 420;  // 4 options
    }

    // Engagement bar
    height += 60;  // Icons row

    return height;
}

// =============================================================================
// SCROLL CONFIGURATION
// =============================================================================

export interface ScrollConfig {
    lockToBottom: boolean;
    smoothScrollDuration: number;
    easing: "linear" | "easeOut" | "easeInOut";
}

export const defaultScrollConfig: ScrollConfig = {
    lockToBottom: false,  // Twitter scrolls from top
    smoothScrollDuration: 15,
    easing: "easeOut",
};

// =============================================================================
// ANIMATION CONFIGURATION
// =============================================================================

export interface AnimationConfig {
    tweetAppearDuration: number;
    tweetAppearOffset: number;
    likeAnimationDuration: number;
    retweetAnimationDuration: number;
}

export const defaultAnimationConfig: AnimationConfig = {
    tweetAppearDuration: 8,         // Frames for tweet to fade in
    tweetAppearOffset: 30,          // Pixels to slide up
    likeAnimationDuration: 12,      // Heart pop animation
    retweetAnimationDuration: 10,   // Retweet spin
};

// =============================================================================
// MEDIA GRID LAYOUTS
// =============================================================================

export interface MediaGridLayout {
    rows: number;
    cols: number;
    spans: { row: number; col: number; rowSpan: number; colSpan: number }[];
}

export const mediaGridLayouts: Record<1 | 2 | 3 | 4, MediaGridLayout> = {
    1: {
        rows: 1,
        cols: 1,
        spans: [{ row: 0, col: 0, rowSpan: 1, colSpan: 1 }],
    },
    2: {
        rows: 1,
        cols: 2,
        spans: [
            { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
            { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
        ],
    },
    3: {
        rows: 2,
        cols: 2,
        spans: [
            { row: 0, col: 0, rowSpan: 2, colSpan: 1 },  // Large left
            { row: 0, col: 1, rowSpan: 1, colSpan: 1 },  // Top right
            { row: 1, col: 1, rowSpan: 1, colSpan: 1 },  // Bottom right
        ],
    },
    4: {
        rows: 2,
        cols: 2,
        spans: [
            { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
            { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
            { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
            { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
        ],
    },
};

export default {
    calculateTweetHeight,
    defaultScrollConfig,
    defaultAnimationConfig,
    mediaGridLayouts,
};
