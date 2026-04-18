import { describe, expect, it } from "vitest";
import { createReactionPlan } from "@tokovo/reactions";
import { buildReactorFrameState } from "./index.js";

const plan = createReactionPlan({
  id: "frame-state-plan",
  sourceRef: {
    kind: "tokovo_episode",
    episodeId: "episode-1",
  },
  cast: [
    {
      id: "hero",
      role: "hero",
      visualProfile: {
        displayName: "Hero",
        accentColor: "#f97316",
        avatar: {
          kind: "pngtuber",
          speakingFps: 10,
          frames: {
            idle: "/avatars/avatar-ava.jpg",
            listening: "/avatars/avatar-zoe.jpg",
            speaking: "/avatars/avatar-jess.jpg",
            shocked: "/avatars/avatar-priya.jpg",
          },
        },
      },
      voiceProfile: {
        provider: "gemini",
        model: "gemini-3.1-flash-tts-preview",
        voiceId: "hero-voice",
      },
      personaPromptRef: "hero-v1",
    },
    {
      id: "guest",
      role: "guest",
      visualProfile: {
        displayName: "Guest",
        accentColor: "#38bdf8",
        avatar: {
          kind: "live2d",
          runtime: "preview-only",
          cubismVersion: "cubism5",
          modelJsonSrc: "/live2d/guest/model3.json",
          previewPosterSrc: "/avatars/avatar-riya.jpg",
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          motions: {
            idle: "Idle_01",
            speaking: "Talk_01",
            listening: "Listen_01",
          },
          expressions: {
            deadpan: "Blank",
            shocked: "Shock",
          },
        },
      },
      voiceProfile: {
        provider: "gemini",
        model: "gemini-3.1-flash-tts-preview",
        voiceId: "guest-voice",
      },
      personaPromptRef: "guest-v1",
    },
  ],
  segments: [
    {
      id: "seg_hero",
      speakerId: "hero",
      startFrame: 10,
      endFrame: 40,
      text: "That is wild.",
      emotion: "shocked",
      interruptType: "hard-cut",
      captionMode: "always-on",
      priority: 100,
    },
    {
      id: "seg_guest",
      speakerId: "guest",
      startFrame: 50,
      endFrame: 70,
      text: "No way.",
      emotion: "deadpan",
      interruptType: "punch-in",
      captionMode: "always-on",
      priority: 90,
    },
  ],
  version: "1",
});

describe("buildReactorFrameState", () => {
  it("marks the active speaker and emits visible captions", () => {
    const state = buildReactorFrameState(plan, 20, {
      showCaptions: true,
      showChrome: true,
    });

    expect(state.cards.find((card) => card.id === "hero")?.state).toBe("speaking");
    expect(state.cards.find((card) => card.id === "guest")?.state).toBe("listening");
    expect(state.activeCaption?.text).toBe("That is wild.");
    expect(state.chrome.liveBadge).toBe(true);
    expect(state.cards.find((card) => card.id === "hero")?.avatar.kind).toBe(
      "pngtuber",
    );
    expect(
      state.cards.find((card) => card.id === "hero")?.avatar.activeAssetSrc,
    ).toBe("/avatars/avatar-priya.jpg");
    expect(state.cards.find((card) => card.id === "guest")?.avatar.kind).toBe(
      "live2d",
    );
    expect(
      state.cards.find((card) => card.id === "guest")?.avatar.runtime,
    ).toBe("preview-only");
  });

  it("suppresses chrome and captions when preview toggles are off", () => {
    const state = buildReactorFrameState(plan, 20, {
      showCaptions: false,
      showChrome: false,
    });

    expect(state.activeCaption).toBeNull();
    expect(state.chrome.liveBadge).toBe(false);
  });

  it("selects the live2d speaking motion and expression for active guest lines", () => {
    const state = buildReactorFrameState(plan, 55, {
      showCaptions: true,
      showChrome: true,
    });

    const guestCard = state.cards.find((card) => card.id === "guest");

    expect(guestCard?.state).toBe("speaking");
    expect(guestCard?.avatar.kind).toBe("live2d");
    expect(guestCard?.avatar.motion).toBe("Talk_01");
    expect(guestCard?.avatar.expression).toBe("Blank");
    expect(guestCard?.avatar.posterSrc).toBe("/avatars/avatar-riya.jpg");
  });

  it("derives deterministic preview runtime metrics for live2d avatars", () => {
    const state = buildReactorFrameState(plan, 55, {
      showCaptions: true,
      showChrome: true,
    });

    const guestCard = state.cards.find((card) => card.id === "guest");

    expect(guestCard?.avatar.kind).toBe("live2d");
    expect(guestCard?.avatar.runtimeState.motionProgress).toBeGreaterThan(0);
    expect(guestCard?.avatar.runtimeState.motionProgress).toBeLessThanOrEqual(1);
    expect(guestCard?.avatar.runtimeState.mouthOpen).toBeGreaterThan(0.4);
    expect(guestCard?.avatar.runtimeState.focusEnergy).toBeGreaterThan(0.7);
    expect(guestCard?.avatar.runtimeState.blink).toBeGreaterThanOrEqual(0);
    expect(guestCard?.avatar.runtimeState.blink).toBeLessThanOrEqual(1);
  });

  it("applies per-card manual overrides for live2d inspection", () => {
    const state = buildReactorFrameState(plan, 55, {
      showCaptions: true,
      showChrome: true,
      cardOverrides: {
        guest: {
          state: "speaking",
          emotion: "shocked",
          avatar: {
            kind: "live2d",
            motion: "Idle_01",
            expression: "Shock",
            scale: 1.22,
            offsetX: 18,
            offsetY: -12,
            runtimeState: {
              motionProgress: 0.25,
              mouthOpen: 0.91,
              blink: 0.14,
              focusEnergy: 0.98,
              swayX: 7,
              bobY: -5,
            },
          },
        },
      },
    });

    const guestCard = state.cards.find((card) => card.id === "guest");

    expect(guestCard?.state).toBe("speaking");
    expect(guestCard?.emotion).toBe("shocked");
    expect(guestCard?.isActiveSpeaker).toBe(true);
    expect(guestCard?.avatar.kind).toBe("live2d");
    expect(guestCard?.avatar.motion).toBe("Idle_01");
    expect(guestCard?.avatar.expression).toBe("Shock");
    expect(guestCard?.avatar.scale).toBe(1.22);
    expect(guestCard?.avatar.offsetX).toBe(18);
    expect(guestCard?.avatar.offsetY).toBe(-12);
    expect(guestCard?.avatar.runtimeState).toEqual({
      motionProgress: 0.25,
      mouthOpen: 0.91,
      blink: 0.14,
      focusEnergy: 0.98,
      swayX: 7,
      bobY: -5,
    });
  });

  it("resolves motion-video pngtuber metadata for richer reactor playback", () => {
    const motionVideoPlan = createReactionPlan({
      id: "motion-video-plan",
      sourceRef: {
        kind: "tokovo_episode",
        episodeId: "episode-motion-video",
      },
      cast: [
        {
          id: "guest",
          role: "guest",
          visualProfile: {
            displayName: "Guest",
            accentColor: "#38bdf8",
            avatar: {
              kind: "pngtuber",
              mode: "motion-video",
              speakingFps: 12,
              videoSrc: "/pngtuber/mira/loop.mp4",
              mouthTrackSrc: "/pngtuber/mira/mouth_track.json",
              mouthSprites: {
                closed: "/pngtuber/mira/mouth/closed.svg",
                half: "/pngtuber/mira/mouth/half.svg",
                open: "/pngtuber/mira/mouth/open.svg",
              },
              frames: {
                idle: "/avatars/avatar-jess.jpg",
                speaking: "/avatars/avatar-priya.jpg",
              },
            },
          },
          voiceProfile: {
            provider: "gemini",
            model: "gemini-3.1-flash-tts-preview",
            voiceId: "guest-voice",
          },
          personaPromptRef: "guest-v2",
        },
      ],
      segments: [
        {
          id: "seg_guest_mv",
          speakerId: "guest",
          startFrame: 10,
          endFrame: 40,
          text: "Motion video is online.",
          emotion: "happy",
          interruptType: "hard-cut",
          captionMode: "always-on",
          priority: 90,
        },
      ],
      version: "1",
    });

    const state = buildReactorFrameState(motionVideoPlan, 18, {
      showCaptions: true,
      showChrome: true,
    });
    const guestCard = state.cards[0];

    expect(guestCard?.avatar.kind).toBe("pngtuber");
    if (guestCard?.avatar.kind !== "pngtuber") {
      throw new Error("Expected pngtuber avatar");
    }

    expect(guestCard.avatar.mode).toBe("motion-video");
    expect(guestCard.avatar.videoSrc).toBe("/pngtuber/mira/loop.mp4");
    expect(guestCard.avatar.mouthTrackSrc).toBe("/pngtuber/mira/mouth_track.json");
    expect(guestCard.avatar.mouthSprites?.open).toBe("/pngtuber/mira/mouth/open.svg");
    expect(guestCard.avatar.mouthShape).toBe("open");
    expect(guestCard.avatar.playbackFrame).toBe(18);
  });

  it("lets pngtuber overrides swap mouth-track profiles deterministically", () => {
    const motionVideoPlan = createReactionPlan({
      id: "motion-video-override-plan",
      sourceRef: {
        kind: "tokovo_episode",
        episodeId: "episode-motion-override",
      },
      cast: [
        {
          id: "guest",
          role: "guest",
          visualProfile: {
            displayName: "Guest",
            accentColor: "#38bdf8",
            avatar: {
              kind: "pngtuber",
              mode: "motion-video",
              speakingFps: 12,
              videoSrc: "/pngtuber/mira/loop.mp4",
              mouthTrackSrc: "/pngtuber/mira/mouth_track.json",
              mouthSprites: {
                closed: "/pngtuber/mira/mouth/closed.svg",
                half: "/pngtuber/mira/mouth/half.svg",
                open: "/pngtuber/mira/mouth/open.svg",
              },
              frames: {
                idle: "/avatars/avatar-jess.jpg",
                speaking: "/avatars/avatar-priya.jpg",
              },
            },
          },
          voiceProfile: {
            provider: "gemini",
            model: "gemini-3.1-flash-tts-preview",
            voiceId: "guest-voice",
          },
          personaPromptRef: "guest-v2",
        },
      ],
      segments: [
        {
          id: "seg_guest_mv_override",
          speakerId: "guest",
          startFrame: 10,
          endFrame: 40,
          text: "Override profile is online.",
          emotion: "happy",
          interruptType: "hard-cut",
          captionMode: "always-on",
          priority: 90,
        },
      ],
      version: "1",
    });

    const state = buildReactorFrameState(motionVideoPlan, 18, {
      showCaptions: true,
      showChrome: true,
      cardOverrides: {
        guest: {
          avatar: {
            kind: "pngtuber",
            mouthTrackSrc: "/pngtuber/mira/mouth_track_alt.json",
          },
        },
      },
    });
    const guestCard = state.cards[0];

    expect(guestCard?.avatar.kind).toBe("pngtuber");
    if (guestCard?.avatar.kind !== "pngtuber") {
      throw new Error("Expected pngtuber avatar");
    }

    expect(guestCard.avatar.mouthTrackSrc).toBe("/pngtuber/mira/mouth_track_alt.json");
  });

  it("resolves avatar asset URLs through Remotion's static base in browser environments", () => {
    const previousWindow = globalThis.window;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        remotion_staticBase: "/static-demo",
      },
    });

    try {
      const state = buildReactorFrameState(plan, 55, {
        showCaptions: true,
        showChrome: true,
      });
      const heroCard = state.cards.find((card) => card.id === "hero");
      const guestCard = state.cards.find((card) => card.id === "guest");

      expect(heroCard?.avatar.kind).toBe("pngtuber");
      expect(heroCard?.avatar.activeAssetSrc).toBe(
        "/static-demo/avatars/avatar-zoe.jpg",
      );
      expect(guestCard?.avatar.kind).toBe("live2d");
      expect(guestCard?.avatar.modelJsonSrc).toBe(
        "/static-demo/live2d/guest/model3.json",
      );
      expect(guestCard?.avatar.coreScriptSrc).toBe(
        "/static-demo/scripts/live2dcubismcore.min.js",
      );
      expect(guestCard?.avatar.posterSrc).toBe(
        "/static-demo/avatars/avatar-riya.jpg",
      );
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previousWindow,
      });
    }
  });
});
