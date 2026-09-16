import { z } from "zod";
import { xTextTokens } from "../layout/tokens.js";
import { getXDirection, translateX } from "../localization/index.js";
import {
  X_UI_VERSION,
  type XExperience,
  type XExperienceInput,
  type XThemeColors,
  type XThemeId,
} from "./contract.js";

const inputSchema = z
  .object({
    platform: z.enum(["ios", "android"]),
    appearance: z.enum(["light", "dark"]),
    themeId: z.string().optional(),
    locale: z.enum(["en-US", "ar-SA", "hi-IN"]),
    reducedMotion: z.boolean(),
    increasedContrast: z.boolean(),
    textScale: z.number().min(0.8).max(1.5),
  })
  .strict();

const light: XThemeColors = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceRaised: "#F7F9F9",
  text: "#0F1419",
  textSecondary: "#536471",
  textTertiary: "#84919A",
  border: "#EFF3F4",
  borderStrong: "#CFD9DE",
  accent: "#1D9BF0",
  accentSoft: "rgba(29,155,240,.12)",
  reply: "#1D9BF0",
  repost: "#00BA7C",
  like: "#F91880",
  danger: "#F4212E",
  incomingBubble: "#EFF3F4",
  outgoingBubble: "#1D9BF0",
  mediaScrim: "rgba(15,20,25,.66)",
  skeleton: "#E7ECF0",
};

const dim: XThemeColors = {
  background: "#15202B",
  surface: "#15202B",
  surfaceRaised: "#1E2732",
  text: "#F7F9F9",
  textSecondary: "#8B98A5",
  textTertiary: "#6B7886",
  border: "#38444D",
  borderStrong: "#536471",
  accent: "#1D9BF0",
  accentSoft: "rgba(29,155,240,.16)",
  reply: "#1D9BF0",
  repost: "#00BA7C",
  like: "#F91880",
  danger: "#F4212E",
  incomingBubble: "#273340",
  outgoingBubble: "#1D9BF0",
  mediaScrim: "rgba(0,0,0,.68)",
  skeleton: "#253341",
};

const lightsOut: XThemeColors = {
  background: "#000000",
  surface: "#000000",
  surfaceRaised: "#16181C",
  text: "#E7E9EA",
  textSecondary: "#71767B",
  textTertiary: "#536471",
  border: "#2F3336",
  borderStrong: "#3E4144",
  accent: "#1D9BF0",
  accentSoft: "rgba(29,155,240,.15)",
  reply: "#1D9BF0",
  repost: "#00BA7C",
  like: "#F91880",
  danger: "#F4212E",
  incomingBubble: "#2F3336",
  outgoingBubble: "#1D9BF0",
  mediaScrim: "rgba(0,0,0,.72)",
  skeleton: "#202327",
};

function resolveThemeId(appearance: "light" | "dark", raw?: string): XThemeId {
  const themeId = raw ?? "default";
  if (themeId !== "default" && themeId !== "x-dim" && themeId !== "x-lights-out") {
    throw new Error(`X_THEME_UNSUPPORTED: "${themeId}"`);
  }
  if (appearance === "light" && themeId !== "default") {
    throw new Error(`X_THEME_APPEARANCE_MISMATCH: "${themeId}" requires dark app appearance`);
  }
  return themeId;
}

export function resolveXExperience(input: XExperienceInput): XExperience {
  const parsed = inputSchema.parse(input);
  const themeId = resolveThemeId(parsed.appearance, parsed.themeId);
  const colors =
    parsed.appearance === "light" ? light : themeId === "x-lights-out" ? lightsOut : dim;
  const contrastColors = parsed.increasedContrast
    ? { ...colors, border: colors.borderStrong, textSecondary: colors.text }
    : colors;
  const ios = parsed.platform === "ios";
  const text = xTextTokens(parsed.textScale, !ios);

  return {
    appId: "app_x",
    text,
    uiVersion: X_UI_VERSION,
    platform: parsed.platform,
    appearance: parsed.appearance,
    themeId,
    locale: parsed.locale,
    direction: getXDirection(parsed.locale),
    reducedMotion: parsed.reducedMotion,
    colors: contrastColors,
    type: {
      family: text.fontFamily,
      displayFamily: text.fontFamily,
      scale: parsed.textScale,
    },
    metrics: {
      headerHeight: ios ? 52 : 56,
      navHeight: ios ? 50 : 64,
      touchTarget: text.touchTarget,
      pagePadding: text.page,
      postPaddingY: text.postPadding,
      avatar: text.avatar,
      composerHeight: ios ? 48 : 52,
      radius: ios ? 16 : 14,
    },
    motion: {
      routeFrames: parsed.reducedMotion ? 0 : ios ? 9 : 7,
      feedbackFrames: parsed.reducedMotion ? 0 : 5,
    },
    t: (key) => translateX(parsed.locale, key),
  };
}
