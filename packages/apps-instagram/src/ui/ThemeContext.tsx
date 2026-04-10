import React from "react";
import type { InstagramTheme } from "../config/theme.js";
import { getInstagramTheme } from "../config/theme.js";

const InstagramThemeContext = React.createContext<InstagramTheme>(getInstagramTheme("light"));

export const InstagramThemeProvider: React.FC<{
  mode?: "light" | "dark" | "ghibli";
  children: React.ReactNode;
}> = ({ mode = "light", children }) => {
  const theme = React.useMemo(() => getInstagramTheme(mode), [mode]);
  return (
    <InstagramThemeContext.Provider value={theme}>
      {children}
    </InstagramThemeContext.Provider>
  );
};

export function useInstagramTheme(): InstagramTheme {
  return React.useContext(InstagramThemeContext);
}
