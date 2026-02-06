import React, { createContext, useContext } from "react";
import type { XTheme, XThemeMode } from "../config/theme.js";
import { getXTheme } from "../config/theme.js";

const ThemeContext = createContext<XTheme>(getXTheme("dark"));

interface ThemeProviderProps {
    mode: XThemeMode;
    children: React.ReactNode;
}

export const XThemeProvider: React.FC<ThemeProviderProps> = ({ mode, children }) => {
    const theme = getXTheme(mode);
    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export function useXTheme(): XTheme {
    return useContext(ThemeContext);
}
