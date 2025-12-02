import { LayoutContext, LayoutState } from "./types";
import { defaultLayoutConfig } from "./config";
import { computeChatLayout } from "./strategies/chat";
import { computeFeedLayout } from "./strategies/feed";
import { computeStoryLayout } from "./strategies/story";
import { computeLockscreenLayout } from "./strategies/lockscreen";
import { computeTransitionLayout } from "./strategies/transition";

export * from "./types";
export * from "./config";

export function computeLayout(ctx: LayoutContext): LayoutState {
    // Merge provided config with defaults
    const config = { ...defaultLayoutConfig, ...ctx.config };
    const fullCtx = { ...ctx, config };

    switch (ctx.viewKind) {
        case "CHAT":
            return computeChatLayout(fullCtx);
        case "FEED":
            return computeFeedLayout(fullCtx);
        case "STORY":
            return computeStoryLayout(fullCtx);
        case "LOCKSCREEN":
            return computeLockscreenLayout(fullCtx);
        case "TRANSITION":
            return computeTransitionLayout(fullCtx);
        default:
            // Fallback to empty transition state
            return {
                kind: "TRANSITION",
                deviceTranslateX: 0,
                deviceTranslateY: 0,
                deviceScale: 1,
                deviceRotation: 0,
                overlayOpacity: 0,
                meta: {}
            };
    }
}
