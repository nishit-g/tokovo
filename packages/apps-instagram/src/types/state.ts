/**
 * Instagram State Types
 * 
 * Core state shape for the Instagram plugin.
 */

// =============================================================================
// SCREEN & NAVIGATION
// =============================================================================

export type InstagramScreen = "home" | "search" | "reels" | "shop" | "profile" | "dms" | "dm_thread";

export interface InstagramState {
    screen: InstagramScreen;
    activeThreadId?: string;
}

// =============================================================================
// USER / AUTHOR
// =============================================================================

export interface InstagramUser {
    username: string;
    displayName?: string;
    avatar: string;
    verified?: boolean;
}

// =============================================================================
// POST
// =============================================================================

export interface InstagramPost {
    id: string;
    author: InstagramUser;
    image: string;
    caption: string;
    likes: number;
    comments: InstagramComment[];
    timestamp: string;
    liked?: boolean;
    saved?: boolean;
}

export interface InstagramComment {
    id: string;
    author: InstagramUser;
    text: string;
    likes: number;
    timestamp: string;
}

// =============================================================================
// STORIES
// =============================================================================

export interface InstagramStory {
    id: string;
    author: InstagramUser;
    viewed: boolean;
    hasUnseenStory: boolean;
}

// =============================================================================
// DIRECT MESSAGES
// =============================================================================

export interface InstagramThread {
    id: string;
    participant: InstagramUser;
    messages: InstagramDM[];
    unread: boolean;
    typing?: boolean;
}

export interface InstagramDM {
    id: string;
    sender: "me" | string;
    type: "text" | "image" | "reel" | "post" | "voice";
    content: string;
    timestamp: string;
    read?: boolean;
}

// =============================================================================
// WORLD STATE EXTENSION
// =============================================================================

export interface InstagramWorldState {
    feed: InstagramPost[];
    stories: InstagramStory[];
    threads: InstagramThread[];
}
