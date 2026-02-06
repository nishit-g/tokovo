/**
 * iMessage Theme Context
 *
 * Provides dynamic theming throughout the iMessage UI components.
 */
import React, { createContext, useContext } from "react";
import type { IMessageTheme } from "../config/theme.js";
import { getTheme } from "../config/theme.js";
import type { IMessageThemeMode } from "../types/state.js";

const ThemeContext = createContext<IMessageTheme>(getTheme("light"));

interface ThemeProviderProps {
    mode: IMessageThemeMode;
    children: React.ReactNode;
}

export const IMessageThemeProvider: React.FC<ThemeProviderProps> = ({
    mode,
    children,
}) => {
    const theme = getTheme(mode);
    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export function useIMessageTheme(): IMessageTheme {
    return useContext(ThemeContext);
}
