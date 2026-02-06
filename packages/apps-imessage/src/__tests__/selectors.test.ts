import { describe, it, expect } from "vitest";
import type { WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { createIMessageInitialState } from "../runtime/initial-state";
import type { IMessageState } from "../types";
import { selectActiveConversation } from "../runtime/selectors";

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

describe("iMessage selectors", () => {
  it("selectActiveConversation returns active conversation", () => {
    const state = createTestWorldState();
    if (!state.appState?.app_imessage) {
      throw new Error("Missing iMessage state in test world");
    }
    (state.appState.app_imessage as IMessageState).conversations = {
      c1: {
        id: "c1",
        transport: "imessage",
        participants: [],
        messages: [],
        typing: {},
        unreadCount: 0,
      },
    } as any;
    (state.appState.app_imessage as IMessageState).activeConversationId = "c1";

    const conv = selectActiveConversation(state);
    expect(conv?.id).toBe("c1");
  });
});
