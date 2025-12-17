/**
 * WhatsApp Module Augmentation
 * 
 * When this module is imported, TypeScript will augment @tokovo/core's types
 * to include WhatsApp-specific type safety.
 * 
 * This allows DSL scripts and other code that imports the WhatsApp plugin
 * to get full autocomplete and type checking for WhatsApp-specific data.
 * 
 * Usage:
 * ```typescript
 * // In your DSL script or episode
 * import "@tokovo/apps-whatsapp"; // This enables augmentation
 * 
 * // Now WorldState.conversations is typed as WhatsAppConversation
 * const conv = world.conversations["chat_123"]; // Type: WhatsAppConversation
 * conv.messages[0].status; // Autocomplete works!
 * ```
 */

import { WhatsAppConversation, WhatsAppState, WhatsAppMessage } from "./types";

// =============================================================================
// MODULE AUGMENTATION FOR @tokovo/core
// =============================================================================

declare module "@tokovo/core" {
    /**
     * Augmented WorldState with WhatsApp-specific types.
     * 
     * When @tokovo/apps-whatsapp is imported, conversations
     * are typed as WhatsAppConversation.
     */
    interface TypedConversations {
        [id: string]: WhatsAppConversation;
    }

    /**
     * Augmented app state with WhatsApp-specific types.
     */
    interface TypedAppState {
        app_whatsapp?: WhatsAppState;
        whatsapp?: WhatsAppState;
    }
}

// =============================================================================
// TYPE-SAFE WORLD ACCESSORS
// =============================================================================

import { WorldState } from "@tokovo/core";

/**
 * Type-safe accessor for WhatsApp conversations.
 * Use this instead of raw world.conversations access.
 * 
 * @example
 * const conversations = getWhatsAppConversations(world);
 * const chat = conversations["main_chat"];
 * chat.messages; // Type: WhatsAppMessage[]
 */
export function getWhatsAppConversations(
    world: WorldState
): Record<string, WhatsAppConversation> {
    return world.conversations as Record<string, WhatsAppConversation>;
}

/**
 * Type-safe accessor for a single WhatsApp conversation.
 * 
 * @example
 * const chat = getWhatsAppConversation(world, "main_chat");
 * if (chat) {
 *    chat.messages.forEach(msg => console.log(msg.text));
 * }
 */
export function getWhatsAppConversation(
    world: WorldState,
    conversationId: string
): WhatsAppConversation | undefined {
    return world.conversations[conversationId] as WhatsAppConversation | undefined;
}

/**
 * Type-safe accessor for WhatsApp app state.
 * 
 * @example
 * const state = getWhatsAppAppState(world);
 * console.log(state?.screen); // Type: string | undefined
 */
export function getWhatsAppAppState(
    world: WorldState
): WhatsAppState | undefined {
    return (
        (world.appState?.app_whatsapp as WhatsAppState) ||
        (world.appState?.whatsapp as WhatsAppState)
    );
}

/**
 * Type-safe accessor for messages in a conversation.
 * 
 * @example
 * const messages = getWhatsAppMessages(world, "main_chat");
 * messages.forEach(msg => {
 *     if (msg.type === "image") {
 *         console.log(msg.imageUrl); // Type-safe!
 *     }
 * });
 */
export function getWhatsAppMessages(
    world: WorldState,
    conversationId: string
): WhatsAppMessage[] {
    const conv = getWhatsAppConversation(world, conversationId);
    return (conv?.messages || []) as WhatsAppMessage[];
}
