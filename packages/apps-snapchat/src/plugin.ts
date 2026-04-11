import type { TokovoPluginContract, PluginViews } from "@tokovo/core";
import type { PluginManagerClass } from "@tokovo/react";
import { SNAPCHAT_APP_ID, SNAPCHAT_DISPLAY_NAME, SNAPCHAT_VERSION } from "./constants.js";
import { snapchatReducer } from "./runtime/reducer.js";
import { createSnapchatInitialState } from "./runtime/initial-state.js";
import { SnapchatView } from "./ui/index.js";
import { snapchatV2Lowering } from "./lowering/index.js";
import { snapchatLayoutStrategies } from "./layout/index.js";
import { SnapchatAnchorProvider } from "./anchors/provider.js";
import { snapchatBootstrap } from "./bootstrap.js";
import { collectSnapchatAssetRefs } from "./asset-refs.js";
import { snapchatDsl, type SnapchatDslApi } from "./dsl/index.js";
import { snapchatNotificationAdapter } from "./notifications/adapter.js";

const snapchatViews: PluginViews = {
    AppRoot: SnapchatView,
    strategies: {
        ios: {
            ChatScreen: SnapchatView,
        },
    },
};

const snapchatAssets = {
    sounds: {
        "app_snapchat.message_in": "plugins/snapchat/received.wav",
        "app_snapchat.message_out": "plugins/snapchat/sent.wav",
        "app_snapchat.snap_in": "plugins/snapchat/snap_received.wav",
        "app_snapchat.typing_loop": "core/keyboard/typing_loop.wav",
    },
    icons: {
        app_icon: "/icons/snapchat.svg",
    },
};

const snapchatAudioRules: NonNullable<TokovoPluginContract["audioRules"]> = [
    {
        match: { kind: "APP", appId: SNAPCHAT_APP_ID, type: "SNAPCHAT_MESSAGE_SEND" },
        action: "PLAY_ONE_SHOT",
        sound: "app_snapchat.message_out",
        bus: "ui",
        duckMusic: true,
    },
    {
        match: { kind: "APP", appId: SNAPCHAT_APP_ID, type: "SNAPCHAT_MESSAGE_RECEIVE" },
        action: "PLAY_ONE_SHOT",
        sound: "app_snapchat.message_in",
        bus: "ui",
        duckMusic: true,
    },
    {
        match: { kind: "APP", appId: SNAPCHAT_APP_ID, type: "SNAPCHAT_SNAP_RECEIVE" },
        action: "PLAY_ONE_SHOT",
        sound: "app_snapchat.snap_in",
        bus: "ui",
        duckMusic: true,
    },
    {
        match: { kind: "APP", appId: SNAPCHAT_APP_ID, type: "SNAPCHAT_TYPING_START" },
        action: "START_LOOP",
        sound: "app_snapchat.typing_loop",
        bus: "sfx",
        volume: 0.3,
        idTemplate: "typing_{conversationId}_{actor}",
    },
    {
        match: { kind: "APP", appId: SNAPCHAT_APP_ID, type: "SNAPCHAT_TYPING_END" },
        action: "STOP_SOUND",
        stopId: "typing_{conversationId}_{actor}",
    },
];

export const SnapchatPlugin: TokovoPluginContract<"app_snapchat"> & {
    v2Lowering: typeof snapchatV2Lowering;
} = {
    id: SNAPCHAT_APP_ID,
    version: SNAPCHAT_VERSION,
    displayName: SNAPCHAT_DISPLAY_NAME,
    reducer: snapchatReducer,
    views: snapchatViews,
    createInitialState: createSnapchatInitialState,
    bootstrap: snapchatBootstrap,
    eventKinds: [
        "SNAPCHAT_CONVERSATION_CREATE",
        "SNAPCHAT_CONVERSATION_OPEN",
        "SNAPCHAT_MESSAGE_SEND",
        "SNAPCHAT_MESSAGE_RECEIVE",
        "SNAPCHAT_SNAP_SEND",
        "SNAPCHAT_SNAP_RECEIVE",
        "SNAPCHAT_SNAP_OPEN",
        "SNAPCHAT_TYPING_START",
        "SNAPCHAT_TYPING_END",
        "SNAPCHAT_STREAK_UPDATE",
        "SNAPCHAT_SET_SCREEN",
        "SNAPCHAT_SET_DRAFT",
        "SNAPCHAT_MESSAGE_STATUS_SET",
        "SNAPCHAT_SCREENSHOT",
        "SNAPCHAT_SAVE_MESSAGE",
    ] as const,
    assets: {
        ...snapchatAssets,
        designWidth: 393,
    },
    audioRules: snapchatAudioRules,
    v2Lowering: snapchatV2Lowering,
    layouts: snapchatLayoutStrategies,
    anchorProvider: SnapchatAnchorProvider,
    dsl: snapchatDsl,
    collectAssetRefs: collectSnapchatAssetRefs,
    notificationAdapter: snapchatNotificationAdapter,
};

const registeredManagers = new WeakSet<PluginManagerClass>();

export function registerSnapchatPlugin(pluginManager: PluginManagerClass): void {
    if (registeredManagers.has(pluginManager)) return;
    registeredManagers.add(pluginManager);
    pluginManager.register(SnapchatPlugin);
}

export const snapchatRuntimeEntry = {
    id: "@tokovo/apps-snapchat",
    scope: "app" as const,
    register({ pluginManager }: { pluginManager: PluginManagerClass }): void {
        registerSnapchatPlugin(pluginManager);
    },
};

export default SnapchatPlugin;
export type { SnapchatDslApi };
