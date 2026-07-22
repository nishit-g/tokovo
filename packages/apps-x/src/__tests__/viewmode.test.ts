import { describe, expect, it } from "vitest";
import { requireXState } from "../runtime/selectors.js";
import { appEvent, createTestWorld, reduce } from "./helpers.js";

describe("X VNext view mode invariant", () => {
  it.each([
    [{ screen: "timeline" }, "FEED", undefined],
    [{ screen: "compose" }, "FULLSCREEN", undefined],
    [{ screen: "thread", threadId: "dm_1" }, "CHAT", "dm_1"],
    [{ screen: "tweet", tweetId: "tw_1" }, "FEED", undefined],
    [{ screen: "profile", userId: "u_other" }, "FEED", undefined],
  ] as const)("maps route %o to %s", (route, viewMode, conversationId) => {
    const next = reduce(createTestWorld(), appEvent("SET_SCREEN", route));
    const state = requireXState(next, "phone");
    expect(state.viewMode).toBe(viewMode);
    expect(state.conversationId).toBe(conversationId);
  });
});
