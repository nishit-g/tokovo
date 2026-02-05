export type Platform = "ios" | "android";
export type WhatsAppThemeId = "whatsapp-ghibli" | "whatsapp-cyberpunk";

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
  systemMessageBg: string;
  systemMessageBorder: string;
  systemMessageShadow: string;
  systemBannerBg: string;
  systemBannerText: string;
  systemBannerBorder: string;
  systemBannerLink: string;
  systemBannerIcon: string;
  datePillBg: string;
  datePillBorder: string;
  datePillText: string;
  callCardIconBgIncoming: string;
  callCardIconBgOutgoing: string;
  callCardIcon: string;
  callCardMissed: string;
  callCardSubtext: string;
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

const sharedColors: WhatsAppColorPalette = {
  sentBubble: "#DCF8C6",
  receivedBubble: "#FFFFFF",
  sentBubbleText: "#000000",
  receivedBubbleText: "#000000",
  timestamp: "#667781",
  checkmark: "#667781",
  checkmarkRead: "#53BDEB",
  background: "#FFFFFF",
  chatBackground: "#E8E2DA",
  headerBackground: "#F9FAFB",
  headerText: "#0B0B0C",
  inputBackground: "#FFFFFF",
  inputText: "#000000",
  inputPlaceholder: "#98A1A8",
  divider: "#E4E6EB",
  accent: "#25D366",
  link: "#027EB5",
  systemMessage: "#667781",
  systemMessageBg: "rgba(255,255,255,0.92)",
  systemMessageBorder: "rgba(0,0,0,0.06)",
  systemMessageShadow: "0 1px 1.5px rgba(0,0,0,0.12)",
  systemBannerBg: "#FFF3C4",
  systemBannerText: "#6A5A00",
  systemBannerBorder: "#F3DFA3",
  systemBannerLink: "#027EB5",
  systemBannerIcon: "#6A5A00",
  datePillBg: "rgba(255,255,255,0.94)",
  datePillBorder: "rgba(0,0,0,0.08)",
  datePillText: "#5B6770",
  callCardIconBgIncoming: "rgba(0,0,0,0.06)",
  callCardIconBgOutgoing: "rgba(255,255,255,0.35)",
  callCardIcon: "#0B0B0C",
  callCardMissed: "#FF3B30",
  callCardSubtext: "#667781",
  typingIndicator: "#5B6770",
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
    chatBackground: "#E8E2DA",
    headerBackground: "#F9FAFB",
    headerText: "#0B0B0C",
    inputBackground: "#FFFFFF",
    inputText: "#000000",
    inputPlaceholder: "#98A1A8",
    divider: "#E4E6EB",
    accent: "#25D366",
    link: "#027EB5",
    systemMessage: "#667781",
    typingIndicator: "#5B6770",
    unreadBadge: "#25D366",
    unreadBadgeText: "#FFFFFF",
    onlineStatus: "#25D366",
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
    fontFamilyMono: '"SF Mono", Menlo, monospace',
    messageFontSize: 16.5,
    messageLineHeight: 22,
    timestampFontSize: 11,
    headerTitleFontSize: 17,
    headerSubtitleFontSize: 13,
    inputFontSize: 16.5,
    systemMessageFontSize: 13,
  },
  spacing: {
    messagePaddingHorizontal: 12,
    messagePaddingVertical: 8,
    bubbleRadius: 18,
    bubbleRadiusTail: 4,
    avatarSize: 40,
    avatarSizeSmall: 32,
    headerHeight: 46,
    inputAreaHeight: 54,
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
    headerBackground: "#0B5E55",
    headerText: "#FFFFFF",
    inputBackground: "#FFFFFF",
    inputText: "#000000",
    inputPlaceholder: "#98A1A8",
    divider: "#E4E6EB",
    accent: "#25D366",
    link: "#027EB5",
    systemMessage: "#667781",
    typingIndicator: "#5B6770",
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
    systemMessageBg: "rgba(31,44,52,0.78)",
    systemMessageBorder: "rgba(255,255,255,0.08)",
    systemMessageShadow: "0 1px 2px rgba(0,0,0,0.55)",
    systemBannerBg: "#2B2A1E",
    systemBannerText: "#F4E6B1",
    systemBannerBorder: "#3A3828",
    systemBannerLink: "#7BB4FF",
    systemBannerIcon: "#F4E6B1",
    datePillBg: "rgba(31,44,52,0.92)",
    datePillBorder: "rgba(255,255,255,0.08)",
    datePillText: "#8696A0",
    callCardIconBgIncoming: "rgba(255,255,255,0.1)",
    callCardIconBgOutgoing: "rgba(255,255,255,0.2)",
    callCardIcon: "#E8F6FF",
    callCardMissed: "#FF453A",
    callCardSubtext: "#8696A0",
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
    systemMessageBg: "rgba(31,44,52,0.78)",
    systemMessageBorder: "rgba(255,255,255,0.08)",
    systemMessageShadow: "0 1px 2px rgba(0,0,0,0.55)",
    systemBannerBg: "#2B2A1E",
    systemBannerText: "#F4E6B1",
    systemBannerBorder: "#3A3828",
    systemBannerLink: "#7BB4FF",
    systemBannerIcon: "#F4E6B1",
    datePillBg: "rgba(31,44,52,0.92)",
    datePillBorder: "rgba(255,255,255,0.08)",
    datePillText: "#8696A0",
    callCardIconBgIncoming: "rgba(255,255,255,0.1)",
    callCardIconBgOutgoing: "rgba(255,255,255,0.2)",
    callCardIcon: "#E8F6FF",
    callCardMissed: "#FF453A",
    callCardSubtext: "#8696A0",
  },
};

const GHIBLI_OVERRIDES: Partial<WhatsAppTheme> = {
  colors: {
    sentBubble: "#CFE6D7",
    receivedBubble: "#FFFDF7",
    sentBubbleText: "#24302A",
    receivedBubbleText: "#2F2A24",
    background: "#F7F2E8",
    chatBackground: "#E7E0D2",
    headerBackground: "#F2E6D6",
    headerText: "#2B2A27",
    inputBackground: "#FFF9F0",
    inputText: "#2B2A27",
    inputPlaceholder: "#9C8F7A",
    divider: "#D7C9B6",
    timestamp: "#8C7F6B",
    systemMessage: "#8C7F6B",
    systemMessageBg: "rgba(255,250,242,0.94)",
    systemMessageBorder: "#E4D7C4",
    systemMessageShadow: "0 1px 2px rgba(75,59,41,0.12)",
    systemBannerBg: "#F7E6BD",
    systemBannerText: "#6A5739",
    systemBannerBorder: "#E4D2A2",
    systemBannerLink: "#3E7FA8",
    systemBannerIcon: "#6A5739",
    datePillBg: "rgba(255,250,242,0.96)",
    datePillBorder: "#E4D7C4",
    datePillText: "#8C7F6B",
    callCardIconBgIncoming: "rgba(94,74,42,0.08)",
    callCardIconBgOutgoing: "rgba(255,255,255,0.45)",
    callCardIcon: "#2F2A24",
    callCardMissed: "#C8625C",
    callCardSubtext: "#8C7F6B",
    typingIndicator: "#8C7F6B",
    accent: "#6BAA7A",
    link: "#3E7FA8",
    unreadBadge: "#6BAA7A",
    unreadBadgeText: "#FFFFFF",
    onlineStatus: "#6BAA7A",
    checkmark: "#7C8F85",
    checkmarkRead: "#3E7FA8",
  },
};

const CYBERPUNK_OVERRIDES: Partial<WhatsAppTheme> = {
  colors: {
    sentBubble: "#1A3D5A",
    receivedBubble: "#2B103A",
    sentBubbleText: "#E8F6FF",
    receivedBubbleText: "#F8E7FF",
    background: "#0B0F1E",
    chatBackground: "#0F1326",
    headerBackground: "#0C0F1F",
    headerText: "#E8F6FF",
    inputBackground: "#12172B",
    inputText: "#E8F6FF",
    inputPlaceholder: "#8AA0B8",
    divider: "#1E2A3A",
    timestamp: "#7BB4FF",
    systemMessage: "#7BB4FF",
    systemMessageBg: "rgba(15,19,38,0.92)",
    systemMessageBorder: "rgba(0,245,255,0.2)",
    systemMessageShadow: "0 1px 2px rgba(0,0,0,0.6)",
    systemBannerBg: "#2C1C3C",
    systemBannerText: "#F8E7FF",
    systemBannerBorder: "#3D2C52",
    systemBannerLink: "#FF2D95",
    systemBannerIcon: "#FF2D95",
    datePillBg: "rgba(18,23,43,0.92)",
    datePillBorder: "#1E2A3A",
    datePillText: "#7BB4FF",
    callCardIconBgIncoming: "rgba(255,45,149,0.18)",
    callCardIconBgOutgoing: "rgba(0,245,255,0.2)",
    callCardIcon: "#E8F6FF",
    callCardMissed: "#FF2D95",
    callCardSubtext: "#7BB4FF",
    typingIndicator: "#7BB4FF",
    accent: "#00F5FF",
    link: "#FF2D95",
    unreadBadge: "#FF2D95",
    unreadBadgeText: "#0B0F1E",
    onlineStatus: "#00F5FF",
    checkmark: "#7BB4FF",
    checkmarkRead: "#00F5FF",
  },
};

function mergeTheme(base: WhatsAppTheme, overrides: Partial<WhatsAppTheme>) {
  return {
    ...base,
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    spacing: { ...base.spacing, ...overrides.spacing },
    safeArea: { ...base.safeArea, ...overrides.safeArea },
  };
}

function normalizeThemeId(themeId?: string): WhatsAppThemeId | null {
  if (!themeId) return null;
  const normalized = themeId.toLowerCase();
  if (normalized === "whatsapp-ghibli" || normalized === "ghibli") {
    return "whatsapp-ghibli";
  }
  if (normalized === "whatsapp-cyberpunk" || normalized === "cyberpunk") {
    return "whatsapp-cyberpunk";
  }
  return null;
}

export function getTheme(
  platform: Platform,
  darkMode = false,
  themeId?: string,
): WhatsAppTheme {
  const base =
    platform === "ios"
      ? darkMode
        ? iosDarkTheme
        : iosTheme
      : darkMode
        ? androidDarkTheme
        : androidTheme;

  const normalizedTheme = normalizeThemeId(themeId);
  if (normalizedTheme === "whatsapp-ghibli") {
    return mergeTheme(base, GHIBLI_OVERRIDES);
  }
  if (normalizedTheme === "whatsapp-cyberpunk") {
    return mergeTheme(base, CYBERPUNK_OVERRIDES);
  }
  return base;
}

export function getThemeForDevice(
  deviceId: string,
  darkMode = false,
  themeId?: string,
): WhatsAppTheme {
  const isAndroid =
    deviceId.toLowerCase().includes("android") ||
    deviceId.toLowerCase().includes("pixel") ||
    deviceId.toLowerCase().includes("samsung") ||
    deviceId.toLowerCase().includes("galaxy");
  return getTheme(isAndroid ? "android" : "ios", darkMode, themeId);
}

export { WhatsAppThemeProvider, useTheme } from "./context";
