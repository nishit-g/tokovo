import {
  resolvePlatformVisuals,
  type PlatformDesignProfileId,
  type VisualPreferences,
} from "@tokovo/visual-system";
import type { InputAppearance, InputPlatform, InputThemeProjection } from "../contract/index.js";

function directionForLocale(locale: string): "ltr" | "rtl" {
  const language = locale.trim().toLowerCase().split(/[-_]/u)[0];
  return language === "ar" || language === "fa" || language === "he" || language === "ur"
    ? "rtl"
    : "ltr";
}

export function getInputTheme(
  platform: InputPlatform,
  appearance: InputAppearance,
  platformProfileId: PlatformDesignProfileId,
  locale = "en-US",
  preferences: Partial<VisualPreferences> = {},
): InputThemeProjection {
  const visuals = resolvePlatformVisuals({
    platformProfileId,
    appearance,
    locale,
    direction: directionForLocale(locale),
    textScale: preferences.textScale ?? 1,
    contrast: preferences.contrast ?? "standard",
    motion: preferences.motion ?? "full",
    transparency: preferences.transparency ?? "standard",
    materialPreference: preferences.materialPreference ?? "automatic",
    colorSeed: preferences.colorSeed,
  });
  if (visuals.platform !== platform) {
    throw new Error(
      `INPUT_VISUAL_PROFILE_MISMATCH: ${platformProfileId} cannot paint a ${platform} keyboard.`,
    );
  }
  const palette = visuals.palette;
  const geometry = visuals.geometry.keyboard;
  const key = visuals.typography.roles["keyboard-key"];
  const special = visuals.typography.roles["keyboard-special"];
  const suggestion = visuals.typography.roles.body;

  return {
    id: `${platformProfileId}:${appearance}:keyboard`,
    platform,
    appearance,
    colors: {
      surface: visuals.materials.keyboard.fill,
      surfaceRaised: palette.surfaceRaised,
      key: palette.keyboardKey,
      keyPressed: palette.keyboardKeyPressed,
      keyText: palette.primaryText,
      specialKey: palette.keyboardSpecialKey,
      specialKeyPressed: palette.keyboardSpecialKeyPressed,
      specialKeyText: palette.primaryText,
      accentKey: palette.keyboardAccentKey,
      accentKeyPressed: palette.keyboardAccentKeyPressed,
      accentKeyText: "#FFFFFF",
      suggestionText: palette.primaryText,
      suggestionDivider: palette.separator,
      border: palette.separator,
      keyShadow:
        platform === "ios"
          ? appearance === "light"
            ? "0 1px 0 rgba(0,0,0,0.32)"
            : "0 1px 0 rgba(0,0,0,0.72)"
          : "0 1px 2px rgba(0,0,0,0.24)",
      keyPreview: palette.surfaceRaised,
    },
    material: platform === "ios" ? { ...visuals.materials.keyboard, fill: appearance === "light" ? "#D1D3D9" : "#29292C" } : visuals.materials.keyboard,
    typography: {
      fontFamily: key.family,
      keyFontSize: key.size,
      specialKeyFontSize: special.size,
      suggestionFontSize: suggestion.size - (platform === "ios" ? 1 : 0),
      returnKeyFontSize: special.size,
    },
    geometry: {
      height: geometry.height,
      suggestionHeight: geometry.candidateHeight,
      keyHeight: geometry.keyHeight,
      keyRadius: geometry.keyRadius,
      keyGap: geometry.keyGap,
      rowGap: geometry.rowGap,
      horizontalPadding: geometry.horizontalPadding,
      topPadding: geometry.topPadding,
      bottomPadding: geometry.bottomPadding,
    },
    motion: {
      entranceDurationSeconds: visuals.motionProfile.keyboardEnterSeconds,
      exitDurationSeconds: visuals.motionProfile.keyboardExitSeconds,
      keyPressDurationSeconds: visuals.motionProfile.keyPressSeconds,
      keyPreviewDurationSeconds: visuals.motionProfile.keyPreviewSeconds,
    },
  };
}
