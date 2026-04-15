import type { TokovoPluginContract, PluginViews, PluginReducer } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { IMESSAGE_APP_ID, IMESSAGE_DISPLAY_NAME, IMESSAGE_VERSION } from "./constants.js";
import { iMessageReducer } from "./runtime/reducer.js";
import { createIMessageInitialState } from "./runtime/initial-state.js";
import { IMessageView } from "./ui/index.js";
import { iMessageV2Lowering } from "./lowering/index.js";
import { iMessageLayoutStrategies } from "./layout/index.js";
import { IMessageAnchorProvider } from "./anchors/provider.js";
import { iMessageBootstrap } from "./bootstrap.js";
import { iMessageDsl, type IMessageDslApi } from "./dsl/index.js";
import { collectIMessageAssetRefs } from "./asset-refs.js";
import { iMessageNotificationAdapter } from "./notifications/adapter.js";

const iMessageViews: PluginViews = {
  AppRoot: IMessageView,
  strategies: {
    ios: {
      ChatScreen: IMessageView,
    },
  },
};

const iMessageAssets = {
  sounds: {
    "app_imessage.message_in": "plugins/imessage/received.wav",
    "app_imessage.message_out": "plugins/imessage/sent.wav",
    "app_imessage.typing_loop": "plugins/imessage/typing_loop.wav",
  },
  icons: {
    app_icon: "/icons/imessage.svg",
  },
};

const iMessageAudioRules: NonNullable<TokovoPluginContract["audioRules"]> = [
  {
    match: { kind: "APP", appId: IMESSAGE_APP_ID, type: "IMESSAGE_MESSAGE_SEND" },
    action: "PLAY_ONE_SHOT",
    sound: "app_imessage.message_out",
    bus: "ui",
    duckMusic: true,
  },
  {
    match: { kind: "APP", appId: IMESSAGE_APP_ID, type: "IMESSAGE_MESSAGE_RECEIVE" },
    action: "PLAY_ONE_SHOT",
    sound: "app_imessage.message_in",
    bus: "ui",
    duckMusic: true,
  },
  {
    match: { kind: "APP", appId: IMESSAGE_APP_ID, type: "IMESSAGE_TYPING_START" },
    action: "START_LOOP",
    sound: "app_imessage.typing_loop",
    bus: "sfx",
    volume: 0.4,
    idTemplate: "typing_{conversationId}_{actor}",
  },
  {
    match: { kind: "APP", appId: IMESSAGE_APP_ID, type: "IMESSAGE_TYPING_END" },
    action: "STOP_SOUND",
    stopId: "typing_{conversationId}_{actor}",
  },
];

export const IMessagePlugin: TokovoPluginContract<"app_imessage"> & {
  v2Lowering: typeof iMessageV2Lowering;
} = {
  id: IMESSAGE_APP_ID,
  version: IMESSAGE_VERSION,
  displayName: IMESSAGE_DISPLAY_NAME,
  reducer: iMessageReducer as PluginReducer<"app_imessage">,
  views: iMessageViews,
  createInitialState: createIMessageInitialState,
  bootstrap: iMessageBootstrap,
  eventKinds: [
    "IMESSAGE_CONVERSATION_CREATE",
    "IMESSAGE_CONVERSATION_UPDATE",
    "IMESSAGE_CONVERSATION_OPEN",
    "IMESSAGE_CONVERSATION_PIN",
    "IMESSAGE_CONVERSATION_UNPIN",
    "IMESSAGE_CONVERSATION_MUTE",
    "IMESSAGE_CONVERSATION_UNMUTE",
    "IMESSAGE_MESSAGE_SEND",
    "IMESSAGE_MESSAGE_RECEIVE",
    "IMESSAGE_MESSAGE_EDIT",
    "IMESSAGE_MESSAGE_DELETE",
    "IMESSAGE_MESSAGE_STATUS_SET",
    "IMESSAGE_TAPBACK_ADD",
    "IMESSAGE_TAPBACK_REMOVE",
    "IMESSAGE_TYPING_START",
    "IMESSAGE_TYPING_END",
    "IMESSAGE_MESSAGE_READ",
    "IMESSAGE_GROUP_MEMBER_ADD",
    "IMESSAGE_GROUP_MEMBER_REMOVE",
    "IMESSAGE_GROUP_MEMBER_LEAVE",
    "IMESSAGE_GROUP_NAME_CHANGE",
    "IMESSAGE_GROUP_AVATAR_CHANGE",
    "IMESSAGE_SET_SCREEN",
    "IMESSAGE_SET_DRAFT",
    "IMESSAGE_CLEAR_DRAFT",
    "IMESSAGE_OPEN_MEDIA",
    "IMESSAGE_SET_THEME_MODE",
    "IMESSAGE_SEARCH_START",
    "IMESSAGE_SEARCH_CLEAR",
    "IMESSAGE_SCREEN_EFFECT",
  ] as const,
  assets: {
    ...iMessageAssets,
    designWidth: 393,
  },
  audioRules: iMessageAudioRules,
  v2Lowering: iMessageV2Lowering,
  layouts: iMessageLayoutStrategies,
  anchorProvider: IMessageAnchorProvider,
  dsl: iMessageDsl,
  collectAssetRefs: collectIMessageAssetRefs,
  notificationAdapter: iMessageNotificationAdapter,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerIMessagePlugin(pluginManager: PluginManagerClass): void {
  if (registeredManagers.has(pluginManager)) return;
  registeredManagers.add(pluginManager);
  pluginManager.register(IMessagePlugin);
}

export const iMessageRuntimeEntry = {
  id: "@tokovo/apps-imessage",
  scope: "app" as const,
  register({ pluginManager }: { pluginManager: PluginManagerClass }): void {
    registerIMessagePlugin(pluginManager);
  },
};

export const tokovoRuntimeManifest = [iMessageRuntimeEntry] as const;

export default IMessagePlugin;
export type { IMessageDslApi };
