#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import {
  createCharacterScript,
  createCastScript,
  encodeMonoPcm16Wav,
  generateBlurbScript,
  TOKOVO_CHARACTERS,
  TOKOVO_CAST_VOICES,
  type BlurbEmotion,
  type BlurbLength,
  type BlurbContour,
  type BlurbCueRole,
  type BlurbChatIntent,
  type BlurbCharacterContext,
  type BlurbSpeechAct,
  type TokovoCharacterId,
  type TokovoCastVoiceId,
} from "../src/index.js";

interface AuthoredScript {
  id: string;
  seed?: string | number;
  voices: Record<string, TokovoCastVoiceId>;
  utterances: Array<{
    id: string;
    performer: string;
    text: string;
    intent?: BlurbChatIntent;
    role?: BlurbCueRole;
    lexemes?: string[];
    emotion?: BlurbEmotion;
    intensity?: number;
    length?: BlurbLength;
    finalContour?: BlurbContour;
    pauseAfterMs?: number;
    seed?: string | number;
  }>;
}

interface AuthoredCharacterScript {
  id: string;
  seed?: string | number;
  character: TokovoCharacterId;
  lines: Array<{
    id: string;
    message: string;
    act: BlurbSpeechAct;
    tone?: BlurbEmotion;
    intensity?: number;
    intent?: BlurbChatIntent;
    context?: BlurbCharacterContext;
    seed?: string | number;
  }>;
}

interface AuthoredCastScript {
  id: string;
  seed?: string | number;
  cast: TokovoCharacterId[];
  lines: Array<{
    id: string;
    character: TokovoCharacterId;
    message: string;
    act: BlurbSpeechAct;
    tone?: BlurbEmotion;
    intensity?: number;
    intent?: BlurbChatIntent;
    context?: BlurbCharacterContext;
    seed?: string | number;
  }>;
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help")) {
  console.log(`
Usage: pnpm blurb:generate <script.json> [--output <directory>]

Generates a deterministic mono PCM16 WAV and mouth-animation manifest.

Example:
  pnpm blurb:demo
  pnpm blurb:micro-demo
  pnpm blurb:generate scripts/examples/cast-listening-sheet.json
`);
  process.exit(0);
}

const scriptPath = path.resolve(args[0]);
const outputIndex = args.indexOf("--output");
const authored = JSON.parse(fs.readFileSync(scriptPath, "utf8")) as
  | AuthoredScript
  | AuthoredCharacterScript
  | AuthoredCastScript;
const outputDirectory = path.resolve(
  outputIndex >= 0 && args[outputIndex + 1]
    ? args[outputIndex + 1]
    : path.join("generated", authored.id),
);
const audioFile = `${authored.id}.wav`;
const script =
  "cast" in authored
    ? createCastScript(
        authored.id,
        authored.cast.map((characterId) => TOKOVO_CHARACTERS[characterId]),
        authored.lines.map(({ character, ...line }) => ({
          ...line,
          characterId: TOKOVO_CHARACTERS[character].id,
        })),
        authored.seed,
      )
    : "character" in authored
    ? createCharacterScript(
        authored.id,
        TOKOVO_CHARACTERS[authored.character],
        authored.lines,
        authored.seed,
      )
    : {
        id: authored.id,
        seed: authored.seed,
        voices: Object.fromEntries(
          Object.entries(authored.voices).map(([performer, presetId]) => {
            const preset = TOKOVO_CAST_VOICES[presetId];
            if (!preset) {
              throw new Error(`Unknown cast voice preset: ${presetId}`);
            }
            return [performer, preset];
          }),
        ),
        utterances: authored.utterances,
      };
const result = generateBlurbScript(script, { audioFile });

fs.mkdirSync(outputDirectory, { recursive: true });
const audioPath = path.join(outputDirectory, audioFile);
const manifestPath = path.join(outputDirectory, `${authored.id}.json`);
const stemsDirectory = path.join(outputDirectory, "stems");
fs.writeFileSync(audioPath, result.wav);
fs.writeFileSync(manifestPath, `${JSON.stringify(result.manifest, null, 2)}\n`);
fs.mkdirSync(stemsDirectory, { recursive: true });
for (const segment of result.manifest.segments) {
  const stemPcm = result.pcm.slice(segment.startSample, segment.endSample);
  const stemWav = encodeMonoPcm16Wav(stemPcm, result.manifest.sampleRate);
  fs.writeFileSync(path.join(stemsDirectory, `${segment.index + 1}-${segment.id}.wav`), stemWav);
}

console.log(`Generated ${result.manifest.scriptId}`);
console.log(`  Audio: ${audioPath}`);
console.log(`  Manifest: ${manifestPath}`);
console.log(`  Stems: ${stemsDirectory}`);
console.log(`  Duration: ${(result.manifest.durationMs / 1_000).toFixed(2)}s`);
console.log(`  Hash: ${result.manifest.contentHash}`);
for (const segment of result.manifest.segments) {
  console.log(
    `  ${segment.id}: ${segment.performer} / ${segment.emotion} / ${segment.syllables.join("-")}`,
  );
}
