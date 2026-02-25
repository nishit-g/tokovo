import { describe, expect, it } from "vitest";
import { TEAMS_THEME_PRESETS } from "../config/theme.js";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3
    ? normalized.split("").map((c) => `${c}${c}`).join("")
    : normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}

describe("teams theme", () => {
  it("keeps readable text contrast on key pairs", () => {
    const pairs = [
      [TEAMS_THEME_PRESETS.light.color.textPrimary, TEAMS_THEME_PRESETS.light.color.surface],
      [TEAMS_THEME_PRESETS.light.color.textSecondary, TEAMS_THEME_PRESETS.light.color.bg],
      [TEAMS_THEME_PRESETS.dark.color.textPrimary, TEAMS_THEME_PRESETS.dark.color.surface],
      [TEAMS_THEME_PRESETS.dark.color.textSecondary, TEAMS_THEME_PRESETS.dark.color.bg],
    ] as const;

    for (const [fg, bg] of pairs) {
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
