import type {
  AppFolder,
  AppIcon,
  HomeScreenConfig,
  LayoutRect,
} from "@tokovo/core";

export type SystemSurfacePlatform = "ios" | "android";
export type SystemAppearance = "light" | "dark";
export type SystemDirection = "ltr" | "rtl";

export interface SystemWallpaperProjection {
  kind: "css" | "image";
  value: string;
  scrim: string;
}

export interface SystemSurfaceTheme {
  id: `system:${SystemSurfacePlatform}:${SystemAppearance}`;
  platform: SystemSurfacePlatform;
  appearance: SystemAppearance;
  statusBarTheme: "light" | "dark";
  fontFamily: string;
  colors: {
    primaryText: string;
    secondaryText: string;
    chrome: string;
    chromeStrong: string;
    chromeBorder: string;
    badge: string;
    badgeText: string;
    dock: string;
    folder: string;
    search: string;
  };
  wallpaper: string;
  wallpaperScrim: string;
  geometry: {
    pointScale: number;
    lock: {
      dateTop: number;
      dateSize: number;
      clockTop: number;
      clockSize: number;
      androidClockSize: number;
      controlsBottom: number;
      controlSize: number;
      controlIconSize: number;
    };
    home: {
      gridColumns: number;
      gridRows: number;
      gridTop: number;
      gridPaddingX: number;
      rowGap: number;
      columnGap: number;
      iconSize: number;
      iconRadius: number;
      labelSize: number;
      labelGap: number;
      dockHeight: number;
      dockWidth: number;
      dockBottom: number;
      dockRadius: number;
      dockIconSize: number;
      pageDotsBottom: number;
      pageDotSize: number;
      pageDotGap: number;
      searchBottom: number;
      searchHeight: number;
      atAGlanceTop: number;
    };
  };
}

export interface SystemLocalizedStrings {
  locale: string;
  direction: SystemDirection;
  date: string;
  shortDate: string;
  search: string;
  flashlight: string;
  camera: string;
  deviceLocked: string;
}

export interface LockscreenProjection {
  kind: "lockscreen";
  theme: SystemSurfaceTheme;
  locale: string;
  direction: SystemDirection;
  time: string;
  androidClockRows: readonly [string, string];
  strings: SystemLocalizedStrings;
  wallpaper: SystemWallpaperProjection;
  cinematicSubjects: Readonly<Record<string, LayoutRect>>;
}

export type ProjectedHomeItem = AppIcon | AppFolder;

export interface HomeScreenProjection {
  kind: "homescreen";
  theme: SystemSurfaceTheme;
  locale: string;
  direction: SystemDirection;
  strings: SystemLocalizedStrings;
  wallpaper: SystemWallpaperProjection;
  activePage: number;
  pageCount: number;
  pageItems: readonly ProjectedHomeItem[];
  dock: readonly AppIcon[];
  config: HomeScreenConfig;
  cinematicSubjects: Readonly<Record<string, LayoutRect>>;
}

export type SystemSurfaceProjection =
  | LockscreenProjection
  | HomeScreenProjection;
