import React from "react";
import { materialToPaintStyle } from "@tokovo/visual-system";
import type { HomeScreenProjection } from "../contract.js";
import { HomeAppGrid, HomeDock, PageDots, SearchIcon } from "./HomeScreenPrimitives.js";
import { SystemWallpaper } from "./Wallpaper.js";

export function IOSHomeScreenSurface({ projection }: { projection: HomeScreenProjection }) {
  if (projection.theme.platform !== "ios") {
    throw new Error("SYSTEM_SURFACE_PLATFORM_MISMATCH: iOS home painter received Android data.");
  }
  const { theme, layout } = projection;
  const home = layout.home;
  return (
    <div
      data-system-surface="homescreen"
      data-system-painter="ios-homescreen@1"
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
      <HomeAppGrid projection={projection} />
      {projection.pageCount > 1 ? (
        <PageDots projection={projection} />
      ) : (
        <div
          style={{
            position: "absolute",
            bottom: home.searchBottom,
            left: "50%",
            transform: "translateX(-50%)",
            height: home.searchHeight,
            padding: `0 ${layout.pointScale * 10}px`,
            borderRadius: home.searchHeight / 2,
            ...materialToPaintStyle(theme.materials.chromeRaised, layout.pointScale),
            display: "flex",
            alignItems: "center",
            gap: layout.pointScale * 4,
            color: theme.colors.primaryText,
            fontSize: layout.pointScale * 12,
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          <SearchIcon color={theme.colors.primaryText} size={layout.pointScale * 12} />
          {projection.strings.search}
        </div>
      )}
      <HomeDock projection={projection} maxItems={4} material circularIcons={false} />
    </div>
  );
}
