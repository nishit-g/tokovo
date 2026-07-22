import React from "react";
import { materialToPaintStyle } from "@tokovo/visual-system";
import type { LockscreenProjection } from "../contract.js";

function FlashlightIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3h8l-1.2 6.1a4 4 0 0 1-1.1 2L13 12v8.5a1 1 0 0 1-2 0V12l-.7-.9a4 4 0 0 1-1.1-2L8 3Z"
        fill={color}
      />
      <path
        d="M9 6h6"
        stroke={color === "#FFFFFF" ? "#111" : "white"}
        strokeWidth="1.4"
        opacity=".34"
      />
    </svg>
  );
}

function CameraIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 7 9 4.8h6L16.5 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2.5Z"
        fill={color}
      />
      <circle cx="12" cy="13" r="3.5" fill={color === "#FFFFFF" ? "#222" : "white"} opacity=".72" />
    </svg>
  );
}

export function LockIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="12" height="10" rx="3" fill={color} />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

export function LockscreenControl({
  label,
  kind,
  projection,
}: {
  label: string;
  kind: "flashlight" | "camera";
  projection: LockscreenProjection;
}) {
  const { theme, layout } = projection;
  const lock = layout.lock;
  return (
    <div
      role="img"
      aria-label={label}
      style={{
        width: lock.controlSize,
        height: lock.controlSize,
        borderRadius: "50%",
        ...materialToPaintStyle(theme.materials.chrome, layout.pointScale),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {kind === "flashlight" ? (
        <FlashlightIcon color={theme.colors.primaryText} size={lock.controlIconSize} />
      ) : (
        <CameraIcon color={theme.colors.primaryText} size={lock.controlIconSize} />
      )}
    </div>
  );
}
