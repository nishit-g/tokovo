import { describe, expect, it } from "vitest";

import { whatsappBootstrap, type WhatsAppSnapshot } from "../bootstrap.js";

function validateSnapshot(snapshot: unknown): string[] {
  return (
    whatsappBootstrap.snapshot?.validate?.({
      appId: "app_whatsapp",
      version: 1,
      value: snapshot,
      context: {} as never,
    }).errors ?? []
  );
}

function validSnapshot(): WhatsAppSnapshot {
  return {
    conversations: [
      {
        id: "room",
        type: "group",
        messages: [
          { id: "text", from: "me", type: "text", text: "Hello" },
          {
            id: "poll",
            from: "ava",
            type: "poll",
            pollQuestion: "Ship it?",
            options: [{ text: "Yes" }, { text: "Also yes" }],
          },
          {
            id: "document",
            from: "ava",
            type: "document",
            fileName: "release-notes.pdf",
            fileSize: 2_400_000,
          },
        ],
      },
    ],
    statuses: [
      {
        id: "status",
        authorId: "ava",
        authorName: "Ava",
        postedAt: 1,
        media: { type: "text", text: "Ready" },
      },
    ],
    channels: [
      {
        id: "channel",
        name: "Build room",
        description: "Release notes",
        followersLabel: "120 followers",
        followed: true,
        unreadCount: 0,
      },
    ],
    callLog: [
      {
        id: "call",
        conversationId: "room",
        name: "Ava",
        direction: "incoming",
        mode: "voice",
        startedAt: 1,
      },
    ],
    communities: [
      {
        id: "community",
        name: "Creators",
        groupConversationIds: ["room"],
      },
    ],
  };
}

describe("WhatsApp strict bootstrap", () => {
  it("accepts a structurally complete snapshot", () => {
    expect(validateSnapshot(validSnapshot())).toEqual([]);
  });

  it("rejects malformed message-specific payloads and authored dates", () => {
    const snapshot = validSnapshot();
    snapshot.conversations[0].messages = [
      { id: "empty", from: "me", type: "text" },
      {
        id: "poll",
        from: "me",
        type: "poll",
        pollQuestion: "Only one?",
        options: [{ text: "Yes" }],
      },
      {
        id: "location",
        from: "me",
        type: "location",
        latitude: 120,
        longitude: 400,
      },
      {
        id: "authored-date",
        from: "system",
        type: "system",
        systemType: "date_change",
      },
      {
        id: "document",
        from: "me",
        type: "document",
        fileName: "empty.pdf",
        fileSize: -1,
      },
    ];

    const errors = validateSnapshot(snapshot);
    expect(errors).toContain(
      "snapshot.conversations[0].messages[0].text must be a non-empty string",
    );
    expect(errors).toContain(
      "snapshot.conversations[0].messages[1].options must contain at least two options",
    );
    expect(errors).toContain(
      "snapshot.conversations[0].messages[2].latitude must be between -90 and 90",
    );
    expect(errors).toContain(
      "snapshot.conversations[0].messages[3].systemType must be one of: member_added, member_removed, admin_change, group_created, group_name_changed, encryption_notice, business_notice, safety_code_changed, disappearing_messages, group_description_changed, group_icon_changed, phone_number_changed, pinned_message",
    );
    expect(errors).toContain(
      "snapshot.conversations[0].messages[4].fileSize must be a non-empty string or non-negative byte count",
    );
  });

  it("rejects invalid product entities and dangling references", () => {
    const snapshot = validSnapshot();
    const status = snapshot.statuses?.[0];
    const call = snapshot.callLog?.[0];
    const community = snapshot.communities?.[0];
    if (!status || !call || !community) {
      throw new Error("validSnapshot fixture must include product entities");
    }
    snapshot.statuses[0] = {
      ...status,
      media: { type: "video", src: "", duration: 0 },
    };
    snapshot.callLog[0] = {
      ...call,
      direction: "missed",
      mode: "voice",
      conversationId: "missing",
    };
    community.groupConversationIds = ["missing"];

    expect(validateSnapshot(snapshot)).toEqual(
      expect.arrayContaining([
        "snapshot.statuses[0].media.src must be a non-empty string",
        "snapshot.statuses[0].media.duration must be greater than zero",
      ]),
    );

    const errors =
      whatsappBootstrap.validate?.({
        snapshot: { snapshot },
        initialView: {
          view: { screen: "profile", conversationId: "missing" },
        },
      } as never).errors ?? [];
    expect(errors).toEqual(
      expect.arrayContaining([
        'initial view references unknown WhatsApp conversation "missing"',
        'WhatsApp community "community" references unknown conversation "missing"',
        'WhatsApp call "call" references unknown conversation "missing"',
      ]),
    );
  });
});
