import { TYPEWRITER_THEME_PRESETS } from "./presets.js";
import type {
  DeepPartial,
  TypewriterThemeConfig,
  TypewriterThemePresetId,
  TypewriterThemeTokens,
} from "./types.js";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function deepMerge<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (!patch) return base;
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return patch as T;
  }

  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch)) {
    const bv = (base as Record<string, unknown>)[k];
    if (isPlainObject(bv) && isPlainObject(v)) {
      out[k] = deepMerge(bv, v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

function scalePxFields<T>(input: T, scale: number): T {
  if (Array.isArray(input)) {
    return input.map((v) => scalePxFields(v, scale)) as T;
  }
  if (!isPlainObject(input)) return input;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === "number" && k.endsWith("Px")) {
      out[k] = v * scale;
      continue;
    }
    out[k] = scalePxFields(v, scale);
  }
  return out as T;
}

export function resolveTypewriterTheme(input: {
  config?: TypewriterThemeConfig;
  video: { width: number; height: number };
}): TypewriterThemeTokens {
  const preset = (input.config?.preset ?? "classic") as TypewriterThemePresetId;
  const base = TYPEWRITER_THEME_PRESETS[preset] ?? TYPEWRITER_THEME_PRESETS.classic;
  const merged = deepMerge(base, input.config?.overrides);

  const scale = input.video.width / (merged.designWidth || 1080);
  return scalePxFields(merged, scale);
}

