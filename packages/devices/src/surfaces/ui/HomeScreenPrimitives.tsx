import React from "react";
import type { AppFolder, AppIcon } from "@tokovo/core";
import { materialToPaintStyle } from "@tokovo/visual-system";
import type { HomeScreenProjection } from "../contract.js";
import { SystemAppIcon } from "./SystemIcon.js";

export function SearchIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke={color} strokeWidth="2.2" />
      <path d="m16 16 4 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function FolderTile({
  folder,
  projection,
}: {
  folder: AppFolder;
  projection: HomeScreenProjection;
}) {
  const { theme, layout } = projection;
  const home = layout.home;
  const miniSize = home.iconSize * 0.24;
  return (
    <div
      style={{
        width: home.iconSize,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: home.labelGap,
      }}
    >
      <div
        style={{
          width: home.iconSize,
          height: home.iconSize,
          borderRadius: home.iconRadius,
          ...materialToPaintStyle(theme.materials.chrome, layout.pointScale),
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
            radius={home.iconRadius * (miniSize / home.iconSize)}
            theme={theme}
            layout={layout}
            showLabel={false}
          />
        ))}
      </div>
      <span
        style={{
          width: home.iconSize + layout.pointScale * 14,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "center",
          color: theme.colors.primaryText,
          fontFamily: theme.fontFamily,
          fontSize: home.labelSize,
          fontWeight: 500,
          textShadow:
            theme.appearance === "light"
              ? "0 1px 5px rgba(255,255,255,.85)"
              : "0 1px 5px rgba(0,0,0,.7)",
        }}
      >
        {folder.name}
      </span>
    </div>
  );
}

export function HomeAppGrid({ projection }: { projection: HomeScreenProjection }) {
  const { layout } = projection;
  const home = layout.home;
  return (
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
      {projection.pageItems
        .slice(0, home.gridColumns * home.gridRows)
        .map((item, index) =>
          "type" in item && item.type === "folder" ? (
            <FolderTile
              key={`folder:${item.name}:${index}`}
              folder={item}
              projection={projection}
            />
          ) : (
            <SystemAppIcon
              key={(item as AppIcon).appId}
              app={item as AppIcon}
              size={home.iconSize}
              radius={home.iconRadius}
              theme={projection.theme}
              layout={layout}
            />
          ),
        )}
    </div>
  );
}

export function HomeDock({
  projection,
  maxItems,
  material,
  circularIcons,
}: {
  projection: HomeScreenProjection;
  maxItems: number;
  material: boolean;
  circularIcons: boolean;
}) {
  const { theme, layout } = projection;
  const home = layout.home;
  return (
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
        ...(material
          ? materialToPaintStyle(theme.materials.chrome, layout.pointScale)
          : { background: "transparent" }),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        padding: `0 ${layout.pointScale * 10}px`,
        boxSizing: "border-box",
        zIndex: 2,
        direction: projection.direction,
      }}
    >
      {projection.dock.slice(0, maxItems).map((app) => (
        <SystemAppIcon
          key={app.appId}
          app={app}
          size={home.dockIconSize}
          radius={circularIcons ? home.dockIconSize / 2 : home.iconRadius}
          theme={theme}
          layout={layout}
          showLabel={false}
        />
      ))}
    </div>
  );
}

export function PageDots({ projection }: { projection: HomeScreenProjection }) {
  const home = projection.layout.home;
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
            background:
              index === projection.activePage
                ? projection.theme.colors.primaryText
                : projection.theme.colors.secondaryText,
            opacity: index === projection.activePage ? 0.95 : 0.44,
          }}
        />
      ))}
    </div>
  );
}
