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
    /**
     * Navigate within current app
     * 
     * @example
     * // Autocompletes 'screen' based on 'appId'!
     * dsl.navigation.navigateScreen(0, "app_whatsapp", "chat")
     */
    navigateScreen: <ID extends keyof import("@tokovo/core").AppScreens>(
        at: number,
        appId: ID,
        screen: import("@tokovo/core").AppScreens[ID],
        options?: {
            transition?: "push" | "pop" | "present" | "dismiss";
            duration?: number
        }
    ): TimelineEvent => ({
        at,
        kind: "APP",
        appId: appId as string,
        type: "NAVIGATE_SCREEN",
        screen: screen as string,
        transition: options?.transition,
        animationDuration: options?.duration
    } as any)
};
