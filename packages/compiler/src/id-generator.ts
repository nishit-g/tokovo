/**
 * Deterministic ID Generator
 *
 * Generates stable IDs based on (episodeId, deviceId, conversationId, opIndex).
 * Same DSL → Same IDs → Same hash → Reproducible renders.
 *
 * NEVER uses Math.random(), Date.now(), or external state.
 *
 * @module @tokovo/compiler/id-generator
 */

// =============================================================================
// ID GENERATOR
// =============================================================================

/**
 * Deterministic ID generator for an episode.
 *
 * All IDs are derived from structural position, not randomness.
 *
 * @example
 * ```ts
 * const idGen = createIdGenerator("my-episode");
 *
 * const msgId = idGen.messageId("phone", "dm_alex", 0);
 * // "msg_my-episode_phone_dm_alex_000000"
 *
 * const postId = idGen.postId("phone", "__main_feed__", 0);
 * // "post_my-episode_phone___main_feed___000000"
 * ```
 */
export interface IdGenerator {
    /** Generate message ID */
    messageId(deviceId: string, conversationId: string, opIndex: number): string;

    /** Generate post/tweet ID */
    postId(deviceId: string, feedId: string, opIndex: number): string;

    /** Generate story ID */
    storyId(deviceId: string, userId: string, opIndex: number): string;

    /** Generate comment ID */
    commentId(deviceId: string, postId: string, opIndex: number): string;

    /** Generate reaction ID */
    reactionId(deviceId: string, targetId: string, opIndex: number): string;

    /** Generate sound instance ID */
    soundId(deviceId: string, soundKey: string, opIndex: number): string;

    /** Generate notification ID */
    notificationId(deviceId: string, appId: string, opIndex: number): string;

    /** Generate actor ID from name */
    actorId(name: string): string;

    /** Generate generic ID with custom prefix */
    genericId(prefix: string, ...parts: string[]): string;
}

/**
 * Create a deterministic ID generator for an episode.
 */
export function createIdGenerator(episodeId: string): IdGenerator {
    // Normalize episode ID
    const normalizedEpisodeId = episodeId.replace(/[^a-zA-Z0-9_-]/g, "_");

    // Pad operation index to 6 digits
    const padIndex = (n: number): string => String(n).padStart(6, "0");

    // Sanitize ID parts (remove special chars that could cause issues)
    const sanitize = (s: string): string => s.replace(/[^a-zA-Z0-9_-]/g, "_");

    return {
        messageId(deviceId, conversationId, opIndex) {
            return `msg_${normalizedEpisodeId}_${sanitize(deviceId)}_${sanitize(conversationId)}_${padIndex(opIndex)}`;
        },

        postId(deviceId, feedId, opIndex) {
            return `post_${normalizedEpisodeId}_${sanitize(deviceId)}_${sanitize(feedId)}_${padIndex(opIndex)}`;
        },

        storyId(deviceId, userId, opIndex) {
            return `story_${normalizedEpisodeId}_${sanitize(deviceId)}_${sanitize(userId)}_${padIndex(opIndex)}`;
        },

        commentId(deviceId, postId, opIndex) {
            return `comment_${normalizedEpisodeId}_${sanitize(deviceId)}_${sanitize(postId)}_${padIndex(opIndex)}`;
        },

        reactionId(deviceId, targetId, opIndex) {
            return `reaction_${normalizedEpisodeId}_${sanitize(deviceId)}_${sanitize(targetId)}_${padIndex(opIndex)}`;
        },

        soundId(deviceId, soundKey, opIndex) {
            return `sound_${normalizedEpisodeId}_${sanitize(deviceId)}_${sanitize(soundKey)}_${padIndex(opIndex)}`;
        },

        notificationId(deviceId, appId, opIndex) {
            return `notif_${normalizedEpisodeId}_${sanitize(deviceId)}_${sanitize(appId)}_${padIndex(opIndex)}`;
        },

        actorId(name) {
            // Normalize: lowercase, replace spaces with underscores
            const normalized = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
            return `actor_${normalized}`;
        },

        genericId(prefix, ...parts) {
            const sanitizedParts = parts.map(sanitize);
            return `${prefix}_${normalizedEpisodeId}_${sanitizedParts.join("_")}`;
        },
    };
}

// =============================================================================
// SHORT ID GENERATOR (for display)
// =============================================================================

/**
 * Generate a short hash for display purposes.
 * NOT cryptographically secure, just for human-readable IDs.
 */
export function shortHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash + char) | 0;
    }
    // Return 8 hex chars
    return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Create a short display ID.
 */
export function createShortId(prefix: string, ...parts: string[]): string {
    const combined = parts.join("_");
    return `${prefix}_${shortHash(combined)}`;
}
