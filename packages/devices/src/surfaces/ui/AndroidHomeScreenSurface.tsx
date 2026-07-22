import React from "react";
import { materialToPaintStyle } from "@tokovo/visual-system";
import type { HomeScreenProjection } from "../contract.js";
import { HomeAppGrid, HomeDock, PageDots, SearchIcon } from "./HomeScreenPrimitives.js";
import { SystemWallpaper } from "./Wallpaper.js";

function MicrophoneIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8.5" y="3.5" width="7" height="11" rx="3.5" stroke={color} strokeWidth="1.8" />
      <path
        d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0M12 17.7v2.8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AndroidHomeScreenSurface({ projection }: { projection: HomeScreenProjection }) {
  if (projection.theme.platform !== "android") {
    throw new Error("SYSTEM_SURFACE_PLATFORM_MISMATCH: Android home painter received iOS data.");
  }
  const { theme, layout } = projection;
  const home = layout.home;
  return (
    <div
      data-system-surface="homescreen"
      data-system-painter="android-homescreen@1"
      data-theme={theme.id}
      dir={projection.direction}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        color: theme.colors.primaryText,
        fontFamily: theme.fontFamily,
      }}
    >
      <SystemWallpaper wallpaper={projection.wallpaper} />
      <div
        style={{
          position: "absolute",
          top: home.atAGlanceTop,
          insetInlineStart: home.gridPaddingX + layout.pointScale * 4,
          zIndex: 2,
          color: theme.colors.primaryText,
        }}
      >
        <div style={{ fontSize: layout.pointScale * 13, fontWeight: 600, opacity: 0.78 }}>
          {projection.strings.date}
        </div>
        <div
          style={{
            marginTop: layout.pointScale * 2,
            fontSize: layout.pointScale * 24,
            fontWeight: 450,
            letterSpacing: -0.4,
          }}
        >
          {projection.strings.shortDate}
        </div>
      </div>
      <HomeAppGrid projection={projection} />
      {projection.pageCount > 1 ? <PageDots projection={projection} /> : null}
      <div
        style={{
          position: "absolute",
          left: home.gridPaddingX,
          right: home.gridPaddingX,
          bottom: home.searchBottom,
          height: home.searchHeight,
          borderRadius: home.searchHeight / 2,
          ...materialToPaintStyle(theme.materials.chromeRaised, layout.pointScale),
          display: "flex",
          alignItems: "center",
          padding: `0 ${layout.pointScale * 18}px`,
          boxSizing: "border-box",
          gap: layout.pointScale * 12,
          color: theme.colors.secondaryText,
          fontSize: layout.pointScale * 16,
          fontWeight: 500,
          zIndex: 2,
        }}
      >
        <SearchIcon color={theme.colors.secondaryText} size={layout.pointScale * 22} />
        <span style={{ flex: 1 }}>{projection.strings.search}</span>
        <MicrophoneIcon color={theme.colors.secondaryText} size={layout.pointScale * 21} />
      </div>
      <HomeDock projection={projection} maxItems={5} material={false} circularIcons />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: layout.pointScale * 5,
          left: "50%",
          transform: "translateX(-50%)",
          width: layout.pointScale * 108,
          height: layout.pointScale * 4,
          borderRadius: 999,
          background: theme.colors.primaryText,
          opacity: 0.86,
          zIndex: 3,
        }}
      />
    </div>
  );
}
