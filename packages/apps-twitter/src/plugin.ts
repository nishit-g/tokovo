/**
 * Twitter/X Plugin
 * 
 * Registration and initial state setup.
 */

import { ReducerRegistry } from "@tokovo/core";
import { twitterReducer, TWITTER_APP_ID } from "./runtime";

// =============================================================================
// INITIAL STATE
// =============================================================================

export const initialTwitterState = {
    screen: "timeline" as const,
    activeTab: "for-you" as const,
    tweets: [],
};

// =============================================================================
// REGISTRATION
// =============================================================================

// Ensure reducer is registered (import side-effect)
export function registerTwitterApp(): void {
    // Registration happens via import of runtime.ts
    // This function ensures the import is not tree-shaken
    console.log(`[Tokovo] Twitter app registered: ${TWITTER_APP_ID}`);
}

// Auto-register on import
registerTwitterApp();

export { TWITTER_APP_ID };
