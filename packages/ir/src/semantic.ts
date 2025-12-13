/**
 * Semantic Metadata
 * 
 * Story intelligence layer - captures INTENT beyond raw events.
 * This enables:
 * - Camera intelligence (react to emotional weight)
 * - AI story generation with control
 * - Analytics and debugging
 */

// =============================================================================
// EPISODE CONFIGURATION
// =============================================================================

/**
 * Episode-level configuration and intent.
 * This is the "episode brain" that AI and DirectorLite can reason about.
 */
export interface EpisodeConfig {
    /** Frames per second */
    fps?: number;

    /** Episode title */
    title?: string;

    /** Aspect ratio for rendering */
    aspectRatio?: "9:16" | "1:1" | "16:9";

    /** Overall pacing style */
    pacing?: "slow-burn" | "normal" | "chaotic" | "explosive";

    /** Director control mode */
    director?: "auto" | "manual" | "hybrid";

    /** Visual theme */
    theme?: "dark" | "light" | "system";

    /** Content tags for categorization */
    tags?: string[];

    /** Target duration hint (for AI generation) */
    targetDuration?: string; // e.g., "30s", "2m"
}

// =============================================================================
// SEMANTIC ANNOTATIONS
// =============================================================================

/**
 * Mood categories for semantic classification.
 */
export type Mood =
    | "calm"
    | "tense"
    | "angry"
    | "sad"
    | "anxious"
    | "excited"
    | "confused"
    | "neutral";

/**
 * Semantic metadata for operations.
 * Attached to messages, actions, and beats.
 */
export interface SemanticMeta {
    /** Emotional mood of the action */
    mood?: Mood;

    /** Emotional intensity (0-1, where 1 = maximum) */
    intensity?: number;

    /** How secret/private is this? (affects viewer anticipation) */
    secrecy?: "low" | "medium" | "high";

    /** How urgent? (affects pacing expectations) */
    urgency?: number; // 0-1

    /** How intimate/close is the relationship? */
    intimacy?: number; // 0-1

    /** Subtext hint for AI understanding */
    subtext?: string;

    /** Custom tags for domain-specific semantics */
    tags?: string[];
}

// =============================================================================
// BEAT METADATA
// =============================================================================

/**
 * Beat-level metadata for story rhythm.
 */
export interface BeatMeta {
    /** Pacing tempo for this beat */
    tempo?: "slow" | "medium" | "fast";

    /** Is this an emotional peak? */
    emotionalPeak?: boolean;

    /** Is this a tension release? */
    release?: boolean;

    /** Dramatic function */
    function?: "setup" | "buildup" | "climax" | "release" | "resolution";

    /** Semantic mood for the entire beat */
    mood?: Mood;
}

// =============================================================================
// POV CONFIGURATION
// =============================================================================

/**
 * POV layout modes for multi-device views.
 */
export type POVLayout =
    | "horizontal"  // Side by side
    | "vertical"    // Stacked
    | "pip"         // Picture in picture
    | "split-diagonal";

/**
 * POV switch intent.
 */
export interface POVConfig {
    /** Primary device perspective */
    primary: string;

    /** Secondary devices (for split view) */
    secondary?: string[];

    /** Layout mode */
    layout?: POVLayout;

    /** Transition style */
    transition?: "cut" | "crossfade" | "wipe";
}

// =============================================================================
// ACTOR METADATA
// =============================================================================

/**
 * Actor (participant) metadata for conversations.
 */
export interface ActorMeta {
    /** Display name */
    name: string;

    /** Avatar URL or identifier */
    avatar?: string;

    /** Actor's role in the story */
    role?: "protagonist" | "antagonist" | "love_interest" | "friend" | "stranger";

    /** Actor's emotional state (can change per beat) */
    mood?: Mood;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate intensity is in range.
 */
export function validateIntensity(value: number | undefined): boolean {
    if (value === undefined) return true;
    return value >= 0 && value <= 1;
}

/**
 * Validate semantic meta.
 */
export function validateSemanticMeta(meta: SemanticMeta | undefined): string[] {
    const errors: string[] = [];
    if (!meta) return errors;

    if (meta.intensity !== undefined && !validateIntensity(meta.intensity)) {
        errors.push("intensity must be between 0 and 1");
    }
    if (meta.urgency !== undefined && !validateIntensity(meta.urgency)) {
        errors.push("urgency must be between 0 and 1");
    }
    if (meta.intimacy !== undefined && !validateIntensity(meta.intimacy)) {
        errors.push("intimacy must be between 0 and 1");
    }

    return errors;
}
