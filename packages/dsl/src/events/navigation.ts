/**
 * Navigation Event Factories
 * 
 * Low-level event creators for app navigation.
 */

import { TimelineEvent } from "@tokovo/core";
import { createTrace } from "@tokovo/ir";
import { Tracer } from "../tracer";

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
        trace: createTrace(Tracer.capture()),
        screen: options?.screen,
        conversationId: options?.conversationId,
        transition: options?.transition,
        animationDuration: options?.duration
    }) satisfies TimelineEvent

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
        trace: createTrace(Tracer.capture()),
        screen: screen as string,
        transition: options?.transition,
        animationDuration: options?.duration
    }) satisfies TimelineEvent
};
