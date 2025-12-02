import { WorldState } from "@tokovo/core";

export interface LayoutState {
    scrollToBottom: boolean;
    messageAnimations: Record<string, { opacity: number; translateY: number }>;
}

export function computeLayout(world: WorldState, t: number = 0): LayoutState {
    const layout: LayoutState = {
        scrollToBottom: true,
        messageAnimations: {}
    };

    // Calculate message animations
    for (const convId in world.conversations) {
        const conversation = world.conversations[convId];
        for (const msg of conversation.messages) {
            const age = t - msg.at;
            // Animation logic: Fade in over 10 frames, slide up from 60px
            const opacity = Math.min(Math.max(age / 10, 0), 1);
            const translateY = Math.max(60 - age * 6, 0);

            layout.messageAnimations[msg.id] = { opacity, translateY };
        }
    }

    return layout;
}
