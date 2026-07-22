import { describe, it, expect } from "vitest";
import type { LayoutContext, WorldState } from "@tokovo/core";
import { DEFAULT_AUDIO_STATE } from "@tokovo/core";
import { computeChatLayout, computeFeedLayout } from "../layout/index.js";
import { createWhatsAppInitialState } from "../runtime/initial-state.js";
import { WhatsAppCinematicSubjects } from "../camera/subjects.js";
import { getChatChromeGeometry } from "../config/layout-config.js";

function computeForScreen(
  currentScreen: string,
  conversations?: Record<string, unknown>,
  statePatch?: Record<string, unknown>,
) {
  const appState = {
    ...createWhatsAppInitialState(),
    currentScreen,
    viewMode: "FEED" as const,
    conversations,
    ...statePatch,
  };
  const world = {
    appState: { app_whatsapp: appState },
    devices: {},
    audio: DEFAULT_AUDIO_STATE,
  } as WorldState;

  const ctx: LayoutContext = {
    world,
    t: 0,
    activeDeviceId: "d1",
    activeAppId: "app_whatsapp",
    viewKind: "FEED",
    viewportWidth: 393,
    viewportHeight: 852,
    safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 },
    layoutCache: undefined,
  };

  return computeFeedLayout(ctx) as any;
}

function expectHas(layout: any, ids: string[]) {
  expect(layout.semantic?.regions).toBeTruthy();
  for (const id of ids) {
    expect(layout.semantic.regions[id], `missing region ${id}`).toBeTruthy();
  }
}

describe("WhatsApp semantic subjects (FEED)", () => {
  it("chats includes expected subjects", () => {
    const layout = computeForScreen("chats");
    expectHas(layout, [
      "device",
      "app",
      "tab_bar",
      "chat_list_header",
      "chat_list",
    ]);
  });

  it("updates includes expected subjects", () => {
    const layout = computeForScreen("updates");
    expectHas(layout, [
      "device",
      "app",
      "tab_bar",
      "updates_header",
      "updates_status_strip",
      "updates_channels",
      "updates_list",
    ]);
  });

  it("updates exposes channel and status row subjects", () => {
    const layout = computeForScreen(
      "updates",
      {},
      {
        statuses: [
          {
            id: "status_naina_1",
            authorId: "dm_naina",
            authorName: "Naina",
            postedAt: 1,
            media: { type: "text", text: "Hello" },
          },
        ],
        channels: [
          {
            id: "channel_bakery",
            name: "Bakery",
            description: "Fresh bread",
            followersLabel: "12K followers",
            followed: true,
            unreadCount: 1,
          },
        ],
      },
    );
    expectHas(layout, [
      "updates_status_dm_naina",
      "channel_row_channel_bakery",
    ]);
  });

  it("chats exposes per-row subjects", () => {
    const layout = computeForScreen("chats", {
      dm_naina: { id: "dm_naina", name: "Naina", messages: [] },
    });
    expectHas(layout, [
      "chat_row_dm_naina",
      "chat_row_dm_naina_avatar",
      "chat_row_dm_naina_title",
      "chat_row_dm_naina_preview",
    ]);
  });

  it("calls includes expected subjects", () => {
    const layout = computeForScreen(
      "calls",
      {},
      {
        callLog: [
          {
            id: "call_naina",
            name: "Naina",
            direction: "incoming",
            mode: "voice",
            startedAt: 100,
          },
        ],
      },
    );
    expectHas(layout, [
      "device",
      "app",
      "tab_bar",
      "calls_header",
      "calls_list",
      "calls_link",
      "call_row_call_naina",
    ]);
  });

  it("communities includes expected subjects", () => {
    const layout = computeForScreen(
      "communities",
      {},
      {
        communities: [
          {
            id: "community_builders",
            name: "Builders",
            groupConversationIds: [],
          },
        ],
      },
    );
    expectHas(layout, [
      "device",
      "app",
      "tab_bar",
      "communities_header",
      "communities_list",
      "communities_new",
      "community_community_builders",
    ]);
  });

  it("settings exposes stable section and row subjects", () => {
    const layout = computeForScreen("settings");
    expectHas(layout, [
      "settings_header",
      "settings_list",
      "settings_search",
      "settings_profile",
      "settings_account",
      "settings_privacy",
      "settings_notifications",
      "settings_linked_devices",
    ]);
  });

  it("profile distinguishes direct-message and group information subjects", () => {
    const direct = computeForScreen(
      "profile",
      { dm_naina: { id: "dm_naina", type: "dm", messages: [] } },
      { conversationId: "dm_naina" },
    );
    expectHas(direct, [
      "profile_header",
      "profile_content",
      "profile_hero",
      "profile_actions",
    ]);

    const group = computeForScreen(
      "profile",
      {
        group_builders: {
          id: "group_builders",
          type: "group",
          messages: [],
          members: [{ id: "naina", name: "Naina" }],
        },
      },
      {
        conversationId: "group_builders",
      },
    );
    expectHas(group, [
      "group_info_header",
      "group_info_content",
      "group_info_hero",
      "group_info_actions",
      "group_info_members",
      "group_member_naina",
    ]);
  });
});

describe("WhatsApp semantic subjects (CHAT)", () => {
  it("projects the same system, reply, reaction, and message IDs as the UI", () => {
    const world = {
      appState: {
        app_whatsapp: {
          ...createWhatsAppInitialState(),
          currentScreen: "chat",
          conversationId: "room",
          conversations: {
            room: {
              id: "room",
              type: "group",
              unreadCount: 1,
              messages: [
                {
                  id: "m1",
                  from: "ava",
                  type: "text",
                  text: "First",
                  at: 0,
                },
                {
                  id: "m2",
                  from: "noor",
                  type: "text",
                  text: "Second",
                  at: 30,
                  reactions: [{ emoji: "🔥", count: 1 }],
                },
                {
                  id: "m3",
                  from: "me",
                  type: "text",
                  text: "Reply",
                  at: 60,
                  replyTo: { messageId: "m2" },
                },
              ],
            },
          },
        },
      },
      devices: {
        d1: {
          id: "d1",
          ownerName: "Owner",
          profileId: "iphone16",
          os: { clock: new Date("2026-07-20T10:00:00Z").getTime() },
        },
      },
      config: { fps: 30 },
      audio: DEFAULT_AUDIO_STATE,
    } as unknown as WorldState;
    const layout = computeChatLayout({
      world,
      t: 90,
      activeDeviceId: "d1",
      activeAppId: "app_whatsapp",
      activeConversationId: "room",
      viewKind: "CHAT",
      viewportWidth: 393,
      viewportHeight: 852,
      safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 },
    });

    expect(layout.semantic?.groups.message).toEqual(
      expect.arrayContaining(["m1", "m2", "m3"]),
    );
    expect(layout.semantic?.groups.system).toHaveLength(2);
    expect(layout.semantic?.groups.reply).toEqual(["reply_m3"]);
    expect(layout.semantic?.groups.reactions).toEqual(["reactions_m2"]);
    expect(layout.semantic?.regions["room:system:unread:m2"]).toBeTruthy();

    const subjects = WhatsAppCinematicSubjects.project(world, layout, "d1");
    const m1 = subjects.find(
      (subject) =>
        subject.ref.kind === "entity" && subject.ref.entityId === "m1",
    );
    const m3 = subjects.find(
      (subject) =>
        subject.ref.kind === "entity" && subject.ref.entityId === "m3",
    );
    const lastMessage = subjects.find(
      (subject) =>
        subject.ref.kind === "semantic" &&
        subject.ref.subjectId === "last-message",
    );
    expect(m1).toBeTruthy();
    expect(lastMessage?.rect).toEqual(m3?.rect);
    expect(
      subjects.some(
        (subject) =>
          subject.ref.kind === "semantic" &&
          ["message-0", "message_thread", "inputArea"].includes(
            subject.ref.subjectId,
          ),
      ),
    ).toBe(false);
  });

  it("exposes authored interaction overlays without DOM geometry", () => {
    const state = {
      ...createWhatsAppInitialState(),
      currentScreen: "chat" as const,
      conversationId: "room",
      replyComposer: { conversationId: "room", messageId: "m1" },
      activeGesture: {
        conversationId: "room",
        messageId: "m1",
        gesture: "long_press" as const,
        phase: "completed" as const,
        progress: 1,
      },
      mediaViewer: {
        conversationId: "room",
        messageId: "m1",
        openedAt: 30,
      },
      statusViewer: {
        statusId: "status-1",
        authorId: "ava",
        openedAt: 45,
      },
      statuses: [
        {
          id: "status-1",
          authorId: "ava",
          authorName: "Ava",
          postedAt: 1,
          media: { type: "text" as const, text: "Ready" },
        },
      ],
      conversations: {
        room: {
          id: "room",
          name: "Room",
          messages: [{ id: "m1", from: "ava", type: "image" as const, at: 0 }],
        },
      },
    };
    const world = {
      appState: { app_whatsapp: state },
      devices: {
        d1: {
          id: "d1",
          ownerName: "Owner",
          profileId: "iphone16",
          screenDimensions: { width: 393, height: 852 },
        },
      },
      config: { fps: 30 },
      audio: DEFAULT_AUDIO_STATE,
    } as unknown as WorldState;
    const layout = computeChatLayout({
      world,
      t: 90,
      activeDeviceId: "d1",
      activeAppId: "app_whatsapp",
      activeConversationId: "room",
      viewKind: "CHAT",
      viewportWidth: 393,
      viewportHeight: 852,
      safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 },
    });

    expect(layout.semantic?.regions.reply_composer).toBeTruthy();
    expect(layout.semantic?.regions.message_actions).toBeTruthy();

    const subjects = WhatsAppCinematicSubjects.project(world, layout, "d1");
    const semanticIds = subjects.flatMap((subject) =>
      subject.ref.kind === "semantic" ? [subject.ref.subjectId] : [],
    );
    expect(semanticIds).toContain("reply_composer");
    expect(semanticIds).toContain("message_actions");
  });

  it("publishes bottom-aligned viewport coordinates rather than raw thread coordinates", () => {
    const state = {
      ...createWhatsAppInitialState(),
      currentScreen: "chat" as const,
      conversationId: "room",
      conversations: {
        room: {
          id: "room",
          name: "Room",
          messages: [
            {
              id: "m1",
              from: "ava",
              type: "text" as const,
              text: "First",
              at: 0,
            },
            {
              id: "m2",
              from: "me",
              type: "text" as const,
              text: "Last",
              at: 0,
            },
          ],
        },
      },
    };
    const world = {
      appState: { app_whatsapp: state },
      devices: { d1: { id: "d1", ownerName: "Owner", profileId: "phone" } },
      config: { fps: 30 },
      audio: DEFAULT_AUDIO_STATE,
    } as unknown as WorldState;
    const viewportHeight = 852;
    const safeAreaInsets = { top: 47, bottom: 34, left: 0, right: 0 };
    const layout = computeChatLayout({
      world,
      t: 0,
      activeDeviceId: "d1",
      activeAppId: "app_whatsapp",
      activeConversationId: "room",
      viewKind: "CHAT",
      viewportWidth: 393,
      viewportHeight,
      safeAreaInsets,
    });

    const last = layout.semantic?.regions.m2?.rect;
    const chrome = getChatChromeGeometry(safeAreaInsets);
    expect(last).toBeTruthy();
    expect((last?.y ?? 0) + (last?.height ?? 0)).toBe(
      viewportHeight - chrome.messageBottomInset,
    );
    expect(layout.semantic?.regions.input_area?.rect.y).toBe(
      viewportHeight - 60 - safeAreaInsets.bottom,
    );
    expect(layout.messageLayouts.m2?.rect).toEqual(last);
  });

  it("only publishes subjects for the same bounded window mounted by the UI", () => {
    const messages = Array.from({ length: 180 }, (_, index) => ({
      id: `m${index + 1}`,
      from: index % 2 === 0 ? "ava" : "me",
      type: "text" as const,
      text: `Message ${index + 1}`,
      at: 0,
    }));
    const state = {
      ...createWhatsAppInitialState(),
      currentScreen: "chat" as const,
      conversationId: "room",
      conversations: {
        room: { id: "room", name: "Room", messages },
      },
    };
    const world = {
      appState: { app_whatsapp: state },
      devices: { d1: { id: "d1", ownerName: "Owner", profileId: "phone" } },
      config: { fps: 30 },
      audio: DEFAULT_AUDIO_STATE,
    } as unknown as WorldState;
    const context: LayoutContext = {
      world,
      t: 0,
      activeDeviceId: "d1",
      activeAppId: "app_whatsapp",
      activeConversationId: "room",
      viewKind: "CHAT",
      viewportWidth: 393,
      viewportHeight: 852,
      safeAreaInsets: { top: 47, bottom: 34, left: 0, right: 0 },
    };

    const latest = computeChatLayout(context);
    expect(latest.semantic?.regions.m1).toBeUndefined();
    expect(latest.semantic?.regions.m180).toBeTruthy();

    state.threadViewport = {
      conversationId: "room",
      focusMessageId: "m20",
      reason: "message" as const,
    };
    const subjected = computeChatLayout(context);
    expect(subjected.semantic?.regions.m20).toBeTruthy();
    expect(subjected.semantic?.regions.m180).toBeUndefined();
    expect(Object.keys(subjected.messageLayouts).length).toBeLessThanOrEqual(
      120,
    );
  });
});
