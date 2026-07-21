import React from "react";
import { DeterministicImage } from "@tokovo/react";
import type { SystemWallpaperProjection } from "../contract.js";

export const SystemWallpaper: React.FC<{ wallpaper: SystemWallpaperProjection }> = ({ wallpaper }) => (
  <>
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background: wallpaper.kind === "css" ? wallpaper.value : "#111318",
      }}
    />
    {wallpaper.kind === "image" ? (
      <DeterministicImage
        src={wallpaper.value}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    ) : null}
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, background: wallpaper.scrim }}
    />
  </>
);

