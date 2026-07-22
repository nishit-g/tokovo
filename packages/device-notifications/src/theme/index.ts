import { resolvePlatformVisuals, type PlatformDesignProfileId } from "@tokovo/visual-system";
import type {
  NotificationAppearance,
  NotificationPlatform,
  NotificationThemeProjection,
} from "../contract/index.js";

function directionForLocale(locale: string): "ltr" | "rtl" {
  const language = locale.trim().toLowerCase().split(/[-_]/u)[0];
  return language === "ar" || language === "fa" || language === "he" || language === "ur"
    ? "rtl"
    : "ltr";
}

export function getNotificationTheme(
  platform: NotificationPlatform,
  appearance: NotificationAppearance,
  platformProfileId: PlatformDesignProfileId,
  locale = "en-US",
): NotificationThemeProjection {
  const visuals = resolvePlatformVisuals({
    platformProfileId,
    appearance,
    locale,
    direction: directionForLocale(locale),
    textScale: 1,
    contrast: "standard",
    motion: "full",
  });
  if (visuals.platform !== platform) {
    throw new Error(
      `NOTIFICATION_VISUAL_PROFILE_MISMATCH: ${platformProfileId} cannot paint ${platform} notifications.`,
    );
  }
  const geometry = visuals.geometry.notification;
  const app = visuals.typography.roles["notification-app"];
  const title = visuals.typography.roles["notification-title"];
  const body = visuals.typography.roles["notification-body"];
  const timestamp = visuals.typography.roles["notification-time"];

  return {
    id: `${platformProfileId}:${appearance}:notifications`,
    platform,
    appearance,
    colors: {
      banner: visuals.materials.notification.fill,
      card: visuals.materials.notification.fill,
      cardSecondary: visuals.materials.notificationSecondary.fill,
      centerScrim: visuals.palette.notificationCenterScrim,
      text: visuals.palette.primaryText,
      secondaryText: visuals.palette.secondaryText,
      border: visuals.materials.notification.stroke?.color ?? visuals.palette.separator,
      action: visuals.palette.accent,
      actionDestructive: visuals.palette.destructive,
    },
    materials: {
      card: visuals.materials.notification,
      secondary: visuals.materials.notificationSecondary,
      center: {
        fill: visuals.palette.notificationCenterScrim,
        backdropBlur: platform === "ios" ? 38 : 12,
        backdropSaturation: platform === "ios" ? 1.28 : 1,
        backdropBrightness: appearance === "dark" ? 0.84 : 0.94,
        shadows: [],
        minimumBackdropContrast: 1.7,
      },
    },
    geometry: {
      bannerTop: visuals.geometry.minimumContentInsets.top + geometry.islandClearance,
      bannerHorizontalMargin: geometry.horizontalMargin,
      bannerMinHeight: geometry.minimumHeight,
      cardRadius: geometry.cardRadius,
      cardPadding: geometry.cardPadding,
      iconSize: geometry.iconSize,
      lockScreenTop: geometry.lockScreenTop,
      centerTop: geometry.centerTop,
      centerHorizontalMargin: geometry.horizontalMargin,
      stackGap: geometry.stackGap,
      maxLockScreenGroups: geometry.maxLockScreenGroups,
      maxCenterGroups: geometry.maxCenterGroups,
    },
    typography: {
      fontFamily: body.family,
      appSize: app.size,
      titleSize: title.size,
      bodySize: body.size,
      timestampSize: timestamp.size,
    },
    motion: {
      bannerEnterFramesAt30: visuals.motionProfile.notificationBannerEnterFramesAt30,
      bannerExitFramesAt30: visuals.motionProfile.notificationBannerExitFramesAt30,
      cardEnterFramesAt30: visuals.motionProfile.notificationCardEnterFramesAt30,
      centerEnterFramesAt30: visuals.motionProfile.notificationCenterEnterFramesAt30,
    },
  };
}
