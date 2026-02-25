import { describe, it, expect } from "vitest";
import { snapchatReducer } from "../runtime/reducer.js";
import { createSnapchatInitialState } from "../runtime/initial-state.js";
import type { SnapchatState } from "../types/index.js";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";

function createTestWorldState(): WorldState {
    return {
        appState: {
            app_snapchat: createSnapchatInitialState(),
        },
        devices: {},
        camera: DEFAULT_BASE_CAMERA_STATE,
        audio: DEFAULT_AUDIO_STATE,
    } as WorldState;
}

type SnapchatReducerEvent = Parameters<typeof snapchatReducer>[1];

function runReducer(state: WorldState, event: SnapchatReducerEvent): WorldState {
    const draft = JSON.parse(JSON.stringify(state)) as WorldState;
    snapchatReducer(draft, event);
    return draft;
}

describe("Snapchat Reducer", () => {
    it("MESSAGE_SEND adds outgoing message", () => {
        const state = createTestWorldState();
        const nextState = runReducer(state, {
            at: 0,
            kind: "APP",
            appId: "app_snapchat",
            type: "SNAPCHAT_MESSAGE_SEND",
            payload: { conversationId: "c1", text: "Hey!" },
        });

        const conv = (nextState.appState?.app_snapchat as SnapchatState | undefined)
            ?.conversations?.["c1"];
        expect(conv?.messages.length).toBe(1);
        expect(conv?.messages[0].text).toBe("Hey!");
        expect(conv?.messages[0].fromMe).toBe(true);
    });

    it("MESSAGE_RECEIVE increments unread count", () => {
        const state = createTestWorldState();
        const nextState = runReducer(state, {
            at: 0,
            kind: "APP",
            appId: "app_snapchat",
            type: "SNAPCHAT_MESSAGE_RECEIVE",
            payload: { conversationId: "c1", from: "Alex", text: "Yo" },
        });

        const conv = (nextState.appState?.app_snapchat as SnapchatState | undefined)
            ?.conversations?.["c1"];
        expect(conv?.unreadCount).toBe(1);
    });

    it("SNAP_RECEIVE creates snap message", () => {
        const state = createTestWorldState();
        const nextState = runReducer(state, {
            at: 0,
            kind: "APP",
            appId: "app_snapchat",
            type: "SNAPCHAT_SNAP_RECEIVE",
            payload: { conversationId: "c1", from: "Alex", snapType: "photo", timer: 5 },
        });

        const conv = (nextState.appState?.app_snapchat as SnapchatState | undefined)
            ?.conversations?.["c1"];
        expect(conv?.messages.length).toBe(1);
        expect(conv?.messages[0].kind).toBe("snap");
        expect(conv?.messages[0].snapType).toBe("photo");
        expect(conv?.messages[0].snapTimer).toBe(5);
        expect(conv?.unreadCount).toBe(1);
    });

    it("SNAP_OPEN marks snap as opened", () => {
        const state = createTestWorldState();
        const withSnap = runReducer(state, {
            at: 0,
            kind: "APP",
            appId: "app_snapchat",
            type: "SNAPCHAT_SNAP_RECEIVE",
            payload: { conversationId: "c1", from: "Alex", snapType: "photo", messageId: "s1" },
        });

        const opened = runReducer(withSnap, {
            at: 1,
            kind: "APP",
            appId: "app_snapchat",
            type: "SNAPCHAT_SNAP_OPEN",
            payload: { conversationId: "c1", messageId: "s1" },
        });

        const conv = (opened.appState?.app_snapchat as SnapchatState | undefined)
            ?.conversations?.["c1"];
        expect(conv?.messages[0].snapOpened).toBe(true);
        expect(conv?.messages[0].status).toBe("opened");
    });

    it("STREAK_UPDATE sets streak counter", () => {
        const state = createTestWorldState();
        const nextState = runReducer(state, {
            at: 0,
            kind: "APP",
            appId: "app_snapchat",
            type: "SNAPCHAT_STREAK_UPDATE",
            payload: { conversationId: "c1", streak: 42 },
        });

        const conv = (nextState.appState?.app_snapchat as SnapchatState | undefined)
            ?.conversations?.["c1"];
        expect(conv?.streak).toBe(42);
    });

    it("SCREENSHOT adds system message", () => {
        const state = createTestWorldState();
        const nextState = runReducer(state, {
            at: 0,
            kind: "APP",
            appId: "app_snapchat",
            type: "SNAPCHAT_SCREENSHOT",
            payload: { conversationId: "c1" },
        });

        const conv = (nextState.appState?.app_snapchat as SnapchatState | undefined)
            ?.conversations?.["c1"];
        expect(conv?.messages.length).toBe(1);
        expect(conv?.messages[0].isSystem).toBe(true);
        expect(conv?.messages[0].systemType).toBe("screenshot");
    });

    it("CONVERSATION_OPEN sets screen to chat", () => {
        const state = createTestWorldState();
        const nextState = runReducer(state, {
            at: 0,
            kind: "APP",
            appId: "app_snapchat",
            type: "SNAPCHAT_CONVERSATION_OPEN",
            payload: { conversationId: "c1" },
        });

        const appState = nextState.appState?.app_snapchat as SnapchatState | undefined;
        expect(appState?.currentScreen).toBe("chat");
        expect(appState?.activeConversationId).toBe("c1");
        expect(appState?.viewMode).toBe("CHAT");
    });
});
