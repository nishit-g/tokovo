import { describe, it, expect } from "vitest";
import { iMessageReducer } from "../runtime/reducer";
import { createIMessageInitialState } from "../runtime/initial-state";
import type { IMessageState } from "../types";
import type { WorldState, RuntimeEvent } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";

function createTestWorldState(): WorldState {
  return {
    appState: {
      app_imessage: createIMessageInitialState(),
    },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
  const draft = JSON.parse(JSON.stringify(state)) as WorldState;
  iMessageReducer(draft, event as any);
  return draft;
}

describe("iMessage Reducer", () => {
  it("MESSAGE_SEND adds outgoing message", () => {
    const state = createTestWorldState();
    const nextState = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_MESSAGE_SEND",
      payload: { conversationId: "c1", text: "Hello" },
    });

    const conv = (nextState.appState?.app_imessage as IMessageState | undefined)
      ?.conversations?.["c1"];
    expect(conv?.messages.length).toBe(1);
    expect(conv?.messages[0].text).toBe("Hello");
  });

  it("MESSAGE_RECEIVE increments unread count", () => {
    const state = createTestWorldState();
    const nextState = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_MESSAGE_RECEIVE",
      payload: { conversationId: "c1", from: "Alex", text: "Yo" },
    });

    const conv = (nextState.appState?.app_imessage as IMessageState | undefined)
      ?.conversations?.["c1"];
    expect(conv?.unreadCount).toBe(1);
  });

  it("TAPBACK_ADD attaches reaction", () => {
    const state = createTestWorldState();
    const withMessage = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_MESSAGE_SEND",
      payload: { conversationId: "c1", text: "Hello", messageId: "m1" },
    });

    const reacted = runReducer(withMessage, {
      at: 1,
      kind: "APP",
      appId: "app_imessage",
      type: "IMESSAGE_TAPBACK_ADD",
      payload: { conversationId: "c1", messageId: "m1", type: "heart" },
    });

    const conv = (reacted.appState?.app_imessage as IMessageState | undefined)?.conversations?.["c1"];

    const msg = conv?.messages[0];
    expect(msg?.tapbacks.length).toBe(1);
  });
});
