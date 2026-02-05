import { describe, it, expect } from "vitest";
import { produce } from "immer";
import type { WorldState, RuntimeEvent } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE, DEFAULT_BASE_CAMERA_STATE } from "@tokovo/core";
import { whatsappReducer, createWhatsAppInitialState } from "../runtime";

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
});
