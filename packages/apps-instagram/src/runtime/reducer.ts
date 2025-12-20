/**
 * Instagram Runtime Reducer
 * 
 * Handles all Instagram-specific events.
 * 
 * IMPORTANT: Events arrive with data in `payload` field, not at root level.
 * e.g., event.payload.screen, not event.screen
 */

import type { WorldState, TimelineEvent, FeatureReducer } from "@tokovo/core";
import type {
    InstagramState,
    InstagramDM,
    InstagramPost,
    InstagramComment,
    InstagramThread,
    InstagramWorldState
} from "../types";

// =============================================================================
// TYPE-SAFE ACCESSORS
// =============================================================================

/**
 * Get Instagram app state with type safety.
 */
function getAppState(draft: WorldState): InstagramState {
    if (!draft.appState) {
        draft.appState = {};
    }
    if (!draft.appState["app_instagram"]) {
        draft.appState["app_instagram"] = {
            screen: "home",
            activeThreadId: undefined,
        };
    }
    return draft.appState["app_instagram"] as InstagramState;
}

/**
 * Get Instagram world data (feed, threads, stories).
 */
function getInstagramData(draft: WorldState): InstagramWorldState {
    const extendedDraft = draft as WorldState & { instagram?: InstagramWorldState };
    if (!extendedDraft.instagram) {
        extendedDraft.instagram = {
            feed: [],
            stories: [],
            threads: [],
        };
    }
    return extendedDraft.instagram;
}

/**
 * Generate timestamp string from frame.
 */
function generateTimestamp(frame: number, draft: WorldState): string {
    const fps = (draft as any).config?.fps ?? 30;
    const baseTime = new Date("2024-12-18T14:30:00");
    const elapsedMs = (frame / fps) * 1000;
    const currentTime = new Date(baseTime.getTime() + elapsedMs);
    return currentTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).toLowerCase();
}

// =============================================================================
// REDUCER
// =============================================================================

export const instagramReducer: FeatureReducer = (
    draft: WorldState,
    event: TimelineEvent
) => {
    const eventAny = event as any;
    const eventType = eventAny.type;

    // Only handle Instagram events
    if (eventAny.kind !== "APP" || eventAny.appId !== "app_instagram") {
        return;
    }

    // Extract payload - events have data in payload field
    const payload = eventAny.payload || {};

    console.log(`[InstagramReducer] Processing ${eventType}:`, payload);

    const appState = getAppState(draft);
    const data = getInstagramData(draft);

    switch (eventType) {
        // =====================================================================
        // NAVIGATION
        // =====================================================================
        case "NAVIGATE": {
            appState.screen = payload.screen;
            if (payload.threadId) {
                appState.activeThreadId = payload.threadId;
            }
            console.log(`[InstagramReducer] Navigated to: ${appState.screen}`);
            break;
        }

        case "OPEN_DM": {
            appState.screen = "dm_thread";
            appState.activeThreadId = payload.threadId;
            // Mark as read
            const thread = data.threads.find((t: InstagramThread) => t.id === payload.threadId);
            if (thread) {
                thread.unread = false;
            }
            console.log(`[InstagramReducer] Opened DM thread: ${payload.threadId}`);
            break;
        }

        // =====================================================================
        // FEED
        // =====================================================================
        case "NEW_POST": {
            const post: InstagramPost = {
                id: payload.id || `post_${Date.now()}`,
                author: payload.author,
                image: payload.image,
                caption: payload.caption || "",
                likes: payload.likes || 0,
                comments: [],
                timestamp: generateTimestamp(event.at, draft),
                liked: false,
                saved: false,
            };
            data.feed.unshift(post); // Add to top
            break;
        }

        case "LIKE_POST": {
            const post = data.feed.find((p: InstagramPost) => p.id === payload.postId);
            if (post) {
                post.liked = !post.liked;
                post.likes += post.liked ? 1 : -1;
            }
            break;
        }

        case "COMMENT": {
            const post = data.feed.find((p: InstagramPost) => p.id === payload.postId);
            if (post) {
                const comment: InstagramComment = {
                    id: `comment_${Date.now()}`,
                    author: payload.author || { username: "me", avatar: "" },
                    text: payload.text,
                    likes: 0,
                    timestamp: generateTimestamp(event.at, draft),
                };
                post.comments.push(comment);
            }
            break;
        }

        case "SAVE_POST": {
            const post = data.feed.find((p: InstagramPost) => p.id === payload.postId);
            if (post) {
                post.saved = !post.saved;
            }
            break;
        }

        // =====================================================================
        // DIRECT MESSAGES
        // =====================================================================
        case "RECEIVE_DM": {
            let thread = data.threads.find((t: InstagramThread) => t.id === payload.threadId);

            // Create thread if doesn't exist
            if (!thread) {
                thread = {
                    id: payload.threadId,
                    participant: payload.from,
                    messages: [],
                    unread: true,
                };
                data.threads.push(thread);
            }

            const dm: InstagramDM = {
                id: `dm_${Date.now()}`,
                sender: payload.from.username,
                type: payload.contentType || "text",
                content: payload.content,
                timestamp: generateTimestamp(event.at, draft),
                read: false,
            };
            thread.messages.push(dm);
            thread.unread = true;
            console.log(`[InstagramReducer] Received DM in thread ${payload.threadId}:`, payload.content);
            break;
        }

        case "SEND_DM": {
            let thread = data.threads.find((t: InstagramThread) => t.id === payload.threadId);

            if (!thread) {
                thread = {
                    id: payload.threadId,
                    participant: payload.to,
                    messages: [],
                    unread: false,
                };
                data.threads.push(thread);
            }

            const dm: InstagramDM = {
                id: `dm_${Date.now()}`,
                sender: "me",
                type: payload.contentType || "text",
                content: payload.content,
                timestamp: generateTimestamp(event.at, draft),
                read: true,
            };
            thread.messages.push(dm);
            console.log(`[InstagramReducer] Sent DM in thread ${payload.threadId}:`, payload.content);
            break;
        }

        case "DM_TYPING": {
            const thread = data.threads.find((t: InstagramThread) => t.id === payload.threadId);
            if (thread) {
                thread.typing = payload.isTyping ?? true;
            }
            break;
        }

        case "DM_TYPING_END": {
            const thread = data.threads.find((t: InstagramThread) => t.id === payload.threadId);
            if (thread) {
                thread.typing = false;
            }
            break;
        }
    }
};
