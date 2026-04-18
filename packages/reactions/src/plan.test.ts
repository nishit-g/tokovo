import { describe, expect, it } from "vitest";
import {
  ReactionPlanSchema,
  applyCharacterPresetToCastMember,
  arbitrateReactionSegments,
  createReactionPlan,
  createImportedPostSourceRef,
  createCharacterPreset,
  createTokovoEpisodeSourceRef,
  updateReactionPlan,
} from "./index.js";

describe("reaction plan schema", () => {
  it("requires provenance for imported post sources", () => {
    const result = ReactionPlanSchema.safeParse({
      id: "missing-provenance",
      sourceRef: {
        kind: "imported_post",
        importedAt: "2026-04-18T00:00:00.000Z",
        rights: { status: "internal-review" },
      },
      cast: [],
      segments: [],
      version: "1",
    });

    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.format())).toMatch(/sourceUrl/);
  });

  it("builds stable content hashes for identical plans", () => {
    const sourceRef = createTokovoEpisodeSourceRef("episode-1");

    const first = createReactionPlan({
      id: "reactor-plan",
      sourceRef,
      cast: [],
      segments: [],
      version: "1",
    });
    const second = createReactionPlan({
      id: "reactor-plan",
      sourceRef,
      cast: [],
      segments: [],
      version: "1",
    });

    expect(first.contentHash).toBe(second.contentHash);
    expect(first.formatPreset).toBe("stream-chaos-vertical");
    expect(first.reviewState).toBe("draft");
  });

  it("creates imported source refs with required provenance", () => {
    const ref = createImportedPostSourceRef({
      sourceUrl: "https://example.com/post/123",
      platform: "x",
      creatorHandle: "@tokovo",
    });

    expect(ref.kind).toBe("imported_post");
    expect(ref.provenance.sourceUrl).toBe("https://example.com/post/123");
  });

  it("rejects segments whose speaker is missing from cast", () => {
    expect(() =>
      createReactionPlan({
        id: "invalid-speaker-plan",
        sourceRef: createTokovoEpisodeSourceRef("episode-2"),
        cast: [
          {
            id: "hero",
            role: "hero",
            visualProfile: {
              displayName: "Hero",
              accentColor: "#fff",
            },
            voiceProfile: {
              provider: "gemini",
              model: "gemini-3.1-flash-tts-preview",
              voiceId: "hero-voice",
            },
            personaPromptRef: "hero-v1",
          },
        ],
        segments: [
          {
            id: "seg_0",
            speakerId: "ghost",
            startFrame: 10,
            endFrame: 30,
            text: "This should fail.",
            emotion: "deadpan",
            interruptType: "soft-cut",
            captionMode: "always-on",
            priority: 10,
          },
        ],
        version: "1",
      }),
    ).toThrowError(/speakerId/);
  });

  it("recomputes content hash when a plan is updated", () => {
    const original = createReactionPlan({
      id: "updatable-plan",
      sourceRef: createTokovoEpisodeSourceRef("episode-3"),
      cast: [],
      segments: [],
      version: "1",
    });

    const updated = updateReactionPlan(original, {
      reviewState: "locked-script",
      chromeCues: [
        {
          id: "cue_1",
          kind: "chat-pulse",
          startFrame: 12,
          endFrame: 24,
          text: "Spike",
          intensity: 0.9,
        },
      ],
    });

    expect(updated.contentHash).not.toBe(original.contentHash);
    expect(updated.reviewState).toBe("locked-script");
    expect(updated.chromeCues).toHaveLength(1);
  });

  it("accepts enterprise avatar adapter configs for image, pngtuber, and live2d", () => {
    const plan = createReactionPlan({
      id: "avatar-adapter-plan",
      sourceRef: createTokovoEpisodeSourceRef("episode-4"),
      cast: [
        {
          id: "hero",
          role: "hero",
          visualProfile: {
            displayName: "Hero",
            accentColor: "#f97316",
            avatar: {
              kind: "image",
              imageSrc: "/avatars/avatar-ava.jpg",
            },
          },
          voiceProfile: {
            provider: "gemini",
            model: "gemini-3.1-flash-tts-preview",
            voiceId: "hero-voice",
          },
          personaPromptRef: "hero-v2",
        },
        {
          id: "guest",
          role: "guest",
          visualProfile: {
            displayName: "Guest",
            accentColor: "#38bdf8",
            avatar: {
              kind: "pngtuber",
              speakingFps: 8,
              frames: {
                idle: "/avatars/avatar-jess.jpg",
                listening: "/avatars/avatar-zoe.jpg",
                speaking: "/avatars/avatar-priya.jpg",
                shocked: "/avatars/avatar-maya.jpg",
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
        {
          id: "panelist",
          role: "panelist",
          visualProfile: {
            displayName: "Panelist",
            accentColor: "#a78bfa",
            avatar: {
              kind: "live2d",
              runtime: "preview-only",
              cubismVersion: "cubism5",
              modelJsonSrc: "/live2d/panelist/model3.json",
              previewPosterSrc: "/avatars/avatar-riya.jpg",
              scale: 1,
              offsetX: 0,
              offsetY: 0,
              motions: {
                idle: "Idle_01",
                speaking: "Talk_Excited",
                listening: "Listen_LeanIn",
              },
              expressions: {
                shocked: "Shock",
                deadpan: "Blank",
              },
            },
          },
          voiceProfile: {
            provider: "gemini",
            model: "gemini-3.1-flash-tts-preview",
            voiceId: "panel-voice",
          },
          personaPromptRef: "panel-v1",
        },
      ],
      segments: [],
      version: "1",
    });

    expect(plan.cast[0]?.visualProfile.avatar?.kind).toBe("image");
    expect(plan.cast[1]?.visualProfile.avatar?.kind).toBe("pngtuber");
    expect(plan.cast[2]?.visualProfile.avatar?.kind).toBe("live2d");
  });

  it("rejects non-preview live2d runtime configs", () => {
    const result = ReactionPlanSchema.safeParse({
      id: "invalid-live2d-runtime",
      sourceRef: createTokovoEpisodeSourceRef("episode-5"),
      cast: [
        {
          id: "hero",
          role: "hero",
          visualProfile: {
            displayName: "Hero",
            accentColor: "#f97316",
            avatar: {
              kind: "live2d",
              runtime: "render-runtime",
              cubismVersion: "cubism5",
              modelJsonSrc: "/live2d/hero/model3.json",
              scale: 1,
              offsetX: 0,
              offsetY: 0,
            },
          },
          voiceProfile: {
            provider: "gemini",
            model: "gemini-3.1-flash-tts-preview",
            voiceId: "hero-voice",
          },
          personaPromptRef: "hero-v2",
        },
      ],
      segments: [],
      version: "1",
      contentHash: "stub",
    });

    expect(result.success).toBe(false);
    expect(JSON.stringify(result.error?.format())).toMatch(/preview-only/);
  });

  it("supports enterprise character presets with asset registry and rights metadata", () => {
    const preset = createCharacterPreset({
      id: "kairo-flagship",
      personaPromptRef: "kairo-v3",
      voiceProfile: {
        provider: "gemini",
        model: "gemini-3.1-flash-tts-preview",
        voiceId: "kairo-voice",
      },
      visualProfile: {
        displayName: "Kairo.exe",
        accentColor: "#f97316",
        avatar: {
          kind: "live2d",
          runtime: "preview-only",
          cubismVersion: "cubism5",
          modelJsonSrc: "/live2d/kairo/model3.json",
          previewPosterSrc: "/avatars/avatar-leo.jpg",
          scale: 1,
          offsetX: 0,
          offsetY: 0,
          motions: {
            idle: "Idle_01",
            listening: "Listen_LeanIn",
            speaking: "Talk_Excited",
          },
          expressions: {
            shocked: "Shock",
            deadpan: "Blank",
          },
          parameterBindings: {
            mouthOpenParamIds: ["ParamMouthOpenY"],
            eyeOpenParamIds: ["ParamEyeLOpen", "ParamEyeROpen"],
            angleXParamId: "ParamAngleX",
            angleYParamId: "ParamAngleY",
            bodyAngleXParamId: "ParamBodyAngleX",
            visemeMap: {
              A: 1,
              E: 0.72,
              I: 0.64,
              O: 0.85,
              U: 0.58,
            },
          },
        },
      },
      assetBundle: {
        id: "bundle-kairo-live2d",
        rights: {
          status: "licensed",
          usageScope: "commercial",
          provider: "Live2D Inc.",
          licenseRef: "live2d-commercial-2026",
        },
        assets: [
          {
            id: "kairo-model",
            kind: "live2d-model",
            src: "/live2d/kairo/model3.json",
          },
          {
            id: "kairo-poster",
            kind: "image",
            src: "/avatars/avatar-leo.jpg",
          },
        ],
      },
    });

    const castMember = applyCharacterPresetToCastMember({
      id: "hero",
      role: "hero",
      preset,
    });

    const plan = createReactionPlan({
      id: "preset-plan",
      sourceRef: createTokovoEpisodeSourceRef("episode-preset"),
      cast: [castMember],
      segments: [],
      version: "1",
      characterPresets: [preset],
      assetRegistry: [preset.assetBundle],
    });

    expect(plan.characterPresets?.[0]?.id).toBe("kairo-flagship");
    expect(plan.assetRegistry?.[0]?.rights.provider).toBe("Live2D Inc.");
    expect(
      plan.characterPresets?.[0]?.visualProfile.avatar?.kind,
    ).toBe("live2d");
  });

  it("supports advanced pngtuber configs with motion video and mouth tracking", () => {
    const result = ReactionPlanSchema.safeParse({
      id: "advanced-pngtuber-plan",
      sourceRef: createTokovoEpisodeSourceRef("episode-png"),
      cast: [
        {
          id: "guest",
          role: "guest",
          visualProfile: {
            displayName: "Mira Byte",
            accentColor: "#38bdf8",
            avatar: {
              kind: "pngtuber",
              mode: "motion-video",
              speakingFps: 12,
              videoSrc: "/pngtuber/mira/loop_mouthless_h264.mp4",
              mouthTrackSrc: "/pngtuber/mira/mouth_track.json",
              mouthSprites: {
                closed: "/pngtuber/mira/mouth/closed.png",
                open: "/pngtuber/mira/mouth/open.png",
                half: "/pngtuber/mira/mouth/half.png",
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
          personaPromptRef: "guest-v3",
        },
      ],
      segments: [],
      version: "1",
      contentHash: "stub",
    });

    expect(result.success).toBe(true);
  });

  it("arbitrates overlapping segments into an interrupt-safe speech queue", () => {
    const segments = arbitrateReactionSegments([
      {
        id: "hero-1",
        speakerId: "hero",
        startFrame: 10,
        endFrame: 60,
        text: "First line",
        emotion: "shocked",
        interruptType: "hard-cut",
        captionMode: "always-on",
        priority: 100,
      },
      {
        id: "guest-1",
        speakerId: "guest",
        startFrame: 40,
        endFrame: 90,
        text: "Overlap line",
        emotion: "deadpan",
        interruptType: "soft-cut",
        captionMode: "always-on",
        priority: 95,
      },
      {
        id: "hero-2",
        speakerId: "hero",
        startFrame: 92,
        endFrame: 130,
        text: "Recovery line",
        emotion: "thinking",
        interruptType: "none",
        captionMode: "always-on",
        priority: 80,
      },
    ]);

    expect(segments).toHaveLength(3);
    expect(segments[0]?.endFrame).toBeLessThanOrEqual(
      segments[1]?.startFrame ?? Number.MAX_SAFE_INTEGER,
    );
    expect(segments[1]?.endFrame).toBeLessThanOrEqual(
      segments[2]?.startFrame ?? Number.MAX_SAFE_INTEGER,
    );
  });
});
