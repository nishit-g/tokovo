import type {
    ChatLayoutState,
    FeedLayoutState,
    FullscreenLayoutState,
    LayoutContext,
    LayoutRect,
    PluginLayoutStrategy,
    SemanticRegion,
} from "@tokovo/core";

import { snapchatSpacing } from "../config/tokens.js";

const DESIGN_WIDTH = 393;

function rect(x: number, y: number, width: number, height: number): LayoutRect {
    return { x, y, width, height };
}

function buildSemantic(
    regions: Record<string, SemanticRegion>,
    groups: Record<string, string[]> = {},
) {
    return { regions, groups };
}

function computeSnapchatFeedLayout(ctx: LayoutContext): FeedLayoutState {
    const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
    const safeTop = safeAreaInsets?.top ?? 0;
    const safeBottom = safeAreaInsets?.bottom ?? 0;
    const scale = w / DESIGN_WIDTH;
    const px = (v: number) => v * scale;

    const headerH = safeTop + px(snapchatSpacing.headerHeight);
    const listY = headerH;
    const listH = Math.max(0, h - safeBottom - listY);

    const regions: Record<string, SemanticRegion> = {
        device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
        app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
        snapchat_header: {
            id: "snapchat_header",
            rect: rect(0, 0, w, headerH),
            tags: ["header", "sticky"],
            metadata: { sticky: true },
        },
        snapchat_chat_list: {
            id: "snapchat_chat_list",
            rect: rect(0, listY, w, listH),
            tags: ["list"],
        },
        snapchat_chat_row_0: {
            id: "snapchat_chat_row_0",
            rect: rect(px(16), listY + px(8), Math.max(0, w - px(32)), px(72)),
            tags: ["list", "row"],
        },
        snapchat_chat_row_0_avatar: {
            id: "snapchat_chat_row_0_avatar",
            rect: rect(px(16), listY + px(14), px(54), px(54)),
            tags: ["list", "avatar"],
        },
        snapchat_chat_row_0_content: {
            id: "snapchat_chat_row_0_content",
            rect: rect(px(82), listY + px(18), Math.max(0, w - px(98)), px(42)),
            tags: ["list", "content"],
        },
    };

    return {
        kind: "FEED",
        cacheHint: "static",
        scrollY: 0,
        contentHeight: h,
        isAtBottom: false,
        itemLayouts: {},
        meta: {},
        semantic: buildSemantic(regions),
    };
}

function computeSnapchatChatLayout(ctx: LayoutContext): ChatLayoutState {
    const { viewportWidth: w, viewportHeight: h, safeAreaInsets } = ctx;
    const safeTop = safeAreaInsets?.top ?? 0;
    const safeBottom = safeAreaInsets?.bottom ?? 0;
    const scale = w / DESIGN_WIDTH;
    const px = (v: number) => v * scale;

    const headerH = safeTop + px(snapchatSpacing.headerHeight);
    const composerH = px(snapchatSpacing.inputHeight) + safeBottom;
    const composerY = Math.max(0, h - composerH);
    const threadY = headerH;
    const threadH = Math.max(0, composerY - threadY);

    const regions: Record<string, SemanticRegion> = {
        device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
        app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
        snapchat_header: {
            id: "snapchat_header",
            rect: rect(0, 0, w, headerH),
            tags: ["header", "sticky"],
            metadata: { sticky: true },
        },
        snapchat_thread: {
            id: "snapchat_thread",
            rect: rect(0, threadY, w, threadH),
            tags: ["thread"],
        },
        snapchat_last_message: {
            id: "snapchat_last_message",
            rect: rect(px(22), threadY + Math.max(0, threadH - px(120)), Math.max(0, w - px(44)), px(72)),
            tags: ["thread", "message", "latest"],
        },
        snapchat_composer: {
            id: "snapchat_composer",
            rect: rect(0, composerY, w, composerH),
            tags: ["composer", "sticky"],
            metadata: { sticky: true },
        },
        snapchat_input: {
            id: "snapchat_input",
            rect: rect(px(56), composerY + px(10), Math.max(0, w - px(122)), px(36)),
            tags: ["composer", "input"],
        },
    };

    return {
        kind: "CHAT",
        cacheHint: "static",
        scrollY: 0,
        contentHeight: h,
        isAtBottom: true,
        messageLayouts: {},
        meta: {},
        semantic: buildSemantic(regions),
    };
}

function computeSnapchatFullscreenLayout(ctx: LayoutContext): FullscreenLayoutState {
    const { viewportWidth: w, viewportHeight: h } = ctx;

    const regions: Record<string, SemanticRegion> = {
        device: { id: "device", rect: rect(0, 0, w, h), tags: ["device"] },
        app: { id: "app", rect: rect(0, 0, w, h), tags: ["app"] },
        snapchat_snap_viewer: {
            id: "snapchat_snap_viewer",
            rect: rect(0, 0, w, h),
            tags: ["snap_viewer", "fullscreen"],
        },
        snapchat_snap_content: {
            id: "snapchat_snap_content",
            rect: rect(0, 0, w, h),
            tags: ["snap_viewer", "content"],
        },
    };

    return {
        kind: "FULLSCREEN",
        cacheHint: "static",
        meta: {},
        semantic: buildSemantic(regions),
    };
}

export const snapchatLayoutStrategies: PluginLayoutStrategy[] = [
    { viewKind: "FEED", computeLayout: computeSnapchatFeedLayout },
    { viewKind: "CHAT", computeLayout: computeSnapchatChatLayout },
    { viewKind: "FULLSCREEN", computeLayout: computeSnapchatFullscreenLayout },
];
