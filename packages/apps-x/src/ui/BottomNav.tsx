import React from "react";
import { getXTheme } from "../config/theme";
import { XIcon } from "./components";

export const BottomNav: React.FC<{ active?: "home" | "search" | "bell" | "mail" }> = ({
  active = "home",
}) => {
  const theme = getXTheme("dark");
  return (
    <div
      style={{
        marginTop: "auto",
        padding: "10px 24px 18px",
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.surface,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <XIcon name="home" active={active === "home"} />
      <XIcon name="search" active={active === "search"} />
      <XIcon name="bell" active={active === "bell"} />
      <XIcon name="mail" active={active === "mail"} />
    </div>
  );
};
