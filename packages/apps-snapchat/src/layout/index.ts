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
    };

    return {
        kind: "FEED",
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
        snapchat_thread: {
            id: "snapchat_thread",
            rect: rect(0, threadY, w, threadH),
            tags: ["thread"],
        },
        snapchat_composer: {
            id: "snapchat_composer",
            rect: rect(0, composerY, w, composerH),
            tags: ["composer", "sticky"],
            metadata: { sticky: true },
        },
    };

    return {
        kind: "CHAT",
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
    };

    return {
        kind: "FULLSCREEN",
        meta: {},
        semantic: buildSemantic(regions),
    };
}

export const snapchatLayoutStrategies: PluginLayoutStrategy[] = [
    { viewKind: "FEED", computeLayout: computeSnapchatFeedLayout },
    { viewKind: "CHAT", computeLayout: computeSnapchatChatLayout },
    { viewKind: "FULLSCREEN", computeLayout: computeSnapchatFullscreenLayout },
];
