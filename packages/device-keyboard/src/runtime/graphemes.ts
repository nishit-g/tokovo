const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export function splitGraphemes(text: string): string[] {
  if (!text) return [];
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

export function countGraphemes(text: string): number {
  return splitGraphemes(text).length;
}

export function sliceGraphemes(
  text: string,
  start: number,
  end?: number,
): string {
  return splitGraphemes(text).slice(start, end).join("");
}

export function insertGraphemeAt(
  text: string,
  cursorPosition: number,
  value: string,
): string {
  const graphemes = splitGraphemes(text);
  graphemes.splice(cursorPosition, 0, value);
  return graphemes.join("");
}

export function removeGraphemeAt(
  text: string,
  cursorPosition: number,
): string {
  const graphemes = splitGraphemes(text);
  if (cursorPosition <= 0 || cursorPosition > graphemes.length) {
    return text;
  }
  graphemes.splice(cursorPosition - 1, 1);
  return graphemes.join("");
}
