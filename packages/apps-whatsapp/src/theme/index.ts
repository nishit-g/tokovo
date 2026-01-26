export type Platform = "ios" | "android";

export interface WhatsAppColorPalette {
  sentBubble: string;
  receivedBubble: string;
  sentBubbleText: string;
  receivedBubbleText: string;
  timestamp: string;
  checkmark: string;
  checkmarkRead: string;
  background: string;
  chatBackground: string;
  headerBackground: string;
  headerText: string;
  inputBackground: string;
  inputText: string;
  inputPlaceholder: string;
  divider: string;
  accent: string;
  link: string;
  systemMessage: string;
  typingIndicator: string;
  unreadBadge: string;
  unreadBadgeText: string;
  onlineStatus: string;
}

export interface WhatsAppTypography {
  fontFamily: string;
  fontFamilyMono: string;
  messageFontSize: number;
  messageLineHeight: number;
  timestampFontSize: number;
  headerTitleFontSize: number;
  headerSubtitleFontSize: number;
  inputFontSize: number;
  systemMessageFontSize: number;
}

export interface WhatsAppSpacing {
  messagePaddingHorizontal: number;
  messagePaddingVertical: number;
  bubbleRadius: number;
  bubbleRadiusTail: number;
  avatarSize: number;
  avatarSizeSmall: number;
  headerHeight: number;
  inputAreaHeight: number;
  messageGap: number;
  sectionGap: number;
}

export interface WhatsAppSafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface WhatsAppTheme {
  platform: Platform;
  colors: WhatsAppColorPalette;
  typography: WhatsAppTypography;
  spacing: WhatsAppSpacing;
  safeArea: WhatsAppSafeArea;
}

const sharedColors: Partial<WhatsAppColorPalette> = {
  sentBubble: "#DCF8C6",
  receivedBubble: "#FFFFFF",
  sentBubbleText: "#000000",
  receivedBubbleText: "#000000",
  timestamp: "#667781",
  checkmark: "#667781",
  checkmarkRead: "#53BDEB",
  accent: "#25D366",
  link: "#027EB5",
  unreadBadge: "#25D366",
  unreadBadgeText: "#FFFFFF",
  onlineStatus: "#25D366",
};

export const iosTheme: WhatsAppTheme = {
  platform: "ios",
  colors: {
    ...sharedColors,
    sentBubble: "#DCF8C6",
    receivedBubble: "#FFFFFF",
    sentBubbleText: "#000000",
    receivedBubbleText: "#000000",
    timestamp: "#667781",
    checkmark: "#667781",
    checkmarkRead: "#53BDEB",
    background: "#FFFFFF",
    chatBackground: "#E5DDD5",
    headerBackground: "#F6F6F6",
    headerText: "#000000",
    inputBackground: "#FFFFFF",
    inputText: "#000000",
    inputPlaceholder: "#8E8E93",
    divider: "#C6C6C8",
    accent: "#25D366",
    link: "#027EB5",
    systemMessage: "#667781",
    typingIndicator: "#667781",
    unreadBadge: "#25D366",
    unreadBadgeText: "#FFFFFF",
    onlineStatus: "#25D366",
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
    fontFamilyMono: '"SF Mono", Menlo, monospace',
    messageFontSize: 17,
    messageLineHeight: 22,
    timestampFontSize: 11,
    headerTitleFontSize: 17,
    headerSubtitleFontSize: 13,
    inputFontSize: 17,
    systemMessageFontSize: 13,
  },
  spacing: {
    messagePaddingHorizontal: 12,
    messagePaddingVertical: 8,
    bubbleRadius: 18,
    bubbleRadiusTail: 4,
    avatarSize: 40,
    avatarSizeSmall: 32,
    headerHeight: 44,
    inputAreaHeight: 52,
    messageGap: 2,
    sectionGap: 16,
  },
  safeArea: {
    top: 47,
    bottom: 34,
    left: 0,
    right: 0,
  },
};

export const androidTheme: WhatsAppTheme = {
  platform: "android",
  colors: {
    ...sharedColors,
    sentBubble: "#DCF8C6",
    receivedBubble: "#FFFFFF",
    sentBubbleText: "#000000",
    receivedBubbleText: "#000000",
    timestamp: "#667781",
    checkmark: "#667781",
    checkmarkRead: "#53BDEB",
    background: "#FFFFFF",
    chatBackground: "#ECE5DD",
    headerBackground: "#075E54",
    headerText: "#FFFFFF",
    inputBackground: "#FFFFFF",
    inputText: "#000000",
    inputPlaceholder: "#8696A0",
    divider: "#E0E0E0",
    accent: "#25D366",
    link: "#027EB5",
    systemMessage: "#667781",
    typingIndicator: "#667781",
    unreadBadge: "#25D366",
    unreadBadgeText: "#FFFFFF",
    onlineStatus: "#25D366",
  },
  typography: {
    fontFamily: 'Roboto, "Noto Sans", "Helvetica Neue", sans-serif',
    fontFamilyMono: '"Roboto Mono", monospace',
    messageFontSize: 16,
    messageLineHeight: 21,
    timestampFontSize: 11,
    headerTitleFontSize: 18,
    headerSubtitleFontSize: 14,
    inputFontSize: 16,
    systemMessageFontSize: 12,
  },
  spacing: {
    messagePaddingHorizontal: 10,
    messagePaddingVertical: 6,
    bubbleRadius: 16,
    bubbleRadiusTail: 2,
    avatarSize: 40,
    avatarSizeSmall: 32,
    headerHeight: 56,
    inputAreaHeight: 56,
    messageGap: 2,
    sectionGap: 12,
  },
  safeArea: {
    top: 24,
    bottom: 0,
    left: 0,
    right: 0,
  },
};

export const iosDarkTheme: WhatsAppTheme = {
  ...iosTheme,
  colors: {
    ...iosTheme.colors,
    sentBubble: "#005C4B",
    receivedBubble: "#1F2C34",
    sentBubbleText: "#FFFFFF",
    receivedBubbleText: "#FFFFFF",
    background: "#0B141A",
    chatBackground: "#0B141A",
    headerBackground: "#1F2C34",
    headerText: "#FFFFFF",
    inputBackground: "#1F2C34",
    inputText: "#FFFFFF",
    inputPlaceholder: "#8696A0",
    divider: "#2A3942",
    timestamp: "#8696A0",
    systemMessage: "#8696A0",
  },
};

export const androidDarkTheme: WhatsAppTheme = {
  ...androidTheme,
  colors: {
    ...androidTheme.colors,
    sentBubble: "#005C4B",
    receivedBubble: "#1F2C34",
    sentBubbleText: "#FFFFFF",
    receivedBubbleText: "#FFFFFF",
    background: "#0B141A",
    chatBackground: "#0B141A",
    headerBackground: "#1F2C34",
    headerText: "#FFFFFF",
    inputBackground: "#1F2C34",
    inputText: "#FFFFFF",
    inputPlaceholder: "#8696A0",
    divider: "#2A3942",
    timestamp: "#8696A0",
    systemMessage: "#8696A0",
  },
};

export function getTheme(platform: Platform, darkMode = false): WhatsAppTheme {
  if (platform === "ios") {
    return darkMode ? iosDarkTheme : iosTheme;
  }
  return darkMode ? androidDarkTheme : androidTheme;
}

export function getThemeForDevice(
  deviceId: string,
  darkMode = false,
): WhatsAppTheme {
  const isAndroid =
    deviceId.toLowerCase().includes("android") ||
    deviceId.toLowerCase().includes("pixel") ||
    deviceId.toLowerCase().includes("samsung") ||
    deviceId.toLowerCase().includes("galaxy");
  return getTheme(isAndroid ? "android" : "ios", darkMode);
}

export { WhatsAppThemeProvider, useTheme } from "./context";
