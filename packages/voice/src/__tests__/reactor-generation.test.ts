import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  DialogueRequest,
  DialogueResult,
  TTSProvider,
  ValidationResult,
} from "../providers/types.js";
import { generateReactorVoice } from "../generate/index.js";

const tempDirs: string[] = [];

function createTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tokovo-reactor-voice-"));
  tempDirs.push(dir);
  return dir;
}

function createProvider(
  name: string,
  generateDialogue: (request: DialogueRequest) => Promise<DialogueResult>,
): TTSProvider {
  return {
    name,
    capabilities: {
      supportsDialogue: true,
      supportsAlignment: true,
      supportsStyleTags: true,
    },
    async generateDialogue(request) {
      return generateDialogue(request);
    },
    estimateCost() {
      return 0;
    },
    validateScript() {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };
      return result;
    },
  };
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("generateReactorVoice", () => {
  it("falls back to a secondary provider and caches the artifact", async () => {
    const primary = createProvider("gemini", async () => {
      throw new Error("primary unavailable");
    });
    const fallbackGenerate = vi.fn(async (request: DialogueRequest) => ({
      audioBuffer: Buffer.from("fallback-audio"),
      durationMs: 1700,
      segments: request.inputs.map((input, index) => ({
        index,
        voiceId: input.voiceId,
        startMs: index * 800,
        endMs: index * 800 + 700,
      })),
      alignment: {
        characters: Array.from("Bro no way"),
        startTimesSeconds: Array.from({ length: "Bro no way".length }, (_, i) => i * 0.05),
        endTimesSeconds: Array.from({ length: "Bro no way".length }, (_, i) => i * 0.05 + 0.04),
      },
    }));
    const fallback = createProvider("chatterbox", fallbackGenerate);

    const cacheDir = createTempDir();
    const request = {
      id: "reactor-voice-1",
      format: "mp3" as const,
      lines: [
        { speakerId: "hero", text: "Bro no way.", emotion: "shocked" },
        { speakerId: "guest", text: "This got worse.", emotion: "deadpan" },
      ],
      speakerProfiles: {
        hero: {
          provider: "gemini",
          model: "gemini-3.1-flash-tts-preview",
          voiceId: "hero-primary",
          fallbackChain: [
            {
              provider: "chatterbox",
              model: "chatterbox-turbo",
              voiceId: "hero-fallback",
            },
          ],
        },
        guest: {
          provider: "gemini",
          model: "gemini-3.1-flash-tts-preview",
          voiceId: "guest-primary",
          fallbackChain: [
            {
              provider: "chatterbox",
              model: "chatterbox-turbo",
              voiceId: "guest-fallback",
            },
          ],
        },
      },
    };

    const first = await generateReactorVoice(request, {
      cacheDir,
      providers: { gemini: primary, chatterbox: fallback },
    });
    const second = await generateReactorVoice(request, {
      cacheDir,
      providers: { gemini: primary, chatterbox: fallback },
    });

    expect(first.cached).toBe(false);
    expect(first.artifact.usedFallback).toBe(true);
    expect(first.artifact.provider).toBe("chatterbox");
    expect(first.artifact.alignmentCoverage).toBe("character");
    expect(first.manifest.segments.map((segment) => segment.speaker)).toEqual([
      "hero",
      "guest",
    ]);
    expect(second.cached).toBe(true);
    expect(fallbackGenerate).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(first.artifact.audioPath)).toBe(true);
    expect(fs.existsSync(first.artifact.manifestPath ?? "")).toBe(true);
  });

  it("skips providers that cannot handle style tags", async () => {
    const unsupportedGenerate = vi.fn(async () => ({
      audioBuffer: Buffer.from("unsupported"),
      durationMs: 1000,
      segments: [],
    }));
    const unsupported = createProvider("basic", unsupportedGenerate);
    unsupported.capabilities = {
      supportsDialogue: true,
      supportsAlignment: false,
      supportsStyleTags: false,
    };

    const fallbackGenerate = vi.fn(async (request: DialogueRequest) => ({
      audioBuffer: Buffer.from("styled-audio"),
      durationMs: 1200,
      segments: request.inputs.map((input, index) => ({
        index,
        voiceId: input.voiceId,
        startMs: index * 500,
        endMs: index * 500 + 450,
      })),
      alignment: {
        characters: Array.from("styled voice"),
        startTimesSeconds: Array.from({ length: "styled voice".length }, (_, i) => i * 0.05),
        endTimesSeconds: Array.from({ length: "styled voice".length }, (_, i) => i * 0.05 + 0.04),
      },
    }));
    const fallback = createProvider("mock", fallbackGenerate);

    const result = await generateReactorVoice(
      {
        id: "style-required",
        format: "wav",
        lines: [
          {
            speakerId: "hero",
            text: "You have got to be kidding me.",
            emotion: "shocked",
            stylePrompt: "fast and punchy",
          },
        ],
        profile: {
          provider: "basic",
          model: "basic-v1",
          voiceId: "hero-basic",
          stylePrompt: "urgent",
          fallbackChain: [
            {
              provider: "mock",
              model: "mock-v1",
              voiceId: "hero-mock",
            },
          ],
        },
      },
      {
        cacheDir: createTempDir(),
        providers: { basic: unsupported, mock: fallback },
      },
    );

    expect(unsupportedGenerate).not.toHaveBeenCalled();
    expect(fallbackGenerate).toHaveBeenCalledTimes(1);
    expect(result.artifact.provider).toBe("mock");
  });

  it("requires alignment-capable providers when character alignment is mandatory", async () => {
    const noAlignmentGenerate = vi.fn(async (request: DialogueRequest) => ({
      audioBuffer: Buffer.from("no-alignment"),
      durationMs: 900,
      segments: request.inputs.map((input, index) => ({
        index,
        voiceId: input.voiceId,
        startMs: index * 400,
        endMs: index * 400 + 350,
      })),
    }));
    const noAlignment = createProvider("cloud-lite", noAlignmentGenerate);
    noAlignment.capabilities = {
      supportsDialogue: true,
      supportsAlignment: false,
      supportsStyleTags: true,
    };

    const alignmentGenerate = vi.fn(async (request: DialogueRequest) => ({
      audioBuffer: Buffer.from("alignment"),
      durationMs: 900,
      segments: request.inputs.map((input, index) => ({
        index,
        voiceId: input.voiceId,
        startMs: index * 400,
        endMs: index * 400 + 350,
      })),
      alignment: {
        characters: Array.from("captions"),
        startTimesSeconds: Array.from({ length: "captions".length }, (_, i) => i * 0.03),
        endTimesSeconds: Array.from({ length: "captions".length }, (_, i) => i * 0.03 + 0.02),
      },
    }));
    const alignmentProvider = createProvider("mock-align", alignmentGenerate);

    const result = await generateReactorVoice(
      {
        id: "alignment-required",
        format: "wav",
        alignmentMode: "require-character",
        lines: [{ speakerId: "hero", text: "Caption me cleanly." }],
        profile: {
          provider: "cloud-lite",
          model: "lite-v1",
          voiceId: "hero-lite",
          fallbackChain: [
            {
              provider: "mock-align",
              model: "mock-v1",
              voiceId: "hero-align",
            },
          ],
        },
      },
      {
        cacheDir: createTempDir(),
        providers: { "cloud-lite": noAlignment, "mock-align": alignmentProvider },
      },
    );

    expect(noAlignmentGenerate).not.toHaveBeenCalled();
    expect(alignmentGenerate).toHaveBeenCalledTimes(1);
    expect(result.artifact.alignmentCoverage).toBe("character");
    expect(result.artifact.provider).toBe("mock-align");
  });
});
