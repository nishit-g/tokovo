import React from "react";
import { useAppViewport } from "@tokovo/react";
import { useLinkedInTheme } from "./ThemeContext.js";

export const LinkedInAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useLinkedInTheme();
  const { interactiveInsets: contentInsets } = useAppViewport();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background:
          theme.mode === "storybook"
            ? "linear-gradient(180deg, #F6E8D7 0%, #F2E3CE 52%, #FFF8EE 100%)"
            : `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.background} 72%, ${theme.colors.surface} 100%)`,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily,
        paddingTop: contentInsets.top,
        paddingBottom: contentInsets.bottom,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};
