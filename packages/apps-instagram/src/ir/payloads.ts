/**
 * Instagram Event Payloads (IR)
 */

export interface InstagramPayloads {
    // Navigation
    NAVIGATE: { screen: string; threadId?: string };
    OPEN_DM: { threadId: string };

    // Feed
    NEW_POST: {
        id?: string;
        author: { username: string; avatar: string; verified?: boolean };
        image: string;
        caption?: string;
        likes?: number;
    };
    LIKE_POST: { postId: string };
    COMMENT: { postId: string; text: string; author?: { username: string; avatar: string } };
    SAVE_POST: { postId: string };

    // DMs
    RECEIVE_DM: {
        threadId: string;
        from: { username: string; avatar: string };
        content: string;
        contentType?: "text" | "image" | "reel" | "post";
    };
    SEND_DM: {
        threadId: string;
        to: { username: string; avatar: string };
        content: string;
        contentType?: "text" | "image" | "reel" | "post";
    };
    DM_TYPING: { threadId: string; isTyping?: boolean };
    DM_TYPING_END: { threadId: string };
}
