/**
 * WhatsApp Initial State Factory
 *
 * Creates the initial state for the WhatsApp plugin.
 */

import type { WhatsAppState } from "../types/index.js";

// =============================================================================
// INITIAL STATE FACTORY
// =============================================================================

/**
 * Create WhatsApp initial state.
 * Called by PluginManager when registering the plugin.
 */
export function createWhatsAppInitialState(): WhatsAppState {
  return {
    layoutRevision: 0,
    locale: "en-US",
    mediaViewer: null,
    statusViewer: null,
    activeGesture: null,
    replyComposer: null,
    threadViewport: null,
    currentScreen: "chats",
    chatFilter: "all",
    viewMode: "FEED",
    conversationId: undefined,
    conversations: {},
    statuses: [],
    channels: [],
    callLog: [],
    communities: [],
    settings: {},
  };
}

/**
 * Create initial conversation state for DSL.
 */
export function createInitialConversation(
  id: string,
  name: string,
  options?: {
    type?: "dm" | "group";
    avatar?: string;
  },
) {
  return {
    id,
    name,
    type: options?.type ?? "dm",
    avatar: options?.avatar ?? "",
    messages: [],
    unreadCount: 0,
    typing: {},
  };
}
