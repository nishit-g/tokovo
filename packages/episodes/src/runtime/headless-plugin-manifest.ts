import type { TokovoPluginContract } from "@tokovo/core";
import { WhatsAppHeadlessPlugin } from "@tokovo/apps-whatsapp/headless";
import { XHeadlessPlugin } from "@tokovo/apps-x/headless";

/**
 * Single server-safe plugin manifest used by compiler and render preparation.
 * Entries may contain reducers, lowering, bootstrap, audio,
 * notification and cinematic subject semantics, but never React views.
 */
export const TOKOVO_HEADLESS_PLUGIN_MANIFEST: readonly TokovoPluginContract<string>[] =
  [WhatsAppHeadlessPlugin, XHeadlessPlugin];

const HEADLESS_PLUGINS_BY_ID = new Map(
  TOKOVO_HEADLESS_PLUGIN_MANIFEST.map((plugin) => [
    plugin.id,
    plugin,
  ]),
);

export function getTokovoHeadlessPlugin(
  appId: string,
): TokovoPluginContract<string> | undefined {
  return HEADLESS_PLUGINS_BY_ID.get(appId);
}

export function requireTokovoHeadlessPlugins(
  appIds: readonly string[],
): TokovoPluginContract<string>[] {
  return [...new Set(appIds)].sort().map((appId) => {
    const plugin = getTokovoHeadlessPlugin(appId);
    if (!plugin) {
      throw new Error(
        `TOKOVO_HEADLESS_PLUGIN_MISSING: runtime plugin "${appId}" has no server-safe contribution.`,
      );
    }
    return plugin;
  });
}
