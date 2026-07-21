import { describe, expect, it } from "vitest";
import type { RuntimeEvent } from "@tokovo/core";
import type { TokovoPlugin } from "@tokovo/core";
import {
  createCanonicalTrackEpisodeIR,
  type CameraPlanIR,
  type StageProgramIR,
  type TrackEvent,
} from "@tokovo/ir";
import { lowerTrackEvent } from "./lowering.js";
import { prepareTrackEpisode } from "./prepare.js";

function runtimeKinds(events: RuntimeEvent[]): string[] {
  return events.map((event) => `${event.kind}:${event.type}`);
}

describe("compiler pipeline guarantees", () => {
  it("prepares episode-owned cinematics against the story event signature", () => {
    const stageProgram: StageProgramIR = {
      version: 1,
      rootNodeId: "root",
      nodes: [
        {
          id: "root",
          source: { kind: "group" },
          localBounds: { x: 0, y: 0, width: 1080, height: 1920 },
          initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
          zIndex: 0,
        },
      ],
      transformKeyframes: [],
    };
    const cameraPlan: CameraPlanIR = {
      version: 1,
      id: "editorial",
      fps: 30,
      durationInFrames: 300,
      outputs: [
        {
          id: "main",
          viewport: { x: 0, y: 0, width: 1080, height: 1920 },
          sourceStageNodeId: "root",
          zIndex: 0,
          defaultRigId: "device",
        },
      ],
      rigs: [
        {
          id: "device",
          outputId: "main",
          subject: { kind: "device", deviceId: "phone", subjectId: "screen" },
          composer: {
            screenPosition: [0.5, 0.5],
            targetFill: 0.8,
            fillMode: "contain",
          },
        },
      ],
      shots: [],
      lenses: [],
      modifiers: [],
    };
    const ir = createCanonicalTrackEpisodeIR();
    ir.cinematics = {
      stageProgram,
      cameraPlans: [cameraPlan],
      defaultCameraPlanId: cameraPlan.id,
    };

    const prepared = prepareTrackEpisode(ir, [], { log: false, validate: true });

    expect(prepared.cinematics?.storySignature).toBe(prepared.eventSignature);
    expect(prepared.cinematics?.defaultCameraPlanId).toBe("editorial");
    expect(prepared.cinematics?.cameraPrograms[0]?.plan.id).toBe("editorial");
  });

  it("rejects stage devices that are absent from the episode", () => {
    const ir = createCanonicalTrackEpisodeIR();
    ir.cinematics = {
      stageProgram: {
        version: 1,
        rootNodeId: "ghost-node",
        nodes: [
          {
            id: "ghost-node",
            source: { kind: "device", deviceId: "ghost" },
            localBounds: { x: 0, y: 0, width: 393, height: 852 },
            initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
            zIndex: 0,
          },
        ],
        transformKeyframes: [],
      },
      cameraPlans: [
        {
          version: 1,
          id: "ghost-plan",
          fps: 30,
          durationInFrames: 300,
          outputs: [
            {
              id: "main",
              viewport: { x: 0, y: 0, width: 1080, height: 1920 },
              sourceStageNodeId: "ghost-node",
              zIndex: 0,
              defaultRigId: "ghost-rig",
            },
          ],
          rigs: [
            {
              id: "ghost-rig",
              outputId: "main",
              subject: { kind: "device", deviceId: "ghost", subjectId: "screen" },
              composer: {
                screenPosition: [0.5, 0.5],
                targetFill: 0.8,
                fillMode: "contain",
              },
            },
          ],
          shots: [],
          lenses: [],
          modifiers: [],
        },
      ],
      defaultCameraPlanId: "ghost-plan",
    };

    expect(() =>
      prepareTrackEpisode(ir, [], { log: false, validate: true }),
    ).toThrow(/CINEMATIC_STAGE_DEVICE_MISSING.*ghost/);
  });

  it("prepares multilingual input as immutable random-access program data", () => {
    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        {
          id: "phone",
          profile: "pixel",
          app: "app_whatsapp",
          appearance: "dark",
        },
      ],
      inputSessions: [
        {
          id: "composer-ar",
          deviceId: "phone",
          appInstanceId: "phone:app_whatsapp",
          fieldId: "composer",
          startFrame: 30,
          submitAtFrame: 140,
          locale: "ar-SA",
          text: "مرحبًا بالعالم",
          expectedFinalValue: "مرحبًا بالعالم",
          keyboard: { returnKey: "send" },
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [], {
      log: false,
      validate: true,
    });

    expect(prepared.inputProgram.sessions[0]).toMatchObject({
      id: "composer-ar",
      deviceId: "phone",
      appInstanceId: "phone:app_whatsapp",
      fieldId: "composer",
      keyboard: {
        platform: "android",
        appearance: "dark",
        returnKey: "send",
        locale: { tag: "ar-SA", direction: "rtl", keyboardFamily: "arabic" },
      },
    });
  });

  it("fails loudly for overlapping input sessions on one device", () => {
    const ir = createCanonicalTrackEpisodeIR({
      inputSessions: [
        {
          id: "one",
          deviceId: "phone",
          appInstanceId: "phone:app_whatsapp",
          fieldId: "composer",
          startFrame: 0,
          endFrame: 90,
          text: "one",
        },
        {
          id: "two",
          deviceId: "phone",
          appInstanceId: "phone:app_whatsapp",
          fieldId: "search",
          startFrame: 60,
          endFrame: 120,
          text: "two",
        },
      ],
    });

    expect(() =>
      prepareTrackEpisode(ir, [], { log: false, validate: true }),
    ).toThrow(/INPUT_SESSION_CONFLICT/);
  });

  it("applies stable same-frame ordering policy", () => {
    const ir = createCanonicalTrackEpisodeIR({
      events: [
        {
          at: 0,
          kind: "AUDIO",
          type: "PLAY",
          payload: { soundId: "tap", volume: 0.2 },
          _declarationOrder: 2,
        },
        {
          at: 0,
          deviceId: "phone",
          kind: "DEVICE",
          type: "OPEN_APP",
          payload: { appId: "app_whatsapp" },
          _declarationOrder: 5,
        },
        {
          at: 0,
          deviceId: "phone",
          kind: "DEVICE",
          type: "UNLOCK",
          payload: {},
          _declarationOrder: 1,
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [], {
      log: false,
      validate: true,
    });
    expect(runtimeKinds(prepared.events)).toEqual([
      "DEVICE:UNLOCK",
      "DEVICE:OPEN_APP",
      "AUDIO:PLAY",
    ]);
  });

  it("throws precise error when app lowerer is missing", () => {
    const appEvent = {
      at: 0,
      kind: "APP",
      appId: "app_missing",
      type: "MESSAGE_SENT",
      payload: {},
      _declarationOrder: 0,
    } as TrackEvent;

    expect(() =>
      lowerTrackEvent(appEvent, {
        fps: 30,
        pluginLowerers: new Map(),
        emitNotification: () => undefined,
        emitNotificationInteraction: () => undefined,
      }),
    ).toThrow(/No plugin lowerer registered for appId: app_missing/);
  });

  it("prepareTrackEpisode signature and keyframe index are deterministic", () => {
    const ir = createCanonicalTrackEpisodeIR({
      events: [
        {
          at: 0,
          deviceId: "phone",
          kind: "DEVICE",
          type: "UNLOCK",
          payload: {},
          _declarationOrder: 0,
        },
        {
          at: 45,
          deviceId: "phone",
          kind: "DEVICE",
          type: "OPEN_APP",
          payload: { appId: "app_whatsapp" },
          _declarationOrder: 1,
        },
      ],
    });
    const preparedA = prepareTrackEpisode(ir, [], {
      log: false,
      validate: true,
    });
    const preparedB = prepareTrackEpisode(ir, [], {
      log: false,
      validate: true,
    });

    expect(preparedA.eventSignature).toBe(preparedB.eventSignature);
    expect(preparedA.keyframedEventIndex?.frames).toEqual(
      preparedB.keyframedEventIndex?.frames,
    );
    expect(preparedA.events).toEqual(preparedB.events);
  });

  it("seeds camera layout with the first actual device id", () => {
    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        {
          id: "phone",
          profile: "iphone16",
          app: "app_whatsapp",
        },
        {
          id: "career",
          profile: "iphone16",
          app: "app_linkedin",
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [], {
      log: false,
      validate: true,
    });

    expect(prepared.initialWorld.camera.activeDeviceId).toBe("phone");
    expect(prepared.initialWorld.camera.layout?.primaryDeviceId).toBe("phone");
  });

  it("hydrates authored device OS state into the initial world", () => {
    const time = new Date("2026-04-10T20:15:00Z");
    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        {
          id: "phone",
          profile: "iphone16",
          app: "app_whatsapp",
          os: {
            time,
            battery: 84,
            charging: true,
            network: "5G",
            strength: 2,
            dnd: true,
          },
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [], {
      log: false,
      validate: true,
    });

    expect(prepared.initialWorld.devices.phone.os).toMatchObject({
      clock: time.getTime(),
      battery: 84,
      charging: true,
      network: "5G",
      cellStrength: 2,
      dnd: true,
    });
  });

  it("hydrates app theme and appearance as independent device state", () => {
    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        {
          id: "phone",
          profile: "pixel",
          app: "app_whatsapp",
          theme: "whatsapp-storybook",
          appearance: "dark",
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [], {
      log: false,
      validate: true,
    });

    expect(prepared.initialWorld.devices.phone).toMatchObject({
      appTheme: "whatsapp-storybook",
      appAppearance: "dark",
    });
  });

  it("hydrates plugin-owned snapshots without compiler-owned conversation shaping", () => {
    const whatsappLikePlugin = {
      id: "app_whatsapp",
      version: "1.0.0",
      displayName: "WhatsApp",
      reducer: (state: unknown) => state,
      views: { AppRoot: () => null },
      createInitialState: () => ({
        viewMode: "FEED",
        currentScreen: "chats",
      }),
      bootstrap: {
        snapshot: {
          currentVersion: 1,
          validate: () => ({ errors: [] }),
        },
        view: {
          currentVersion: 1,
          validate: () => ({ errors: [] }),
        },
        hydrate: ({ baseState, snapshot, initialView }: any) => ({
          ...baseState,
          conversations: Object.fromEntries(
            (snapshot?.snapshot?.conversations ?? []).map(
              (conversation: any) => [conversation.id, conversation],
            ),
          ),
          currentScreen: initialView?.view?.screen ?? baseState.currentScreen,
          viewMode:
            initialView?.view?.screen === "chat" ? "CHAT" : baseState.viewMode,
          conversationId: initialView?.view?.conversationId,
        }),
      },
    } as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR({
      appSnapshots: [
        {
          appId: "app_whatsapp",
          deviceId: "phone",
          snapshotVersion: 1,
          snapshot: {
            conversations: [{ id: "dm_alex", name: "Alex" }],
          },
        },
      ],
      initialViews: [
        {
          appId: "app_whatsapp",
          deviceId: "phone",
          viewVersion: 1,
          view: {
            screen: "chat",
            conversationId: "dm_alex",
          },
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [whatsappLikePlugin], {
      log: false,
      validate: true,
    });

    const app = prepared.initialWorld.appState.app_whatsapp as Record<
      string,
      unknown
    >;
    expect(app.viewMode).toBe("CHAT");
    expect(app.currentScreen).toBe("chat");
    expect(app.conversationId).toBe("dm_alex");
    expect(typeof app.conversations).toBe("object");
  });

  it("keeps same-app bootstrap state independent across devices", () => {
    const collectedLabels: string[] = [];
    const plugin = {
      id: "app_same",
      version: "1.0.0",
      displayName: "Same App",
      createInitialState: () => ({}),
      bootstrap: {
        snapshot: {
          currentVersion: 1,
          validate: () => ({ errors: [] }),
        },
        hydrate: ({ deviceId, snapshot }: any) => ({
          deviceId,
          label: snapshot?.snapshot?.label,
          avatarUrl: `/avatars/${String(snapshot?.snapshot?.label).toLowerCase()}.png`,
        }),
      },
      collectAssetRefs: ({ initialWorld }: any) => {
        collectedLabels.push(initialWorld.appState.app_same?.label);
        return [];
      },
    } as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        { id: "left", profile: "iphone16", app: "app_same" },
        { id: "right", profile: "iphone16", app: "app_same" },
      ],
      events: [],
      appSnapshots: [
        {
          appId: "app_same",
          deviceId: "left",
          snapshotVersion: 1,
          snapshot: { label: "LEFT" },
        },
        {
          appId: "app_same",
          deviceId: "right",
          snapshotVersion: 1,
          snapshot: { label: "RIGHT" },
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [plugin], {
      log: false,
      validate: true,
    });

    expect(prepared.initialWorld.appState.app_same).toBeUndefined();
    expect(prepared.initialWorld.appStateByDevice?.left?.app_same).toEqual({
      deviceId: "left",
      label: "LEFT",
      avatarUrl: "/avatars/left.png",
    });
    expect(prepared.initialWorld.appStateByDevice?.right?.app_same).toEqual({
      deviceId: "right",
      label: "RIGHT",
      avatarUrl: "/avatars/right.png",
    });
    expect(collectedLabels).toEqual(["LEFT", "RIGHT"]);
    expect(prepared.assetRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/avatars/left.png",
          appId: "app_same",
        }),
        expect.objectContaining({
          src: "/avatars/right.png",
          appId: "app_same",
        }),
      ]),
    );
  });

  it("hydrates snapshot-backed apps before they become foreground", () => {
    const createPlugin = (id: string) =>
      ({
        id,
        version: "1.0.0",
        displayName: id,
        reducer: (state: unknown) => state,
        views: { AppRoot: () => null },
        createInitialState: () => ({
          currentScreen: "timeline",
          viewMode: "FEED",
        }),
        bootstrap: {
          snapshot: {
            currentVersion: 1,
            validate: () => ({ errors: [] }),
          },
          view: {
            currentVersion: 1,
            validate: () => ({ errors: [] }),
          },
          hydrate: ({ baseState, initialView }: any) => ({
            ...baseState,
            currentScreen: initialView?.view?.screen ?? baseState.currentScreen,
            viewMode: "FEED",
          }),
        },
      }) as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        {
          id: "phone",
          profile: "iphone16",
          app: "app_whatsapp",
        },
      ],
      appSnapshots: [
        {
          appId: "app_x",
          deviceId: "phone",
          snapshotVersion: 1,
          snapshot: {},
        },
      ],
      initialViews: [
        {
          appId: "app_x",
          deviceId: "phone",
          viewVersion: 1,
          view: {
            screen: "timeline",
          },
        },
      ],
      events: [
        {
          at: 30,
          deviceId: "phone",
          kind: "DEVICE",
          type: "OPEN_APP",
          payload: { appId: "app_x" },
          _declarationOrder: 0,
        },
      ],
    });

    const prepared = prepareTrackEpisode(
      ir,
      [createPlugin("app_whatsapp"), createPlugin("app_x")],
      {
        log: false,
        validate: true,
      },
    );

    expect(prepared.initialWorld.appState.app_x).toMatchObject({
      currentScreen: "timeline",
      viewMode: "FEED",
    });
  });

  it("hydrates installed apps before they become foreground", () => {
    const createPlugin = (id: string, currentScreen: string) =>
      ({
        id,
        version: "1.0.0",
        displayName: id,
        reducer: (state: unknown) => state,
        views: { AppRoot: () => null },
        createInitialState: () => ({
          currentScreen,
          viewMode: "FEED",
        }),
      }) as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        {
          id: "phone",
          profile: "iphone16",
          app: "app_whatsapp",
          installedApps: ["app_whatsapp", "app_imessage"],
        },
      ],
      events: [
        {
          at: 30,
          deviceId: "phone",
          kind: "DEVICE",
          type: "OPEN_APP",
          payload: { appId: "app_imessage" },
          _declarationOrder: 0,
        },
      ],
    });

    const prepared = prepareTrackEpisode(
      ir,
      [
        createPlugin("app_whatsapp", "chats"),
        createPlugin("app_imessage", "list"),
      ],
      {
        log: false,
        validate: true,
      },
    );

    expect(prepared.initialWorld.appState.app_imessage).toMatchObject({
      currentScreen: "list",
      viewMode: "FEED",
    });
  });

  it("migrates versioned snapshots before hydrate", () => {
    const plugin = {
      id: "app_whatsapp",
      version: "1.0.0",
      displayName: "WhatsApp",
      reducer: (state: unknown) => state,
      views: { AppRoot: () => null },
      createInitialState: () => ({ migrated: false }),
      bootstrap: {
        snapshot: {
          currentVersion: 2,
          migrate: ({ version, value }: any) => {
            if (version !== 1) {
              throw new Error(`unexpected version ${version}`);
            }

            return {
              version: 2,
              value: {
                ...(value as Record<string, unknown>),
                migrated: true,
              },
            };
          },
          validate: ({ version, value }: any) => ({
            errors:
              version === 2 &&
              (value as Record<string, unknown>).migrated === true
                ? []
                : ["snapshot was not migrated"],
          }),
        },
        hydrate: ({ baseState, snapshot }: any) => ({
          ...baseState,
          migrated: snapshot?.snapshot?.migrated ?? false,
        }),
      },
    } as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR({
      appSnapshots: [
        {
          appId: "app_whatsapp",
          deviceId: "phone",
          snapshotVersion: 1,
          snapshot: {
            conversations: [],
          },
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [plugin], {
      log: false,
      validate: true,
    });

    expect(prepared.initialWorld.appState.app_whatsapp).toEqual(
      expect.objectContaining({ migrated: true }),
    );
  });

  it("keeps plugin initial state untouched when no snapshot or initial view is provided", () => {
    const fallbackPlugin = {
      id: "app_whatsapp",
      version: "1.0.0",
      displayName: "Fallback Plugin",
      reducer: (state: unknown) => state,
      views: { AppRoot: () => null },
      createInitialState: () => ({
        viewMode: "FEED",
        currentScreen: "chats",
      }),
    } as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR();
    const prepared = prepareTrackEpisode(ir, [fallbackPlugin], {
      log: false,
      validate: true,
    });

    const app = prepared.initialWorld.appState.app_whatsapp as Record<
      string,
      unknown
    >;
    expect(app.viewMode).toBe("FEED");
    expect(app.currentScreen).toBe("chats");
    expect(app.conversationId).toBeUndefined();
  });

  it("collects system asset refs for background, voice, and wallpaper", () => {
    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        {
          id: "phone",
          profile: "iphone16",
          app: "app_whatsapp",
          homeScreen: {
            wallpaper: "/wallpapers/hero.jpg",
          },
        },
      ],
      voice: {
        audioPath: "/voice/episode.mp3",
        manifestPath: "/voice/episode.json",
        durationMs: 1200,
      },
    });
    ir.background = { type: "image", src: "/backgrounds/scene.jpg" };

    const prepared = prepareTrackEpisode(ir, [], {
      log: false,
      validate: true,
    });

    expect(prepared.assetRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/backgrounds/scene.jpg",
          owner: "system",
          usage: "background",
          strategy: "eager",
        }),
        expect.objectContaining({
          src: "/voice/episode.mp3",
          owner: "system",
          usage: "voice-audio",
          strategy: "eager",
        }),
        expect.objectContaining({
          src: "/voice/episode.json",
          owner: "system",
          usage: "voice-manifest",
          strategy: "none",
        }),
        expect.objectContaining({
          src: "/wallpapers/hero.jpg",
          owner: "system",
          usage: "wallpaper",
          strategy: "eager",
        }),
      ]),
    );
  });

  it("eagerly collects avatars but keeps seeded initial media conservative", () => {
    const whatsappLikePlugin = {
      id: "app_whatsapp",
      version: "1.0.0",
      displayName: "WhatsApp",
      reducer: (state: unknown) => state,
      views: { AppRoot: () => null },
      createInitialState: () => ({}),
      bootstrap: {
        snapshot: {
          currentVersion: 1,
          validate: () => ({ errors: [] }),
        },
        hydrate: ({ baseState }: any) => baseState,
      },
    } as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR({
      appSnapshots: [
        {
          appId: "app_whatsapp",
          deviceId: "phone",
          snapshotVersion: 1,
          snapshot: {
            conversations: [
              {
                id: "dm_alex",
                name: "Alex",
                avatar: "/avatars/alex.jpg",
                messages: [
                  {
                    id: "msg_1",
                    from: "alex",
                    type: "image",
                    imageUrl: "/history/photo.jpg",
                  },
                ],
              },
            ],
          },
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [whatsappLikePlugin], {
      log: false,
      validate: true,
    });

    expect(prepared.assetRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/avatars/alex.jpg",
          owner: "app",
          appId: "app_whatsapp",
          usage: "avatar",
          strategy: "eager",
        }),
        expect.objectContaining({
          src: "/history/photo.jpg",
          owner: "app",
          appId: "app_whatsapp",
          usage: "message-media",
          strategy: "none",
        }),
      ]),
    );
  });

  it("uses runtime event timing for media refs and lets plugin refs upgrade strategy", () => {
    const plugin = {
      id: "app_whatsapp",
      version: "1.0.0",
      displayName: "WhatsApp",
      reducer: (state: unknown) => state,
      views: { AppRoot: () => null },
      v2Lowering: {
        lower: (event: TrackEvent) => [
          {
            at: event.at,
            kind: "APP" as const,
            appId: "app_whatsapp",
            type: event.type,
            payload: event.payload,
          },
        ],
      },
      collectAssetRefs: () => [
        {
          id: "plugin-photo",
          src: "/runtime/photo.jpg",
          kind: "image" as const,
          owner: "app" as const,
          appId: "app_whatsapp",
          usage: "message-media" as const,
          fromFrame: 30,
          toFrame: 120,
          strategy: "eager" as const,
          priority: 99,
          source: "plugin" as const,
        },
      ],
    } as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR({
      events: [
        {
          at: 30,
          deviceId: "phone",
          kind: "APP",
          appId: "app_whatsapp",
          type: "ImageReceived",
          payload: {
            imageUrl: "/runtime/photo.jpg",
          },
          _declarationOrder: 0,
        } as TrackEvent,
      ],
    });

    const prepared = prepareTrackEpisode(ir, [plugin], {
      log: false,
      validate: true,
    });

    expect(prepared.assetRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/runtime/photo.jpg",
          owner: "app",
          appId: "app_whatsapp",
          usage: "message-media",
          fromFrame: 30,
          toFrame: 120,
          strategy: "eager",
          priority: 99,
        }),
      ]),
    );
  });

  it("prepares notification actions as ordinary navigation and app events", () => {
    const plugin = {
      id: "app_chat",
      version: "1.0.0",
      displayName: "Chat",
      reducer: (state: unknown) => state,
      views: { AppRoot: () => null },
      notificationAdapter: {
        appId: "app_chat",
        format: (intent: any) => ({
          appName: "Chat",
          icon: "/icons/chat.svg",
          accentColor: "#22c55e",
          title: intent.content.title,
          body: intent.content.body,
        }),
        defaultAction: () => ({
          navigation: { route: "thread" },
        }),
      },
    } as unknown as TokovoPlugin;

    const ir = createCanonicalTrackEpisodeIR({
      devices: [
        {
          id: "phone",
          profile: "iphone16",
          app: "app_home",
          os: { locale: "hi-IN" },
        },
      ],
      notificationIntents: [
        {
          id: "message",
          deviceId: "phone",
          appId: "app_chat",
          deliverAtFrame: 30,
          content: { title: "रिया", body: "नमस्ते" },
          privacy: "private",
          reply: {
            actionId: "reply",
            textPayloadKey: "text",
            target: {
              navigation: { route: "thread", params: { id: "dm" } },
              appEvent: { type: "MESSAGE_SEND", payload: { threadId: "dm" } },
            },
          },
        },
      ],
      notificationInteractions: [
        {
          deviceId: "phone",
          atFrame: 60,
          type: "reply",
          notificationId: "message",
          replyText: "ज़रूर 👋🏽",
          sequence: 0,
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [plugin], {
      log: false,
      validate: true,
    });

    expect(prepared.notificationProgram.devices.phone.locale).toBe("hi-IN");
    expect(prepared.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "DEVICE",
          type: "OPEN_APP",
          deviceId: "phone",
          payload: expect.objectContaining({ appId: "app_chat", route: "thread" }),
        }),
        expect.objectContaining({
          kind: "APP",
          appId: "app_chat",
          type: "MESSAGE_SEND",
          payload: expect.objectContaining({ text: "ज़रूर 👋🏽", threadId: "dm" }),
        }),
      ]),
    );
    expect(prepared.events.filter((event) => event.at === 30 && event.kind === "DEVICE"))
      .toEqual([]);
    const replyEvent = prepared.events.find(
      (event) => event.kind === "APP" && event.type === "MESSAGE_SEND",
    );
    expect(replyEvent).toBeDefined();
    expect(replyEvent).not.toHaveProperty("_declarationOrder");
    const replyPayload = (replyEvent as { payload?: Record<string, unknown> } | undefined)?.payload;
    expect(replyPayload).not.toHaveProperty("notificationId");
    expect(replyPayload).not.toHaveProperty("actionId");
  });
});
