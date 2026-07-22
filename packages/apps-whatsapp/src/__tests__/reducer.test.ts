import { describe, it, expect } from "vitest";
import { produce } from "immer";
import type { WorldState, RuntimeEvent } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE } from "@tokovo/core";
import {
  whatsappReducer,
  createWhatsAppInitialState,
} from "../runtime/index.js";
import { getBaseTime } from "../utils/messages.js";
import { projectWhatsAppThread } from "../thread/projector.js";
import type { WhatsAppConversation, WhatsAppMessage } from "../types/index.js";

function projectChat(
  world: WorldState,
  conversationId: string,
  messages: WhatsAppMessage[],
  deviceId?: string,
  conversation?: WhatsAppConversation,
) {
  return projectWhatsAppThread({
    conversationId,
    messages,
    conversation,
    baseTime: getBaseTime(world, deviceId),
    fps: world.config?.fps ?? 30,
    locale: "en-US",
  });
}

function createTestWorldState(): WorldState {
  const appState = createWhatsAppInitialState();
  appState.conversations.dm_test = { id: "dm_test", messages: [] };
  return {
    appState: {
      app_whatsapp: appState,
    },
    devices: {},
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;
}

function runReducer(state: WorldState, event: RuntimeEvent): WorldState {
  return produce(state, (draft) => {
    whatsappReducer(draft, event as any);
  });
}

describe("WhatsApp reducer", () => {
  it("derives event timestamps from authored device time without accelerated drift", () => {
    const state = createTestWorldState();
    const clock = new Date("2026-04-10T20:15:00Z").getTime();
    state.devices = {
      phone: {
        id: "phone",
        os: { clock },
      },
    } as any;
    state.config = { fps: 30 } as any;

    const next = runReducer(state, {
      at: 90,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_RECEIVED",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        text: "Three seconds later",
      },
    });

    const message = (next.appState as any).app_whatsapp.conversations.dm_test
      .messages[0];
    expect(message.timestamp).toBe("20:15");
    expect(message.timestampMs).toBe(clock + 3_000);
    expect(
      (next.appState as any).app_whatsapp.conversations.dm_test.lastMessageAt,
    ).toBe(clock + 3_000);
  });

  it("accepts the canonical contact payload", () => {
    const state = createTestWorldState();
    const next = runReducer(state, {
      at: 0,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "CONTACT_RECEIVED",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        contactName: "Sam Lee",
        contactPhone: "+1 555-0101",
        contactAvatarUrl: "/avatars/sam.jpg",
      },
    });

    const conv = (next.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.messages).toHaveLength(1);
    expect(conv.messages[0].contactName).toBe("Sam Lee");
    expect(conv.messages[0].contactPhone).toBe("+1 555-0101");
    expect(conv.messages[0].contactAvatarUrl).toBe("/avatars/sam.jpg");
  });

  it("accepts the canonical location payload", () => {
    const state = createTestWorldState();
    const next = runReducer(state, {
      at: 10,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "LOCATION_RECEIVED",
      payload: {
        conversationId: "dm_test",
        from: "alex",
        latitude: 37.7749,
        longitude: -122.4194,
        locationName: "San Francisco",
        locationAddress: "California, USA",
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
      payload: {
        conversationId: "dm_test",
      },
    });

    const conv = (opened.appState as any).app_whatsapp.conversations.dm_test;
    expect(conv.unreadCount).toBe(0);
    expect(conv.unreadDividerMessageId).toBe(conv.messages[0].id);

    const thread = projectChat(
      opened,
      "dm_test",
      conv.messages,
      undefined,
      conv,
    );

    expect(
      thread.blocks.some(
        (block) =>
          block.kind === "system" &&
          block.message.systemType === "unread_divider",
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
      payload: {
        conversationId: "dm_test",
        from: "alex",
        text: "Original message",
        messageId: "original-message",
      },
    });

    const replied = runReducer(withIncoming, {
      at: 20,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_SENT",
      payload: {
        conversationId: "dm_test",
        text: "Reply message",
        replyTo: { messageId: "original-message" },
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

  it("models deterministic outgoing delivery failure and retry", () => {
    const sent = runReducer(createTestWorldState(), {
      at: 10,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_SENT",
      payload: {
        conversationId: "dm_test",
        text: "Upload the final cut",
        messageId: "retry-me",
      },
    });
    const failed = runReducer(sent, {
      at: 20,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_DELIVERY_FAILED",
      payload: {
        conversationId: "dm_test",
        messageId: "retry-me",
        failureReason: "offline",
      },
    });
    const retrying = runReducer(failed, {
      at: 30,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_RETRY_STARTED",
      payload: { conversationId: "dm_test", messageId: "retry-me" },
    });
    const completed = runReducer(retrying, {
      at: 40,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_RETRY_COMPLETED",
      payload: { conversationId: "dm_test", messageId: "retry-me" },
    });

    const message = (completed.appState as any).app_whatsapp.conversations
      .dm_test.messages[0];
    expect(message).toMatchObject({
      status: "sent",
      retryCount: 1,
      lastRetryAt: 30,
      deliveredAt: 58,
    });
    expect(message.failureReason).toBeUndefined();
  });

  it("opens, advances, and closes authored status playback while marking views", () => {
    const state = createTestWorldState();
    const whatsapp = (state.appState as any).app_whatsapp;
    whatsapp.statuses = [
      {
        id: "status-one",
        authorId: "ava",
        authorName: "Ava",
        postedAt: 10,
        media: { type: "text", text: "First" },
      },
      {
        id: "status-two",
        authorId: "ava",
        authorName: "Ava",
        postedAt: 20,
        media: { type: "text", text: "Second" },
      },
    ];

    const opened = runReducer(state, {
      at: 30,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "STATUS_VIEWER_OPENED",
      payload: { statusId: "status-one" },
    });
    expect((opened.appState as any).app_whatsapp.statusViewer).toEqual({
      statusId: "status-one",
      authorId: "ava",
      openedAt: 30,
    });
    expect((opened.appState as any).app_whatsapp.statuses[0].viewed).toBe(true);

    const advanced = runReducer(opened, {
      at: 60,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "STATUS_VIEWER_ADVANCED",
      payload: { direction: "next" },
    });
    expect((advanced.appState as any).app_whatsapp.statusViewer).toMatchObject({
      statusId: "status-two",
      openedAt: 60,
    });
    expect((advanced.appState as any).app_whatsapp.statuses[1].viewed).toBe(
      true,
    );

    const closed = runReducer(advanced, {
      at: 90,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "STATUS_VIEWER_CLOSED",
      payload: {},
    });
    expect((closed.appState as any).app_whatsapp.statusViewer).toBeNull();
  });

  it("auto-inserts Today and Yesterday separators for chat timelines", () => {
    const state = createTestWorldState();
    state.devices = {
      phone: {
        id: "phone",
        os: {
          clock: new Date("2025-02-02T18:45:00Z").getTime(),
        },
      },
    } as any;
    state.config = { fps: 30 } as any;

    const thread = projectChat(
      state,
      "dm_test",
      [
        {
          id: "yesterday",
          from: "alex",
          type: "text",
          text: "Yesterday text",
          timestampMs: new Date("2025-02-01T18:45:00Z").getTime(),
        },
        {
          id: "today",
          from: "alex",
          type: "text",
          text: "Today text",
          timestampMs: new Date("2025-02-02T17:45:00Z").getTime(),
        },
      ],
      "phone",
    );

    expect(
      thread.blocks
        .filter(
          (block) =>
            block.kind === "system" &&
            block.message.systemType === "date_change",
        )
        .map((block) =>
          block.kind === "system" ? block.message.text : undefined,
        ),
    ).toEqual(["Yesterday", "Today"]);
  });
});
