import type { TokovoPluginContract } from "@tokovo/core";
import { whatsappAudioRules } from "../assets/audio-rules.js";
import { collectWhatsAppAssetRefs } from "../asset-refs.js";
import { whatsappBootstrap } from "../bootstrap.js";
import { WhatsAppCinematicSubjects } from "../camera/subjects.js";
import { WHATSAPP_APP_ID } from "../constants.js";
import { WHATSAPP_EVENT_TYPES, whatsappV2Lowering } from "../lowering/v2/handler.js";
import { whatsappNotificationAdapter } from "../notifications/adapter.js";
import { createWhatsAppInitialState } from "../runtime/initial-state.js";
import { whatsappReducer } from "../runtime/reducer.js";

const whatsappAssets = {
  sounds: {
    "app_whatsapp.message_out": "plugins/whatsapp/sent.wav",
    "app_whatsapp.typing_loop": "plugins/whatsapp/typing_loop.wav",
  },
  icons: {
    app_icon: "/icons/whatsapp.svg",
  },
  designWidth: 393,
};

/**
 * Pure compiler/runtime contribution. It deliberately contains no React view
 * or hook imports, so compiler and render workers can prepare an
 * episode without bundling the interactive app UI.
 */
export const WhatsAppHeadlessPlugin: TokovoPluginContract<"app_whatsapp"> & {
  v2Lowering: typeof whatsappV2Lowering;
  notificationAdapter: typeof whatsappNotificationAdapter;
  eventKinds: typeof WHATSAPP_EVENT_TYPES;
} = {
  id: WHATSAPP_APP_ID as "app_whatsapp",
  version: "2.0.0",
  displayName: "WhatsApp",
  reducer: whatsappReducer,
  views: {
    AppRoot: () => null,
  },
  createInitialState: createWhatsAppInitialState,
  bootstrap: whatsappBootstrap,
  eventKinds: WHATSAPP_EVENT_TYPES,
  assets: whatsappAssets,
  audioRules: whatsappAudioRules,
  notificationAdapter: whatsappNotificationAdapter,
  v2Lowering: whatsappV2Lowering,
  collectAssetRefs: collectWhatsAppAssetRefs,
  cinematicSubjects: WhatsAppCinematicSubjects,
};
