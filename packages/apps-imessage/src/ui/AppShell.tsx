/**
 * iMessage App Shell
 *
 * Root layout wrapper that provides:
 * - Platform content insets from the app viewport
 * - Theme colors from context
 * - Consistent layout structure
 */
import React from "react";
import { useAppViewport } from "@tokovo/react";
import { useIMessageTheme } from "./ThemeContext.js";

interface AppShellProps {
  children: React.ReactNode;
  /** Override content insets for intentional immersive layouts. */
  overrideContentInsets?: {
    top?: number;
    bottom?: number;
  };
}

export const AppShell: React.FC<AppShellProps> = ({ children, overrideContentInsets }) => {
  const theme = useIMessageTheme();
  const { contentInsets } = useAppViewport();

  const topInset = overrideContentInsets?.top ?? contentInsets.top;
  const bottomInset = overrideContentInsets?.bottom ?? contentInsets.bottom;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.system.background,
        color: theme.colors.header.title,
        fontFamily: theme.typography.message.family,
        paddingTop: topInset,
        paddingBottom: bottomInset,
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
