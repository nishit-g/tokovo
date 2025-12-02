import { ConversationState } from "@tokovo/core";

export interface DMState {
    // Re-using generic ConversationState for now, but wrapped
    conversations: Record<string, ConversationState>;
    activeConversationId?: string;
}

export interface FeedState {
    posts: any[];
    scrollPosition: number;
}

export interface StoryState {
    activeStoryId?: string;
    viewedStories: string[];
}

export interface ProfileState {
    currentProfile?: string; // username
}

export interface InstagramState {
    dm: DMState;
    feed: FeedState;
    stories: StoryState;
    profile: ProfileState;
    // Add others as needed
    activeModule: "dm" | "feed" | "stories" | "profile" | "posts" | "explore" | "reels" | "notifications";
}
