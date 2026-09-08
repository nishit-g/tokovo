import { describe, it, expect } from "vitest";
import { iMessageReducer } from "../runtime/reducer.js";
import { createIMessageInitialState } from "../runtime/initial-state.js";
import type { IMessageState } from "../types/index.js";
import type { WorldState, RuntimeEvent } from "@tokovo/core";
import { createDefaultAudioState } from "@tokovo/core";

function createTestWorldState(): WorldState {
  return {
    appInstances: {
      "phone:app_imessage": createIMessageInitialState(),
    },
    capabilityState: {},
    devices: {},
    audio: createDefaultAudioState(),
  } as WorldState;
}

function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
  const draft = JSON.parse(JSON.stringify(state)) as WorldState;
  iMessageReducer(draft, event as any);
  return draft;
}

describe("iMessage Reducer", () => {
  it("clears typing and drafts and does not mark the visible thread unread", () => {
    let world = createTestWorldState();
    const event = (type: string, payload: Record<string, unknown>) => {
      world = runReducer(world, {
        at: 30,
        kind: "APP",
        deviceId: "phone",
        appId: "app_imessage",
        type,
        payload,
      } as RuntimeEvent);
    };
    event("IMESSAGE_CONVERSATION_OPEN", { conversationId: "c1" });
    event("IMESSAGE_TYPING_START", { conversationId: "c1", actor: "Ava" });
    event("IMESSAGE_MESSAGE_RECEIVE", { conversationId: "c1", from: "Ava", text: "Hello" });
    event("IMESSAGE_SET_DRAFT", { conversationId: "c1", text: "Reply" });
    event("IMESSAGE_MESSAGE_SEND", {
      conversationId: "c1",
      text: "Reply",
      deliveredAt: 48,
      readAt: 90,
    });
    const conversation = (world.appInstances["phone:app_imessage"] as IMessageState).conversations!
      .c1;
    expect(conversation.unreadCount).toBe(0);
    expect(conversation.typing.Ava).toBe(false);
    expect(conversation.draft).toBe("");
    expect(conversation.messages.at(-1)).toMatchObject({ deliveredAt: 48, readAt: 90 });
  });
  it("keeps system chrome contrast synchronized with light and dark themes", () => {
    let world = createTestWorldState();
    expect((world.appInstances["phone:app_imessage"] as IMessageState).statusBarTheme).toBe(
      "light",
    );
    for (const mode of ["dark", "light"] as const) {
      world = runReducer(world, {
        at: 0,
        kind: "APP",
        deviceId: "phone",
        appId: "app_imessage",
        type: "IMESSAGE_SET_THEME_MODE",
        payload: { mode },
      });
      const state = world.appInstances["phone:app_imessage"] as IMessageState;
      expect(state.themeMode).toBe(mode);
      expect(state.statusBarTheme).toBe(mode);
    }
  });

  it("MESSAGE_SEND adds outgoing message", () => {
    const state = createTestWorldState();
    const nextState = runReducer(state, {
      at: 0,
      kind: "APP",
      deviceId: "phone",
      appId: "app_imessage",
      type: "IMESSAGE_MESSAGE_SEND",
      payload: { conversationId: "c1", text: "Hello" },
    });

    const conv = (nextState.appInstances?.["phone:app_imessage"] as IMessageState | undefined)
      ?.conversations?.["c1"];
    expect(conv?.messages.length).toBe(1);
    expect(conv?.messages[0].text).toBe("Hello");
  });

  it("MESSAGE_RECEIVE increments unread count", () => {
    const state = createTestWorldState();
    const nextState = runReducer(state, {
      at: 0,
      kind: "APP",
      deviceId: "phone",
      appId: "app_imessage",
      type: "IMESSAGE_MESSAGE_RECEIVE",
      payload: { conversationId: "c1", from: "Alex", text: "Yo" },
    });

    const conv = (nextState.appInstances?.["phone:app_imessage"] as IMessageState | undefined)
      ?.conversations?.["c1"];
    expect(conv?.unreadCount).toBe(1);
  });

  it("TAPBACK_ADD attaches reaction", () => {
    const state = createTestWorldState();
    const withMessage = runReducer(state, {
      at: 0,
      kind: "APP",
      deviceId: "phone",
      appId: "app_imessage",
      type: "IMESSAGE_MESSAGE_SEND",
      payload: { conversationId: "c1", text: "Hello", messageId: "m1" },
    });

    const reacted = runReducer(withMessage, {
      at: 1,
      kind: "APP",
      deviceId: "phone",
      appId: "app_imessage",
      type: "IMESSAGE_TAPBACK_ADD",
      payload: { conversationId: "c1", messageId: "m1", type: "heart" },
    });

    const conv = (reacted.appInstances?.["phone:app_imessage"] as IMessageState | undefined)
      ?.conversations?.["c1"];

    const msg = conv?.messages[0];
    expect(msg?.tapbacks.length).toBe(1);
  });

  it("records the authored frame for screen effects", () => {
    const nextState = runReducer(createTestWorldState(), {
      at: 123,
      kind: "APP",
      deviceId: "phone",
      appId: "app_imessage",
      type: "IMESSAGE_SCREEN_EFFECT",
      payload: { effect: "confetti" },
    });

    const appState = nextState.appInstances?.["phone:app_imessage"] as IMessageState | undefined;
    expect(appState?.activeScreenEffect).toBe("confetti");
    expect(appState?.activeScreenEffectStartedAtFrame).toBe(123);
  });
});
