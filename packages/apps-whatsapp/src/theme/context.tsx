import React, { createContext, useContext, useMemo } from "react";
import { WhatsAppTheme, getTheme, Platform } from "./index";

const ThemeContext = createContext<WhatsAppTheme | null>(null);

export interface WhatsAppThemeProviderProps {
  platform?: Platform;
  darkMode?: boolean;
  children: React.ReactNode;
}

export function WhatsAppThemeProvider({
  platform = "ios",
  darkMode = false,
  children,
}: WhatsAppThemeProviderProps) {
  const theme = useMemo(
    () => getTheme(platform, darkMode),
    [platform, darkMode],
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
