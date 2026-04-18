import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { VoiceManifest, VoiceSegment } from "../types/manifest.js";
import {
  AlignmentData,
  ReactorVoiceRequest,
  TTSProvider,
  VoiceGenerationArtifact,
  VoiceProfile,
  buildProviderAttemptOrder,
  computeVoiceArtifactKey,
} from "../providers/types.js";

export interface GenerateReactorVoiceOptions {
  cacheDir?: string;
  skipCache?: boolean;
  providers: Record<string, TTSProvider>;
}

export interface GenerateReactorVoiceResult {
  manifest: VoiceManifest;
  artifact: VoiceGenerationArtifact;
  cached: boolean;
}

export interface ReactorVoiceAttempt {
  provider: string;
  model: string;
  speakerProfiles: Record<string, VoiceProfile>;
}

function requestNeedsStyleTags(request: ReactorVoiceRequest): boolean {
  return request.lines.some(
    (line) =>
      !!line.emotion ||
      !!line.stylePrompt ||
      !!request.profile?.stylePrompt ||
      !!request.speakerProfiles?.[line.speakerId]?.stylePrompt,
  );
}

function requestNeedsDialogueSupport(request: ReactorVoiceRequest): boolean {
  return new Set(request.lines.map((line) => line.speakerId)).size > 1;
}

function providerCanSatisfyRequest(
  provider: TTSProvider,
  request: ReactorVoiceRequest,
): boolean {
  const capabilities = provider.capabilities;
  if (!capabilities) {
    return true;
  }

  if (requestNeedsDialogueSupport(request) && !capabilities.supportsDialogue) {
    return false;
  }

  if (requestNeedsStyleTags(request) && !capabilities.supportsStyleTags) {
    return false;
  }

  if (
    request.alignmentMode === "require-character" &&
    !capabilities.supportsAlignment
  ) {
    return false;
  }

  return true;
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
}

function computeReactorVoiceContentHash(request: ReactorVoiceRequest): string {
  return createHash("sha256")
    .update(
      stableSerialize({
        id: request.id,
        format: request.format,
        lines: request.lines,
        profile: request.profile,
        speakerProfiles: request.speakerProfiles,
      }),
    )
    .digest("hex")
    .slice(0, 16);
}

function resolveSpeakerProfiles(
  request: ReactorVoiceRequest,
): Record<string, VoiceProfile> {
  if (request.speakerProfiles && Object.keys(request.speakerProfiles).length > 0) {
    return request.speakerProfiles;
  }

  if (!request.profile) {
    throw new Error(
      "Reactor voice generation requires either a shared profile or speakerProfiles",
    );
  }

  return Object.fromEntries(
    Array.from(new Set(request.lines.map((line) => line.speakerId))).map(
      (speakerId) => [speakerId, request.profile as VoiceProfile],
    ),
  );
}

function buildPromptedText(
  line: ReactorVoiceRequest["lines"][number],
  profile: VoiceProfile,
): string {
  const prefixes = [line.emotion, line.stylePrompt, profile.stylePrompt]
    .filter((entry) => entry && entry.trim().length > 0)
    .map((entry) => `[${entry}]`);

  return prefixes.length > 0
    ? `${prefixes.join(" ")} ${line.text}`
    : line.text;
}

function buildManifestSegments(
  request: ReactorVoiceRequest,
  segments: Array<{ index: number; startMs: number; endMs: number }>,
): VoiceSegment[] {
  return segments.map((segment, index) => ({
    index,
    id: `seg_${index}`,
    speaker: request.lines[segment.index]?.speakerId ?? "unknown",
    text: request.lines[segment.index]?.text ?? "",
    startMs: Math.round(segment.startMs),
    endMs: Math.round(segment.endMs),
    durationMs: Math.max(0, Math.round(segment.endMs - segment.startMs)),
  }));
}

function buildAlignment(
  alignment?: AlignmentData,
): VoiceManifest["alignment"] | undefined {
  if (!alignment) {
    return undefined;
  }

  return {
    characters: alignment.characters,
    startTimesMs: alignment.startTimesSeconds.map((value) =>
      Math.round(value * 1000),
    ),
    endTimesMs: alignment.endTimesSeconds.map((value) =>
      Math.round(value * 1000),
    ),
  };
}

export function buildReactorVoiceAttempts(
  request: ReactorVoiceRequest,
): ReactorVoiceAttempt[] {
  const speakerProfiles = resolveSpeakerProfiles(request);
  const perSpeakerOrders = Object.fromEntries(
    Object.entries(speakerProfiles).map(([speakerId, profile]) => [
      speakerId,
      buildProviderAttemptOrder(profile),
    ]),
  );

  const orderedPairs: Array<{ provider: string; model: string }> = [];
  const seenPairs = new Set<string>();

  for (const order of Object.values(perSpeakerOrders)) {
    for (const profile of order) {
      const pairKey = `${profile.provider}:${profile.model}`;
      if (seenPairs.has(pairKey)) {
        continue;
      }
      seenPairs.add(pairKey);
      orderedPairs.push({
        provider: profile.provider,
        model: profile.model,
      });
    }
  }

  return orderedPairs.flatMap((pair) => {
    const resolvedProfiles: Record<string, VoiceProfile> = {};

    for (const [speakerId, order] of Object.entries(perSpeakerOrders)) {
      const matched = order.find(
        (profile) =>
          profile.provider === pair.provider && profile.model === pair.model,
      );

      if (!matched) {
        return [];
      }

      resolvedProfiles[speakerId] = matched;
    }

    return [
      {
        provider: pair.provider,
        model: pair.model,
        speakerProfiles: resolvedProfiles,
      },
    ];
  });
}

function readCachedArtifact(
  cacheDir: string,
  cacheKey: string,
  format: ReactorVoiceRequest["format"],
): GenerateReactorVoiceResult | null {
  const entryDir = path.join(cacheDir, cacheKey);
  const manifestPath = path.join(entryDir, "manifest.json");
  const audioPath = path.join(entryDir, `audio.${format}`);
  const artifactPath = path.join(entryDir, "artifact.json");

  if (
    !fs.existsSync(manifestPath) ||
    !fs.existsSync(audioPath) ||
    !fs.existsSync(artifactPath)
  ) {
    return null;
  }

  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8"),
  ) as VoiceManifest;
  const artifact = JSON.parse(
    fs.readFileSync(artifactPath, "utf-8"),
  ) as VoiceGenerationArtifact;

  return {
    manifest,
    artifact,
    cached: true,
  };
}

function writeArtifactFiles(input: {
  cacheDir: string;
  cacheKey: string;
  format: ReactorVoiceRequest["format"];
  audioBuffer: Buffer;
  manifest: VoiceManifest;
  artifact: VoiceGenerationArtifact;
}): void {
  const entryDir = path.join(input.cacheDir, input.cacheKey);
  fs.mkdirSync(entryDir, { recursive: true });
  fs.writeFileSync(path.join(entryDir, `audio.${input.format}`), input.audioBuffer);
  fs.writeFileSync(
    path.join(entryDir, "manifest.json"),
    JSON.stringify(input.manifest, null, 2),
  );
  fs.writeFileSync(
    path.join(entryDir, "artifact.json"),
    JSON.stringify(input.artifact, null, 2),
  );
}

export async function generateReactorVoice(
  request: ReactorVoiceRequest,
  options: GenerateReactorVoiceOptions,
): Promise<GenerateReactorVoiceResult> {
  const cacheDir = options.cacheDir ?? "./generated/reactor-voice-cache";
  const contentHash = computeReactorVoiceContentHash(request);
  const attempts = buildReactorVoiceAttempts(request);

  if (attempts.length === 0) {
    throw new Error("No compatible provider/model attempts found for reactor voice request");
  }

  let lastError: Error | null = null;

  for (const [attemptIndex, attempt] of attempts.entries()) {
    const provider = options.providers[attempt.provider];
    if (!provider) {
      lastError = new Error(`No TTS provider registered for "${attempt.provider}"`);
      continue;
    }

    if (!providerCanSatisfyRequest(provider, request)) {
      lastError = new Error(
        `Provider "${attempt.provider}" cannot satisfy the requested reactor voice capabilities`,
      );
      continue;
    }

    const primaryVoiceId = Object.values(attempt.speakerProfiles)[0]?.voiceId ?? "voice";
    const cacheKey = computeVoiceArtifactKey({
      contentHash,
      provider: attempt.provider,
      model: attempt.model,
      voiceId: primaryVoiceId,
    });

    if (!options.skipCache) {
      const cached = readCachedArtifact(cacheDir, cacheKey, request.format);
      if (cached) {
        return cached;
      }
    }

    const script = {
      id: request.id,
      voices: Object.fromEntries(
        Object.entries(attempt.speakerProfiles).map(([speakerId, profile]) => [
          speakerId,
          profile.voiceId,
        ]),
      ),
      lines: request.lines.map((line) => ({
        speaker: line.speakerId,
        text: buildPromptedText(line, attempt.speakerProfiles[line.speakerId]!),
      })),
    };
    const validation = provider.validateScript(script);
    if (!validation.valid) {
      lastError = new Error(validation.errors.join("; "));
      continue;
    }

    try {
      const result = await provider.generateDialogue({
        model: attempt.model,
        outputFormat: request.format,
        inputs: request.lines.map((line) => ({
          text: buildPromptedText(line, attempt.speakerProfiles[line.speakerId]!),
          voiceId: attempt.speakerProfiles[line.speakerId]!.voiceId,
        })),
      });

      const manifestSegments = buildManifestSegments(request, result.segments);
      const manifest: VoiceManifest = {
        scriptId: request.id,
        audioFile: `audio.${request.format}`,
        durationMs:
          manifestSegments[manifestSegments.length - 1]?.endMs ?? result.durationMs,
        generatedAt: new Date().toISOString(),
        provider: attempt.provider,
        model: attempt.model,
        segments: manifestSegments,
        alignment: buildAlignment(result.alignment),
        contentHash,
      };

      const artifact: VoiceGenerationArtifact = {
        audioPath: path.join(cacheDir, cacheKey, `audio.${request.format}`),
        manifestPath: path.join(cacheDir, cacheKey, "manifest.json"),
        cacheKey,
        provider: attempt.provider,
        model: attempt.model,
        voiceId: primaryVoiceId,
        contentHash,
        usedFallback: attemptIndex > 0,
        alignmentCoverage: result.alignment
          ? "character"
          : request.alignmentMode === "none"
            ? "none"
            : "segment",
      };

      writeArtifactFiles({
        cacheDir,
        cacheKey,
        format: request.format,
        audioBuffer: result.audioBuffer,
        manifest,
        artifact,
      });

      return {
        manifest,
        artifact,
        cached: false,
      };
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw lastError ?? new Error("Unable to generate reactor voice artifact");
}
