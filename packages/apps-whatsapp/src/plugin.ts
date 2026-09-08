/**
 * WhatsApp interactive plugin. The compiler/runtime contract is composed from
 * the headless entry so compiler and render workers never import React
 * views merely to prepare an episode.
 */

import type { PluginViews, TokovoPluginContract } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { WhatsAppHeadlessPlugin } from "./headless/index.js";
import { computeChatLayout, computeFeedLayout } from "./layout/index.js";
import { whatsappNotificationAdapter } from "./notifications/adapter.js";
import { WhatsappChatView } from "./ui/index.js";
import { whatsappV2Lowering } from "./lowering/index.js";

const whatsappViews: PluginViews = {
  AppRoot: WhatsappChatView,
  strategies: {
    ios: {
      ChatScreen: WhatsappChatView,
    },
  },
};

export const WhatsAppPluginV2: TokovoPluginContract<"app_whatsapp"> & {
  v2Lowering: typeof whatsappV2Lowering;
  notificationAdapter: typeof whatsappNotificationAdapter;
} = {
  ...WhatsAppHeadlessPlugin,
  views: whatsappViews,
  layouts: [
    {
      viewKind: "FEED",
      computeLayout: computeFeedLayout,
    },
    {
      viewKind: "CHAT",
      computeLayout: computeChatLayout,
    },
  ],
};

export { WhatsAppPluginV2 as WhatsAppPlugin };

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerWhatsAppPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(WhatsAppPluginV2);
}

export const whatsappRuntimeEntry = {
  id: "@tokovo/apps-whatsapp",
  scope: "app" as const,
  register({ pluginManager }: { pluginManager: PluginManagerClass }): void {
    registerWhatsAppPlugin(pluginManager);
  },
};

export const tokovoRuntimeManifest = [whatsappRuntimeEntry] as const;

export default WhatsAppPluginV2;
