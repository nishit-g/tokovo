import React, { createContext, useContext, useMemo } from "react";
import { WhatsAppTheme, getTheme, Platform } from "./index";

const ThemeContext = createContext<WhatsAppTheme | null>(null);

export interface WhatsAppThemeProviderProps {
  platform?: Platform;
  darkMode?: boolean;
  themeId?: string;
  children: React.ReactNode;
}

export function WhatsAppThemeProvider({
  platform = "ios",
  darkMode = false,
  themeId,
  children,
}: WhatsAppThemeProviderProps) {
  const theme = useMemo(
    () => getTheme(platform, darkMode, themeId),
    [platform, darkMode, themeId],
  );
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): WhatsAppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within WhatsAppThemeProvider");
  }
  return theme;
}
