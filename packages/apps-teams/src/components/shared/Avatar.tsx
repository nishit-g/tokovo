import React from "react";
import { teamsFontFamily } from "../../styles.js";

const AVATAR_PALETTE = [
  "#5B8DEF",
  "#3E7BFA",
  "#2FA3B8",
  "#00A38C",
  "#56B356",
  "#C7A200",
  "#E3883A",
  "#D95C4E",
  "#C254A0",
  "#7A62D6",
  "#5667D8",
  "#0E78D5",
];

function pickAvatarColor(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0];
}

export const Avatar: React.FC<{
  name: string;
  size?: number;
  presence?: string;
  tone?: "brand" | "neutral";
}> = ({ name, size = 38, presence, tone = "brand" }) => {
  const initials = name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const dotColor =
    presence === "available"
      ? "var(--teams-presence-available)"
      : presence === "busy"
        ? "var(--teams-presence-busy)"
        : presence === "away"
          ? "var(--teams-presence-away)"
          : "var(--teams-presence-offline)";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: tone === "brand" ? "var(--teams-brand)" : pickAvatarColor(name),
        color: tone === "brand" ? "var(--teams-text-inverse)" : "var(--teams-text-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: Math.max(12, size * 0.34),
        fontFamily: teamsFontFamily,
        position: "relative",
        flexShrink: 0,
        boxShadow: "var(--teams-shadow-card)",
      }}
    >
      {initials || "?"}
      {presence ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: Math.max(10, size * 0.28),
            height: Math.max(10, size * 0.28),
            borderRadius: 999,
            backgroundColor: dotColor,
            border: "2px solid var(--teams-surface-elevated)",
          }}
        />
      ) : null}
    </div>
  );
};

export const AvatarStack: React.FC<{
  names: string[];
  size?: number;
}> = ({ names, size = 42 }) => {
  const visible = names.slice(0, 3);

  return (
    <div style={{ display: "flex", alignItems: "center", minWidth: size + 14, flexShrink: 0 }}>
      {visible.map((name, index) => (
        <div
          key={`${name}:${index}`}
          style={{
            marginLeft: index === 0 ? 0 : -12,
            borderRadius: 999,
            border: "2px solid var(--teams-surface)",
          }}
        >
          <Avatar name={name} size={size - index * 4} tone="neutral" />
        </div>
      ))}
    </div>
  );
};
