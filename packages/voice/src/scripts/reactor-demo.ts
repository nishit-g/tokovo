import {
  type GenerateReactorVoiceResult,
  generateReactorVoice,
} from "../generate/index.js";
import { createMockTTSProvider } from "../providers/index.js";
import type { ReactorVoiceRequest } from "../providers/types.js";

export interface ReactorVoiceDemoOptions {
  cacheDir?: string;
}

export interface ReactorVoiceDemoResult extends GenerateReactorVoiceResult {
  request: ReactorVoiceRequest;
}

export async function runReactorVoiceDemo(
  options: ReactorVoiceDemoOptions = {},
): Promise<ReactorVoiceDemoResult> {
  const demoLite = createMockTTSProvider({
    name: "demo-lite",
    voiceDurationMs: 260,
  });
  demoLite.capabilities = {
    supportsDialogue: true,
    supportsAlignment: false,
    supportsStyleTags: false,
  };

  const demoPro = createMockTTSProvider({
    name: "demo-pro",
    voiceDurationMs: 360,
  });

  const request: ReactorVoiceRequest = {
    id: "reactor-demo",
    format: "wav",
    alignmentMode: "require-character",
    lines: [
      {
        speakerId: "hero",
        text: "Bro this screenshot ended his whole career.",
        emotion: "shocked",
        stylePrompt: "fast and punchy",
      },
      {
        speakerId: "guest",
        text: "No, the font roast is somehow worse.",
        emotion: "deadpan",
        stylePrompt: "dry and sharp",
      },
    ],
    speakerProfiles: {
      hero: {
        provider: "demo-lite",
        model: "demo-lite-v1",
        voiceId: "hero-lite",
        stylePrompt: "urgent",
        fallbackChain: [
          {
            provider: "demo-pro",
            model: "demo-pro-v1",
            voiceId: "hero-pro",
            stylePrompt: "urgent",
          },
        ],
      },
      guest: {
        provider: "demo-lite",
        model: "demo-lite-v1",
        voiceId: "guest-lite",
        stylePrompt: "dry",
        fallbackChain: [
          {
            provider: "demo-pro",
            model: "demo-pro-v1",
            voiceId: "guest-pro",
            stylePrompt: "dry",
          },
        ],
      },
    },
  };

  const result = await generateReactorVoice(request, {
    cacheDir: options.cacheDir,
    providers: {
      "demo-lite": demoLite,
      "demo-pro": demoPro,
    },
  });

  return {
    ...result,
    request,
  };
}
