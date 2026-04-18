import {
  DialogueRequest,
  DialogueResult,
  TTSProvider,
  ValidationResult,
} from "../types.js";

export interface MockTTSProviderOptions {
  name?: string;
  sampleRate?: number;
  voiceDurationMs?: number;
}

function stripLeadingTags(text: string): string {
  return text.replace(/^(?:\[[^\]]+\]\s*)+/, "").trim();
}

function buildWavBuffer(samples: Int16Array, sampleRate: number): Buffer {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < samples.length; index += 1) {
    buffer.writeInt16LE(samples[index] ?? 0, 44 + index * 2);
  }

  return buffer;
}

function createToneSamples(input: {
  durationMs: number;
  sampleRate: number;
  frequencyHz: number;
  amplitude?: number;
}): Int16Array {
  const totalSamples = Math.max(
    1,
    Math.round((input.durationMs / 1000) * input.sampleRate),
  );
  const amplitude = input.amplitude ?? 0.28;
  const samples = new Int16Array(totalSamples);

  for (let index = 0; index < totalSamples; index += 1) {
    const time = index / input.sampleRate;
    const envelope = Math.min(1, index / 200) * Math.min(1, (totalSamples - index) / 200);
    const value =
      Math.sin(2 * Math.PI * input.frequencyHz * time) * amplitude * envelope;
    samples[index] = Math.round(value * 32767);
  }

  return samples;
}

export function createMockTTSProvider(
  options: MockTTSProviderOptions = {},
): TTSProvider {
  const sampleRate = options.sampleRate ?? 24000;
  const voiceDurationMs = options.voiceDurationMs ?? 420;

  return {
    name: options.name ?? "mock",
    capabilities: {
      supportsDialogue: true,
      supportsAlignment: true,
      supportsStyleTags: true,
    },
    async generateDialogue(request: DialogueRequest): Promise<DialogueResult> {
      const segments = request.inputs.map((input, index) => {
        const cleanText = stripLeadingTags(input.text);
        const durationMs = Math.max(
          voiceDurationMs,
          Math.round(cleanText.length * 42 + 180),
        );
        const startMs =
          index === 0 ? 0 : request.inputs.slice(0, index).reduce((sum, line) => {
            const previousText = stripLeadingTags(line.text);
            return sum + Math.max(voiceDurationMs, Math.round(previousText.length * 42 + 180));
          }, 0);
        return {
          index,
          voiceId: input.voiceId,
          startMs,
          endMs: startMs + durationMs,
          text: cleanText,
          durationMs,
        };
      });

      const mergedCharacters: string[] = [];
      const startTimesSeconds: number[] = [];
      const endTimesSeconds: number[] = [];

      for (const segment of segments) {
        const chars = Array.from(segment.text);
        const charDurationMs = Math.max(
          20,
          Math.round(segment.durationMs / Math.max(chars.length, 1)),
        );
        chars.forEach((char, index) => {
          mergedCharacters.push(char);
          const startMs = segment.startMs + index * charDurationMs;
          startTimesSeconds.push(startMs / 1000);
          endTimesSeconds.push((startMs + charDurationMs) / 1000);
        });
        mergedCharacters.push(" ");
        startTimesSeconds.push(segment.endMs / 1000);
        endTimesSeconds.push(segment.endMs / 1000);
      }

      const totalDurationMs = segments[segments.length - 1]?.endMs ?? voiceDurationMs;
      const frequencyBase = 180;
      const toneSamples = createToneSamples({
        durationMs: totalDurationMs,
        sampleRate,
        frequencyHz: frequencyBase + request.inputs.length * 20,
      });

      return {
        audioBuffer: buildWavBuffer(toneSamples, sampleRate),
        durationMs: totalDurationMs,
        segments: segments.map(({ index, voiceId, startMs, endMs }) => ({
          index,
          voiceId,
          startMs,
          endMs,
        })),
        alignment: {
          characters: mergedCharacters,
          startTimesSeconds,
          endTimesSeconds,
        },
      };
    },
    estimateCost() {
      return 0;
    },
    validateScript(script): ValidationResult {
      const errors: string[] = [];

      if (!script.id) {
        errors.push("Script must have an id");
      }

      if (!script.lines.length) {
        errors.push("Script must contain at least one line");
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings: [],
      };
    },
  };
}
