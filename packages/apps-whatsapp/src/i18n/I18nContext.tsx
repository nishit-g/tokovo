import React, { createContext, useContext, useMemo } from "react";
import {
  getStrings,
  t,
  type Locale,
  type WhatsAppStrings,
} from "./translations.js";

interface I18nContextValue {
  locale: Locale;
  strings: WhatsAppStrings;
  t: (key: string, values?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  strings: getStrings("en"),
  t: (key) => key,
});

interface I18nProviderProps {
  locale?: Locale;
  children: React.ReactNode;
}

export function I18nProvider({
  locale = "en",
  children,
}: I18nProviderProps): React.ReactElement {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      strings: getStrings(locale),
      t: (key: string, values?: Record<string, string>) =>
        t(key, locale, values),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

export function useStrings(): WhatsAppStrings {
  return useContext(I18nContext).strings;
}

export function useTranslation(): (
  key: string,
  values?: Record<string, string>,
) => string {
  return useContext(I18nContext).t;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
