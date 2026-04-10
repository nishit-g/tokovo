import React, { createContext, useContext, useMemo } from "react";
import {
  getTheme,
  teamsIosLightTheme,
  type TeamsDesignTokens,
  type TeamsPlatform,
} from "../config/theme.js";

interface TeamsThemeContextValue {
  theme: TeamsDesignTokens;
  platform: TeamsPlatform;
  isDarkMode: boolean;
}

const TeamsThemeContext = createContext<TeamsThemeContextValue>({
  theme: teamsIosLightTheme,
  platform: "ios",
  isDarkMode: false,
});

interface TeamsThemeProviderProps {
  platform?: TeamsPlatform;
  darkMode?: boolean;
  themeId?: string;
  children: React.ReactNode;
}

export function TeamsThemeProvider({
  platform = "ios",
  darkMode = false,
  themeId,
  children,
}: TeamsThemeProviderProps): React.ReactElement {
  const value = useMemo<TeamsThemeContextValue>(
    () => ({
      theme: getTheme(platform, darkMode, themeId),
      platform,
      isDarkMode: darkMode,
    }),
    [platform, darkMode, themeId],
  );

  return (
    <TeamsThemeContext.Provider value={value}>
      {children}
    </TeamsThemeContext.Provider>
  );
}

export function useTeamsTheme(): TeamsDesignTokens {
  return useContext(TeamsThemeContext).theme;
}

export function useTeamsThemeContext(): TeamsThemeContextValue {
  return useContext(TeamsThemeContext);
}
