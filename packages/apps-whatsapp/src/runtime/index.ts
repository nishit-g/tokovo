/**
 * WhatsApp Runtime Layer - Barrel Export
 * 
 * Exports all runtime-related modules:
 * - Reducer: State machine transitions
 * - Selectors: Memoized state queries
 * - Initial State: Factory functions
 * - Adapters: External integrations
 */

// Reducer
export { whatsappReducer } from "./reducer.js";

// Initial State
export { createWhatsAppInitialState, createInitialConversation } from "./initial-state.js";

// Selectors
export {
    selectAppState,
    selectConversations,
    selectCurrentConversationId,
    selectCurrentConversation,
    selectMessages,
    selectLastMessage,
    selectTypingMembers,
    selectIsGroupConversation,
} from "./selectors.js";

// Adapters
export * from "./adapters/index.js";
