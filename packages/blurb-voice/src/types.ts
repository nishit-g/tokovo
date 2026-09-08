export type BlurbEmotion =
  | "neutral"
  | "excited"
  | "angry"
  | "annoyed"
  | "panic"
  | "confused"
  | "sad"
  | "smug"
  | "deadpan";

export type BlurbLength = "tiny" | "short" | "medium" | "long";

export type BlurbContour = "rise" | "fall" | "flat" | "bounce";

export type BlurbChatIntent =
  | "controlled-accusation"
  | "held-breath-anticipation"
  | "urgent-warning"
  | "caught-panic"
  | "nervous-justification"
  | "bad-news-realization"
  | "smug-reframe"
  | "hesitant-question"
  | "deadpan-verdict"
  | "defeated-button"
  | "interrupted-protest"
  | "suspicious-check"
  | "eager-confirmation"
  | "delayed-realization"
  | "tiny-confession";

export type BlurbCueRole = "speaker" | "reaction" | "anticipation";

export interface BlurbCueDirection {
  role: BlurbCueRole;
  preSilenceMs: number;
  postSilenceMs: number;
  interruption: "clean" | "may-overlap" | "cuts-current";
  prominence: "foreground" | "background" | "button";
}

export interface BlurbIntentProfile extends BlurbCueDirection {
  emotion: BlurbEmotion;
  intensity: number;
  length: BlurbLength;
  finalContour: BlurbContour;
}

export interface BlurbVoiceSignature {
  /** High values feel controlled; low values feel elastic. */
  cadenceRegularity: number;

  /** Probability and size of expressive micro-pauses. */
  hesitation: number;

  /** Strength of the short orienting transient at syllable attacks. */
  onsetSalience: number;

  /** Softens upper harmonics without simply lowering the voice. */
  warmth: number;

  /** Repeating phrase melody that makes the performer recognizable. */
  pitchMotifSemitones: readonly number[];

  /** Amount of carry-over and overlap between neighboring syllables. */
  coarticulation: number;

  /** Amount of vowel-resonance movement inside each syllable. */
  vowelDrift: number;

  /** Slow pitch and amplitude imperfection; never sample-to-sample randomness. */
  microVariation: number;
}

export interface BlurbVoice {
  id: string;
  basePitchHz: number;
  pitchRangeSemitones: number;
  formantScale: number;
  spectralTilt: number;
  breathiness: number;
  roughness: number;
  electronic: number;
  tempo: number;
  syllables: readonly string[];
  signature: BlurbVoiceSignature;
}

export interface BlurbUtterance {
  id: string;
  performer: string;
  text: string;
  intent?: BlurbChatIntent;
  role?: BlurbCueRole;
  /** Exact recurring character-language units, when the director wants them. */
  lexemes?: readonly string[];
  emotion?: BlurbEmotion;
  intensity?: number;
  length?: BlurbLength;
  finalContour?: BlurbContour;
  pauseAfterMs?: number;
  seed?: string | number;
}

export interface BlurbScript {
  id: string;
  voices: Record<string, BlurbVoice>;
  utterances: BlurbUtterance[];
  seed?: string | number;
}

export interface BlurbSegmentAnalysis {
  frameRate: number;
  energy: number[];
  mouth: Array<"closed" | "small" | "medium" | "wide">;
  emphasisFrames: number[];
}

export interface BlurbSegment {
  index: number;
  id: string;
  /** Voice-renderer-compatible speaker alias for the authored performer. */
  speaker: string;
  performer: string;
  text: string;
  intent?: BlurbChatIntent;
  direction: BlurbCueDirection;
  emotion: BlurbEmotion;
  syllables: string[];
  startSample: number;
  endSample: number;
  startMs: number;
  endMs: number;
  durationMs: number;
  analysis: BlurbSegmentAnalysis;
}

export interface BlurbManifest {
  version: 1;
  scriptId: string;
  audioFile: string;
  sampleRate: number;
  channels: 1;
  durationMs: number;
  /** Fixed value keeps procedural manifests byte-stable across generations. */
  generatedAt: "1970-01-01T00:00:00.000Z";
  provider: "tokovo-blurb";
  model: "tokovo-blurb-v2";
  contentHash: string;
  segments: BlurbSegment[];
}

export interface GenerateBlurbOptions {
  sampleRate?: number;
  analysisFrameRate?: number;
  audioFile?: string;
}

export interface GeneratedBlurbScript {
  pcm: Int16Array;
  wav: Uint8Array;
  manifest: BlurbManifest;
}
