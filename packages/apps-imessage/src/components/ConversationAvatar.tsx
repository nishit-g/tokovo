import React from "react";
import { DeterministicImage as Img } from "@tokovo/react";
import { useIMessageTheme } from "../ui/ThemeContext.js";

export function ConversationAvatar({
  name,
  src,
  size,
  isGroup = false,
}: {
  name: string;
  src?: string;
  size: number;
  isGroup?: boolean;
}) {
  const theme = useIMessageTheme();
  const initials = name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return (
    <div
      role="img"
      aria-label={name}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(#A9ADB5, #858A95)",
        color: "white",
        fontFamily: theme.typography.message.family,
        fontSize: size * 0.4,
        fontWeight: 500,
      }}
    >
      {src ? (
        <Img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : isGroup ? (
        <svg
          width={size * 0.7}
          height={size * 0.7}
          viewBox="0 0 32 32"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="10" r="5" />
          <circle cx="23" cy="12" r="4" />
          <path d="M2 27v-2a10 10 0 0 1 20 0v2Zm21 0v-2a12 12 0 0 0-2-7 8 8 0 0 1 10 8v1Z" />
        </svg>
      ) : (
        initials
      )}
    </div>
  );
}
