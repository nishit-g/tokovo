const segmenterCache = new Map<string, Intl.Segmenter>();

function getSegmenter(locale = "und"): Intl.Segmenter | null {
  if (typeof Intl === "undefined" || !("Segmenter" in Intl)) {
    return null;
  }

  const cached = segmenterCache.get(locale);
  if (cached) return cached;

  const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
  segmenterCache.set(locale, segmenter);
  return segmenter;
}

export function splitGraphemes(text: string, locale = "und"): string[] {
  if (!text) return [];
  const segmenter = getSegmenter(locale);
  if (segmenter) {
    return Array.from(segmenter.segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

export function countGraphemes(text: string, locale = "und"): number {
  return splitGraphemes(text, locale).length;
}

export function sliceGraphemes(
  text: string,
  start: number,
  end?: number,
  locale = "und",
): string {
  return splitGraphemes(text, locale).slice(start, end).join("");
}

export function replaceGraphemeRange(
  text: string,
  start: number,
  end: number,
  replacement: string,
  locale = "und",
): string {
  const graphemes = splitGraphemes(text, locale);
  const safeStart = Math.max(0, Math.min(start, graphemes.length));
  const safeEnd = Math.max(safeStart, Math.min(end, graphemes.length));
  graphemes.splice(safeStart, safeEnd - safeStart, ...splitGraphemes(replacement, locale));
  return graphemes.join("");
}

export function insertGraphemeAt(
  text: string,
  cursorPosition: number,
  value: string,
  locale = "und",
): string {
  return replaceGraphemeRange(
    text,
    cursorPosition,
    cursorPosition,
    value,
    locale,
  );
}

export function removeGraphemeAt(
  text: string,
  cursorPosition: number,
  locale = "und",
): string {
  if (cursorPosition <= 0) return text;
  return replaceGraphemeRange(
    text,
    cursorPosition - 1,
    cursorPosition,
    "",
    locale,
  );
}
