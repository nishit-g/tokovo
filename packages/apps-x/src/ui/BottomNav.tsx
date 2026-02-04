import React from "react";
import { getXTheme } from "../config/theme";
import { XIcon } from "./components";

type NavItem = "home" | "search" | "bell" | "mail";

export const BottomNav: React.FC<{ active?: NavItem }> = ({
  active = "home",
}) => {
  const theme = getXTheme("dark");

  const navItems: { key: NavItem; icon: "home" | "search" | "bell" | "mail" }[] = [
    { key: "home", icon: "home" },
    { key: "search", icon: "search" },
    { key: "bell", icon: "bell" },
    { key: "mail", icon: "mail" },
  ];

  return (
    <div
      style={{
        height: theme.spacing.navHeight,
        minHeight: theme.spacing.navHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        marginTop: "auto",
        flexShrink: 0,
      }}
    >
      {navItems.map(({ key, icon }) => {
        const isActive = active === key;
        const iconName = isActive ? (`${icon}Filled` as const) : icon;

        return (
          <div
            key={key}
            style={{
              padding: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XIcon
              name={iconName}
              size={26}
              color={isActive ? theme.colors.textPrimary : theme.colors.textSecondary}
            />
          </div>
        );
      })}
    </div>
  );
};
