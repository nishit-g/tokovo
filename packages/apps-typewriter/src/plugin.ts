import type { PluginReducer, TokovoPluginContract, PluginViews } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";

import { TYPEWRITER_APP_ID, TYPEWRITER_DISPLAY_NAME, TYPEWRITER_VERSION } from "./constants.js";
import { typewriterReducer } from "./runtime/reducer.js";
import { createTypewriterInitialState } from "./runtime/state.js";
import { TypewriterView } from "./ui/index.js";
import { typewriterLowering } from "./lowering/index.js";
import { TypewriterAnchorProvider } from "./anchors/provider.js";

const views: PluginViews = {
  AppRoot: TypewriterView,
};

export const TypewriterPlugin: TokovoPluginContract<typeof TYPEWRITER_APP_ID> & {
  v2Lowering: typeof typewriterLowering;
} = {
  id: TYPEWRITER_APP_ID,
  version: TYPEWRITER_VERSION,
  displayName: TYPEWRITER_DISPLAY_NAME,
  views,
  reducer: typewriterReducer as PluginReducer<typeof TYPEWRITER_APP_ID>,
  createInitialState: createTypewriterInitialState,
  eventKinds: [
    "TYPEWRITER_INIT_LETTER",
    "TYPEWRITER_KEY",
    "TYPEWRITER_NEWLINE",
    "TYPEWRITER_BACKSPACE",
    "TYPEWRITER_SET_CURSOR",
    "TYPEWRITER_SCROLL",
  ] as const,
  assets: {
    icons: { app_icon: "/icons/typewriter.svg" },
    sounds: {
      "app_typewriter.key": "plugins/typewriter/key.wav",
      "app_typewriter.carriage": "plugins/typewriter/carriage.wav",
      "app_typewriter.backspace": "plugins/typewriter/backspace.wav",
    },
    designWidth: 1080,
  },
  audioRules: [
    {
      match: { kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_KEY" },
      action: "PLAY_ONE_SHOT",
      sound: "app_typewriter.key",
      bus: "ui",
      volume: 0.85,
    },
    {
      match: { kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_NEWLINE" },
      action: "PLAY_ONE_SHOT",
      sound: "app_typewriter.carriage",
      bus: "ui",
      volume: 0.95,
    },
    {
      match: { kind: "APP", appId: TYPEWRITER_APP_ID, type: "TYPEWRITER_BACKSPACE" },
      action: "PLAY_ONE_SHOT",
      sound: "app_typewriter.backspace",
      bus: "ui",
      volume: 0.8,
    },
  ],
  v2Lowering: typewriterLowering,
  anchorProvider: TypewriterAnchorProvider,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerTypewriterPlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(TypewriterPlugin);
}

export default TypewriterPlugin;

