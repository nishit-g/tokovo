import { describe, expect, it } from "vitest";
import { normalizeTrackEpisodeIR } from "@tokovo/ir";
import { episode } from "./episode.js";

function buildDeterministicDslEpisode() {
  return episode("dsl-contract", { fps: 30, duration: "10s" })
    .device("phone", "iphone16", { app: "app_whatsapp" })
    .deviceTrack("phone", (device) => {
      device.at("0s").unlock();
      device.at("1s").openApp("app_whatsapp");
      device.at(45).setBadge("app_whatsapp", 3);
    })
    .overlay((overlay) => {
      overlay.at("2s").caption("hello");
      overlay.at("3s").clear();
    })
    .build();
}

describe("DSL contract + determinism", () => {
  it("maps builder calls to expected IR shape", () => {
    const ir = buildDeterministicDslEpisode();
    expect(ir.id).toBe("dsl-contract");
    expect(ir.events.map((e) => `${e.kind}:${e.type}`)).toEqual([
      "DEVICE:UNLOCK",
      "DEVICE:OPEN_APP",
      "DEVICE:SET_BADGE",
      "OVERLAY:SHOW",
      "OVERLAY:CLEAR",
    ]);
  });

  it("resolves mixed timing notation correctly", () => {
    const ir = buildDeterministicDslEpisode();
    const frames = ir.events.map((e) => e.at);
    expect(frames).toEqual([0, 30, 45, 60, 90]);
  });

  it("fails explicitly for invalid authoring timing input", () => {
    expect(() =>
      episode("bad-timing", { fps: 30, duration: "5s" })
        .device("phone", "iphone16", { app: "app_whatsapp" })
        .overlay((overlay) => {
          overlay.at("oops").caption("x");
        })
        .build(),
    ).toThrow(/Invalid time format/);
  });

  it("produces deterministic normalized IR", () => {
    const a = buildDeterministicDslEpisode();
    const b = buildDeterministicDslEpisode();
    expect(normalizeTrackEpisodeIR(a)).toEqual(normalizeTrackEpisodeIR(b));
  });

  it("preserves the episode seed in the built IR", () => {
    const ir = episode("seeded", {
      fps: 30,
      duration: "1s",
      seed: "episode-seed",
    }).build();

    expect(ir.seed).toBe("episode-seed");
  });

  it("authors appearance independently from a theme variant", () => {
    const ir = episode("appearance", { fps: 30, duration: "1s" })
      .device("phone", "pixel", {
        app: "app_whatsapp",
        theme: "whatsapp-storybook",
        appearance: "dark",
      })
      .build();

    expect(ir.devices[0]).toMatchObject({
      theme: "whatsapp-storybook",
      appearance: "dark",
    });
  });

  it("uses an overlay span as the default visible duration", () => {
    const ir = episode("overlay-span", { fps: 30, duration: "3s" })
      .overlay((overlay) => {
        overlay.span("0.5s", "2s").caption("Held on screen");
      })
      .build();

    expect(ir.events[0]?.payload).toMatchObject({ durationFrames: 45 });
  });

  it("authors field-scoped multilingual input independently from events", () => {
    const ir = episode("input", { fps: 30, duration: "6s", seed: "demo" })
      .device("phone", "pixel", {
        app: "app_whatsapp",
        appearance: "dark",
      })
      .input("phone", "composer", {
        at: "1s",
        submitAt: "4s",
        clearOnSubmit: false,
        locale: "ar-SA",
        text: "مرحبًا بالعالم",
        expectedFinalValue: "مرحبًا بالعالم",
        keyboard: { returnKey: "send" },
      })
      .build();

    expect(ir.inputSessions).toEqual([
      expect.objectContaining({
        deviceId: "phone",
        appInstanceId: "phone:app_whatsapp",
        fieldId: "composer",
        startFrame: 30,
        submitAtFrame: 120,
        clearOnSubmit: false,
        locale: "ar-SA",
        text: "مرحبًا بالعالم",
      }),
    ]);
    expect(ir.events).toEqual([]);
  });

  it("fails immediately when input targets an unknown device", () => {
    expect(() =>
      episode("bad-input", { fps: 30, duration: "2s" }).input(
        "missing",
        "composer",
        { at: 0, text: "hello" },
      ),
    ).toThrow(/unknown device/);
  });

  it("authors ordered notification intent and interaction data outside runtime events", () => {
    const ir = episode("notifications", { fps: 30, duration: "8s" })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        appearance: "dark",
        os: { locale: "ar-SA" },
      })
      .notificationTrack("phone", (notifications) => {
        notifications.at("1s").deliver({
          id: "message-a",
          appId: "app_whatsapp",
          content: { title: "ليلى", body: "مرحبًا 👋🏽" },
          privacy: "private",
        });
        notifications.at("2s").reply("message-a", "أهلًا");
        notifications.at("3s").openCenter();
      })
      .build();

    expect(ir.devices[0].os?.locale).toBe("ar-SA");
    expect(ir.notificationIntents).toMatchObject([
      {
        id: "message-a",
        deviceId: "phone",
        appInstanceId: "phone:app_whatsapp",
        deliverAtFrame: 30,
        sequence: 0,
      },
    ]);
    expect(ir.notificationInteractions).toMatchObject([
      {
        type: "reply",
        notificationId: "message-a",
        replyText: "أهلًا",
        atFrame: 60,
        sequence: 1,
      },
      { type: "openCenter", atFrame: 90, sequence: 2 },
    ]);
    expect(ir.events).toEqual([]);
  });

  it("fails immediately when a notification track targets an unknown device", () => {
    expect(() =>
      episode("bad-notification", { fps: 30, duration: "2s" })
        .notificationTrack("missing", () => undefined),
    ).toThrow(/unknown device/);
  });
});
