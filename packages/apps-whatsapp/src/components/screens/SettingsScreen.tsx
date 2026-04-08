import React from "react";
import { WorldState } from "@tokovo/core";
import { spacing, typography } from "../theme.js";
import { TabNavigation } from "../TabNavigation.js";
import { useTheme } from "../../theme/ThemeContext.js";

export interface SettingsScreenProps {
  world: WorldState;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

const SettingsRow: React.FC<{ label: string; isLast?: boolean }> = ({
  label,
  isLast,
}) => {
  const theme = useTheme();

  return (
    <div
      style={{
        padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
        backgroundColor: theme.colors.background,
        borderBottom: isLast ? "none" : `0.5px solid ${theme.colors.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          ...typography.body,
          color: theme.colors.receivedBubbleText,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...typography.caption,
          color: theme.colors.timestamp,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {"›"}
      </div>
    </div>
  );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  world: _world,
  safeAreaInsets,
  width: _width,
  height: _height,
}) => {
  const theme = useTheme();
  const safeAreaTop = safeAreaInsets?.top ?? 47;
  const safeAreaBottom = safeAreaInsets?.bottom ?? 34;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.headerBackground,
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          paddingTop: safeAreaTop,
          paddingLeft: spacing.pagePaddingWide,
          paddingRight: spacing.pagePaddingX,
          height: spacing.navBarHeight + safeAreaTop,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `0.5px solid ${theme.colors.divider}`,
          backgroundColor: `${theme.colors.headerBackground}F2`,
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            ...typography.title,
            color: theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          Settings
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          paddingBottom: spacing.tabBarHeight + safeAreaBottom,
        }}
      >
        <div style={{ paddingTop: spacing.sectionGap }}>
          <SettingsRow label="Account" />
          <SettingsRow label="Privacy" />
          <SettingsRow label="Chats" />
          <SettingsRow label="Notifications" />
          <SettingsRow label="Storage and Data" isLast />
        </div>
      </div>

      <TabNavigation activeTab="settings" safeAreaBottom={safeAreaBottom} />
    </div>
  );
};

export default SettingsScreen;
