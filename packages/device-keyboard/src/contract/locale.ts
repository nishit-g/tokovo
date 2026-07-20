import type {
  InputDirection,
  KeyboardFamily,
  ResolvedInputLocale,
} from "./types.js";

const RTL_LANGUAGES = new Set([
  "ar",
  "dv",
  "fa",
  "he",
  "ku",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

const LANGUAGE_FAMILIES: Readonly<Record<string, KeyboardFamily>> = {
  ar: "arabic",
  fa: "arabic",
  ps: "arabic",
  sd: "arabic",
  ug: "arabic",
  ur: "arabic",
  ru: "cyrillic",
  uk: "cyrillic",
  bg: "cyrillic",
  sr: "cyrillic",
  hi: "devanagari",
  mr: "devanagari",
  ne: "devanagari",
  bn: "bengali",
  pa: "gurmukhi",
  gu: "gujarati",
  ta: "tamil",
  te: "telugu",
  kn: "kannada",
  ml: "malayalam",
  th: "thai",
  ko: "hangul",
  ja: "kana",
  zh: "cjk",
};

const RTL_SCRIPT_PATTERN =
  /\p{Script=Arabic}|\p{Script=Hebrew}|\p{Script=Syriac}|\p{Script=Thaana}|\p{Script=Nko}|\p{Script=Adlam}/u;
const LETTER_PATTERN = /\p{Letter}/u;

export function normalizeInputLocale(tag = "en-US"): ResolvedInputLocale {
  let locale: Intl.Locale;
  try {
    locale = new Intl.Locale(tag);
  } catch {
    throw new Error(
      `INPUT_INVALID_LOCALE: "${tag}" is not a valid BCP 47 locale tag.`,
    );
  }

  const language = locale.language.toLowerCase();
  return {
    tag: locale.toString(),
    language,
    script: locale.script || undefined,
    region: locale.region || undefined,
    direction: RTL_LANGUAGES.has(language) ? "rtl" : "ltr",
    keyboardFamily: LANGUAGE_FAMILIES[language] ?? "latin",
  };
}

export function inferTextDirection(
  text: string,
  fallback: InputDirection,
): InputDirection {
  for (const character of text) {
    if (RTL_SCRIPT_PATTERN.test(character)) return "rtl";
    if (LETTER_PATTERN.test(character)) return "ltr";
  }
  return fallback;
}
