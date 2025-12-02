export type InstagramView = 'dm' | 'feed' | 'stories' | 'profile' | 'post' | 'explore' | 'notifications' | 'reels';

export interface Post {
    id: string;
    username: string;
    avatar: string;
    image: string;
    caption: string;
    likes: number;
    comments: number;
    liked: boolean;
    saved: boolean;
}

export interface Story {
    id: string;
    image: string;
    seen: boolean;
}

export interface StoryUser {
    username: string;
    avatar: string;
    stories: Story[];
    hasUnseen: boolean;
}

export interface Notification {
    id: string;
    type: 'like' | 'follow' | 'comment' | 'mention';
    username: string;
    avatar: string;
    text?: string;
    time: string;
}

export interface InstagramState {
    currentView: InstagramView;
    feed: {
        posts: Post[];
        scrollPosition: number;
    };
    stories: {
        users: StoryUser[];
        activeStoryId?: string;
    };
    notifications: {
        items: Notification[];
    };
    // Add other module states here
}

export const initialInstagramState: InstagramState = {
    currentView: 'dm', // Default to DM for now as it's the most developed
    feed: {
        posts: [],
        scrollPosition: 0
    },
    stories: {
        users: [],
    },
    notifications: {
        items: []
    }
};
