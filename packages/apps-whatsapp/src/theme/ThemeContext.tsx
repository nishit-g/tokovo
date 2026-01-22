import React, { createContext, useContext, useMemo } from "react";
import { iosTheme, getTheme, type WhatsAppTheme, type Platform } from "./index";

interface ThemeContextValue {
  theme: WhatsAppTheme;
  platform: Platform;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: iosTheme,
  platform: "ios",
  isDarkMode: false,
});

interface ThemeProviderProps {
  platform?: Platform;
  darkMode?: boolean;
  children: React.ReactNode;
}

export function ThemeProvider({
  platform = "ios",
  darkMode = false,
  children,
}: ThemeProviderProps): React.ReactElement {
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: getTheme(platform, darkMode),
      platform,
      isDarkMode: darkMode,
    }),
    [platform, darkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): WhatsAppTheme {
  return useContext(ThemeContext).theme;
}

export function usePlatform(): Platform {
  return useContext(ThemeContext).platform;
}

export function useIsDarkMode(): boolean {
  return useContext(ThemeContext).isDarkMode;
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function useColors(): WhatsAppTheme["colors"] {
  return useTheme().colors;
}

export function useTypography(): WhatsAppTheme["typography"] {
  return useTheme().typography;
}

export function useSpacing(): WhatsAppTheme["spacing"] {
  return useTheme().spacing;
}

export function useSafeArea(): WhatsAppTheme["safeArea"] {
  return useTheme().safeArea;
}
