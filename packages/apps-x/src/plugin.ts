import type { TokovoPluginContract, PluginViews } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { XView } from "./ui/index.js";
import { xLowering } from "./lowering/index.js";
import { xLayoutStrategies } from "./layout/index.js";
import { xDsl, type XDslApi } from "./dsl/extension.js";
import { xNotificationAdapter } from "./notifications/adapter.js";
import { XHeadlessPlugin } from "./headless/index.js";

const xViews: PluginViews = {
  AppRoot: XView,
};

export const XPlugin: TokovoPluginContract<"app_x"> & {
  v2Lowering: typeof xLowering;
  notificationAdapter: typeof xNotificationAdapter;
} = {
  ...XHeadlessPlugin,
  views: xViews,
  v2Lowering: xLowering,
  layouts: xLayoutStrategies,
  dsl: xDsl,
  notificationAdapter: xNotificationAdapter,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerXPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(XPlugin);
}

export const xRuntimeEntry = {
  id: "@tokovo/apps-x",
  scope: "app" as const,
  register({ pluginManager }: { pluginManager: PluginManagerClass }): void {
    registerXPlugin(pluginManager);
  },
};

export const tokovoRuntimeManifest = [xRuntimeEntry] as const;

export type { XDslApi };
