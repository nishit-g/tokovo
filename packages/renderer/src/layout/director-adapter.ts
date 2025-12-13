/**
 * Director Layout Adapter
 *
 * Creates DirectorLayoutModel from computed chat layout.
 * This is the ONLY place layout rects are extracted for the director.
 * 
 * IMPORTANT: All rects must be in CONTENT-SPACE (not screen-space).
 * Content-space means y=0 is top of scrollable content, not top of viewport.
 */

import { DirectorLayoutModel, LayoutRect, LAYOUT } from "@tokovo/core";
import { ChatLayoutState } from "./types";

/**
 * Create DirectorLayoutModel from computed chat layout.
 * Both UI and Director use the same source (chat strategy computed rects).
 * 
 * @param chatLayout - Computed chat layout with scrollY and messageLayouts
 * @param deviceId - Device ID for scoping
 * @param appId - App ID for scoping
 * @param conversationId - Conversation ID for scoping
 * @param viewportWidth - Device viewport width (no hardcodes)
 * @param viewportHeight - Effective viewport height (content area)
 */
export function createDirectorLayoutModel(
    chatLayout: ChatLayoutState,
    deviceId: string,
    appId: string,
    conversationId: string,
    viewportWidth: number,
    viewportHeight: number
): DirectorLayoutModel {
    const messageRects: Record<string, LayoutRect> = {};

    for (const [id, layout] of Object.entries(chatLayout.messageLayouts)) {
        if (layout.rect) {
            messageRects[id] = layout.rect;
        }
    }

    // Input area rect in CONTENT-SPACE
    // The input bar is always visible at the bottom of the viewport.
    // In content-space, this means: scrollY + (viewportHeight - inputHeight)
    const inputHeight = LAYOUT.CHAT_INPUT_HEIGHT;
    const inputAreaRect: LayoutRect = {
        x: 0,
        y: chatLayout.scrollY + viewportHeight,  // Bottom of visible content area
        width: viewportWidth,
        height: inputHeight,
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

