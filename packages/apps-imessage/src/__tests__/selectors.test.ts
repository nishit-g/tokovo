import { describe, it, expect } from "vitest";
import type { WorldState } from "@tokovo/core";
import { createDefaultAudioState } from "@tokovo/core";
import { createIMessageInitialState } from "../runtime/initial-state.js";
import type { IMessageState } from "../types/index.js";
import { selectActiveConversation } from "../runtime/selectors.js";

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

describe("iMessage selectors", () => {
  it("selectActiveConversation returns active conversation", () => {
    const state = createTestWorldState();
    if (!state.appInstances?.["phone:app_imessage"]) {
      throw new Error("Missing iMessage state in test world");
    }
    (state.appInstances["phone:app_imessage"] as IMessageState).conversations = {
      c1: {
        id: "c1",
        transport: "imessage",
        participants: [],
        messages: [],
        typing: {},
        unreadCount: 0,
      },
    } as any;
    (state.appInstances["phone:app_imessage"] as IMessageState).activeConversationId = "c1";

    const conv = selectActiveConversation(state, "phone");
    expect(conv?.id).toBe("c1");
  });
});
