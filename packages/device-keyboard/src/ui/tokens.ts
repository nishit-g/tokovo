/**
 * iOS 26 Liquid Glass Keyboard Design Tokens
 *
 * Translucent, glassy design with light refraction effects
 */

export type KeyboardTheme = "light" | "dark";

export interface KeyboardColorTokens {
  background: string;
  backgroundBlur: string;
  key: {
    default: string;
    defaultBorder: string;
    special: string;
    specialBorder: string;
    return: string;
    returnGlow: string;
    space: string;
    active: string;
  };
  text: {
    primary: string;
    secondary: string;
    onReturn: string;
  };
  suggestion: {
    background: string;
    active: string;
    divider: string;
    text: string;
  };
  glass: {
    highlight: string;
    innerShadow: string;
    outerGlow: string;
  };
}

const lightColors: KeyboardColorTokens = {
  background: "rgba(210, 211, 215, 0.95)",
  backgroundBlur: "blur(40px) saturate(180%)",
  key: {
    default: "rgba(255, 255, 255, 0.95)",
    defaultBorder: "rgba(0, 0, 0, 0.08)",
    special: "rgba(172, 179, 190, 0.85)",
    specialBorder: "rgba(0, 0, 0, 0.08)",
    return: "rgba(172, 179, 190, 0.85)",
    returnGlow: "rgba(0, 0, 0, 0.05)",
    space: "rgba(255, 255, 255, 0.95)",
    active: "rgba(200, 200, 205, 1)",
  },
  text: {
    primary: "#000000",
    secondary: "#000000",
    onReturn: "#000000",
  },
  suggestion: {
    background: "rgba(255, 255, 255, 0.5)",
    active: "rgba(255, 255, 255, 0.9)",
    divider: "rgba(0, 0, 0, 0.15)",
    text: "#000000",
  },
  glass: {
    highlight: "rgba(255, 255, 255, 0.5)",
    innerShadow: "rgba(0, 0, 0, 0.08)",
    outerGlow: "rgba(255, 255, 255, 0.25)",
  },
};

const darkColors: KeyboardColorTokens = {
  background: "rgba(44, 44, 46, 0.75)",
  backgroundBlur: "blur(40px) saturate(180%)",
  key: {
    default: "rgba(99, 99, 102, 0.65)",
    defaultBorder: "rgba(130, 130, 135, 0.3)",
    special: "rgba(58, 58, 60, 0.8)",
    specialBorder: "rgba(80, 80, 85, 0.4)",
    return: "rgba(10, 132, 255, 0.95)",
    returnGlow: "rgba(10, 132, 255, 0.35)",
    space: "rgba(99, 99, 102, 0.7)",
    active: "rgba(120, 120, 128, 0.9)",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#EBEBF5",
    onReturn: "#FFFFFF",
  },
  suggestion: {
    background: "rgba(60, 60, 64, 0.6)",
    active: "rgba(99, 99, 102, 0.8)",
    divider: "rgba(255, 255, 255, 0.12)",
    text: "#FFFFFF",
  },
  glass: {
    highlight: "rgba(255, 255, 255, 0.15)",
    innerShadow: "rgba(0, 0, 0, 0.2)",
    outerGlow: "rgba(255, 255, 255, 0.08)",
  },
};

export const keyboardThemes: Record<KeyboardTheme, KeyboardColorTokens> = {
  light: lightColors,
  dark: darkColors,
};

export function getKeyboardColors(
  theme: KeyboardTheme = "light",
): KeyboardColorTokens {
  return keyboardThemes[theme];
}

export const keyboardColors = lightColors;

export const keyboardTypography = {
  key: {
    letter: {
      fontSize: 23,
      fontWeight: 400 as const,
      letterSpacing: -0.4,
    },
    special: {
      fontSize: 16,
      fontWeight: 500 as const,
    },
    multiChar: {
      fontSize: 16,
      fontWeight: 500 as const,
    },
    popup: {
      fontSize: 42,
      fontWeight: 300 as const,
    },
  },

  suggestion: {
    normal: {
      fontSize: 16,
      fontWeight: 400 as const,
    },
    emphasized: {
      fontSize: 16,
      fontWeight: 600 as const,
    },
  },

  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif",
} as const;

export const keyboardSpacing = {
  height: 300,

  padding: {
    top: 6,
    bottom: 34,
    horizontal: 2,
  },

  gap: {
    rows: 11,
    keys: 6,
  },

  key: {
    height: 46,
    defaultWidth: 34,
    shiftWidth: 46,
    backspaceWidth: 46,
    numberModeWidth: 50,
    globeWidth: 42,
    spaceWidth: 190,
    returnWidth: 92,
    borderRadius: 6,
  },

  popup: {
    offset: 8,
    widthMultiplier: 1.6,
    heightMultiplier: 1.8,
    borderRadius: 12,
  },

  suggestion: {
    height: 40,
    dividerWidth: 1,
    dividerHeight: 22,
    padding: {
      horizontal: 14,
      vertical: 8,
    },
    margin: 2,
    borderRadius: 8,
    marginBottom: 6,
  },

  row2Padding: 20,
  row3Padding: 4,
  row4Padding: 3,
} as const;

export const createKeyboardShadows = (colors: KeyboardColorTokens) => ({
  key: (scale: number) =>
    `0 ${1 * scale}px ${2 * scale}px ${colors.glass.innerShadow}, inset 0 ${0.5 * scale}px 0 ${colors.glass.highlight}`,
  keyActive: (scale: number) =>
    `0 0 ${8 * scale}px ${colors.glass.outerGlow}, inset 0 ${0.5 * scale}px 0 ${colors.glass.highlight}`,
  popup: (scale: number) =>
    `0 ${4 * scale}px ${16 * scale}px rgba(0, 0, 0, 0.2), 0 0 ${1 * scale}px rgba(0, 0, 0, 0.1)`,
  suggestionActive: (scale: number) =>
    `0 ${2 * scale}px ${6 * scale}px rgba(0, 0, 0, 0.08)`,
  keyboard: (scale: number) =>
    `0 ${-2 * scale}px ${20 * scale}px rgba(0, 0, 0, 0.1)`,
});

export const keyboardShadows = createKeyboardShadows(lightColors);

export const keyboardLayouts = {
  qwerty: {
    row1: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    row2: ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    row3: ["Z", "X", "C", "V", "B", "N", "M"],
  },
} as const;

export type KeyboardTokens = {
  colors: KeyboardColorTokens;
  typography: typeof keyboardTypography;
  spacing: typeof keyboardSpacing;
  shadows: ReturnType<typeof createKeyboardShadows>;
  layouts: typeof keyboardLayouts;
};

export function createKeyboardTokens(
  theme: KeyboardTheme = "light",
): KeyboardTokens {
  const colors = getKeyboardColors(theme);
  return {
    colors,
    typography: keyboardTypography,
    spacing: keyboardSpacing,
    shadows: createKeyboardShadows(colors),
    layouts: keyboardLayouts,
  };
}

export const keyboardTokens: KeyboardTokens = createKeyboardTokens("light");
