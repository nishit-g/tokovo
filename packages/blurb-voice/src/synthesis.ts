import type {
  BlurbContour,
  BlurbEmotion,
  BlurbLength,
  BlurbScript,
  BlurbSegment,
  BlurbSegmentAnalysis,
  BlurbUtterance,
  BlurbVoice,
  GenerateBlurbOptions,
  GeneratedBlurbScript,
} from "./types.js";
import { resolveBlurbUtterance, type ResolvedBlurbUtterance } from "./chat-intents.js";
import { encodeMonoPcm16Wav } from "./wav.js";

const TAU = Math.PI * 2;
const DEFAULT_SAMPLE_RATE = 48_000;
const DEFAULT_ANALYSIS_FRAME_RATE = 60;
const GENERATOR_VERSION = "tokovo-blurb-v2";

const VOWEL_FORMANTS: Record<string, readonly [number, number, number]> = {
  a: [800, 1_150, 2_900],
  e: [450, 2_000, 2_800],
  i: [300, 2_300, 3_000],
  o: [500, 900, 2_600],
  u: [350, 800, 2_400],
};

interface EmotionShape {
  pitchOffset: number;
  pitchRange: number;
  tempo: number;
  roughness: number;
  breathiness: number;
  attackHardness: number;
  pauseScale: number;
  gain: number;
  defaultContour: BlurbContour;
}

interface PlannedSyllable {
  label: string;
  nextVowel: keyof typeof VOWEL_FORMANTS;
  phrasePosition: number;
  durationSeconds: number;
  pauseSeconds: number;
  pitchSemitones: number;
  contour: BlurbContour;
  emphasis: number;
  noiseSeed: number;
}

interface RenderedUtterance {
  samples: Float32Array;
  syllables: string[];
  analysis: BlurbSegmentAnalysis;
}

const EMOTION_SHAPES: Record<BlurbEmotion, EmotionShape> = {
  neutral: {
    pitchOffset: 0,
    pitchRange: 1,
    tempo: 1,
    roughness: 0,
    breathiness: 0,
    attackHardness: 0.32,
    pauseScale: 1,
    gain: 0.78,
    defaultContour: "bounce",
  },
  excited: {
    pitchOffset: 2.2,
    pitchRange: 1.2,
    tempo: 1.18,
    roughness: 0.025,
    breathiness: 0.05,
    attackHardness: 0.52,
    pauseScale: 0.72,
    gain: 0.84,
    defaultContour: "bounce",
  },
  angry: {
    pitchOffset: 1.2,
    pitchRange: 0.7,
    tempo: 1.2,
    roughness: 0.24,
    breathiness: 0.02,
    attackHardness: 0.95,
    pauseScale: 0.55,
    gain: 0.94,
    defaultContour: "fall",
  },
  annoyed: {
    pitchOffset: -1.1,
    pitchRange: 0.52,
    tempo: 1.08,
    roughness: 0.09,
    breathiness: 0,
    attackHardness: 0.72,
    pauseScale: 0.7,
    gain: 0.82,
    defaultContour: "fall",
  },
  panic: {
    pitchOffset: 3.8,
    pitchRange: 1.45,
    tempo: 1.38,
    roughness: 0.08,
    breathiness: 0.1,
    attackHardness: 0.62,
    pauseScale: 0.42,
    gain: 0.88,
    defaultContour: "rise",
  },
  confused: {
    pitchOffset: 1.1,
    pitchRange: 1.15,
    tempo: 0.93,
    roughness: 0,
    breathiness: 0.04,
    attackHardness: 0.28,
    pauseScale: 1.2,
    gain: 0.75,
    defaultContour: "rise",
  },
  sad: {
    pitchOffset: -2.8,
    pitchRange: 0.62,
    tempo: 0.72,
    roughness: 0.03,
    breathiness: 0.22,
    attackHardness: 0.12,
    pauseScale: 1.55,
    gain: 0.62,
    defaultContour: "fall",
  },
  smug: {
    pitchOffset: -0.4,
    pitchRange: 0.68,
    tempo: 0.88,
    roughness: 0.02,
    breathiness: 0.015,
    attackHardness: 0.24,
    pauseScale: 1.1,
    gain: 0.76,
    defaultContour: "rise",
  },
  deadpan: {
    pitchOffset: -1.8,
    pitchRange: 0.15,
    tempo: 0.82,
    roughness: 0.03,
    breathiness: 0,
    attackHardness: 0.4,
    pauseScale: 1.25,
    gain: 0.72,
    defaultContour: "flat",
  },
};

const LENGTH_RANGES: Record<BlurbLength, readonly [number, number]> = {
  tiny: [1, 2],
  short: [3, 4],
  medium: [5, 7],
  long: [8, 11],
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

const smoothstep = (value: number): number => {
  const normalized = clamp(value, 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
};

function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function hashBytes(value: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (const byte of value) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createRandom(seed: string | number): () => number {
  let state = typeof seed === "number" ? seed >>> 0 : hashString(String(seed)) >>> 0;
  if (state === 0) state = 0x9e3779b9;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function inferLength(utterance: BlurbUtterance): BlurbLength {
  if (utterance.length) return utterance.length;
  const words = utterance.text.trim().split(/\s+/).filter(Boolean).length;
  if (words <= 2) return "tiny";
  if (words <= 5) return "short";
  if (words <= 10) return "medium";
  return "long";
}

function inferSyllableCount(utterance: BlurbUtterance, random: () => number): number {
  const [minimum, maximum] = LENGTH_RANGES[inferLength(utterance)];
  const textWeight = Math.round(utterance.text.replace(/\s+/g, "").length / 5);
  const boundedTextWeight = clamp(textWeight, minimum, maximum);
  const variation = random() > 0.72 ? 1 : random() < 0.18 ? -1 : 0;
  return Math.round(clamp(boundedTextWeight + variation, minimum, maximum));
}

function inferFinalContour(utterance: BlurbUtterance, fallback: BlurbContour): BlurbContour {
  if (utterance.finalContour) return utterance.finalContour;
  const trimmed = utterance.text.trim();
  if (trimmed.endsWith("?")) return "rise";
  if (trimmed.endsWith("!")) return "bounce";
  return fallback;
}

function vowelForSyllable(label: string): keyof typeof VOWEL_FORMANTS {
  const match = label.toLowerCase().match(/[aeiou]/);
  return (match?.[0] ?? "a") as keyof typeof VOWEL_FORMANTS;
}

function consonantHardness(label: string): number {
  const first = label[0]?.toLowerCase() ?? "m";
  if ("ktdgpb".includes(first)) return 1;
  if ("zvfs".includes(first)) return 0.72;
  if ("rwyl".includes(first)) return 0.38;
  return 0.18;
}

type ConsonantKind = "plosive" | "fricative" | "nasal" | "glide";

function consonantKind(label: string): ConsonantKind {
  const first = label[0]?.toLowerCase() ?? "m";
  if ("szvf".includes(first)) return "fricative";
  if ("mn".includes(first)) return "nasal";
  if ("rwyl".includes(first)) return "glide";
  return "plosive";
}

function contourAt(contour: BlurbContour, progress: number): number {
  if (contour === "rise") return lerp(-0.55, 1, smoothstep(progress));
  if (contour === "fall") return lerp(0.65, -0.85, smoothstep(progress));
  if (contour === "bounce") return Math.sin(progress * Math.PI) * 0.8 - 0.2;
  return 0;
}

function amplitudeEnvelope(progress: number, attackHardness: number): number {
  const attackEnd = lerp(0.16, 0.035, attackHardness);
  const releaseStart = 0.72;
  if (progress < attackEnd) return smoothstep(progress / attackEnd);
  if (progress > releaseStart) {
    return 1 - smoothstep((progress - releaseStart) / (1 - releaseStart));
  }
  return 1;
}

function planUtterance(
  utterance: ResolvedBlurbUtterance,
  voice: BlurbVoice,
  scriptSeed: string | number,
): PlannedSyllable[] {
  const emotion = utterance.emotion ?? "neutral";
  const shape = EMOTION_SHAPES[emotion];
  const intensity = clamp(utterance.intensity ?? 0.65, 0, 1);
  const random = createRandom(
    `${scriptSeed}/${utterance.performer}/${utterance.id}/${utterance.seed ?? ""}`,
  );
  const authoredLexemes = utterance.lexemes ? [...utterance.lexemes] : undefined;
  const count = authoredLexemes?.length ?? inferSyllableCount(utterance, random);
  const plan: PlannedSyllable[] = [];
  const regularity = clamp(voice.signature.cadenceRegularity, 0, 1);
  const punctuationEmphasis = utterance.text.trim().endsWith("!") ? 0.12 : 0;
  const labels =
    authoredLexemes ??
    Array.from(
      { length: count },
      () => voice.syllables[Math.floor(random() * voice.syllables.length)] ?? "ba",
    );
  let phrasePitchDrift = 0;

  for (let index = 0; index < count; index += 1) {
    const label = labels[index];
    const emphasis = clamp(
      index === count - 1 && /[!?]$/.test(utterance.text.trim())
        ? 0.95
        : lerp(0.25, 0.82, random()) + punctuationEmphasis,
      0,
      1,
    );
    const variableDuration = lerp(0.105, 0.19, random());
    const durationBase = lerp(variableDuration, 0.145, regularity);
    const durationSeconds =
      (durationBase / clamp(voice.tempo * shape.tempo, 0.45, 2.2)) * lerp(1, 1.12, emphasis);
    const variablePause = lerp(0.018, 0.058, random());
    const basePause = lerp(variablePause, 0.031, regularity);
    const hesitation = random() < voice.signature.hesitation ? lerp(1.45, 2.8, random()) : 1;
    const pauseSeconds =
      basePause *
      shape.pauseScale *
      hesitation *
      (emotion === "panic" && random() > 0.76 ? 1.8 : 1);
    const targetPitchVariance =
      (random() * 2 - 1) * voice.pitchRangeSemitones * shape.pitchRange * lerp(0.5, 1, intensity);
    phrasePitchDrift = lerp(phrasePitchDrift, targetPitchVariance, lerp(0.68, 0.22, regularity));
    const motif = voice.signature.pitchMotifSemitones;
    const motifPitch = motif[index % motif.length] ?? 0;

    plan.push({
      label,
      nextVowel: vowelForSyllable(labels[index + 1] ?? label),
      phrasePosition: index / Math.max(1, count - 1),
      durationSeconds,
      pauseSeconds,
      pitchSemitones: shape.pitchOffset + phrasePitchDrift + motifPitch,
      contour:
        index === count - 1
          ? inferFinalContour(utterance, shape.defaultContour)
          : random() > 0.72
            ? "bounce"
            : "flat",
      emphasis,
      noiseSeed: Math.floor(random() * 0xffff_ffff),
    });
  }

  return plan;
}

function renderSyllable(
  syllable: PlannedSyllable,
  voice: BlurbVoice,
  emotion: BlurbEmotion,
  intensity: number,
  sampleRate: number,
): Float32Array {
  const shape = EMOTION_SHAPES[emotion];
  const sampleCount = Math.max(1, Math.round(syllable.durationSeconds * sampleRate));
  const samples = new Float32Array(sampleCount);
  const vowel = vowelForSyllable(syllable.label);
  const sourceFormants = VOWEL_FORMANTS[vowel].map((frequency) => frequency * voice.formantScale);
  const targetFormants = VOWEL_FORMANTS[syllable.nextVowel].map(
    (frequency) => frequency * voice.formantScale,
  );
  const random = createRandom(syllable.noiseSeed);
  const attackKind = consonantKind(syllable.label);
  const hardness = consonantHardness(syllable.label) * lerp(0.65, 1.25, shape.attackHardness);
  const breathiness = clamp(voice.breathiness + shape.breathiness * intensity, 0, 0.7);
  const roughness = clamp(voice.roughness + shape.roughness * intensity, 0, 0.65);
  let phase = 0;
  let electronicPhase = 0;
  let previousNoise = 0;
  let lowPass = 0;
  let previousInput = 0;
  let highPass = 0;
  let pitchJitterState = 0;
  const lowPassCutoff = lerp(10_500, 5_200, voice.signature.warmth);
  const lowPassAlpha = 1 - Math.exp((-TAU * lowPassCutoff) / sampleRate);

  for (let index = 0; index < sampleCount; index += 1) {
    const progress = index / Math.max(1, sampleCount - 1);
    const contour = contourAt(syllable.contour, progress) * voice.pitchRangeSemitones * 0.34;
    const timeSeconds = index / sampleRate;
    const microVariation = voice.signature.microVariation;
    pitchJitterState += 0.012 * (random() * 2 - 1 - pitchJitterState);
    const vibrato =
      Math.sin(TAU * 5.4 * timeSeconds) * roughness * lerp(0.18, 0.42, microVariation);
    const jitter = pitchJitterState * lerp(0.12, 0.72, microVariation) * (0.45 + roughness);
    const onsetScoop =
      -0.48 * microVariation * (progress < 0.2 ? 1 - smoothstep(progress / 0.2) : 0);
    const semitones = syllable.pitchSemitones + contour + vibrato + jitter + onsetScoop;
    const pitch = voice.basePitchHz * 2 ** (semitones / 12);
    phase += (TAU * pitch) / sampleRate;
    const driftWindow = Math.max(0.08, voice.signature.vowelDrift * 0.5);
    const formantBlend = smoothstep((progress - (1 - driftWindow)) / driftWindow);

    let voiced = 0;
    let weightTotal = 0;
    for (let harmonic = 1; harmonic <= 14; harmonic += 1) {
      const frequency = pitch * harmonic;
      if (frequency >= sampleRate * 0.46) break;

      const resonance = sourceFormants.reduce((sum, sourceFormant, formantIndex) => {
        const formant = lerp(sourceFormant, targetFormants[formantIndex], formantBlend);
        const bandwidth = 95 + formantIndex * 90;
        const distance = (frequency - formant) / bandwidth;
        return sum + Math.exp(-0.5 * distance * distance);
      }, 0);
      const tilt = 1 / harmonic ** lerp(0.72, 1.65, voice.spectralTilt);
      const weight = tilt * (0.16 + resonance * 1.3);
      voiced += Math.sin(phase * harmonic) * weight;
      weightTotal += weight;
    }
    voiced /= Math.max(0.001, weightTotal);

    const rawNoise = random() * 2 - 1;
    const brightNoise = rawNoise - previousNoise * 0.82;
    previousNoise = rawNoise;
    const attackProgress = progress / 0.16;
    const plosiveEnvelope =
      attackKind === "plosive" && attackProgress < 1 ? 1 - smoothstep(attackProgress) : 0;
    const frictionProgress = progress / 0.34;
    const frictionEnvelope =
      attackKind === "fricative" && frictionProgress < 1 ? 1 - smoothstep(frictionProgress) : 0;
    const attackNoise =
      brightNoise *
      hardness *
      voice.signature.onsetSalience *
      (plosiveEnvelope + frictionEnvelope * 0.62);
    const nasalOnset =
      attackKind === "nasal"
        ? Math.sin(phase * 0.5) * 0.16 * (progress < 0.3 ? 1 - smoothstep(progress / 0.3) : 0)
        : 0;
    const breathNoise = rawNoise * breathiness * 0.3;
    const chirpProgress = progress / 0.28;
    const chirpEnvelope = chirpProgress < 1 ? 1 - smoothstep(chirpProgress) : 0;
    const electronicFrequency =
      pitch * (emotion === "panic" ? lerp(3, 4.8, progress) : emotion === "deadpan" ? 1 : 2);
    electronicPhase += (TAU * electronicFrequency) / sampleRate;
    const electronic =
      Math.sin(electronicPhase) *
      voice.electronic *
      voice.signature.onsetSalience *
      chirpEnvelope *
      (0.18 + syllable.emphasis * 0.34);
    const envelope = amplitudeEnvelope(progress, shape.attackHardness);
    const gain = shape.gain * lerp(0.72, 1.08, intensity) * lerp(0.82, 1.08, syllable.emphasis);
    const amplitudeWander =
      1 +
      microVariation *
        0.035 *
        (Math.sin(TAU * 3.2 * timeSeconds + syllable.phrasePosition) + pitchJitterState);

    const rawSample =
      Math.tanh(
        (voiced * (1 - breathiness * 0.38) +
          nasalOnset +
          attackNoise * 0.4 +
          breathNoise +
          electronic) *
          gain *
          (1 + roughness * 1.5) *
          amplitudeWander,
      ) * envelope;
    lowPass += lowPassAlpha * (rawSample - lowPass);
    highPass = lowPass - previousInput + 0.995 * highPass;
    previousInput = lowPass;
    samples[index] = highPass;
  }

  return samples;
}

function analyzeSamples(
  samples: Float32Array,
  sampleRate: number,
  frameRate: number,
): BlurbSegmentAnalysis {
  const samplesPerFrame = sampleRate / frameRate;
  const frameCount = Math.ceil(samples.length / samplesPerFrame);
  const rawEnergy: number[] = [];
  let peak = 0;

  for (let frame = 0; frame < frameCount; frame += 1) {
    const start = Math.floor(frame * samplesPerFrame);
    const end = Math.min(samples.length, Math.floor((frame + 1) * samplesPerFrame));
    let sumSquares = 0;
    for (let index = start; index < end; index += 1) {
      sumSquares += samples[index] * samples[index];
    }
    const rms = Math.sqrt(sumSquares / Math.max(1, end - start));
    rawEnergy.push(rms);
    peak = Math.max(peak, rms);
  }

  const energy = rawEnergy.map((value) =>
    Number(clamp(value / Math.max(peak, 0.000_001), 0, 1).toFixed(4)),
  );
  const mouthLevels = ["closed", "small", "medium", "wide"] as const;
  const openThresholds = [0.12, 0.38, 0.7];
  const closeThresholds = [0.075, 0.28, 0.56];
  let previousMouthLevel = 0;
  const mouth = energy.map((value) => {
    let target = previousMouthLevel;
    while (target < 3 && value >= openThresholds[target]) target += 1;
    while (target > 0 && value < closeThresholds[target - 1]) target -= 1;
    if (target > previousMouthLevel + 1) target = previousMouthLevel + 1;
    if (target < previousMouthLevel - 1) target = previousMouthLevel - 1;
    previousMouthLevel = target;
    return mouthLevels[target];
  });
  const emphasisFrames: number[] = [];
  for (let index = 1; index < energy.length - 1; index += 1) {
    const isPeak =
      energy[index] >= 0.76 &&
      energy[index] >= energy[index - 1] &&
      energy[index] > energy[index + 1];
    const farEnough = index - (emphasisFrames[emphasisFrames.length - 1] ?? -10) >= 5;
    if (isPeak && farEnough) emphasisFrames.push(index);
  }

  return { frameRate, energy, mouth, emphasisFrames };
}

function renderUtterance(
  utterance: ResolvedBlurbUtterance,
  voice: BlurbVoice,
  scriptSeed: string | number,
  sampleRate: number,
  analysisFrameRate: number,
): RenderedUtterance {
  const emotion = utterance.emotion ?? "neutral";
  const intensity = clamp(utterance.intensity ?? 0.65, 0, 1);
  const plan = planUtterance(utterance, voice, scriptSeed);
  const rendered = plan.map((syllable) => ({
    samples: renderSyllable(syllable, voice, emotion, intensity, sampleRate),
    pauseSamples: Math.round(syllable.pauseSeconds * sampleRate),
  }));
  const starts: number[] = [];
  let timelineEnd = 0;
  rendered.forEach((item, index) => {
    const previous = rendered[index - 1];
    const effectiveGap = previous
      ? Math.round(previous.pauseSamples * (1 - voice.signature.coarticulation))
      : 0;
    const overlap = previous ? Math.round(sampleRate * 0.016 * voice.signature.coarticulation) : 0;
    const start = previous ? Math.max(0, timelineEnd + effectiveGap - overlap) : 0;
    starts.push(start);
    timelineEnd = Math.max(timelineEnd, start + item.samples.length);
  });
  const samples = new Float32Array(timelineEnd);

  rendered.forEach((item, itemIndex) => {
    const start = starts[itemIndex];
    for (let sampleIndex = 0; sampleIndex < item.samples.length; sampleIndex += 1) {
      samples[start + sampleIndex] += item.samples[sampleIndex];
    }
  });

  return {
    samples,
    syllables: plan.map((syllable) => syllable.label),
    analysis: analyzeSamples(samples, sampleRate, analysisFrameRate),
  };
}

function normalizeToPcm16(samples: Float32Array): Int16Array {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  const scale = peak > 0 ? 0.92 / peak : 1;
  const pcm = new Int16Array(samples.length);

  for (let index = 0; index < samples.length; index += 1) {
    const normalized = clamp(samples[index] * scale, -1, 1);
    pcm[index] = normalized < 0 ? Math.round(normalized * 32_768) : Math.round(normalized * 32_767);
  }
  return pcm;
}

function validateScript(script: BlurbScript): void {
  if (!script.id.trim()) throw new Error("Blurb script must have an id.");
  if (script.utterances.length === 0) {
    throw new Error("Blurb script must contain at least one utterance.");
  }

  const ids = new Set<string>();
  for (const utterance of script.utterances) {
    if (ids.has(utterance.id)) {
      throw new Error(`Duplicate blurb utterance id: ${utterance.id}`);
    }
    ids.add(utterance.id);
    const voice = script.voices[utterance.performer];
    if (!voice) {
      throw new Error(`Unknown performer "${utterance.performer}" in utterance "${utterance.id}".`);
    }
    if (voice.syllables.length === 0) {
      throw new Error(`Voice "${voice.id}" must define at least one syllable.`);
    }
    if (voice.signature.pitchMotifSemitones.length === 0) {
      throw new Error(`Voice "${voice.id}" must define a pitch motif.`);
    }
    if (utterance.lexemes) {
      if (utterance.lexemes.length === 0) {
        throw new Error(`Utterance "${utterance.id}" must not define an empty lexeme sequence.`);
      }
      for (const lexeme of utterance.lexemes) {
        if (!voice.syllables.includes(lexeme)) {
          throw new Error(
            `Utterance "${utterance.id}" uses lexeme "${lexeme}" outside voice "${voice.id}".`,
          );
        }
      }
    }
    const unitControls = {
      cadenceRegularity: voice.signature.cadenceRegularity,
      hesitation: voice.signature.hesitation,
      onsetSalience: voice.signature.onsetSalience,
      warmth: voice.signature.warmth,
      coarticulation: voice.signature.coarticulation,
      vowelDrift: voice.signature.vowelDrift,
      microVariation: voice.signature.microVariation,
    };
    for (const [name, value] of Object.entries(unitControls)) {
      if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new Error(`Voice "${voice.id}" control "${name}" must be between 0 and 1.`);
      }
    }
  }
}

export function generateBlurbScript(
  script: BlurbScript,
  options: GenerateBlurbOptions = {},
): GeneratedBlurbScript {
  validateScript(script);
  const sampleRate = options.sampleRate ?? DEFAULT_SAMPLE_RATE;
  const analysisFrameRate = options.analysisFrameRate ?? DEFAULT_ANALYSIS_FRAME_RATE;
  const scriptSeed = script.seed ?? script.id;
  const gapSamples = Math.round(sampleRate * 0.18);
  const utterances = script.utterances.map(resolveBlurbUtterance);
  const rendered = utterances.map((utterance) => {
    const voice = script.voices[utterance.performer];
    if (!voice) {
      throw new Error(`Unknown performer: ${utterance.performer}`);
    }
    return renderUtterance(utterance, voice, scriptSeed, sampleRate, analysisFrameRate);
  });
  const trailingPauses = utterances.map((utterance, index) =>
    index === utterances.length - 1
      ? 0
      : Math.round(
          ((utterance.direction.postSilenceMs ?? (gapSamples / sampleRate) * 1_000) / 1_000) *
            sampleRate,
        ),
  );
  const totalSamples = rendered.reduce(
    (total, item, index) => total + item.samples.length + trailingPauses[index],
    0,
  );
  const mixed = new Float32Array(totalSamples);
  const segments: BlurbSegment[] = [];
  let cursor = 0;

  rendered.forEach((item, index) => {
    const utterance = utterances[index];
    const startSample = cursor;
    mixed.set(item.samples, cursor);
    cursor += item.samples.length;
    const endSample = cursor;

    segments.push({
      index,
      id: utterance.id,
      speaker: utterance.performer,
      performer: utterance.performer,
      text: utterance.text,
      intent: utterance.intent,
      direction: utterance.direction,
      emotion: utterance.emotion ?? "neutral",
      syllables: item.syllables,
      startSample,
      endSample,
      startMs: Math.round((startSample / sampleRate) * 1_000),
      endMs: Math.round((endSample / sampleRate) * 1_000),
      durationMs: Math.round(((endSample - startSample) / sampleRate) * 1_000),
      analysis: item.analysis,
    });

    cursor += trailingPauses[index];
  });

  const pcm = normalizeToPcm16(mixed);
  const wav = encodeMonoPcm16Wav(pcm, sampleRate);

  return {
    pcm,
    wav,
    manifest: {
      version: 1,
      scriptId: script.id,
      audioFile: options.audioFile ?? `${script.id}.wav`,
      sampleRate,
      channels: 1,
      durationMs: Math.round((pcm.length / sampleRate) * 1_000),
      generatedAt: "1970-01-01T00:00:00.000Z",
      provider: "tokovo-blurb",
      model: GENERATOR_VERSION,
      contentHash: hashBytes(wav),
      segments,
    },
  };
}
