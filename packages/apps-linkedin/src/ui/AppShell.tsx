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
        fontFamily:
          "'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        paddingTop: safeArea.top,
        paddingBottom: safeArea.bottom,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          theme.mode === "dark"
            ? "radial-gradient(circle at 20% 0%, rgba(59,130,246,0.14), transparent 44%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.04), transparent 55%)"
            : "radial-gradient(circle at 20% 0%, rgba(10,102,194,0.10), transparent 42%), radial-gradient(circle at 90% 0%, rgba(255,255,255,0.75), transparent 60%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            theme.mode === "dark"
              ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 7px)"
              : "repeating-linear-gradient(135deg, rgba(0,0,0,0.02) 0, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 7px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
};

