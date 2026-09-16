import { create, type Font } from "fontkit";
import interData from "./fonts/inter-latin.js";
import interExtendedData from "./fonts/inter-latin-ext.js";
import robotoData from "./fonts/roboto-latin.js";
import arabicData from "./fonts/noto-sans-arabic-arabic.js";
import devanagariData from "./fonts/noto-sans-devanagari-devanagari.js";
import interCyrillic from "./fonts/inter-cyrillic.js";
import interGreek from "./fonts/inter-greek.js";
import interVietnamese from "./fonts/inter-vietnamese.js";
import robotoExtended from "./fonts/roboto-latin-ext.js";
import robotoCyrillic from "./fonts/roboto-cyrillic.js";
import robotoGreek from "./fonts/roboto-greek.js";
import robotoVietnamese from "./fonts/roboto-vietnamese.js";

const data = {
  inter: interData,
  extended: interExtendedData,
  roboto: robotoData,
  arabic: arabicData,
  devanagari: devanagariData,
  interCyrillic,
  interGreek,
  interVietnamese,
  robotoExtended,
  robotoCyrillic,
  robotoGreek,
  robotoVietnamese,
};
const fallbacks = {
  inter: ["extended", "interCyrillic", "interGreek", "interVietnamese"],
  roboto: ["robotoExtended", "robotoCyrillic", "robotoGreek", "robotoVietnamese"],
} as const;
type Face = keyof typeof data;
const fonts = new Map<Face, Font>();
const widths = new Map<string, number>();
const shapedRuns = new Map<string, number>();
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
export function bodyCellWidth(grapheme: string): number | undefined {
  if (/\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u.test(grapheme)) return 1.25;
  if (/[\u3000-\u9fff\uff01-\uff60]/u.test(grapheme)) return 1;
  return undefined;
}

export function bodyTextRuns(text: string): { text: string; cellWidth?: number }[] {
  if (/^[\x20-\x7e\n\r]*$/.test(text)) return [{ text }];
  const runs: { text: string; cellWidth?: number }[] = [];
  for (const { segment } of segmenter.segment(text)) {
    const cellWidth = bodyCellWidth(segment);
    const last = runs.at(-1);
    if (cellWidth === undefined && last && last.cellWidth === undefined) last.text += segment;
    else runs.push({ text: segment, cellWidth });
  }
  return runs;
}
function font(face: Face) {
  let value = fonts.get(face);
  if (!value) {
    // Fontkit accepts Uint8Array in both runtimes; its types still specify Buffer.
    value = create(
      Uint8Array.from(atob(data[face]), (char) => char.charCodeAt(0)) as Parameters<
        typeof create
      >[0],
    ) as Font;
    fonts.set(face, value);
  }
  return value;
}

function shape(face: Face, text: string): number {
  const key = `${face}:${text}`;
  const existing = shapedRuns.get(key);
  if (existing !== undefined) return existing;
  const selected = font(face);
  const value = selected.layout(text).advanceWidth / selected.unitsPerEm;
  if (shapedRuns.size >= 8192) shapedRuns.delete(shapedRuns.keys().next().value!);
  shapedRuns.set(key, value);
  return value;
}

function shapeRun(face: Face, text: string): number {
  if (!/^[A-Za-z0-9\s-]*$/.test(text)) return shape(face, text);
  // Cache words independently of changing timestamps/message numbers. Preserve
  // pair positioning at boundaries; retain full shaping inside words/ligatures.
  const parts = text.split(/(\s+|\d+)/).filter(Boolean);
  let total = 0;
  let previous = "";
  for (const part of parts) {
    const chunks = /^\d+$/.test(part) ? [...part] : [part];
    for (const chunk of chunks) {
      total += shape(face, chunk);
      if (previous)
        total += shape(face, previous + chunk[0]) - shape(face, previous) - shape(face, chunk[0]);
      previous = chunk.at(-1)!;
    }
  }
  return total;
}

/** Pinned 400-weight body-text shaping; independent of DOM, platform fonts and playback order. */
export function measureBodyText(text: string, size: number, family = "Inter Variable"): number {
  if (!Number.isFinite(size) || size <= 0) throw new Error("TEXT_FONT_SIZE_INVALID");
  const primary: Face = family.includes("Roboto") ? "roboto" : "inter";
  const key = `${primary}:${text}`;
  const cached = widths.get(key);
  if (cached !== undefined) return cached * size;
  let units = 0;
  let run = "";
  let current: Face = primary;
  const flush = () => {
    if (run) {
      units += shapeRun(current, run);
      run = "";
    }
  };
  const parts = /^[\x20-\x7e]*$/.test(text)
    ? [...text]
    : [...segmenter.segment(text)].map((part) => part.segment);
  for (const part of parts) {
    if (/^[\n\r]$/u.test(part)) {
      flush();
      continue;
    }
    const cellWidth = bodyCellWidth(part);
    if (cellWidth !== undefined) {
      flush();
      units += cellWidth;
      continue;
    }
    const face: Face = /\p{Script_Extensions=Arabic}/u.test(part)
      ? "arabic"
      : /\p{Script_Extensions=Devanagari}/u.test(part)
        ? "devanagari"
        : font(primary).hasGlyphForCodePoint(part.codePointAt(0)!)
          ? primary
          : (fallbacks[primary].find((face) =>
              font(face).hasGlyphForCodePoint(part.codePointAt(0)!),
            ) ?? "extended");
    if (face !== current) {
      flush();
      current = face;
    }
    if (!font(face).hasGlyphForCodePoint(part.codePointAt(0)!))
      throw new Error(`TEXT_FONT_GLYPH_UNAVAILABLE: U+${part.codePointAt(0)!.toString(16)}`);
    run += part;
  }
  flush();
  if (widths.size >= 8192) widths.delete(widths.keys().next().value!);
  widths.set(key, units);
  return units * size;
}
