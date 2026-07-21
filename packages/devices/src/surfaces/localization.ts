import type { SystemDirection, SystemLocalizedStrings } from "./contract.js";

type SupportedLanguage = "en" | "hi" | "ar" | "ja";

const DAYS: Record<SupportedLanguage, readonly string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
  ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
  ja: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
};

const MONTHS: Record<SupportedLanguage, readonly string[]> = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  hi: [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
  ],
  ar: [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ],
  ja: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
};

const COPY: Record<SupportedLanguage, Omit<SystemLocalizedStrings, "locale" | "direction" | "date" | "shortDate">> = {
  en: { search: "Search", flashlight: "Flashlight", camera: "Camera", deviceLocked: "Device locked" },
  hi: { search: "खोजें", flashlight: "फ़्लैशलाइट", camera: "कैमरा", deviceLocked: "डिवाइस लॉक है" },
  ar: { search: "بحث", flashlight: "مصباح", camera: "الكاميرا", deviceLocked: "الجهاز مقفل" },
  ja: { search: "検索", flashlight: "フラッシュライト", camera: "カメラ", deviceLocked: "デバイスはロック中" },
};

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;
const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const;

function languageFor(locale: string): SupportedLanguage {
  const language = locale.trim().toLowerCase().split(/[-_]/u)[0];
  if (language === "hi" || language === "ar" || language === "ja") return language;
  return "en";
}

export function directionForLocale(locale: string): SystemDirection {
  return languageFor(locale) === "ar" ? "rtl" : "ltr";
}

export function localizeSystemDigits(value: string, locale: string): string {
  const language = languageFor(locale);
  const digits = language === "ar" ? ARABIC_DIGITS : language === "hi" ? DEVANAGARI_DIGITS : null;
  if (!digits) return value;
  return value.replace(/[0-9]/gu, (digit) => digits[Number(digit)] ?? digit);
}

function useTwelveHourClock(locale: string, hourCycle?: "h12" | "h24"): boolean {
  if (hourCycle) return hourCycle === "h12";
  const normalized = locale.toLowerCase();
  return normalized === "en" || normalized.startsWith("en-us") || normalized.startsWith("en-ca");
}

export function formatSystemTime(
  timestampMs: number,
  locale: string,
  hourCycle?: "h12" | "h24",
): string {
  const date = new Date(timestampMs);
  const hour24 = date.getUTCHours();
  const twelveHour = useTwelveHourClock(locale, hourCycle);
  const hour = twelveHour ? (hour24 % 12 === 0 ? 12 : hour24 % 12) : hour24;
  const hourLabel = twelveHour ? String(hour) : String(hour).padStart(2, "0");
  const value = `${hourLabel}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
  return localizeSystemDigits(value, locale);
}

export function getSystemLocalizedStrings(
  timestampMs: number,
  locale: string,
): SystemLocalizedStrings {
  const language = languageFor(locale);
  const date = new Date(timestampMs);
  const day = localizeSystemDigits(String(date.getUTCDate()), locale);
  const month = MONTHS[language][date.getUTCMonth()];
  const weekday = DAYS[language][date.getUTCDay()];
  const year = localizeSystemDigits(String(date.getUTCFullYear()), locale);

  const fullDate = language === "ja"
    ? `${year}年${month}${day}日 ${weekday}`
    : language === "ar"
      ? `${weekday}، ${day} ${month}`
      : language === "hi"
        ? `${weekday}, ${day} ${month}`
        : `${weekday}, ${month} ${day}`;
  const shortDate = language === "ja"
    ? `${month}${day}日 ${weekday}`
    : language === "ar"
      ? `${weekday}، ${day} ${month}`
      : `${weekday}, ${day} ${month}`;

  return {
    locale,
    direction: directionForLocale(locale),
    date: fullDate,
    shortDate,
    ...COPY[language],
  };
}
