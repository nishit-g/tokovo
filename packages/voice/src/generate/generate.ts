import { VoiceScript } from "../types/script";
import { VoiceManifest, VoiceSegment } from "../types/manifest";
import { ElevenLabsClient } from "../providers/elevenlabs/client";
import { ElevenLabsTextToDialogueResponse } from "../providers/elevenlabs/types";
import { FileCache, computeScriptHash } from "../cache/file-cache";

export interface GenerateOptions {
  apiKey: string;
  cacheDir?: string;
  skipCache?: boolean;
  model?: string;
}

export interface GenerateResult {
  manifest: VoiceManifest;
  audioPath: string;
  cached: boolean;
}

function transformScriptToApiInputs(
  script: VoiceScript,
): Array<{ text: string; voice_id: string }> {
  return script.lines.map((line) => ({
    text: line.text,
    voice_id: script.voices[line.speaker],
  }));
}

function buildSegments(
  script: VoiceScript,
  response: ElevenLabsTextToDialogueResponse,
): VoiceSegment[] {
  return response.voice_segments.map((seg, index) => ({
    index,
    id: `seg_${index}`,
    speaker: script.lines[seg.dialogue_input_index].speaker,
    text: script.lines[seg.dialogue_input_index].text,
    startMs: Math.round(seg.start_time_seconds * 1000),
    endMs: Math.round(seg.end_time_seconds * 1000),
    durationMs: Math.round(
      (seg.end_time_seconds - seg.start_time_seconds) * 1000,
    ),
  }));
}

function buildManifest(
  script: VoiceScript,
  response: ElevenLabsTextToDialogueResponse,
  model: string,
): VoiceManifest {
  const segments = buildSegments(script, response);
  const lastSegment = segments[segments.length - 1];
  const durationMs = lastSegment ? lastSegment.endMs : 0;

  return {
    scriptId: script.id,
    audioFile: "audio.mp3",
    durationMs,
    generatedAt: new Date().toISOString(),
    provider: "elevenlabs",
    model,
    segments,
    alignment: response.alignment
      ? {
          characters: response.alignment.characters,
          startTimesMs: response.alignment.character_start_times_seconds.map(
            (t) => Math.round(t * 1000),
          ),
          endTimesMs: response.alignment.character_end_times_seconds.map((t) =>
            Math.round(t * 1000),
          ),
        }
      : undefined,
    contentHash: computeScriptHash(script),
  };
}

export async function generateVoice(
  script: VoiceScript,
  options: GenerateOptions,
): Promise<GenerateResult> {
  const cacheDir = options.cacheDir ?? "./generated/voice-cache";
  const cache = new FileCache({ cacheDir });

  if (!options.skipCache) {
    const cached = await cache.get(script);
    if (cached) {
      return {
        manifest: cached.manifest,
        audioPath: cached.audioPath,
        cached: true,
      };
    }
  }

  const client = new ElevenLabsClient({
    apiKey: options.apiKey,
    model: options.model,
  });

  const inputs = transformScriptToApiInputs(script);
  const response = await client.textToDialogue(inputs);

  const audioBuffer = Buffer.from(response.audio_base64, "base64");
  const manifest = buildManifest(script, response, client.getModel());

  const entry = await cache.set(script, audioBuffer, manifest);

  return {
    manifest: entry.manifest,
    audioPath: entry.audioPath,
    cached: false,
  };
}

export function validateScript(script: VoiceScript): string[] {
  const errors: string[] = [];

  if (!script.id) {
    errors.push("Script must have an id");
  }

  if (!script.voices || Object.keys(script.voices).length === 0) {
    errors.push("Script must have at least one voice defined");
  }

  if (!script.lines || script.lines.length === 0) {
    errors.push("Script must have at least one line");
  }

  const speakers = new Set(Object.keys(script.voices || {}));
  for (const line of script.lines || []) {
    if (!speakers.has(line.speaker)) {
      errors.push(`Unknown speaker "${line.speaker}" - not in voices map`);
    }
    if (!line.text || line.text.trim() === "") {
      errors.push(`Empty text for speaker "${line.speaker}"`);
    }
  }

  const totalChars = (script.lines || []).reduce(
    (sum, l) => sum + l.text.length,
    0,
  );
  if (totalChars > 5000) {
    errors.push(
      `Script exceeds 5000 character limit (${totalChars} chars) - ElevenLabs API restriction`,
    );
  }

  if (Object.keys(script.voices || {}).length > 10) {
    errors.push("Script exceeds 10 voice limit - ElevenLabs API restriction");
  }

  return errors;
}
