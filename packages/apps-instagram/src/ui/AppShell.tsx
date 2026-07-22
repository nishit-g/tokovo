import React from "react";
import { useAppViewport } from "@tokovo/react";
import { useInstagramTheme } from "./ThemeContext.js";

export const AppShell: React.FC<{
  children: React.ReactNode;
  immersive?: boolean;
}> = ({ children, immersive = false }) => {
  const theme = useInstagramTheme();
  const { contentInsets } = useAppViewport();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: immersive
          ? theme.mode === "storybook"
            ? "linear-gradient(180deg, #324236 0%, #20231f 100%)"
            : "#050505"
          : theme.colors.background,
        color: immersive ? "#FFFFFF" : theme.colors.textPrimary,
        fontFamily:
          "'Inter Variable', 'Noto Sans Arabic Variable', 'Noto Sans Devanagari Variable', 'Noto Sans JP Variable', sans-serif",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        paddingTop: immersive ? 0 : contentInsets.top,
        paddingBottom: immersive ? 0 : contentInsets.bottom,
      }}
    >
      {!immersive ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              theme.mode === "storybook"
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
