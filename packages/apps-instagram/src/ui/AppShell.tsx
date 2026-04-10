import React from "react";
import { useSafeAreaInsets } from "@tokovo/react";
import { injectInstagramStyles } from "../styles.js";
import { useInstagramTheme } from "./ThemeContext.js";

function useOptionalSafeAreaInsets() {
  try {
    return useSafeAreaInsets();
  } catch {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
}

export const AppShell: React.FC<{
  children: React.ReactNode;
  immersive?: boolean;
}> = ({ children, immersive = false }) => {
  const theme = useInstagramTheme();
  const safeArea = useOptionalSafeAreaInsets();

  React.useEffect(() => {
    injectInstagramStyles();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: immersive
          ? theme.mode === "ghibli"
            ? "linear-gradient(180deg, #324236 0%, #20231f 100%)"
            : "#050505"
          : theme.colors.background,
        color: immersive ? "#FFFFFF" : theme.colors.textPrimary,
        fontFamily: "'Instagram Sans', 'SF Pro Display', 'Helvetica Neue', sans-serif",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        paddingTop: immersive ? 0 : safeArea.top,
        paddingBottom: immersive ? 0 : safeArea.bottom,
      }}
    >
      {!immersive ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              theme.mode === "ghibli"
                ? "radial-gradient(circle at top, rgba(255,255,255,0.14), transparent 28%)"
                : "linear-gradient(180deg, rgba(0,0,0,0.015), transparent 14%)",
            pointerEvents: "none",
          }}
        />
      ) : null}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};
