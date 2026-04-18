import type { PngtuberFrameKey } from "@tokovo/reactions";
import type { PngtuberMouthShape } from "@tokovo/reactors";

export interface PngtuberInspectorPreset {
  id: string;
  label: string;
  frameKey: PngtuberFrameKey;
  pulseScale: number;
  mouthShape: "auto" | PngtuberMouthShape;
  mouthTrackProfileId: string;
}

export type PngtuberPresetRecord = Record<string, PngtuberInspectorPreset>;

export const PNGTUBER_PRESET_STORAGE_KEY = "tokovo.live2d-lab.pngtuber-presets";

export const DEFAULT_PNGTUBER_PRESET: PngtuberInspectorPreset = {
  id: "default",
  label: "Default",
  frameKey: "speaking",
  pulseScale: 1.04,
  mouthShape: "auto",
  mouthTrackProfileId: "snappy",
};

export const DEFAULT_PNGTUBER_PRESETS: PngtuberInspectorPreset[] = [
  {
    ...DEFAULT_PNGTUBER_PRESET,
    id: "reactive-tight",
    label: "Reactive Tight",
  },
  {
    ...DEFAULT_PNGTUBER_PRESET,
    id: "deadpan-drawl",
    label: "Deadpan Drawl",
    frameKey: "deadpan",
    pulseScale: 1.01,
    mouthShape: "half",
    mouthTrackProfileId: "drawl",
  },
  {
    ...DEFAULT_PNGTUBER_PRESET,
    id: "shock-chaos",
    label: "Shock Chaos",
    frameKey: "shocked",
    pulseScale: 1.11,
    mouthShape: "open",
    mouthTrackProfileId: "chaos",
  },
];

const VALID_FRAME_KEYS: PngtuberFrameKey[] = [
  "idle",
  "listening",
  "speaking",
  "neutral",
  "happy",
  "angry",
  "sad",
  "shocked",
  "deadpan",
  "laughing",
  "thinking",
];
const VALID_MOUTH_SHAPES: Array<"auto" | PngtuberMouthShape> = [
  "auto",
  "closed",
  "half",
  "open",
  "e",
  "u",
];

export function buildPngtuberPresetRecord(
  presets: PngtuberInspectorPreset[],
): PngtuberPresetRecord {
  return Object.fromEntries(presets.map((preset) => [preset.id, preset]));
}

export function sanitizePngtuberPresetRecord(
  value: unknown,
): PngtuberPresetRecord {
  if (!value || typeof value !== "object") {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>);
  return Object.fromEntries(
    entries.map(([id, presetValue]) => [id, sanitizePreset(id, presetValue)]),
  );
}

function sanitizePreset(
  fallbackId: string,
  value: unknown,
): PngtuberInspectorPreset {
  if (!value || typeof value !== "object") {
    return {
      ...DEFAULT_PNGTUBER_PRESET,
      id: fallbackId,
      label: titleCase(fallbackId),
    };
  }

  const record = value as Partial<PngtuberInspectorPreset>;
  const frameKey = VALID_FRAME_KEYS.includes(record.frameKey as PngtuberFrameKey)
    ? (record.frameKey as PngtuberFrameKey)
    : DEFAULT_PNGTUBER_PRESET.frameKey;
  const mouthShape = VALID_MOUTH_SHAPES.includes(
    record.mouthShape as "auto" | PngtuberMouthShape,
  )
    ? (record.mouthShape as "auto" | PngtuberMouthShape)
    : DEFAULT_PNGTUBER_PRESET.mouthShape;
  const pulseScale =
    typeof record.pulseScale === "number" && record.pulseScale >= 1 && record.pulseScale <= 1.2
      ? Number(record.pulseScale.toFixed(2))
      : DEFAULT_PNGTUBER_PRESET.pulseScale;

  return {
    id:
      typeof record.id === "string" && record.id.trim().length > 0
        ? record.id.trim()
        : fallbackId,
    label:
      typeof record.label === "string" && record.label.trim().length > 0
        ? record.label.trim()
        : titleCase(fallbackId),
    frameKey,
    pulseScale,
    mouthShape,
    mouthTrackProfileId:
      typeof record.mouthTrackProfileId === "string" && record.mouthTrackProfileId.trim().length > 0
        ? record.mouthTrackProfileId.trim()
        : DEFAULT_PNGTUBER_PRESET.mouthTrackProfileId,
  };
}

function titleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
