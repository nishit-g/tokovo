import React from "react";
import { useSafeAreaInsets } from "@tokovo/react";
import { injectLinkedInStyles } from "../styles.js";
import { useLinkedInTheme } from "./ThemeContext.js";

export const LinkedInAppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useLinkedInTheme();
  const safeArea = useSafeAreaInsets();

  React.useEffect(() => {
    injectLinkedInStyles();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily,
        paddingTop: safeArea.top,
        paddingBottom: safeArea.bottom,
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
