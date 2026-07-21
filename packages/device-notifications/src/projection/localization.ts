export interface NotificationLocalizedStrings {
  centerTitle: string;
  newNotification: string;
  reply: string;
  timeSensitive: string;
  critical: string;
  now: string;
  minute(value: number): string;
  hour(value: number): string;
  day(value: number): string;
}

const RTL_LANGUAGES = new Set(["ar", "fa", "he", "ur"]);

function languageOf(locale: string): string {
  return locale.trim().toLowerCase().split(/[-_]/u)[0] || "en";
}

const LOCALIZED: Readonly<Record<string, NotificationLocalizedStrings>> = {
  en: {
    centerTitle: "Notifications",
    newNotification: "New notification",
    reply: "Reply",
    timeSensitive: "Time Sensitive",
    critical: "Critical",
    now: "now",
    minute: (value) => `${value}m`,
    hour: (value) => `${value}h`,
    day: (value) => `${value}d`,
  },
  hi: {
    centerTitle: "सूचनाएँ",
    newNotification: "नई सूचना",
    reply: "जवाब दें",
    timeSensitive: "समय संवेदनशील",
    critical: "अत्यावश्यक",
    now: "अभी",
    minute: (value) => `${value} मि`,
    hour: (value) => `${value} घं`,
    day: (value) => `${value} दिन`,
  },
  ar: {
    centerTitle: "الإشعارات",
    newNotification: "إشعار جديد",
    reply: "رد",
    timeSensitive: "حساس للوقت",
    critical: "حرج",
    now: "الآن",
    minute: (value) => `${value} د`,
    hour: (value) => `${value} س`,
    day: (value) => `${value} ي`,
  },
  ja: {
    centerTitle: "通知",
    newNotification: "新しい通知",
    reply: "返信",
    timeSensitive: "時間指定",
    critical: "重大",
    now: "今",
    minute: (value) => `${value}分`,
    hour: (value) => `${value}時間`,
    day: (value) => `${value}日`,
  },
};

export function getNotificationLocalization(locale: string): {
  direction: "ltr" | "rtl";
  strings: NotificationLocalizedStrings;
} {
  const language = languageOf(locale);
  return {
    direction: RTL_LANGUAGES.has(language) ? "rtl" : "ltr",
    strings: LOCALIZED[language] ?? LOCALIZED.en,
  };
}
