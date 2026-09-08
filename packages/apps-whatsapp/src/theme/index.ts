export type Platform = "ios" | "android";
/** Shared logical-point and second-based tokens for app-owned interaction surfaces. */
export const WHATSAPP_INTERACTION_TOKENS = {
  navigationSeconds: 0.28,
  viewerSeconds: 0.22,
  surfaceMargin: 12,
  menuWidth: 236,
  menuRowHeight: 44,
  menuRadius: 14,
  viewerHeaderHeight: 52,
  sectionHeaderHeight: 34,
  callRowHeight: 70,
  callLinkHeight: 70,
  callLinkMarginTop: 14,
  callLinkMarginBottom: 8,
  favoritesHeight: 88,
} as const;
export type WhatsAppThemeId =
  | "whatsapp-storybook"
  | "whatsapp-signal-pop"
  | "whatsapp-coral-studio";

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
  mediaViewerBackground: string;
  mediaViewerText: string;
  mediaViewerTextMuted: string;
  mediaViewerControlsBackground: string;
  statusRingUnviewed: string;
  statusRingViewed: string;
  statusRingGap: string;
  sentBubbleBorder: string;
  receivedBubbleBorder: string;
  bubbleShadow: string;
  reactionSurface: string;
  reactionBorder: string;
  reactionShadow: string;
  replySurfaceSent: string;
  replySurfaceReceived: string;
  mediaScrim: string;
  wallpaperDoodle: string;
  wallpaperGlow: string;
  surfaceMuted: string;
}

export interface WhatsAppTextStyle {
  fontSize: number;
  fontWeight: "400" | "500" | "600" | "700";
  letterSpacing?: number;
}

export interface WhatsAppUITypography {
  largeTitle: WhatsAppTextStyle;
  title: WhatsAppTextStyle;
  headline: WhatsAppTextStyle;
  body: WhatsAppTextStyle;
  caption: WhatsAppTextStyle;
  tabLabel: WhatsAppTextStyle;
  badge: WhatsAppTextStyle;
  chip: WhatsAppTextStyle;
}

export interface WhatsAppUISpacing {
  chatListItemHeight: number;
  avatarSize: number;
  avatarMarginLeft: number;
  contentMarginLeft: number;
  contentMarginRight: number;
  pagePaddingX: number;
  pagePaddingWide: number;
  headerActionGap: number;
  filterChipPaddingX: number;
  filterChipPaddingY: number;
  filterChipGap: number;
  searchPaddingX: number;
  searchIconGap: number;
  sectionGap: number;
  tabBarHeight: number;
  tabIconSize: number;
  tabPaddingTop: number;
  tabBadgeOffsetTop: number;
  tabBadgeOffsetRight: number;
  navBarHeight: number;
  searchBarHeight: number;
  filterChipHeight: number;
  badgeMinWidth: number;
  badgeHeight: number;
  badgePadding: number;
  avatarRadius: number;
  searchBarRadius: number;
  filterChipRadius: number;
  badgeRadius: number;
}

export interface WhatsAppTypography {
  fontFamily: string;
  messageFontSize: number;
  messageLineHeight: number;
  timestampFontSize: number;
  headerTitleFontSize: number;
  headerSubtitleFontSize: number;
  inputFontSize: number;
  systemMessageFontSize: number;
}

export interface WhatsAppSpacing {
  shortThreadAlignment?: "start" | "end";
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

export interface WhatsAppTheme {
  platform: Platform;
  colors: WhatsAppColorPalette;
  typography: WhatsAppTypography;
  spacing: WhatsAppSpacing;
  uiTypography: WhatsAppUITypography;
  uiSpacing: WhatsAppUISpacing;
}

export const WHATSAPP_IOS_FONT_FAMILY =
  '"Inter Variable", "Noto Sans Arabic Variable", "Noto Sans Devanagari Variable", "Noto Sans JP Variable", sans-serif';
export const WHATSAPP_ANDROID_FONT_FAMILY =
  '"Roboto", "Noto Sans Arabic Variable", "Noto Sans Devanagari Variable", "Noto Sans JP Variable", sans-serif';

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
  mediaViewerBackground: "#000000",
  mediaViewerText: "#FFFFFF",
  mediaViewerTextMuted: "rgba(255,255,255,0.7)",
  mediaViewerControlsBackground: "rgba(0,0,0,0.4)",
  statusRingUnviewed: "#25D366",
  statusRingViewed: "#AEB7BD",
  statusRingGap: "#FFFFFF",
  sentBubbleBorder: "rgba(0,0,0,0.055)",
  receivedBubbleBorder: "rgba(0,0,0,0.07)",
  bubbleShadow: "0 1px 1.5px rgba(0,0,0,0.13)",
  reactionSurface: "#FFFFFF",
  reactionBorder: "#E4E6EB",
  reactionShadow: "0 1px 3px rgba(0,0,0,0.16)",
  replySurfaceSent: "rgba(255,255,255,0.28)",
  replySurfaceReceived: "rgba(0,0,0,0.045)",
  mediaScrim: "rgba(0,0,0,0.54)",
  wallpaperDoodle: "rgba(102,119,129,0.1)",
  wallpaperGlow: "rgba(255,255,255,0.14)",
  surfaceMuted: "#F7F9FA",
};

const sharedUITypography: WhatsAppUITypography = {
  largeTitle: { fontSize: 34, fontWeight: "700", letterSpacing: 0.37 },
  title: { fontSize: 17, fontWeight: "600", letterSpacing: -0.41 },
  headline: { fontSize: 17, fontWeight: "600", letterSpacing: -0.41 },
  body: { fontSize: 15, fontWeight: "400", letterSpacing: -0.24 },
  caption: { fontSize: 14, fontWeight: "400", letterSpacing: -0.08 },
  tabLabel: { fontSize: 10, fontWeight: "500", letterSpacing: 0 },
  badge: { fontSize: 12, fontWeight: "600" },
  chip: { fontSize: 15, fontWeight: "500" },
};

const sharedUISpacing: WhatsAppUISpacing = {
  chatListItemHeight: 78,
  avatarSize: 56,
  avatarMarginLeft: 16,
  contentMarginLeft: 12,
  contentMarginRight: 16,
  pagePaddingX: 16,
  pagePaddingWide: 20,
  headerActionGap: 20,
  filterChipPaddingX: 14,
  filterChipPaddingY: 6,
  filterChipGap: 8,
  searchPaddingX: 10,
  searchIconGap: 8,
  sectionGap: 16,
  tabBarHeight: 49,
  tabIconSize: 25,
  tabPaddingTop: 6,
  tabBadgeOffsetTop: -4,
  tabBadgeOffsetRight: -8,
  navBarHeight: 44,
  searchBarHeight: 36,
  filterChipHeight: 32,
  badgeMinWidth: 20,
  badgeHeight: 20,
  badgePadding: 6,
  avatarRadius: 28,
  searchBarRadius: 12,
  filterChipRadius: 16,
  badgeRadius: 10,
};

export const WHATSAPP_GROUP_SENDER_COLORS = [
  "#00A884",
  "#53BDEB",
  "#FF7E67",
  "#FFD93D",
  "#6C63FF",
  "#F06595",
  "#20C997",
  "#FFC078",
] as const;

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
    fontFamily: WHATSAPP_IOS_FONT_FAMILY,
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
    bubbleRadius: 12,
    bubbleRadiusTail: 4,
    avatarSize: 40,
    avatarSizeSmall: 32,
    headerHeight: 46,
    inputAreaHeight: 54,
    messageGap: 2,
    sectionGap: 16,
  },
  uiTypography: sharedUITypography,
  uiSpacing: sharedUISpacing,
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
    fontFamily: WHATSAPP_ANDROID_FONT_FAMILY,
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
  uiTypography: sharedUITypography,
  uiSpacing: sharedUISpacing,
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
    statusRingViewed: "#64737C",
    statusRingGap: "#0B141A",
    sentBubbleBorder: "rgba(255,255,255,0.055)",
    receivedBubbleBorder: "rgba(255,255,255,0.06)",
    bubbleShadow: "0 1px 2px rgba(0,0,0,0.48)",
    reactionSurface: "#1F2C34",
    reactionBorder: "#2A3942",
    reactionShadow: "0 1px 3px rgba(0,0,0,0.5)",
    replySurfaceSent: "rgba(0,0,0,0.18)",
    replySurfaceReceived: "rgba(0,0,0,0.22)",
    wallpaperDoodle: "rgba(134,150,160,0.08)",
    wallpaperGlow: "rgba(255,255,255,0.025)",
    surfaceMuted: "#182229",
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
    statusRingViewed: "#64737C",
    statusRingGap: "#0B141A",
    sentBubbleBorder: "rgba(255,255,255,0.055)",
    receivedBubbleBorder: "rgba(255,255,255,0.06)",
    bubbleShadow: "0 1px 2px rgba(0,0,0,0.48)",
    reactionSurface: "#1F2C34",
    reactionBorder: "#2A3942",
    reactionShadow: "0 1px 3px rgba(0,0,0,0.5)",
    replySurfaceSent: "rgba(0,0,0,0.18)",
    replySurfaceReceived: "rgba(0,0,0,0.22)",
    wallpaperDoodle: "rgba(134,150,160,0.08)",
    wallpaperGlow: "rgba(255,255,255,0.025)",
    surfaceMuted: "#182229",
  },
};

type WhatsAppThemeOverrides = {
  colors?: Partial<WhatsAppColorPalette>;
  typography?: Partial<WhatsAppTypography>;
  spacing?: Partial<WhatsAppSpacing>;
  uiTypography?: Partial<WhatsAppUITypography>;
  uiSpacing?: Partial<WhatsAppUISpacing>;
};

const STORYBOOK_OVERRIDES: WhatsAppThemeOverrides = {
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
    statusRingUnviewed: "#6BAA7A",
    statusRingViewed: "#B7AA94",
    statusRingGap: "#F7F2E8",
    sentBubbleBorder: "rgba(67,82,70,0.16)",
    receivedBubbleBorder: "rgba(92,73,51,0.14)",
    bubbleShadow: "0 2px 5px rgba(75,59,41,0.14)",
    reactionSurface: "#FFF9F0",
    reactionBorder: "#D7C9B6",
    reactionShadow: "0 2px 6px rgba(75,59,41,0.16)",
    replySurfaceSent: "rgba(255,253,247,0.5)",
    replySurfaceReceived: "rgba(107,170,122,0.1)",
    mediaScrim: "rgba(47,42,36,0.58)",
    wallpaperDoodle: "rgba(108,91,68,0.075)",
    wallpaperGlow: "rgba(255,253,247,0.12)",
    surfaceMuted: "#F2EADD",
  },
  spacing: {
    bubbleRadius: 20,
    bubbleRadiusTail: 6,
  },
  uiSpacing: {
    searchBarRadius: 16,
    filterChipRadius: 18,
  },
};

const STORYBOOK_DARK_COLORS: Partial<WhatsAppColorPalette> = {
  sentBubble: "#365B4A",
  receivedBubble: "#292C29",
  sentBubbleText: "#F5F0E6",
  receivedBubbleText: "#F5F0E6",
  background: "#171B18",
  chatBackground: "#20241F",
  headerBackground: "#24231F",
  headerText: "#F5F0E6",
  inputBackground: "#2C2B26",
  inputText: "#F5F0E6",
  inputPlaceholder: "#A99E89",
  divider: "#413D34",
  timestamp: "#B0A58E",
  systemMessage: "#B0A58E",
  systemMessageBg: "rgba(41,44,41,0.94)",
  systemMessageBorder: "#4A463D",
  systemMessageShadow: "0 2px 5px rgba(0,0,0,0.38)",
  systemBannerBg: "#3E3724",
  systemBannerText: "#F2DFA8",
  systemBannerBorder: "#5A5033",
  systemBannerLink: "#91C3DF",
  systemBannerIcon: "#F2DFA8",
  datePillBg: "rgba(41,44,41,0.96)",
  datePillBorder: "#4A463D",
  datePillText: "#B0A58E",
  callCardIconBgIncoming: "rgba(255,255,255,0.08)",
  callCardIconBgOutgoing: "rgba(255,255,255,0.14)",
  callCardIcon: "#F5F0E6",
  callCardMissed: "#E37A72",
  callCardSubtext: "#B0A58E",
  typingIndicator: "#B0A58E",
  accent: "#7FBD8D",
  link: "#91C3DF",
  unreadBadge: "#7FBD8D",
  unreadBadgeText: "#172019",
  onlineStatus: "#7FBD8D",
  checkmark: "#A8B7AE",
  checkmarkRead: "#91C3DF",
  statusRingUnviewed: "#7FBD8D",
  statusRingViewed: "#716A5C",
  statusRingGap: "#171B18",
  sentBubbleBorder: "rgba(191,222,199,0.12)",
  receivedBubbleBorder: "rgba(255,246,229,0.1)",
  bubbleShadow: "0 2px 6px rgba(0,0,0,0.34)",
  reactionSurface: "#34342F",
  reactionBorder: "#4A463D",
  reactionShadow: "0 2px 7px rgba(0,0,0,0.42)",
  replySurfaceSent: "rgba(0,0,0,0.18)",
  replySurfaceReceived: "rgba(127,189,141,0.09)",
  mediaScrim: "rgba(17,20,18,0.68)",
  wallpaperDoodle: "rgba(203,190,164,0.055)",
  wallpaperGlow: "rgba(255,246,229,0.025)",
  surfaceMuted: "#242823",
};

const SIGNAL_POP_OVERRIDES: WhatsAppThemeOverrides = {
  colors: {
    sentBubble: "#16B8C9",
    receivedBubble: "#F1E7D9",
    sentBubbleText: "#101528",
    receivedBubbleText: "#171C31",
    background: "#F6EFE7",
    chatBackground: "#E8DDD4",
    headerBackground: "#FFF8EF",
    headerText: "#171C31",
    inputBackground: "#FFF8EF",
    inputText: "#171C31",
    inputPlaceholder: "#776F77",
    divider: "#D9CCC2",
    timestamp: "#6E6872",
    systemMessage: "#625D68",
    systemMessageBg: "rgba(255,248,239,0.94)",
    systemMessageBorder: "rgba(23,28,49,0.12)",
    systemMessageShadow: "0 3px 10px rgba(23,28,49,0.14)",
    systemBannerBg: "#F7DCA8",
    systemBannerText: "#503A12",
    systemBannerBorder: "#E5A13B",
    systemBannerLink: "#5B3FA0",
    systemBannerIcon: "#503A12",
    datePillBg: "rgba(255,248,239,0.96)",
    datePillBorder: "rgba(23,28,49,0.12)",
    datePillText: "#625D68",
    callCardIconBgIncoming: "rgba(23,28,49,0.07)",
    callCardIconBgOutgoing: "rgba(255,255,255,0.34)",
    callCardIcon: "#171C31",
    callCardMissed: "#E95E4A",
    callCardSubtext: "#6E6872",
    typingIndicator: "#5B3FA0",
    accent: "#7650BD",
    link: "#4D3A9A",
    unreadBadge: "#F16B4F",
    unreadBadgeText: "#FFFFFF",
    onlineStatus: "#16B8C9",
    checkmark: "#315967",
    checkmarkRead: "#5B3FA0",
    statusRingUnviewed: "#F16B4F",
    statusRingViewed: "#A59AA1",
    statusRingGap: "#F6EFE7",
    sentBubbleBorder: "rgba(16,21,40,0.14)",
    receivedBubbleBorder: "rgba(23,28,49,0.13)",
    bubbleShadow: "0 3px 9px rgba(23,28,49,0.16)",
    reactionSurface: "#FFF8EF",
    reactionBorder: "#D9CCC2",
    reactionShadow: "0 3px 10px rgba(23,28,49,0.18)",
    replySurfaceSent: "rgba(255,255,255,0.34)",
    replySurfaceReceived: "rgba(118,80,189,0.1)",
    mediaScrim: "rgba(16,21,40,0.62)",
    wallpaperDoodle: "rgba(118,80,189,0.08)",
    wallpaperGlow: "rgba(22,184,201,0.12)",
    surfaceMuted: "#EEE3DA",
  },
  spacing: {
    messagePaddingHorizontal: 13,
    messagePaddingVertical: 9,
    bubbleRadius: 19,
    bubbleRadiusTail: 6,
    messageGap: 5,
  },
  uiTypography: {
    largeTitle: { fontSize: 34, fontWeight: "700", letterSpacing: -0.2 },
    title: { fontSize: 17, fontWeight: "700", letterSpacing: -0.35 },
    headline: { fontSize: 17, fontWeight: "600", letterSpacing: -0.35 },
  },
  uiSpacing: {
    chatListItemHeight: 82,
    contentMarginLeft: 14,
    contentMarginRight: 18,
    filterChipGap: 10,
    sectionGap: 18,
    searchBarRadius: 16,
    filterChipRadius: 18,
  },
};

const SIGNAL_POP_DARK_COLORS: Partial<WhatsAppColorPalette> = {
  sentBubble: "#168C9B",
  receivedBubble: "#29243D",
  sentBubbleText: "#F8F1E8",
  receivedBubbleText: "#F8F1E8",
  background: "#101528",
  chatBackground: "#171C31",
  headerBackground: "#1F2440",
  headerText: "#FFF8EF",
  inputBackground: "#252A47",
  inputText: "#FFF8EF",
  inputPlaceholder: "#AAA5B2",
  divider: "#373B59",
  timestamp: "#B7B0BC",
  systemMessage: "#C4BDC8",
  systemMessageBg: "rgba(37,42,71,0.94)",
  systemMessageBorder: "rgba(241,231,217,0.13)",
  systemMessageShadow: "0 3px 10px rgba(0,0,0,0.38)",
  systemBannerBg: "#4D3C25",
  systemBannerText: "#FFE4AE",
  systemBannerBorder: "#765D32",
  systemBannerLink: "#B6A2FF",
  systemBannerIcon: "#FFE4AE",
  datePillBg: "rgba(37,42,71,0.96)",
  datePillBorder: "rgba(241,231,217,0.13)",
  datePillText: "#C4BDC8",
  callCardIconBgIncoming: "rgba(255,255,255,0.09)",
  callCardIconBgOutgoing: "rgba(255,255,255,0.14)",
  callCardIcon: "#FFF8EF",
  callCardMissed: "#FF7A65",
  callCardSubtext: "#B7B0BC",
  typingIndicator: "#B6A2FF",
  accent: "#9B7CE7",
  link: "#A89CFF",
  unreadBadge: "#F16B4F",
  unreadBadgeText: "#FFFFFF",
  onlineStatus: "#28C7D7",
  checkmark: "#C3D6D9",
  checkmarkRead: "#C0ABFF",
  statusRingUnviewed: "#F16B4F",
  statusRingViewed: "#706A7D",
  statusRingGap: "#101528",
  sentBubbleBorder: "rgba(211,249,253,0.13)",
  receivedBubbleBorder: "rgba(241,231,217,0.12)",
  bubbleShadow: "0 3px 10px rgba(0,0,0,0.38)",
  reactionSurface: "#302B49",
  reactionBorder: "#47415E",
  reactionShadow: "0 3px 11px rgba(0,0,0,0.42)",
  replySurfaceSent: "rgba(0,0,0,0.18)",
  replySurfaceReceived: "rgba(155,124,231,0.12)",
  mediaScrim: "rgba(8,11,24,0.72)",
  wallpaperDoodle: "rgba(155,124,231,0.07)",
  wallpaperGlow: "rgba(22,184,201,0.055)",
  surfaceMuted: "#1D2239",
};

function mergeTheme(
  base: WhatsAppTheme,
  overrides: WhatsAppThemeOverrides,
): WhatsAppTheme {
  return {
    ...base,
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    spacing: { ...base.spacing, ...overrides.spacing },
    uiTypography: { ...base.uiTypography, ...overrides.uiTypography },
    uiSpacing: { ...base.uiSpacing, ...overrides.uiSpacing },
  };
}

export function getTheme(
  platform: Platform,
  darkMode = false,
  themeId?: WhatsAppThemeId,
): WhatsAppTheme {
  const base =
    platform === "ios"
      ? darkMode
        ? iosDarkTheme
        : iosTheme
      : darkMode
        ? androidDarkTheme
        : androidTheme;

  if (themeId === "whatsapp-storybook") {
    const themed = mergeTheme(base, STORYBOOK_OVERRIDES);
    return darkMode
      ? mergeTheme(themed, { colors: STORYBOOK_DARK_COLORS })
      : themed;
  }
  if (themeId === "whatsapp-signal-pop") {
    const themed = mergeTheme(base, SIGNAL_POP_OVERRIDES);
    return darkMode
      ? mergeTheme(themed, { colors: SIGNAL_POP_DARK_COLORS })
      : themed;
  }
  if (themeId === "whatsapp-coral-studio") {
    return mergeTheme(base, {
      colors: {
        sentBubble: "#FF825C",
        sentBubbleText: "#30251F",
        receivedBubble: darkMode ? "#34302D" : "#FFFFFF",
        receivedBubbleText: darkMode ? "#FFF6ED" : "#30251F",
        background: darkMode ? "#201D1A" : "#FFF8F0",
        chatBackground: darkMode ? "#201D1A" : "#FFF8F0",
        headerBackground: darkMode ? "#28231F" : "#FFF8F0",
        headerText: darkMode ? "#FFF6ED" : "#30251F",
        inputBackground: darkMode ? "#34302D" : "#FFFDF9",
        accent: "#C34A28",
        checkmarkRead: "#694334",
        wallpaperDoodle: "transparent",
        wallpaperGlow: "transparent",
        bubbleShadow: "0 3px 9px rgba(80,45,25,0.08)",
        sentBubbleBorder: "transparent",
        receivedBubbleBorder: darkMode ? "#51443B" : "#F0E2D6",
        datePillBg: "transparent",
        datePillBorder: "transparent",
      },
      typography: { messageFontSize: 20, messageLineHeight: 27 },
      spacing: {
        bubbleRadius: 22,
        messagePaddingVertical: 14,
        shortThreadAlignment: "start",
      },
    });
  }
  return base;
}
