/**
 * Instagram Initial State Factory
 * 
 * Creates the initial state for the Instagram plugin.
 */

import type { InstagramState, InstagramWorldState, InstagramPost, InstagramThread, InstagramStory } from "../types";

// =============================================================================
// INITIAL STATE FACTORY
// =============================================================================

/**
 * Create Instagram app state.
 * Called by PluginManager when registering the plugin.
 */
export function createInstagramInitialState(): InstagramState {
    return {
        screen: "home",
        activeThreadId: undefined,
    };
}

/**
 * Create initial Instagram world state for DSL.
 * Allows episode to configure initial feed, stories, and threads.
 */
export function createInstagramWorldState(config?: {
    feed?: InstagramPost[];
    stories?: InstagramStory[];
    threads?: InstagramThread[];
}): InstagramWorldState {
    return {
        feed: config?.feed ?? [],
        stories: config?.stories ?? [],
        threads: config?.threads ?? [],
    };
}

/**
 * Create a post helper.
 */
export function createPost(
    id: string,
    author: { username: string; avatar: string; verified?: boolean },
    image: string,
    caption: string,
    options?: { likes?: number; timestamp?: string }
): InstagramPost {
    return {
        id,
        author,
        image,
        caption,
        likes: options?.likes ?? 0,
        comments: [],
        timestamp: options?.timestamp ?? "1h",
        liked: false,
        saved: false,
    };
}

/**
 * Create a thread helper.
 */
export function createThread(
    id: string,
    participant: { username: string; avatar: string },
    options?: { unread?: boolean }
): InstagramThread {
    return {
        id,
        participant,
        messages: [],
        unread: options?.unread ?? false,
    };
}

/**
 * Create a story helper.
 */
export function createStory(
    id: string,
    author: { username: string; avatar: string },
    options?: { hasUnseenStory?: boolean }
): InstagramStory {
    return {
        id,
        author,
        viewed: false,
        hasUnseenStory: options?.hasUnseenStory ?? true,
    };
}
