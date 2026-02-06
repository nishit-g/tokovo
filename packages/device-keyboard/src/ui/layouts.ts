import { keyboardSpacing } from "./tokens.js";

export interface SpecialKeyConfig {
  width: number;
  variant: "special" | "return" | "space";
  label?: string;
}

export interface KeyboardLayout {
  id: string;
  rows: readonly (readonly string[])[];
  specialKeys: Record<string, SpecialKeyConfig>;
  bottomRow: {
    showNumberMode: boolean;
    showGlobe: boolean;
    showSpace: boolean;
    showReturn: boolean;
  };
}

const sp = keyboardSpacing;

export const qwertyLayout: KeyboardLayout = {
  id: "qwerty",
  rows: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ],
  specialKeys: {
    shift: { width: sp.key.shiftWidth, variant: "special", label: "⇧" },
    backspace: { width: sp.key.backspaceWidth, variant: "special", label: "⌫" },
    numberMode: {
      width: sp.key.numberModeWidth,
      variant: "special",
      label: "123",
    },
    globe: { width: sp.key.globeWidth, variant: "special", label: "⌘" },
    space: { width: sp.key.spaceWidth, variant: "space", label: "" },
    return: { width: sp.key.returnWidth, variant: "return", label: "return" },
  },
  bottomRow: {
    showNumberMode: true,
    showGlobe: true,
    showSpace: true,
    showReturn: true,
  },
};

export const numericLayout: KeyboardLayout = {
  id: "numeric",
  rows: [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "⌫"],
  ],
  specialKeys: {
    backspace: { width: sp.key.defaultWidth, variant: "special", label: "⌫" },
  },
  bottomRow: {
    showNumberMode: false,
    showGlobe: false,
    showSpace: false,
    showReturn: false,
  },
};

export const phoneLayout: KeyboardLayout = {
  id: "phone",
  rows: [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["+", "0", "⌫"],
  ],
  specialKeys: {
    backspace: { width: sp.key.defaultWidth, variant: "special", label: "⌫" },
  },
  bottomRow: {
    showNumberMode: false,
    showGlobe: false,
    showSpace: false,
    showReturn: false,
  },
};

export const emailLayout: KeyboardLayout = {
  id: "email",
  rows: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ],
  specialKeys: {
    shift: { width: sp.key.shiftWidth, variant: "special", label: "⇧" },
    backspace: { width: sp.key.backspaceWidth, variant: "special", label: "⌫" },
    at: { width: sp.key.defaultWidth, variant: "special", label: "@" },
    dot: { width: sp.key.defaultWidth, variant: "special", label: "." },
    space: { width: 120, variant: "space", label: "" },
    return: { width: sp.key.returnWidth, variant: "return", label: "return" },
  },
  bottomRow: {
    showNumberMode: true,
    showGlobe: false,
    showSpace: true,
    showReturn: true,
  },
};

export const layoutRegistry: Record<string, KeyboardLayout> = {
  default: qwertyLayout,
  qwerty: qwertyLayout,
  numeric: numericLayout,
  phone: phoneLayout,
  email: emailLayout,
};

export function getLayout(keyboardType: string): KeyboardLayout {
  return layoutRegistry[keyboardType] || qwertyLayout;
}
