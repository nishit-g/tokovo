/**
 * Navigation Event Factories
 * 
 * Low-level event creators for app navigation.
 */

import { TimelineEvent } from "@tokovo/core";

export const navigation = {
    /**
     * Navigate to a different app
     */
    navigateApp: (
        at: number,
        targetAppId: string,
        options?: {
            screen?: string;
            conversationId?: string;
            transition?: "push" | "pop" | "present";
            duration?: number
        }
    ): TimelineEvent => ({
        at,
        kind: "APP",
        appId: targetAppId, // Targeted at the destination app
        type: "NAVIGATE_APP",
        screen: options?.screen,
        conversationId: options?.conversationId,
        transition: options?.transition,
        animationDuration: options?.duration
    } as any), // Cast to any because NAVIGATE_APP might not be in core types yet, but runtime handles it

    /**
     * Navigate within current app
     */
    navigateScreen: (
        at: number,
        appId: string,
        screen: string,
        options?: {
            transition?: "push" | "pop" | "present" | "dismiss";
            duration?: number
        }
    ): TimelineEvent => ({
        at,
        kind: "APP",
        appId,
        type: "NAVIGATE_SCREEN",
        screen,
        transition: options?.transition,
        animationDuration: options?.duration
    } as any)
};
