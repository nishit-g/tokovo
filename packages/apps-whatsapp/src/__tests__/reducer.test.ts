import { describe, it, expect } from "vitest";
import { produce } from "immer";
import type { WorldState, RuntimeEvent } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { whatsappReducer, createWhatsAppInitialState } from "../runtime/index.js";
import { normalizeMessagesForChat } from "../utils/messages.js";

function createTestWorldState(): WorldState {
  return {
    appState: {
      app_whatsapp: createWhatsAppInitialState(),
    },
    devices: {},
    camera: DEFAULT_BASE_CAMERA_STATE,
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
  return produce(state, (draft) => {
    whatsappReducer(draft, event as any);
  });
}

describe("WhatsApp Reducer (compat)", () => {
  it("normalizes legacy contact payload fields", () => {
    const state = createTestWorldState();
    const next = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "CONTACT_RECEIVED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        name: "Sam Lee",
        phone: "+1 555-0101",
        avatar: "/avatars/sam.jpg",
      },
    });

    const conv = (next.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.messages).toHaveLength(1);
    expect(conv.messages[0].contactName).toBe("Sam Lee");
    expect(conv.messages[0].contactPhone).toBe("+1 555-0101");
    expect(conv.messages[0].contactAvatarUrl).toBe("/avatars/sam.jpg");
  });

  it("normalizes legacy location payload fields", () => {
    const state = createTestWorldState();
    const next = runReducer(state, {
      at: 10,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "LOCATION_RECEIVED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        lat: 37.7749,
        lng: -122.4194,
        name: "San Francisco",
        address: "California, USA",
      },
    });

    const conv = (next.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.messages).toHaveLength(1);
    expect(conv.messages[0].latitude).toBe(37.7749);
    expect(conv.messages[0].longitude).toBe(-122.4194);
    expect(conv.messages[0].locationName).toBe("San Francisco");
    expect(conv.messages[0].locationAddress).toBe("California, USA");
  });

  it("formats document file sizes consistently", () => {
    const state = createTestWorldState();
    const next = runReducer(state, {
      at: 20,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "DOCUMENT_RECEIVED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        fileName: "Specs.pdf",
        fileSize: "2.3 MB",
        url: "/docs/specs.pdf",
      },
    });

    const conv = (next.appState as any).app_whatsapp.conversations.dm_test;
    const fileSize = conv.messages[0].fileSize;
    expect(typeof fileSize).toBe("string");
    expect(fileSize).toMatch(/MB|KB|B/);
    expect(conv.messages[0].fileType).toBe("pdf");
  });

  it("increments unread count on received messages", () => {
    const state = createTestWorldState();
    const next = runReducer(state, {
      at: 30,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_RECEIVED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        text: "Ping",
      },
    });

    const conv = (next.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.unreadCount).toBe(1);
  });

  it("clears unread count when a conversation is opened", () => {
    const state = createTestWorldState();
    const withUnread = runReducer(state, {
      at: 30,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_RECEIVED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        text: "Ping",
      },
    });

    const opened = runReducer(withUnread, {
      at: 31,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "CONVERSATION_OPENED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
      },
    });

    const conv = (opened.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.unreadCount).toBe(0);
  });

  it("preserves an unread divider marker when opening a chat with unread history", () => {
    const state = createTestWorldState();
    const withUnread = runReducer(
      runReducer(state, {
        at: 10,
        kind: "APP",
        appId: "app_whatsapp",
        deviceId: "phone",
        type: "MESSAGE_RECEIVED",
        conversationId: "dm_test",
        payload: {
          conversationId: "dm_test",
          from: "alex",
          text: "First unread",
        },
      }),
      {
        at: 20,
        kind: "APP",
        appId: "app_whatsapp",
        deviceId: "phone",
        type: "MESSAGE_RECEIVED",
        conversationId: "dm_test",
        payload: {
          conversationId: "dm_test",
          from: "alex",
          text: "Second unread",
        },
      },
    );

    const opened = runReducer(withUnread, {
      at: 21,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "CONVERSATION_OPENED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
      },
    });

    const conv = (opened.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.unreadCount).toBe(0);
    expect(conv.unreadDividerMessageId).toBe(conv.messages[0].id);

    const timeline = normalizeMessagesForChat(
      opened,
      "dm_test",
      conv.messages,
      undefined,
      conv,
    );

    expect(
      timeline.some(
        (msg) =>
          msg.type === "system" && msg.systemType === "unread_divider",
      ),
    ).toBe(true);
  });

  it("resolves quoted replies from message references", () => {
    const state = createTestWorldState();
    const withIncoming = runReducer(state, {
      at: 10,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_RECEIVED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        text: "Original message",
      },
    });

    const replied = runReducer(withIncoming, {
      at: 20,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_SENT",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        text: "Reply message",
        replyTo: { index: -1 },
      },
    });

    const conv = (replied.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.messages[1].replyTo).toMatchObject({
      text: "Original message",
      from: "alex",
      type: "text",
    });
  });

  it("marks prior outgoing messages as read when the other side replies", () => {
    const state = createTestWorldState();
    const withOutgoing = runReducer(state, {
      at: 10,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_SENT",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        text: "You there?",
      },
    });

    const withReply = runReducer(withOutgoing, {
      at: 40,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_RECEIVED",
      conversationId: "dm_test",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        text: "haan bol",
      },
    });

    const conv = (withReply.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.messages[0].status).toBe("read");
    expect(conv.messages[0].readAt).toBe(40);
  });

  it("auto-inserts Today and Yesterday separators for chat timelines", () => {
    const state = createTestWorldState();
    state.devices = {
      phone: {
        id: "phone",
        os: {
          clock: new Date("2025-02-02T18:45:00").getTime(),
        },
      },
    } as any;
    state.config = { fps: 30 } as any;

    const timeline = normalizeMessagesForChat(
      state,
      "dm_test",
      [
        { from: "alex", text: "Yesterday text", timestamp: -86400 },
        { from: "alex", text: "Today text", timestamp: -3600 },
      ],
      "phone",
    );

    expect(
      timeline
        .filter((msg) => msg.type === "system" && msg.systemType === "date_change")
        .map((msg) => msg.text),
    ).toEqual(["Yesterday", "Today"]);
  });
});
