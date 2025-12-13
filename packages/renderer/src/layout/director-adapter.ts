/**
 * Director Layout Adapter
 *
 * Creates DirectorLayoutModel from computed chat layout.
 * This is the ONLY place layout rects are extracted for the director.
 */

import { DirectorLayoutModel, LayoutRect } from "@tokovo/core";
import { ChatLayoutState } from "./types";

/**
 * Create DirectorLayoutModel from computed chat layout.
 * Both UI and Director use the same source (chat strategy computed rects).
 */
export function createDirectorLayoutModel(
    chatLayout: ChatLayoutState,
    deviceId: string,
    appId: string,
    conversationId: string,
    viewportHeight: number
): DirectorLayoutModel {
    const messageRects: Record<string, LayoutRect> = {};

    for (const [id, layout] of Object.entries(chatLayout.messageLayouts)) {
        if (layout.rect) {
            messageRects[id] = layout.rect;
        }
    }

    // Input area rect (always at bottom of viewport)
    const inputAreaRect: LayoutRect = {
        x: 0,
        y: viewportHeight - 120, // Approximate input area position
        width: 1080, // Will be refined by caller
        height: 120,
    };

    // Last message rect
    const lastMessageId = chatLayout.meta?.lastMessageId;
    const lastMessageRect = lastMessageId
        ? messageRects[lastMessageId]
        : undefined;

    return {
        deviceId,
        appId,
        conversationId,
        messageRects,
        inputAreaRect,
        typingIndicatorRect: chatLayout.typingLayout?.rect,
        lastMessageRect,
    };
}
