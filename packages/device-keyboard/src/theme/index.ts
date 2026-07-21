import type {
  InputAppearance,
  InputPlatform,
  InputThemeId,
  InputThemeProjection,
} from "../contract/index.js";

const SHARED_TYPOGRAPHY: InputThemeProjection["typography"] = {
  fontFamily:
    '"Noto Sans Variable", "Noto Sans Arabic Variable", "Noto Sans Devanagari Variable", sans-serif',
  keyFontSize: 22,
  specialKeyFontSize: 16,
  suggestionFontSize: 16,
  returnKeyFontSize: 15,
};

const IOS_GEOMETRY: InputThemeProjection["geometry"] = {
  height: 300,
  suggestionHeight: 44,
  keyHeight: 44,
  keyRadius: 6,
  keyGap: 6,
  // Four key rows plus the suggestion strip must fit above the home
  // indicator safe area. The previous 11pt gap overflowed this surface.
  rowGap: 8,
  horizontalPadding: 4,
  topPadding: 6,
  bottomPadding: 34,
};

const ANDROID_GEOMETRY: InputThemeProjection["geometry"] = {
  height: 300,
  suggestionHeight: 48,
  keyHeight: 48,
  keyRadius: 8,
  keyGap: 5,
  rowGap: 7,
  horizontalPadding: 6,
  topPadding: 5,
  bottomPadding: 20,
};

const IOS_MOTION: InputThemeProjection["motion"] = {
  entranceDurationSeconds: 0.25,
  exitDurationSeconds: 0.22,
  keyPressDurationSeconds: 0.1,
  keyPreviewDurationSeconds: 0.14,
};

const ANDROID_MOTION: InputThemeProjection["motion"] = {
  entranceDurationSeconds: 0.2,
  exitDurationSeconds: 0.18,
  keyPressDurationSeconds: 0.09,
  keyPreviewDurationSeconds: 0.12,
};

const THEMES: Readonly<Record<string, InputThemeProjection>> = {
  "system:ios:light": {
    id: "system:ios:light",
    platform: "ios",
    appearance: "light",
    colors: {
      surface: "rgba(209, 212, 217, 0.96)",
      surfaceRaised: "rgba(238, 239, 242, 0.92)",
      key: "#FFFFFF",
      keyPressed: "#B7BBC2",
      keyText: "#000000",
      specialKey: "#ABB0B8",
      specialKeyPressed: "#FFFFFF",
      specialKeyText: "#000000",
      accentKey: "#007AFF",
      accentKeyPressed: "#0062CC",
      accentKeyText: "#FFFFFF",
      suggestionText: "#111111",
      suggestionDivider: "rgba(60, 60, 67, 0.24)",
      border: "rgba(0, 0, 0, 0.08)",
      keyShadow: "0 1px 0 rgba(0,0,0,0.34)",
      keyPreview: "#FFFFFF",
    },
    typography: SHARED_TYPOGRAPHY,
    geometry: IOS_GEOMETRY,
    motion: IOS_MOTION,
  },
  "system:ios:dark": {
    id: "system:ios:dark",
    platform: "ios",
    appearance: "dark",
    colors: {
      surface: "rgba(31, 31, 33, 0.97)",
      surfaceRaised: "rgba(50, 50, 53, 0.94)",
      key: "#636366",
      keyPressed: "#8E8E93",
      keyText: "#FFFFFF",
      specialKey: "#3A3A3C",
      specialKeyPressed: "#636366",
      specialKeyText: "#FFFFFF",
      accentKey: "#0A84FF",
      accentKeyPressed: "#409CFF",
      accentKeyText: "#FFFFFF",
      suggestionText: "#FFFFFF",
      suggestionDivider: "rgba(235, 235, 245, 0.22)",
      border: "rgba(255, 255, 255, 0.08)",
      keyShadow: "0 1px 0 rgba(0,0,0,0.72)",
      keyPreview: "#636366",
    },
    typography: SHARED_TYPOGRAPHY,
    geometry: IOS_GEOMETRY,
    motion: IOS_MOTION,
  },
  "system:android:light": {
    id: "system:android:light",
    platform: "android",
    appearance: "light",
    colors: {
      surface: "#ECEFF1",
      surfaceRaised: "#F8F9FA",
      key: "#FFFFFF",
      keyPressed: "#D7DCE0",
      keyText: "#202124",
      specialKey: "#DCE1E5",
      specialKeyPressed: "#C8CFD5",
      specialKeyText: "#202124",
      accentKey: "#1A73E8",
      accentKeyPressed: "#1558B0",
      accentKeyText: "#FFFFFF",
      suggestionText: "#202124",
      suggestionDivider: "rgba(60,64,67,0.18)",
      border: "rgba(60,64,67,0.1)",
      keyShadow: "0 1px 2px rgba(60,64,67,0.22)",
      keyPreview: "#FFFFFF",
    },
    typography: SHARED_TYPOGRAPHY,
    geometry: ANDROID_GEOMETRY,
    motion: ANDROID_MOTION,
  },
  "system:android:dark": {
    id: "system:android:dark",
    platform: "android",
    appearance: "dark",
    colors: {
      surface: "#202124",
      surfaceRaised: "#303134",
      key: "#3C4043",
      keyPressed: "#5F6368",
      keyText: "#F8F9FA",
      specialKey: "#303134",
      specialKeyPressed: "#5F6368",
      specialKeyText: "#F8F9FA",
      accentKey: "#8AB4F8",
      accentKeyPressed: "#AECBFA",
      accentKeyText: "#202124",
      suggestionText: "#F8F9FA",
      suggestionDivider: "rgba(232,234,237,0.18)",
      border: "rgba(232,234,237,0.08)",
      keyShadow: "0 1px 2px rgba(0,0,0,0.5)",
      keyPreview: "#5F6368",
    },
    typography: SHARED_TYPOGRAPHY,
    geometry: ANDROID_GEOMETRY,
    motion: ANDROID_MOTION,
  },
};

export function getInputTheme(
  platform: InputPlatform,
  appearance: InputAppearance,
  themeId: InputThemeId = "system",
): InputThemeProjection {
  const key = `${themeId}:${platform}:${appearance}`;
  const theme = THEMES[key];
  if (!theme) {
    throw new Error(
      `INPUT_THEME_UNSUPPORTED: no keyboard theme "${themeId}" exists for ${platform}/${appearance}.`,
    );
  }
  return theme;
}

export const inputThemes = THEMES;
