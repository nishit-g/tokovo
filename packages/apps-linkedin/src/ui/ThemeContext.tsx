import React, { createContext, useContext } from "react";
import type { LITheme, LIThemeMode } from "./theme.js";
import { getLITheme } from "./theme.js";

const ThemeContext = createContext<LITheme>(getLITheme("light"));

export const LinkedInThemeProvider: React.FC<{
  mode: LIThemeMode;
  children: React.ReactNode;
}> = ({ mode, children }) => {
  const theme = getLITheme(mode);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export function useLinkedInTheme(): LITheme {
  return useContext(ThemeContext);
}

