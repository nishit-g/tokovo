import { createDefaultAudioState, type WorldState } from "@tokovo/core";
import { produce } from "immer";
import { describe, expect, it } from "vitest";

import {
  WhatsAppTrackBuilder,
  type WhatsAppSendInputIntent,
} from "../dsl/track-builder.js";
import { whatsappV2Lowering } from "../lowering/v2/handler.js";
import { createWhatsAppInitialState } from "../runtime/initial-state.js";
import { whatsappReducer } from "../runtime/reducer.js";
import { selectAppState } from "../runtime/selectors.js";
import { parseWhatsAppEventStrict } from "../schemas/events.js";

function world(): WorldState {
  const appState = createWhatsAppInitialState();
  appState.conversations.dm = { id: "dm", messages: [] };
  return {
    capabilityState: {},
    devices: {},
    appInstances: { "phone:app_whatsapp": appState },
    audio: createDefaultAudioState(),
  } as WorldState;
}

function reduce(
  state: WorldState,
  event: Parameters<typeof whatsappReducer>[1],
) {
  return produce(state, (draft) => whatsappReducer(draft, event));
}

function reduceTrack(
  state: WorldState,
  track: WhatsAppTrackBuilder,
): WorldState {
  const context = {
    pluginLowerers: new Map(),
    fps: 30,
    emitNotification: () => undefined,
    emitNotificationInteraction: () => undefined,
  };
  return track._events
    .flatMap((event) => whatsappV2Lowering.lower(event as never, context))
    .reduce((next, event) => reduce(next, event), state);
}

describe("WhatsApp canonical authoring contract", () => {
  it("fails loudly when runtime state or conversation bootstrap is missing", () => {
    const event = {
      at: 0,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_SENT",
      payload: { conversationId: "missing", text: "hello" },
    } as const;

    expect(() =>
      reduce(
        {
          capabilityState: {},
          devices: {},
          appInstances: {},
          audio: createDefaultAudioState(),
        } as WorldState,
        event,
      ),
    ).toThrow('APP_INSTANCE_MISSING: app "app_whatsapp" is not mounted on device "phone"');
    expect(() => reduce(world(), event)).toThrow(
      'unknown conversation "missing"',
    );
  });

  it("rejects index, id-alias, and messageRef targeting", () => {
    const base = {
      at: 0,
      appId: "app_whatsapp",
      deviceId: "phone",
    } as const;

    expect(() =>
      parseWhatsAppEventStrict({
        ...base,
        kind: "React",
        payload: { emoji: "🔥", messageRef: { index: -1 } },
      }),
    ).toThrow();

    expect(() =>
      parseWhatsAppEventStrict({
        ...base,
        kind: "APP",
        type: "MESSAGE_SENT",
        conversationId: "dm",
        payload: { conversationId: "dm", text: "legacy envelope" },
      }),
    ).toThrow(/conversationId/);

    expect(() =>
      parseWhatsAppEventStrict({
        ...base,
        kind: "MessageSent",
        payload: {
          text: "reply",
          replyTo: { id: "old-shape" },
        },
      }),
    ).toThrow();
  });

  it("fails loudly for unknown and duplicate stable message IDs", () => {
    const missingTarget = {
      at: 1,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "REACTION_ADDED",
      payload: {
        conversationId: "dm",
        messageId: "missing",
        emoji: "🔥",
        fromMe: true,
      },
    } as const;
    expect(() => reduce(world(), missingTarget)).toThrow(
      'WhatsApp message "missing" does not exist',
    );

    const first = reduce(world(), {
      at: 1,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "MESSAGE_SENT",
      payload: {
        conversationId: "dm",
        messageId: "stable-id",
        text: "first",
      },
    });
    expect(() =>
      reduce(first, {
        at: 2,
        kind: "APP",
        appId: "app_whatsapp",
        deviceId: "phone",
        type: "MESSAGE_SENT",
        payload: {
          conversationId: "dm",
          messageId: "stable-id",
          text: "duplicate",
        },
      }),
    ).toThrow('Duplicate WhatsApp message id "stable-id"');
  });

  it("emits only stable IDs from the point DSL", () => {
    let order = 0;
    const track = new WhatsAppTrackBuilder(30, "phone", "dm", () => order++);
    track.at("1s").receive("naina", "hello", { messageId: "incoming-1" });
    track.at("2s").react("incoming-1", "🔥");
    track.at("3s").send("reply", {
      messageId: "outgoing-1",
      replyTo: { messageId: "incoming-1" },
    });

    expect(track._events.map((event) => event.payload)).toEqual([
      expect.objectContaining({ messageId: "incoming-1" }),
      expect.objectContaining({ messageId: "incoming-1", emoji: "🔥" }),
      expect.objectContaining({
        messageId: "outgoing-1",
        replyTo: { messageId: "incoming-1" },
      }),
    ]);
    for (const event of track._events) {
      expect(event).not.toHaveProperty("conversationId");
    }
  });

  it("keeps structured input out of app events and fails without canonical integration", () => {
    let order = 0;
    const intents: WhatsAppSendInputIntent[] = [];
    const track = new WhatsAppTrackBuilder(
      30,
      "phone",
      "dm",
      () => order++,
      (intent) => intents.push(intent),
    );
    track.at("3s").send("I’ll fix it.", {
      input: {
        duration: "2s",
        correction: { typed: "I’ll fox it.", replace: "fox", with: "fix" },
      },
    });

    expect(track._events[0]?.payload).not.toHaveProperty("input");
    expect(intents).toEqual([
      expect.objectContaining({
        deviceId: "phone",
        conversationId: "dm",
        fieldId: "composer",
        sendFrame: 90,
        text: "I’ll fix it.",
      }),
    ]);

    const detached = new WhatsAppTrackBuilder(30, "phone", "dm", () => 0);
    expect(() =>
      detached.at("3s").send("No hidden fallback.", {
        input: { duration: "2s" },
      }),
    ).toThrow(/WHATSAPP_INPUT_INTEGRATION_MISSING/);
  });

  it("runs media and message actions through the strict point DSL", () => {
    let order = 0;
    const track = new WhatsAppTrackBuilder(30, "phone", "dm", () => order++);
    track.at(0).receive("naina", "original", { messageId: "message-1" });
    track.at(1).receiveVoice("naina", 4, { messageId: "voice-1" });
    track.at(2).startMediaPlayback("voice-1", 0.25);
    track.at(3).pauseMediaPlayback("voice-1");
    track.at(4).react("message-1", "🔥");
    track.at(5).editMessage("message-1", "edited");
    track.at(6).forward("message-1", { messageId: "forward-1" });
    track.at(7).deleteMessage("forward-1");

    const next = reduceTrack(world(), track);
    const conversation = selectAppState(next, "phone")?.conversations.dm;
    expect(
      conversation?.messages.find((message) => message.id === "message-1"),
    ).toMatchObject({
      text: "edited",
      edited: true,
      reactions: [{ emoji: "🔥", count: 1, fromMe: true }],
    });
    expect(
      conversation?.messages.find((message) => message.id === "voice-1"),
    ).toMatchObject({
      type: "voice",
      media: {
        transferState: "ready",
        transferProgress: 1,
        playbackState: "paused",
        playbackProgress: 0.25,
      },
    });
    expect(
      conversation?.messages.find((message) => message.id === "forward-1"),
    ).toMatchObject({
      type: "deleted",
      originalText: "edited",
    });
  });

  it("enforces transfer, viewer, gesture, and locale state machines", () => {
    let order = 0;
    const track = new WhatsAppTrackBuilder(30, "phone", "dm", () => order++);
    track.at(0).receive("naina", "review this", { messageId: "text-1" });
    track.at(1).receiveDocument("naina", {
      fileName: "brief.pdf",
      messageId: "document-1",
    });
    track.at(2).startMediaDownload("document-1");
    track.at(3).updateMediaDownload("document-1", 0.6);
    track.at(4).completeMediaDownload("document-1");
    track.at(5).openMediaViewer("document-1");
    track.at(6).closeMediaViewer();
    track.at(7).startGesture("text-1", "long_press");
    track.at(8).completeGesture("text-1");

    const actionMenuState = reduceTrack(world(), track);
    expect(selectAppState(actionMenuState, "phone")).toMatchObject({
      mediaViewer: null,
      activeGesture: {
        messageId: "text-1",
        gesture: "long_press",
        phase: "completed",
      },
    });
    expect(
      selectAppState(actionMenuState, "phone")?.conversations.dm.messages.find(
        (message) => message.id === "document-1",
      )?.media,
    ).toMatchObject({ transferState: "ready", transferProgress: 1 });

    const swipe = new WhatsAppTrackBuilder(30, "phone", "dm", () => order++);
    swipe.at(9).cancelGesture("text-1");
    swipe.at(10).startGesture("text-1", "swipe_reply");
    swipe.at(11).updateGesture("text-1", 0.75);
    swipe.at(12).completeGesture("text-1");
    swipe.at(13).setLocale("ar");
    const replyState = reduceTrack(actionMenuState, swipe);
    expect(selectAppState(replyState, "phone")).toMatchObject({
      locale: "ar",
      activeGesture: null,
      replyComposer: { conversationId: "dm", messageId: "text-1" },
    });
  });

  it("rejects impossible media lifecycle transitions", () => {
    let order = 0;
    const track = new WhatsAppTrackBuilder(30, "phone", "dm", () => order++);
    track.at(0).receiveDocument("naina", {
      fileName: "brief.pdf",
      messageId: "document-1",
    });
    const seeded = reduceTrack(world(), track);
    const invalid = new WhatsAppTrackBuilder(30, "phone", "dm", () => order++);
    invalid.at(1).completeMediaDownload("document-1");

    expect(() => reduceTrack(seeded, invalid)).toThrow(
      "Cannot complete media download",
    );
  });

  it("uses typed group events and keeps membership invariants", () => {
    const initial = world();
    const appState = selectAppState(initial, "phone");
    if (!appState) throw new Error("missing test app state");
    appState.conversations.group = {
      id: "group",
      type: "group",
      messages: [],
      members: [],
    };

    let order = 0;
    const track = new WhatsAppTrackBuilder(30, "phone", "group", () => order++);
    track.at(1).addGroupMember("naina", "Naina");
    track.at(2).changeGroupAdmin("naina", "promote", { memberName: "Naina" });
    track.at(3).updateGroupInfo("description", "Launch room");
    track.at(4).removeGroupMember("naina", "Naina");

    const next = reduceTrack(initial, track);
    const conversation = selectAppState(next, "phone")?.conversations.group;
    expect(conversation?.description).toBe("Launch room");
    expect(conversation?.members).toEqual([]);
    expect(conversation?.admins).toEqual([]);
    expect(conversation?.messages.map((message) => message.systemType)).toEqual(
      [
        "member_added",
        "admin_change",
        "group_description_changed",
        "member_removed",
      ],
    );
  });

  it("increments the static-layout revision after every accepted event", () => {
    const next = reduce(world(), {
      at: 1,
      kind: "APP",
      appId: "app_whatsapp",
      deviceId: "phone",
      type: "NAVIGATE_SCREEN",
      payload: { screen: "updates" },
    });
    expect(
      (next.appInstances?.["phone:app_whatsapp"] as { layoutRevision: number })
        .layoutRevision,
    ).toBe(1);
  });

  it("selects the correct WhatsApp instance for each device", () => {
    const left = {
      ...createWhatsAppInitialState(),
      currentScreen: "chats" as const,
    };
    const right = {
      ...createWhatsAppInitialState(),
      currentScreen: "updates" as const,
    };
    const state = world();
    state.appInstances["left:app_whatsapp"] = left;
    state.appInstances["right:app_whatsapp"] = right;

    expect(selectAppState(state, "left")).toBe(left);
    expect(selectAppState(state, "right")).toBe(right);
  });
});
