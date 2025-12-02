import { WorldState } from "@tokovo/core";

export interface LayoutState {
    scrollToBottom: boolean;
    scrollY: number;
    messageAnimations: Record<string, { opacity: number; translateY: number }>;
}

export function computeLayout(world: WorldState, t: number = 0): LayoutState {
    const layout: LayoutState = {
        scrollToBottom: true,
        scrollY: 0,
        messageAnimations: {}
    };

    // Calculate message animations
    let totalHeight = 0;
    const messageHeights: Record<string, number> = {}; // Mock heights for now, ideally measured

    for (const convId in world.conversations) {
        const conversation = world.conversations[convId];
        for (const msg of conversation.messages) {
            const age = t - msg.at;
            // Animation logic: Fade in over 10 frames, slide up from 60px
            const opacity = Math.min(Math.max(age / 10, 0), 1);
            const translateY = Math.max(60 - age * 6, 0);

            layout.messageAnimations[msg.id] = { opacity, translateY };

            // Estimate height (mock) - in real implementation, this needs measureText or fixed heights
            const estimatedHeight = 150 + (msg.text?.length || 0) * 2;
            messageHeights[msg.id] = estimatedHeight;

            if (age >= 0) {
                totalHeight += estimatedHeight + 20; // 20px gap
            }
        }
    }

    // Smooth scroll logic
    // Target scroll is totalHeight - viewportHeight (approx 2000 for iPhone)
    // We want to scroll to the bottom if new messages appear
    const viewportHeight = 2000;
    const targetScroll = Math.max(0, totalHeight - viewportHeight + 300); // +300 padding

    // Simple linear interpolation for smoothness, or just snap for now if t is large
    // For a real spring, we'd need previous state, but here we are pure function of t.
    // So we make scroll dependent on the latest message timestamp.

    // Find latest message time
    let lastMsgTime = 0;
    for (const convId in world.conversations) {
        for (const msg of world.conversations[convId].messages) {
            if (msg.at > lastMsgTime && msg.at <= t) lastMsgTime = msg.at;
        }
    }

    const timeSinceLastMsg = t - lastMsgTime;
    // Scroll animation duration = 20 frames
    const scrollProgress = Math.min(timeSinceLastMsg / 20, 1);

    // This is a simplification. Ideally we interpolate from "previous target" to "current target".
    // Since we don't have previous state, we can assume the "previous target" was valid at lastMsgTime - 1.
    // For MVP Phase 2, we will just output the targetScroll. 
    // The UI component can use CSS transitions for the actual smooth visual if needed, 
    // OR we can implement a deterministic scroll function here if we knew the history.

    layout.scrollY = targetScroll;

    return layout;
}
