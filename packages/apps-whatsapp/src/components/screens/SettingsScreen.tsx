import React from "react";
import { WorldState } from "@tokovo/core";
import { whatsappColors, spacing, typography } from "../theme.js";
import { TabNavigation } from "../TabNavigation.js";

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
}) => (
  <div
    style={{
      padding: `${spacing.sectionGap}px ${spacing.pagePaddingX}px`,
      backgroundColor: whatsappColors.bgPrimary,
      borderBottom: isLast ? "none" : `0.5px solid ${whatsappColors.separator}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ ...typography.body, color: whatsappColors.textPrimary }}>
      {label}
    </div>
    <div style={{ ...typography.caption, color: whatsappColors.textSecondary }}>
      {"›"}
    </div>
  </div>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  world: _world,
  safeAreaInsets,
  width: _width,
  height: _height,
}) => {
  // TokovoRenderer already provides safeAreaInsets in design coordinates.
  const safeAreaTop = safeAreaInsets?.top ?? 47;
  const safeAreaBottom = safeAreaInsets?.bottom ?? 34;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: whatsappColors.bgList,
        display: "flex",
        flexDirection: "column",
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
          borderBottom: `0.5px solid ${whatsappColors.separatorLight}`,
          backgroundColor: whatsappColors.surfaceGlass,
        }}
      >
        <div style={{ ...typography.title, color: whatsappColors.textPrimary }}>
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

