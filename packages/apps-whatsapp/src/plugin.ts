/**
 * WhatsApp Plugin - Enterprise Contract
 * 
 * Self-contained plugin with all tiers:
 * - Tier A: id, version, displayName, reducer, views
 * - Tier B: lowering handler, layouts
 * - Tier C: DSL extension (b.use() pattern)
 * 
 * @see docs/FUCKING_MESS.md Section 6
 */

import { APP_IDS, PluginManager } from "@tokovo/core";
import type { TokovoPluginContract, PluginViews, PluginLayoutStrategy } from "@tokovo/core/src/types/plugin-contract";
import { whatsappReducer } from "./logic/reducer";
import { WhatsappChatView } from "./ui";
import { whatsappLowering } from "./lowering";
import { whatsappV2Lowering } from "./v2/lowering";
import { whatsappDsl, WhatsAppDslApi } from "./dsl-extension";
import { whatsappAudioRules } from "./assets/audio-rules";
import { computeChatLayout } from "./layout";

// =============================================================================
// PLUGIN VIEWS
// =============================================================================

const whatsappViews: PluginViews = {
    AppRoot: WhatsappChatView as any,
    // Platform strategies will be added when Android views are ready
    strategies: {
        ios: {
            ChatScreen: WhatsappChatView as any,
        },
    },
};

// =============================================================================
// PLUGIN ASSETS
// =============================================================================

const whatsappAssets = {
    sounds: {
        "message_in": "/audio/app_whatsapp/message_in.mp3",
        "message_out": "/audio/app_whatsapp/message_out.mp3",
        "typing_loop": "/audio/app_whatsapp/typing_loop.mp3",
        "notification": "/audio/app_whatsapp/notification.mp3",
    },
    icons: {
        "app_icon": "/icons/whatsapp.svg",
    },
};

// =============================================================================
// INITIAL STATE
// =============================================================================

function createWhatsAppInitialState() {
    return {
        currentScreen: "chats" as const,
        conversations: {},
        currentConversationId: null as string | null,
    };
}

// =============================================================================
// ENTERPRISE PLUGIN CONTRACT
// =============================================================================

export const WhatsAppPluginV2: TokovoPluginContract<"app_whatsapp"> & {
    appView: any;
    name: string;
    v2Lowering: typeof whatsappV2Lowering;
} = {
    // === TIER A: Identity ===
    id: APP_IDS.WHATSAPP as "app_whatsapp",
    version: "2.0.0",
    displayName: "WhatsApp",
    name: "WhatsApp",  // Legacy field for PluginManager

    // === TIER A: Runtime ===
    reducer: whatsappReducer as any,
    views: whatsappViews,
    appView: WhatsappChatView as any,  // Legacy field for PluginManager

    // === TIER A: Assets ===
    assets: whatsappAssets,
    audioRules: whatsappAudioRules as any,

    // === TIER A: Initial State ===
    createInitialState: createWhatsAppInitialState,

    // === TIER B: Lowering ===
    lowering: whatsappLowering,
    v2Lowering: whatsappV2Lowering,

    // === TIER B: Layouts ===
    layouts: [
        {
            viewKind: "CHAT",
            computeLayout: computeChatLayout as any,  // Type cast for LayoutContext compatibility
        },
    ],

    // === TIER C: DSL ===
    dsl: whatsappDsl,
};

// =============================================================================
// LEGACY EXPORTS (for backward compatibility)
// =============================================================================

// Re-export as old name for existing consumers
export { WhatsAppPluginV2 as WhatsAppPlugin };

// Legacy registration function
export function registerWhatsAppPlugin(): void {
    PluginManager.register(WhatsAppPluginV2 as any);
}

// Type export for b.use()
export type { WhatsAppDslApi };

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default WhatsAppPluginV2;
