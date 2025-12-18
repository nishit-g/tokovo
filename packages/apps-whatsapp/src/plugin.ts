/**
 * WhatsApp Plugin - Enterprise Contract
 * 
 * Self-contained plugin with all tiers:
 * - Tier A: id, version, displayName, reducer, views
 * - Tier B: lowering handler, layouts
 * - Tier C: DSL extension (b.use() pattern)
 * 
 * @see docs/ARCHITECTURE.md
 */

import { APP_IDS, PluginManager } from "@tokovo/core";
import type { TokovoPluginContract, PluginViews } from "@tokovo/core/src/types/plugin-contract";

// Runtime Layer
import { whatsappReducer } from "./runtime/reducer";
import { createWhatsAppInitialState } from "./runtime/initial-state";

// Views Layer
import { WhatsappChatView } from "./ui";

// Lowering Layer (V2 is default)
import { whatsappLowering, whatsappV2Lowering } from "./lowering";

// DSL Layer
import { whatsappDsl, type WhatsAppDslApi } from "./dsl";

// Layout Layer
import { computeChatLayout } from "./layout";

// Assets
import { whatsappAudioRules } from "./assets/audio-rules";

// Camera
import { WhatsAppBehavior } from "./camera";

// =============================================================================
// PLUGIN VIEWS
// =============================================================================

const whatsappViews: PluginViews = {
    AppRoot: WhatsappChatView as React.FC<any>,
    strategies: {
        ios: {
            ChatScreen: WhatsappChatView as React.FC<any>,
        },
    },
};

// =============================================================================
// PLUGIN ASSETS
// =============================================================================

const whatsappAssets = {
    sounds: {
        "message_in": "plugins/whatsapp/received.wav",
        "message_out": "plugins/whatsapp/sent.wav",
        "typing_loop": "plugins/whatsapp/typing_loop.wav",
    },
    icons: {
        "app_icon": "/icons/whatsapp.svg",
    },
};

// =============================================================================
// ENTERPRISE PLUGIN CONTRACT
// =============================================================================

export const WhatsAppPluginV2: TokovoPluginContract<"app_whatsapp"> & {
    appView: any;
    name: string;
    v2Lowering: typeof whatsappV2Lowering;
    behaviors: typeof WhatsAppBehavior;
} = {
    // === TIER A: Identity ===
    id: APP_IDS.WHATSAPP as "app_whatsapp",
    version: "2.0.0",
    displayName: "WhatsApp",
    name: "WhatsApp",

    // === TIER A: Runtime ===
    reducer: whatsappReducer as any,
    views: whatsappViews,
    appView: WhatsappChatView as any,
    createInitialState: createWhatsAppInitialState,

    // === TIER A: Assets ===
    assets: whatsappAssets,
    audioRules: whatsappAudioRules as any,

    // === TIER B: Lowering ===
    // NOTE: whatsappLowering requires handles property, using v2Lowering only
    v2Lowering: whatsappV2Lowering,

    // === TIER B: Layouts ===
    layouts: [
        {
            viewKind: "CHAT",
            computeLayout: computeChatLayout as any,
        },
    ],

    // === TIER B: Behaviors ===
    behaviors: WhatsAppBehavior,

    // === TIER C: DSL ===
    dsl: whatsappDsl,
};

// =============================================================================
// EXPORTS
// =============================================================================

export { WhatsAppPluginV2 as WhatsAppPlugin };

export function registerWhatsAppPlugin(): void {
    PluginManager.register(WhatsAppPluginV2 as any);
}

export type { WhatsAppDslApi };

export default WhatsAppPluginV2;
