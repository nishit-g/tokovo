/**
 * iMessage Theme Configuration
 * 
 * Uses centralized tokens from tokens.ts for spacing and typography.
 */
import { iOS_COLORS, TAPBACK_COLORS } from "./colors";
import { iMessageSpacing, iMessageTypography } from "./tokens";


export interface BubbleColors {
  iMessage: string;
  sms: string;
  received: string;
  myText: string;
  otherText: string;
  timestamp: string;
  deliveryStatus: string;
}

export interface HeaderColors {
  background: string;
  title: string;
  subtitle: string;
  icons: string;
  backArrow: string;
}

export interface InputColors {
  background: string;
  field: string;
  border: string;
  placeholder: string;
  icons: string;
  sendButton: string;
}

export interface SystemColors {
  background: string;
  chatBackground: string;
  separator: string;
  timestamp: string;
  unreadBadge: string;
}

export interface ThemeColors {
  bubble: BubbleColors;
  header: HeaderColors;
  input: InputColors;
  system: SystemColors;
  tapback: typeof TAPBACK_COLORS;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
}

export interface ThemeTypography {
  message: FontConfig;
  timestamp: FontConfig;
  headerTitle: FontConfig;
  headerSubtitle: FontConfig;
  systemMessage: FontConfig;
  input: FontConfig;
  listTitle: FontConfig;
  listSubtitle: FontConfig;
}

export interface BubbleConfig {
  borderRadius: number;
  maxWidth: number;
  horizontalPadding: number;
  verticalPadding: number;
  showTail: boolean;
  tailWidth: number;
  tailHeight: number;
}

export interface IMessageTheme {
  mode: "light" | "dark";
  colors: ThemeColors;
  typography: ThemeTypography;
  bubble: BubbleConfig;
}

export const iOS_IMESSAGE_LIGHT: IMessageTheme = {
  mode: "light",
  colors: {
    bubble: {
      iMessage: iOS_COLORS.blue,
      sms: iOS_COLORS.green,
      received: iOS_COLORS.receivedBubble,
      myText: iOS_COLORS.textWhite,
      otherText: iOS_COLORS.textPrimary,
      timestamp: iOS_COLORS.gray,
      deliveryStatus: iOS_COLORS.gray,
    },
    header: {
      background: "rgba(249, 249, 249, 0.94)",
      title: iOS_COLORS.textPrimary,
      subtitle: iOS_COLORS.gray,
      icons: iOS_COLORS.blue,
      backArrow: iOS_COLORS.blue,
    },
    input: {
      background: iOS_COLORS.backgroundLight,
      field: iOS_COLORS.grayUltraLight,
      border: iOS_COLORS.grayLight,
      placeholder: iOS_COLORS.gray,
      icons: iOS_COLORS.gray,
      sendButton: iOS_COLORS.blue,
    },
    system: {
      background: iOS_COLORS.backgroundLight,
      chatBackground: iOS_COLORS.backgroundLight,
      separator: iOS_COLORS.separator,
      timestamp: iOS_COLORS.gray,
      unreadBadge: iOS_COLORS.blue,
    },
    tapback: TAPBACK_COLORS,
  },
  typography: {
    message: {
      family: iMessageTypography.fontFamily,
      size: iMessageTypography.message.fontSize,
      weight: iMessageTypography.message.fontWeight,
      lineHeight: iMessageTypography.message.lineHeight,
    },
    timestamp: {
      family: iMessageTypography.fontFamily,
      size: iMessageTypography.timestamp.fontSize,
      weight: iMessageTypography.timestamp.fontWeight,
      lineHeight: iMessageTypography.timestamp.lineHeight,
    },
    headerTitle: {
      family: iMessageTypography.fontFamily,
      size: iMessageTypography.headerTitle.fontSize,
      weight: iMessageTypography.headerTitle.fontWeight,
      lineHeight: iMessageTypography.headerTitle.lineHeight,
    },
    headerSubtitle: {
      family: iMessageTypography.fontFamily,
      size: iMessageTypography.headerSubtitle.fontSize,
      weight: iMessageTypography.headerSubtitle.fontWeight,
      lineHeight: iMessageTypography.headerSubtitle.lineHeight,
    },
    systemMessage: {
      family: iMessageTypography.fontFamily,
      size: iMessageTypography.system.fontSize,
      weight: iMessageTypography.system.fontWeight,
      lineHeight: iMessageTypography.system.lineHeight,
    },
    input: {
      family: iMessageTypography.fontFamily,
      size: iMessageTypography.input.fontSize,
      weight: iMessageTypography.input.fontWeight,
      lineHeight: iMessageTypography.input.lineHeight,
    },
    listTitle: {
      family: iMessageTypography.fontFamily,
      size: iMessageTypography.listTitle.fontSize,
      weight: iMessageTypography.listTitle.fontWeight,
      lineHeight: iMessageTypography.listTitle.lineHeight,
    },
    listSubtitle: {
      family: iMessageTypography.fontFamily,
      size: iMessageTypography.listPreview.fontSize,
      weight: iMessageTypography.listPreview.fontWeight,
      lineHeight: iMessageTypography.listPreview.lineHeight,
    },
  },
  bubble: {
    borderRadius: iMessageSpacing.bubbleRadius,
    maxWidth: iMessageSpacing.bubbleMaxWidthRatio,
    horizontalPadding: iMessageSpacing.bubblePaddingH,
    verticalPadding: iMessageSpacing.bubblePaddingV,
    showTail: true,
    tailWidth: iMessageSpacing.bubbleTailWidth,
    tailHeight: iMessageSpacing.bubbleTailHeight,
  },
};

export const iOS_IMESSAGE_DARK: IMessageTheme = {
  mode: "dark",
  colors: {
    bubble: {
      iMessage: iOS_COLORS.blue,
      sms: iOS_COLORS.green,
      received: iOS_COLORS.receivedBubbleDark,
      myText: iOS_COLORS.textWhite,
      otherText: iOS_COLORS.textWhite,
      timestamp: iOS_COLORS.gray,
      deliveryStatus: iOS_COLORS.gray,
    },
    header: {
      background: "rgba(28, 28, 30, 0.94)",
      title: iOS_COLORS.textWhite,
      subtitle: iOS_COLORS.gray,
      icons: iOS_COLORS.blue,
      backArrow: iOS_COLORS.blue,
    },
    input: {
      background: iOS_COLORS.backgroundDark,
      field: "#1C1C1E",
      border: iOS_COLORS.separatorDark,
      placeholder: iOS_COLORS.gray,
      icons: iOS_COLORS.gray,
      sendButton: iOS_COLORS.blue,
    },
    system: {
      background: iOS_COLORS.backgroundDark,
      chatBackground: iOS_COLORS.backgroundDark,
      separator: iOS_COLORS.separatorDark,
      timestamp: iOS_COLORS.gray,
      unreadBadge: iOS_COLORS.blue,
    },
    tapback: TAPBACK_COLORS,
  },
  typography: iOS_IMESSAGE_LIGHT.typography,
  bubble: iOS_IMESSAGE_LIGHT.bubble,
};

export function getTheme(mode: "light" | "dark" = "light") {
  return mode === "dark" ? iOS_IMESSAGE_DARK : iOS_IMESSAGE_LIGHT;
}

export function createTheme(
  base: IMessageTheme,
  overrides: Partial<IMessageTheme>,
): IMessageTheme {
  return {
    ...base,
    ...overrides,
    colors: {
      ...base.colors,
      ...overrides.colors,
    },
    typography: {
      ...base.typography,
      ...overrides.typography,
    },
    bubble: {
      ...base.bubble,
      ...overrides.bubble,
    },
  };
}
