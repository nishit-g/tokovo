import { VoiceScript } from "../types/script.js";

export interface DialogueInput {
  text: string;
  voiceId: string;
}

export interface DialogueRequest {
  inputs: DialogueInput[];
  model?: string;
  outputFormat?: "mp3" | "wav";
}

export interface SegmentTiming {
  index: number;
  voiceId: string;
  startMs: number;
  endMs: number;
}

export interface AlignmentData {
  characters: string[];
  startTimesSeconds: number[];
  endTimesSeconds: number[];
}

export interface DialogueResult {
  audioBuffer: Buffer;
  durationMs: number;
  segments: SegmentTiming[];
  alignment?: AlignmentData;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TTSProviderCapabilities {
  supportsDialogue: boolean;
  supportsAlignment: boolean;
  supportsStyleTags: boolean;
}

export interface VoiceProfile {
  provider: string;
  model: string;
  voiceId: string;
  stylePrompt?: string;
  fallbackChain?: VoiceProfile[];
}

export interface ReactorVoiceLine {
  speakerId: string;
  text: string;
  emotion?: string;
  stylePrompt?: string;
}

export interface ReactorVoiceRequest {
  id: string;
  format: "mp3" | "wav";
  lines: ReactorVoiceLine[];
  alignmentMode?: "none" | "prefer-character" | "require-character";
  profile?: VoiceProfile;
  speakerProfiles?: Record<string, VoiceProfile>;
}

export interface VoiceGenerationArtifact {
  audioPath: string;
  manifestPath?: string;
  cacheKey: string;
  provider: string;
  model: string;
  voiceId: string;
  contentHash: string;
  usedFallback: boolean;
  alignmentCoverage: "none" | "segment" | "character";
}

export interface TTSProvider {
  name: string;
  capabilities?: TTSProviderCapabilities;
  generateDialogue(request: DialogueRequest): Promise<DialogueResult>;
  estimateCost(script: VoiceScript): number;
  validateScript(script: VoiceScript): ValidationResult;
}

export function buildProviderAttemptOrder(
  profile: VoiceProfile,
): VoiceProfile[] {
  const seen = new Set<string>();
  return [profile, ...(profile.fallbackChain ?? [])].filter((entry) => {
    const key = `${entry.provider}:${entry.model}:${entry.voiceId}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function computeVoiceArtifactKey(input: {
  contentHash: string;
  provider: string;
  model: string;
  voiceId: string;
}): string {
  return [
    input.contentHash,
    input.provider,
    input.model.replace(/[^a-zA-Z0-9._-]+/g, "_"),
    input.voiceId.replace(/[^a-zA-Z0-9._-]+/g, "_"),
  ].join("__");
}
