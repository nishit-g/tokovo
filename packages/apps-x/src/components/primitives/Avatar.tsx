import React from "react";
import { DeterministicImage } from "@tokovo/react";
import type { XUser } from "../../runtime/state.js";
import { useXExperience } from "../../experience/context.js";

const gradients = [
  ["#7C3AED", "#2563EB"],
  ["#0F766E", "#22C55E"],
  ["#C2410C", "#F59E0B"],
  ["#BE185D", "#7C3AED"],
  ["#0369A1", "#06B6D4"],
] as const;

function gradientFor(id: string): string {
  const index = Array.from(id).reduce((sum, char) => sum + (char.codePointAt(0) ?? 0), 0) % gradients.length;
  const [from, to] = gradients[index];
  return `linear-gradient(145deg, ${from}, ${to})`;
}

export const Avatar: React.FC<{
  user: XUser;
  size?: number;
  ring?: boolean;
}> = ({ user, size = 40, ring = false }) => {
  const experience = useXExperience();
  const common: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    flex: "0 0 auto",
    boxSizing: "border-box",
    border: ring ? `3px solid ${experience.colors.background}` : "none",
  };
  if (user.avatarUrl) {
    return (
      <DeterministicImage
        src={user.avatarUrl}
        alt=""
        aria-hidden
        style={{ ...common, display: "block", objectFit: "cover", background: experience.colors.surfaceRaised }}
      />
    );
  }
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toUpperCase();
  return (
    <div
      aria-hidden
      style={{
        ...common,
        display: "grid",
        placeItems: "center",
        background: gradientFor(user.id),
        color: "#FFFFFF",
        fontSize: Math.max(11, Math.round(size * 0.34)),
        fontWeight: 700,
        letterSpacing: "-.02em",
      }}
    >
      {initials}
    </div>
  );
};

export const VerifiedBadge: React.FC<{ variant: XUser["verified"]; size?: number }> = ({
  variant,
  size = 17,
}) => {
  if (!variant) return null;
  const fill = variant === "gold" ? "#E2B719" : variant === "grey" ? "#82909C" : "#1D9BF0";
  return (
    <span aria-label="Verified account" style={{ display: "inline-flex", flex: "0 0 auto" }}>
      <svg viewBox="0 0 22 22" width={size} height={size} aria-hidden>
        <path fill={fill} d="M20.4 11c0 1.2-1.5 2-1.9 3-.4 1 .1 2.6-.7 3.4-.8.8-2.4.3-3.4.7-1 .4-1.8 1.9-3 1.9s-2-1.5-3-1.9c-1-.4-2.6.1-3.4-.7-.8-.8-.3-2.4-.7-3.4-.4-1-1.9-1.8-1.9-3s1.5-2 1.9-3c.4-1-.1-2.6.7-3.4.8-.8 2.4-.3 3.4-.7 1-.4 1.8-1.9 3-1.9s2 1.5 3 1.9c1 .4 2.6-.1 3.4.7.8.8.3 2.4.7 3.4.4 1 1.9 1.8 1.9 3Z" />
        <path d="m7.3 11 2.4 2.4 5-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
};
