import { describe, expect, it } from "vitest";
import {
  hydrateInstagramState,
  validateInstagramBootstrap,
} from "../bootstrap.js";

describe("instagram bootstrap", () => {
  it("rejects invalid references in snapshot", () => {
    const result = validateInstagramBootstrap({
      users: [{ id: "u1", username: "mira", displayName: "Mira" }],
      posts: [{ id: "p1", authorId: "missing", imageUrl: "/x.png", caption: "hello" }],
    });

    expect(result.errors[0]).toContain("unknown user");
  });

  it("hydrates story sets and threads into normalized state", () => {
    const state = hydrateInstagramState(
      {
        currentUserId: "u1",
        users: [{ id: "u1", username: "mira", displayName: "Mira" }],
        storySets: [
          {
            id: "set1",
            userId: "u1",
            items: [{ id: "story1", authorId: "u1", mediaUrl: "/story.png" }],
          },
        ],
        threads: [{ id: "t1", participantIds: ["u1"] }],
        messages: [{ id: "m1", threadId: "t1", senderId: "u1", text: "hello" }],
      },
      { screen: "story", storySetId: "set1", storyId: "story1" },
    );

    expect(state.storySets).toHaveLength(1);
    expect(state.stories).toHaveLength(1);
    expect(state.dmThreads[0]?.messageIds).toEqual(["m1"]);
    expect(state.currentScreen).toBe("story");
  });
});
