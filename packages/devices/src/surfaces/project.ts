import type {
  DeviceOSState,
  HomeScreenConfig,
  LayoutRect,
  LayoutState,
  SemanticRegion,
} from "@tokovo/core";
import type { DeviceProfile } from "../types.js";
import type {
  HomeScreenProjection,
  LockscreenProjection,
  SystemAppearance,
  SystemWallpaperProjection,
} from "./contract.js";
import { formatSystemTime, getSystemLocalizedStrings } from "./localization.js";
import { resolveSystemSurfaceDesign } from "./theme.js";

const DEFAULT_CLOCK_MS = Date.parse("2024-01-01T09:41:00Z");

function wallpaperProjection(
  authored: string | undefined,
  fallback: string,
  scrim: string,
): SystemWallpaperProjection {
  const value = authored?.trim() || fallback;
  const isImage = /^(?:https?:\/\/|\/|data:|r2:\/\/)/u.test(value);
  return { kind: isImage ? "image" : "css", value, scrim };
}

function rect(x: number, y: number, width: number, height: number): LayoutRect {
  return { x, y, width, height };
}

function resolveOS(os: DeviceOSState | undefined): {
  locale: string;
  appearance: SystemAppearance;
  clock: number;
  hourCycle?: "h12" | "h24";
  lockScreenWallpaper?: string;
} {
  return {
    locale: os?.locale || "en-US",
    appearance: os?.appearance || "light",
    clock: os?.clock ?? DEFAULT_CLOCK_MS,
    hourCycle: os?.hourCycle,
    lockScreenWallpaper: os?.lockScreenWallpaper,
  };
}

export function projectLockscreen(input: {
  profile: DeviceProfile;
  os?: DeviceOSState;
  fallbackWallpaper?: string;
}): LockscreenProjection {
  const resolved = resolveOS(input.os);
  const { theme, layout } = resolveSystemSurfaceDesign(
    input.profile,
    resolved.appearance,
    resolved.locale,
  );
  const strings = getSystemLocalizedStrings(resolved.clock, resolved.locale);
  const time = formatSystemTime(resolved.clock, resolved.locale, resolved.hourCycle);
  const [hours = "", minutes = ""] = time.split(":");
  const lock = layout.lock;
  const clockHeight =
    theme.platform === "android" ? lock.androidClockSize * 1.72 : lock.clockSize * 1.05;

  return {
    kind: "lockscreen",
    theme,
    layout,
    locale: resolved.locale,
    direction: strings.direction,
    time,
    androidClockRows: [hours, minutes],
    strings,
    wallpaper: wallpaperProjection(
      resolved.lockScreenWallpaper ?? input.fallbackWallpaper,
      theme.wallpaper,
      theme.wallpaperScrim,
    ),
    cinematicSubjects: {
      "lockscreen.clock": rect(
        layout.pointScale * 20,
        lock.clockTop,
        input.profile.display.width - layout.pointScale * 40,
        clockHeight,
      ),
      "lockscreen.controls": rect(
        0,
        input.profile.display.height - lock.controlsBottom - lock.controlSize,
        input.profile.display.width,
        lock.controlSize,
      ),
    },
  };
}

export function projectHomeScreen(input: {
  profile: DeviceProfile;
  os?: DeviceOSState;
  config: HomeScreenConfig;
  activePage?: number;
}): HomeScreenProjection {
  if (input.config.pages.length === 0) {
    throw new Error("SYSTEM_HOME_INVALID: a home screen must contain at least one page.");
  }
  const resolved = resolveOS(input.os);
  const { theme, layout } = resolveSystemSurfaceDesign(
    input.profile,
    resolved.appearance,
    resolved.locale,
  );
  const strings = getSystemLocalizedStrings(resolved.clock, resolved.locale);
  const activePage = Math.max(0, Math.min(input.activePage ?? 0, input.config.pages.length - 1));
  const pageItems = input.config.pages[activePage]?.apps ?? [];
  const home = layout.home;
  const gridBottom =
    theme.platform === "ios"
      ? home.pageDotsBottom + home.searchHeight
      : home.searchBottom + home.searchHeight + home.rowGap;
  const cinematicSubjects: Record<string, LayoutRect> = {
    "homescreen.grid": rect(
      home.gridPaddingX,
      home.gridTop,
      input.profile.display.width - home.gridPaddingX * 2,
      Math.max(0, input.profile.display.height - home.gridTop - gridBottom),
    ),
    "homescreen.dock": rect(
      (input.profile.display.width - home.dockWidth) / 2,
      input.profile.display.height - home.dockBottom - home.dockHeight,
      home.dockWidth,
      home.dockHeight,
    ),
    "homescreen.search": rect(
      theme.platform === "ios" ? input.profile.display.width * 0.4 : home.gridPaddingX,
      input.profile.display.height - home.searchBottom - home.searchHeight,
      theme.platform === "ios"
        ? input.profile.display.width * 0.2
        : input.profile.display.width - home.gridPaddingX * 2,
      home.searchHeight,
    ),
  };

  const cellWidth = (input.profile.display.width - home.gridPaddingX * 2) / home.gridColumns;
  const cellHeight = home.iconSize + home.labelGap + home.labelSize + home.rowGap;
  pageItems.forEach((item, index) => {
    if (!("appId" in item)) return;
    const visualIndex =
      strings.direction === "rtl"
        ? Math.floor(index / home.gridColumns) * home.gridColumns +
          (home.gridColumns - 1 - (index % home.gridColumns))
        : index;
    const column = visualIndex % home.gridColumns;
    const row = Math.floor(visualIndex / home.gridColumns);
    cinematicSubjects[`homescreen.icon:${item.appId}`] = rect(
      home.gridPaddingX + column * cellWidth + (cellWidth - home.iconSize) / 2,
      home.gridTop + row * cellHeight,
      home.iconSize,
      home.iconSize,
    );
  });

  return {
    kind: "homescreen",
    theme,
    layout,
    locale: resolved.locale,
    direction: strings.direction,
    strings,
    wallpaper: wallpaperProjection(input.config.wallpaper, theme.wallpaper, theme.wallpaperScrim),
    activePage,
    pageCount: input.config.pages.length,
    pageItems,
    dock: input.config.dock,
    config: input.config,
    cinematicSubjects,
  };
}

export function projectSystemSurfaceLayout(
  projection: HomeScreenProjection | LockscreenProjection,
): LayoutState {
  const regions = Object.fromEntries(
    Object.entries(projection.cinematicSubjects).map(([id, region]) => [
      id,
      {
        id,
        rect: region,
        tags: ["system", projection.kind],
      } satisfies SemanticRegion,
    ]),
  );
  const semantic = { regions, groups: {} };
  return projection.kind === "lockscreen"
    ? { kind: "LOCKSCREEN", meta: {}, semantic, cacheHint: "static" }
    : { kind: "HOMESCREEN", meta: {}, semantic, cacheHint: "static" };
}
