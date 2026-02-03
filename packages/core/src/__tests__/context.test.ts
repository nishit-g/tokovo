import { describe, expect, it } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import type { WorldState } from "../types";
import {
  TokovoProvider,
  useWorld,
  useDevice,
  useAppState,
  useLayout,
  useTime,
  usePlatform,
  useDeviceId,
  useAppId,
  useSafeAreaInsets,
  useConversation,
  useActiveConversation,
} from "../context/TokovoContext";

const world: WorldState = {
  devices: {
    phone: { id: "phone" },
  },
  appState: {
    app: {
      conversations: {
        conv1: { id: "conv1", name: "One" },
        conv2: { id: "conv2", name: "Two" },
      },
      activeConversationId: "conv2",
    },
  },
  camera: { baseView: "APP_VIEW" } as any,
  audio: { activeSounds: {}, buses: {}, policyState: { recentSounds: {}, nextId: 0 }, autoSoundRules: [] } as any,
};

describe("Tokovo context", () => {
  it("provides hooks for world/device/app", () => {
    let values: Record<string, unknown> = {};

    const Probe = () => {
      values = {
        world: useWorld(),
        device: useDevice(),
        appState: useAppState(),
        layout: useLayout(),
        t: useTime(),
        platform: usePlatform(),
        deviceId: useDeviceId(),
        appId: useAppId(),
        safe: useSafeAreaInsets(),
        conversation: useConversation("conv1"),
        active: useActiveConversation(),
      };
      return React.createElement("div");
    };

    renderToString(
      React.createElement(
        TokovoProvider,
        {
          world,
          deviceId: "phone",
          appId: "app",
          t: 10,
          platform: "ios",
          safeAreaInsets: { top: 1, bottom: 2, left: 3, right: 4 },
        },
        React.createElement(Probe),
      ),
    );

    expect((values.world as WorldState).devices.phone).toBeDefined();
    expect((values.device as any).id).toBe("phone");
    expect((values.appState as any).activeConversationId).toBe("conv2");
    expect(values.layout).toBeUndefined();
    expect(values.t).toBe(10);
    expect(values.platform).toBe("ios");
    expect(values.deviceId).toBe("phone");
    expect(values.appId).toBe("app");
    expect((values.safe as any).top).toBe(1);
    expect((values.conversation as any).id).toBe("conv1");
    expect((values.active as any).id).toBe("conv2");
  });

  it("throws when device missing", () => {
    const Missing = () => {
      useDevice();
      return React.createElement("div");
    };

    expect(() =>
      renderToString(
        React.createElement(
          TokovoProvider,
          { world, deviceId: "missing", appId: "app", t: 0 },
          React.createElement(Missing),
        ),
      ),
    ).toThrow();
  });

  it("handles array conversations", () => {
    const arrayWorld = {
      ...world,
      appState: {
        app: {
          conversations: [
            { id: "a" },
            { id: "b" },
          ],
          currentConversationId: "b",
        },
      },
    } as WorldState;

    let conversationId: string | undefined;
    const Probe = () => {
      conversationId = useActiveConversation()?.id;
      return React.createElement("div");
    };

    renderToString(
      React.createElement(
        TokovoProvider,
        { world: arrayWorld, deviceId: "phone", appId: "app", t: 0 },
        React.createElement(Probe),
      ),
    );

    expect(conversationId).toBe("b");
  });

  it("returns undefined when conversations are missing", () => {
    const noConversationsWorld = {
      ...world,
      appState: { app: {} },
    } as WorldState;

    let conversation: unknown;
    const Probe = () => {
      conversation = useConversation("conv1");
      return React.createElement("div");
    };

    renderToString(
      React.createElement(
        TokovoProvider,
        { world: noConversationsWorld, deviceId: "phone", appId: "app", t: 0 },
        React.createElement(Probe),
      ),
    );

    expect(conversation).toBeUndefined();
  });

  it("returns undefined when active conversation is missing", () => {
    const noActiveIdWorld = {
      ...world,
      appState: { app: { conversations: [{ id: "a" }] } },
    } as WorldState;

    const noConversationsWorld = {
      ...world,
      appState: { app: { activeConversationId: "conv1" } },
    } as WorldState;

    let activeId: string | undefined;
    let missingConversations: unknown;

    const Probe = ({ mode }: { mode: "noActive" | "noConversations" }) => {
      if (mode === "noActive") {
        activeId = useActiveConversation()?.id;
      } else {
        missingConversations = useActiveConversation();
      }
      return React.createElement("div");
    };

    renderToString(
      React.createElement(
        TokovoProvider,
        { world: noActiveIdWorld, deviceId: "phone", appId: "app", t: 0 },
        React.createElement(Probe, { mode: "noActive" }),
      ),
    );

    renderToString(
      React.createElement(
        TokovoProvider,
        { world: noConversationsWorld, deviceId: "phone", appId: "app", t: 0 },
        React.createElement(Probe, { mode: "noConversations" }),
      ),
    );

    expect(activeId).toBeUndefined();
    expect(missingConversations).toBeUndefined();
  });

  it("throws when hooks are used outside provider", () => {
    const MissingProvider = () => {
      useWorld();
      return React.createElement("div");
    };

    expect(() => renderToString(React.createElement(MissingProvider))).toThrow(
      /TokovoProvider/,
    );
  });

  it("resolves conversations from arrays via useConversation", () => {
    const arrayWorld = {
      ...world,
      appState: {
        app: {
          conversations: [{ id: "a" }, { id: "b" }],
        },
      },
    } as WorldState;

    let foundId: string | undefined;
    const Probe = () => {
      foundId = useConversation("b")?.id;
      return React.createElement("div");
    };

    renderToString(
      React.createElement(
        TokovoProvider,
        { world: arrayWorld, deviceId: "phone", appId: "app", t: 0 },
        React.createElement(Probe),
      ),
    );

    expect(foundId).toBe("b");
  });
});
