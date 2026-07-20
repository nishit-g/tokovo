import { describe, expect, it } from "vitest";
import {
  resolveParticipantName,
  resolveReplyPreview,
  resolveTypingMembers,
} from "../utils/participants.js";
import type { WhatsAppConversation } from "../types/index.js";

describe("participant normalization", () => {
  it("uses stable dm participant IDs and filters the local actor", () => {
    const conversation: WhatsAppConversation = {
      id: "dm_kabir",
      type: "dm",
      name: "Kabir",
      members: [{ id: "kabir", name: "Kabir" }],
      messages: [],
      typing: { kabir: true, me: true },
    };

    expect(resolveParticipantName(conversation, "kabir")).toBe("Kabir");
    expect(resolveTypingMembers(conversation)).toEqual([
      { id: "kabir", name: "Kabir" },
    ]);
    expect(
      resolveReplyPreview(conversation, {
        messageId: "m1",
        text: "bhai uth",
        from: "kabir",
      }),
    ).toMatchObject({ from: "Kabir" });
  });

  it("uses group member names for typing and reply previews", () => {
    const conversation: WhatsAppConversation = {
      id: "grp",
      type: "group",
      name: "Hostel chat",
      members: [
        { id: "alice", name: "Alice" },
        { id: "bob", name: "Bob" },
      ],
      messages: [],
      typing: { alice: true, bob: true, me: true },
    };

    expect(resolveParticipantName(conversation, "alice")).toBe("Alice");
    expect(resolveTypingMembers(conversation)).toEqual([
      { id: "alice", name: "Alice" },
      { id: "bob", name: "Bob" },
    ]);
    expect(
      resolveReplyPreview(conversation, {
        messageId: "m2",
        text: "aa raha hu",
        from: "bob",
      }),
    ).toMatchObject({ from: "Bob" });
  });
});
