import React from "react";
import { useSafeAreaInsets } from "@tokovo/react";
import { injectXStyles } from "../styles.js";
import { useXTheme } from "./ThemeContext.js";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const theme = useXTheme();
  const safeArea = useSafeAreaInsets();
  const isStorybook = theme.mode === "storybook";

  React.useEffect(() => {
    injectXStyles();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
        fontFamily:
          "'Söhne', 'GT America', 'Neue Haas Grotesk Display', 'Helvetica Neue', sans-serif",
        paddingTop: safeArea.top,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundImage: isStorybook
          ? "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 18%), radial-gradient(circle at 20% 8%, rgba(74,124,89,0.12), transparent 32%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 18%)",
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            isStorybook
              ? "radial-gradient(circle at top, rgba(255,255,255,0.16), transparent 42%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 20%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          paddingBottom: safeArea.bottom,
        }}
      >
        {children}
      </div>
    </div>
  );
};
