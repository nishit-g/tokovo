import React from "react";
import { useSafeAreaInsets } from "@tokovo/react";
import { injectXStyles } from "../styles";
import { useXTheme } from "./ThemeContext";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const theme = useXTheme();
  const safeArea = useSafeAreaInsets();

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
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(29,155,240,0.08), transparent 45%), radial-gradient(circle at 80% 5%, rgba(255,255,255,0.03), transparent 55%)",
      }}
    >
      {/* Line texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 6px)",
          pointerEvents: "none",
        }}
      />

      {/* Main content area - scrollable */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "auto",
          paddingBottom: safeArea.bottom,
        }}
      >
        {children}
      </div>
    </div>
  );
};
