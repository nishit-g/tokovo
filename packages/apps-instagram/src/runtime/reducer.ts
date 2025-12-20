/**
 * Instagram Runtime Reducer
 * 
 * Handles all Instagram-specific events.
 * Events arrive with data in `payload` field.
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

function getAppState(draft: WorldState): InstagramState {
    if (!draft.appState) {
        draft.appState = {};
    }
    if (!draft.appState["app_instagram"]) {
        draft.appState["app_instagram"] = {
            screen: "home",
            activeThreadId: undefined,
            statusBarTheme: "dark", // Instagram uses dark theme
        };
    }
    return draft.appState["app_instagram"] as InstagramState;
}

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

export function instagramReducer(draft: WorldState, event: TimelineEvent): void {
    const eventAny = event as any;

    // Only handle APP events for Instagram
    if (eventAny.kind === "APP" && eventAny.appId !== "app_instagram") {
        return;
    }

    const payload = eventAny.payload || {};
    const eventType = eventAny.type;
    const appState = getAppState(draft);
    const data = getInstagramData(draft);

    switch (eventType) {
        // =====================================================================
        // NAVIGATION
        // =====================================================================
        case "NAVIGATE": {
            appState.screen = payload.screen;
            appState.statusBarTheme = "dark"; // Instagram dark theme
            if (payload.threadId) {
                appState.activeThreadId = payload.threadId;
            }
            break;
        }

        case "OPEN_DM": {
            appState.screen = "dm_thread";
            appState.activeThreadId = payload.threadId;
            appState.statusBarTheme = "dark"; // Instagram dark theme
            const thread = data.threads.find((t: InstagramThread) => t.id === payload.threadId);
            if (thread) {
                thread.unread = false;
            }
            break;
        }

        // =====================================================================
        // FEED
        // =====================================================================
        case "NEW_POST": {
            const post: InstagramPost = {
                id: payload.id || `post_${event.at}`,
                author: payload.author,
                image: payload.image,
                caption: payload.caption || "",
                likes: payload.likes || 0,
                comments: [],
                timestamp: generateTimestamp(event.at, draft),
                liked: false,
                saved: false,
            };
            data.feed.unshift(post);
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
                    id: `comment_${event.at}`,
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
                id: `dm_${event.at}_recv`,
                sender: payload.from.username,
                type: payload.contentType || "text",
                content: payload.content,
                timestamp: generateTimestamp(event.at, draft),
                read: false,
            };
            thread.messages.push(dm);
            thread.unread = true;
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
                id: `dm_${event.at}_sent`,
                sender: "me",
                type: payload.contentType || "text",
                content: payload.content,
                timestamp: generateTimestamp(event.at, draft),
                read: true,
            };
            thread.messages.push(dm);
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
}

export { instagramReducer as default };
