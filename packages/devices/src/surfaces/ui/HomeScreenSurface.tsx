import React from "react";
import type { AppFolder, AppIcon } from "@tokovo/core";
import type { HomeScreenProjection, SystemSurfaceTheme } from "../contract.js";
import { SystemWallpaper } from "./Wallpaper.js";
import { SystemAppIcon } from "./SystemIcon.js";

const SearchIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="2.2" />
    <path d="m16 16 4 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const FolderTile: React.FC<{ folder: AppFolder; theme: SystemSurfaceTheme }> = ({ folder, theme }) => {
  const home = theme.geometry.home;
  const miniSize = home.iconSize * 0.24;
  return (
    <div style={{ width: home.iconSize, display: "flex", flexDirection: "column", alignItems: "center", gap: home.labelGap }}>
      <div
        style={{
          width: home.iconSize,
          height: home.iconSize,
          borderRadius: home.iconRadius,
          background: theme.colors.folder,
          border: `1px solid ${theme.colors.chromeBorder}`,
          display: "grid",
          gridTemplateColumns: `repeat(3, ${miniSize}px)`,
          gridAutoRows: miniSize,
          alignContent: "center",
          justifyContent: "center",
          gap: home.iconSize * 0.055,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {folder.apps.slice(0, 9).map((app) => (
          <SystemAppIcon
            key={app.appId}
            app={app}
            size={miniSize}
            radius={theme.platform === "ios" ? miniSize * 0.22 : miniSize / 2}
            theme={theme}
            showLabel={false}
          />
        ))}
      </div>
      <span
        style={{
          width: home.iconSize + theme.geometry.pointScale * 14,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "center",
          color: theme.colors.primaryText,
          fontFamily: theme.fontFamily,
          fontSize: home.labelSize,
          fontWeight: 500,
          textShadow: theme.appearance === "light" ? "0 1px 5px rgba(255,255,255,.85)" : "0 1px 5px rgba(0,0,0,.7)",
        }}
      >
        {folder.name}
      </span>
    </div>
  );
};

const PageDots: React.FC<{ projection: HomeScreenProjection }> = ({ projection }) => {
  const { theme } = projection;
  const home = theme.geometry.home;
  if (projection.pageCount <= 1 && theme.platform === "ios") {
    return (
      <div
        style={{
          position: "absolute",
          bottom: home.searchBottom,
          left: "50%",
          transform: "translateX(-50%)",
          height: home.searchHeight,
          padding: `0 ${theme.geometry.pointScale * 10}px`,
          borderRadius: home.searchHeight / 2,
          background: theme.colors.search,
          border: `1px solid ${theme.colors.chromeBorder}`,
          display: "flex",
          alignItems: "center",
          gap: theme.geometry.pointScale * 4,
          color: theme.colors.primaryText,
          fontFamily: theme.fontFamily,
          fontSize: theme.geometry.pointScale * 12,
          fontWeight: 600,
          zIndex: 2,
        }}
      >
        <SearchIcon color={theme.colors.primaryText} size={theme.geometry.pointScale * 12} />
        {projection.strings.search}
      </div>
    );
  }
  return (
    <div
      aria-label={`Page ${projection.activePage + 1} of ${projection.pageCount}`}
      style={{
        position: "absolute",
        bottom: home.pageDotsBottom,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: home.pageDotGap,
        zIndex: 2,
      }}
    >
      {Array.from({ length: projection.pageCount }, (_, index) => (
        <div
          key={index}
          style={{
            width: home.pageDotSize,
            height: home.pageDotSize,
            borderRadius: "50%",
            background: index === projection.activePage
              ? theme.colors.primaryText
              : theme.colors.secondaryText,
            opacity: index === projection.activePage ? 0.95 : 0.44,
          }}
        />
      ))}
    </div>
  );
};

export const HomeScreenSurface: React.FC<{ projection: HomeScreenProjection }> = ({ projection }) => {
  const { theme } = projection;
  const home = theme.geometry.home;
  const android = theme.platform === "android";

  return (
    <div
      data-system-surface="homescreen"
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

      {android ? (
        <div
          style={{
            position: "absolute",
            top: home.atAGlanceTop,
            insetInlineStart: home.gridPaddingX + theme.geometry.pointScale * 4,
            zIndex: 2,
            color: theme.colors.primaryText,
          }}
        >
          <div style={{ fontSize: theme.geometry.pointScale * 24, fontWeight: 450, letterSpacing: -0.4 }}>
            {projection.strings.shortDate}
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          top: home.gridTop,
          left: home.gridPaddingX,
          right: home.gridPaddingX,
          display: "grid",
          gridTemplateColumns: `repeat(${home.gridColumns}, 1fr)`,
          gridAutoRows: home.iconSize + home.labelGap + home.labelSize * 1.2,
          rowGap: home.rowGap,
          columnGap: home.columnGap,
          justifyItems: "center",
          alignItems: "start",
          zIndex: 2,
          direction: projection.direction,
        }}
      >
        {projection.pageItems.slice(0, home.gridColumns * home.gridRows).map((item, index) => (
          "type" in item && item.type === "folder"
            ? <FolderTile key={`folder:${item.name}:${index}`} folder={item} theme={theme} />
            : (
              <SystemAppIcon
                key={(item as AppIcon).appId}
                app={item as AppIcon}
                size={home.iconSize}
                radius={home.iconRadius}
                theme={theme}
              />
            )
        ))}
      </div>

      <PageDots projection={projection} />

      {android ? (
        <div
          style={{
            position: "absolute",
            left: home.gridPaddingX,
            right: home.gridPaddingX,
            bottom: home.searchBottom,
            height: home.searchHeight,
            borderRadius: home.searchHeight / 2,
            background: theme.colors.search,
            border: `1px solid ${theme.colors.chromeBorder}`,
            display: "flex",
            alignItems: "center",
            padding: `0 ${theme.geometry.pointScale * 18}px`,
            boxSizing: "border-box",
            gap: theme.geometry.pointScale * 12,
            color: theme.colors.secondaryText,
            fontSize: theme.geometry.pointScale * 16,
            fontWeight: 500,
            zIndex: 2,
          }}
        >
          <SearchIcon color={theme.colors.secondaryText} size={theme.geometry.pointScale * 22} />
          <span style={{ flex: 1 }}>{projection.strings.search}</span>
          <span aria-hidden="true" style={{ fontWeight: 800, color: "#4285F4" }}>G</span>
        </div>
      ) : null}

      <div
        data-system-region="dock"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: home.dockBottom,
          width: home.dockWidth,
          height: home.dockHeight,
          borderRadius: home.dockRadius,
          background: theme.colors.dock,
          border: theme.platform === "ios" ? `1px solid ${theme.colors.chromeBorder}` : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          padding: `0 ${theme.geometry.pointScale * 10}px`,
          boxSizing: "border-box",
          zIndex: 2,
          direction: projection.direction,
        }}
      >
        {projection.dock.slice(0, android ? 5 : 4).map((app) => (
          <SystemAppIcon
            key={app.appId}
            app={app}
            size={home.dockIconSize}
            radius={theme.platform === "ios" ? home.iconRadius : home.dockIconSize / 2}
            theme={theme}
            showLabel={false}
          />
        ))}
      </div>

      {android ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: theme.geometry.pointScale * 5,
            left: "50%",
            transform: "translateX(-50%)",
            width: theme.geometry.pointScale * 108,
            height: theme.geometry.pointScale * 4,
            borderRadius: 999,
            background: theme.colors.primaryText,
            opacity: 0.86,
            zIndex: 3,
          }}
        />
      ) : null}
    </div>
  );
};
