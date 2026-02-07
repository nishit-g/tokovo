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
      "app_typewriter.space": "plugins/typewriter/space.wav",
      "app_typewriter.punct": "plugins/typewriter/punct.wav",
      "app_typewriter.bell": "plugins/typewriter/bell.wav",
      "app_typewriter.room": "plugins/typewriter/room.wav",
    },
    designWidth: 1080,
  },
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
