import React from "react";
import {
  HomeScreenConfig,
  AppIcon,
  AppFolder,
  Platform,
  getAppConfig,
} from "@tokovo/core";

interface HomeScreenStyleConfig {
  gridColumns: number;
  gridRows: number;
  gridGapRow: number;
  gridGapCol: number;
  gridPaddingTop: number;
  gridPaddingHorizontal: number;
  iconSize: number;
  iconRadius: number;
  iconLabelSize: number;
  iconLabelColor: string;
  iconLabelGap: number;
  folderBackdrop: string;
  folderBlur: string;
  folderPreviewGap: number;
  folderMiniIconRadius: number;
  dockHeight: number;
  dockRadius: number;
  dockBottom: number;
  dockWidth: string;
  dockBackdrop: string;
  dockBlur: string;
  dockIconSize: number;
  dotSize: number;
  dotGap: number;
  dotActiveColor: string;
  dotInactiveColor: string;
  dotMarginBottom: number;
}

interface AppIconItemProps {
  app: AppIcon;
  size?: number;
  styleConfig: HomeScreenStyleConfig;
}

const AppIconItem: React.FC<AppIconItemProps> = ({
  app,
  size,
  styleConfig,
}) => {
  const iconSize = size || styleConfig.iconSize;
  // Android icons are often circular or different shape; iOS are rounded rects
  const isEmoji = /^\p{Emoji}/u.test(app.icon);

  // Scale radius if size is overridden (e.g. in dock)
  const scale = iconSize / styleConfig.iconSize;
  const radius = styleConfig.iconRadius * scale;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: iconSize,
        gap: styleConfig.iconLabelGap,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: radius,
          position: "relative",
          backgroundColor: isEmoji ? "rgba(255,255,255,0.15)" : "#333",
          backgroundImage: !isEmoji ? `url(${app.icon})` : undefined,
          backgroundSize: "cover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isEmoji && (
          <span style={{ fontSize: iconSize * 0.5 }}>{app.icon}</span>
        )}

        {/* Badge - Keeping hardcoded red for now as it's standard notification color */}
        {app.badge && app.badge > 0 && (
          <div
            style={{
              position: "absolute",
              top: -12 * scale,
              right: -12 * scale,
              minWidth: 54 * scale,
              height: 54 * scale,
              borderRadius: 27 * scale,
              backgroundColor: "#FF3B30",
              color: "white",
              fontSize: 33 * scale,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: `0 ${15 * scale}px`,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}
          >
            {app.badge > 99 ? "99+" : app.badge}
          </div>
        )}
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: styleConfig.iconLabelSize,
          color: styleConfig.iconLabelColor,
          textAlign: "center",
          maxWidth: iconSize + 20,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        {app.label}
      </span>
    </div>
  );
};

// ============================================================================
// FOLDER COMPONENT
// ============================================================================

interface FolderItemProps {
  folder: AppFolder;
  size?: number;
  styleConfig: HomeScreenStyleConfig;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  size,
  styleConfig,
}) => {
  const iconSize = size || styleConfig.iconSize;
  const miniSize = (iconSize - 30) / 3; // Approx calculation for 3x3 grid
  const scale = iconSize / styleConfig.iconSize;
  const radius = styleConfig.iconRadius * scale;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: iconSize,
        gap: styleConfig.iconLabelGap,
      }}
    >
      {/* Folder icon with mini app previews */}
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: radius,
          backgroundColor: styleConfig.folderBackdrop,
          backdropFilter: `blur(${styleConfig.folderBlur})`,
          display: "grid",
          gridTemplateColumns: `repeat(3, ${miniSize}px)`,
          gridTemplateRows: `repeat(3, ${miniSize}px)`,
          gap: styleConfig.folderPreviewGap * scale,
          padding: 15 * scale,
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        {folder.apps.slice(0, 9).map((app, i) => (
          <div
            key={i}
            style={{
              width: miniSize,
              height: miniSize,
              borderRadius: miniSize * styleConfig.folderMiniIconRadius,
              backgroundColor: "rgba(255,255,255,0.3)",
              backgroundImage: !/^\p{Emoji}/u.test(app.icon)
                ? `url(${app.icon})`
                : undefined,
              backgroundSize: "cover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: miniSize * 0.6,
            }}
          >
            {/^\p{Emoji}/u.test(app.icon) && app.icon}
          </div>
        ))}
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: styleConfig.iconLabelSize,
          color: styleConfig.iconLabelColor,
          textAlign: "center",
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        {folder.name}
      </span>
    </div>
  );
};

// ============================================================================
// DOCK COMPONENT
// ============================================================================

interface DockProps {
  apps: AppIcon[];
  styleConfig: HomeScreenStyleConfig;
}

const Dock: React.FC<DockProps> = ({ apps, styleConfig }) => (
  <div
    style={{
      position: "absolute",
      bottom: styleConfig.dockBottom,
      left: "50%",
      transform: "translateX(-50%)",
      width: styleConfig.dockWidth,
      height: styleConfig.dockHeight,
      borderRadius: styleConfig.dockRadius,
      backgroundColor: styleConfig.dockBackdrop,
      backdropFilter: `blur(${styleConfig.dockBlur})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      padding: "0 30px",
    }}
  >
    {apps.slice(0, 4).map((app, i) => (
      <AppIconItem
        key={i}
        app={app}
        size={styleConfig.dockIconSize}
        styleConfig={styleConfig}
      />
    ))}
  </div>
);

// ============================================================================
// PAGE DOTS
// ============================================================================

interface PageDotsProps {
  count: number;
  activeIndex: number;
  styleConfig: HomeScreenStyleConfig;
}

const PageDots: React.FC<PageDotsProps> = ({
  count,
  activeIndex,
  styleConfig,
}) => (
  <div
    style={{
      display: "flex",
      gap: styleConfig.dotGap,
      marginBottom: styleConfig.dotMarginBottom,
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          width: styleConfig.dotSize,
          height: styleConfig.dotSize,
          borderRadius: "50%",
          backgroundColor:
            i === activeIndex
              ? styleConfig.dotActiveColor
              : styleConfig.dotInactiveColor,
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    ))}
  </div>
);

// ============================================================================
// HOME SCREEN VIEW
// ============================================================================

interface HomeScreenViewProps {
  config: HomeScreenConfig;
  variant?: "ios" | "android";
  activePage?: number;
  platform?: Platform; // Add platform prop to match other views
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  config,
  variant = "ios",
  activePage = 0,
  platform,
}) => {
  // Use platform prop if provided, otherwise fallback to variant
  const effectivePlatform = (platform || variant) as Platform;
  const styleConfig = getAppConfig(
    "homescreen",
    effectivePlatform,
  ) as HomeScreenStyleConfig;

  const currentPage = config.pages[activePage] || config.pages[0];
  const wallpaper =
    config.wallpaper ||
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: wallpaper.startsWith("http")
          ? `url(${wallpaper}) center/cover`
          : wallpaper,
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      {/* App Grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${styleConfig.gridColumns}, 1fr)`,
          gridTemplateRows: `repeat(${styleConfig.gridRows}, auto)`,
          gap: `${styleConfig.gridGapRow}px ${styleConfig.gridGapCol}px`,
          padding: `${styleConfig.gridPaddingTop}px ${styleConfig.gridPaddingHorizontal}px 0`,
          justifyItems: "center",
          overflow: "hidden",
        }}
      >
        {currentPage?.apps.map((item, i) =>
          "type" in item && item.type === "folder" ? (
            <FolderItem key={i} folder={item} styleConfig={styleConfig} />
          ) : (
            <AppIconItem
              key={i}
              app={item as AppIcon}
              styleConfig={styleConfig}
            />
          ),
        )}
      </div>

      {/* Page Dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <PageDots
          count={config.pages.length}
          activeIndex={activePage}
          styleConfig={styleConfig}
        />
      </div>

      {/* Dock */}
      <Dock apps={config.dock} styleConfig={styleConfig} />

      {/* Home Indicator - Visible on iOS */}
      {effectivePlatform === "ios" && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: 405,
            height: 15,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            borderRadius: 15,
          }}
        />
      )}
    </div>
  );
};
