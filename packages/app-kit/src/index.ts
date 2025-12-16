export * from "./router";

import { TokovoPlugin, definePlugin } from "@tokovo/core/dist/plugin";

/**
 * Helper to define a standard Chat App (WhatsApp, Telegram, etc.)
 * Enforces standardized features (Screens, Reducer, etc.)
 */
export function createChatApp(config: TokovoPlugin): TokovoPlugin {
    return definePlugin(config);
}
