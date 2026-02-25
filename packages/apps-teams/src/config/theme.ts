export type TeamsThemeMode = "light" | "dark";

export interface TeamsDesignTokens {
  color: {
    /** App background */
    bg: string;
    /** Card/surface background */
    surface: string;
    /** Elevated card background */
    surfaceElevated: string;
    /** Borders */
    border: string;
    /** Primary text */
    textPrimary: string;
    /** Secondary text */
    textSecondary: string;
    /** Muted/tertiary text */
    textMuted: string;
    /** Brand purple (Teams primary) */
    brand: string;
    /** Brand hover/pressed */
    brandStrong: string;
    /** Success / Available green */
    success: string;
    /** Warning amber */
    warning: string;
    /** Danger / End call red */
    danger: string;
    /** Info blue */
    info: string;
    /** Presence: Available */
    presenceAvailable: string;
    /** Presence: Busy */
    presenceBusy: string;
    /** Presence: Away */
    presenceAway: string;
    /** Presence: Offline */
    presenceOffline: string;
    /** Row hover background */
    hover: string;
    /** Pressed state */
    pressed: string;
    /** Focus ring color */
    focusRing: string;
    /** Selected item background */
    selected: string;
    /** Unread badge background */
    unreadBadge: string;
    /** Sent message bubble */
    sentBubble: string;
    /** Received message bubble */
    receivedBubble: string;
    /** Compose bar background */
    composeBar: string;
    /** Tab bar background */
    tabBar: string;
    /** Tab bar active icon */
    tabBarActive: string;
    /** Tab bar inactive icon */
    tabBarInactive: string;
  };
  typography: {
    title: number;
    subtitle: number;
    body: number;
    caption: number;
    meta: number;
    badge: number;
  };
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    chip: number;
    card: number;
    input: number;
    panel: number;
    callBanner: number;
    avatar: number;
    bubble: number;
  };
  shadow: {
    card: string;
    panel: string;
    overlay: string;
  };
  motion: {
    fastMs: number;
    normalMs: number;
    slowMs: number;
    easing: "linear" | "easeIn" | "easeOut" | "easeInOut";
  };
  zIndex: {
    base: number;
    sticky: number;
    overlay: number;
    call: number;
  };
}

const base: Omit<TeamsDesignTokens, "color"> = {
  typography: {
    title: 18,
    subtitle: 15,
    body: 14,
    caption: 12,
    meta: 11,
    badge: 10,
  },
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  radius: {
    chip: 10,
    card: 8,
    input: 20,
    panel: 12,
    callBanner: 14,
    avatar: 20,
    bubble: 16,
  },
  shadow: {
    card: "0 1px 3px rgba(0, 0, 0, 0.06)",
    panel: "0 2px 8px rgba(0, 0, 0, 0.08)",
    overlay: "0 8px 24px rgba(0, 0, 0, 0.18)",
  },
  motion: {
    fastMs: 120,
    normalMs: 220,
    slowMs: 320,
    easing: "easeOut",
  },
  zIndex: {
    base: 1,
    sticky: 10,
    overlay: 20,
    call: 30,
  },
};

export const TEAMS_THEME_PRESETS: Record<TeamsThemeMode, TeamsDesignTokens> = {
  light: {
    ...base,
    color: {
      bg: "#f5f5f5",
      surface: "#ffffff",
      surfaceElevated: "#ffffff",
      border: "#e0e0e0",
      textPrimary: "#242424",
      textSecondary: "#616161",
      textMuted: "#adadad",
      brand: "#5b5fc7",
      brandStrong: "#4f52b2",
      success: "#6bb700",
      warning: "#f7630c",
      danger: "#c50f1f",
      info: "#0078d4",
      presenceAvailable: "#6bb700",
      presenceBusy: "#c50f1f",
      presenceAway: "#eaa300",
      presenceOffline: "#adadad",
      hover: "#f5f5f5",
      pressed: "#ebebeb",
      focusRing: "#5b5fc7",
      selected: "#e8ebfa",
      unreadBadge: "#c50f1f",
      sentBubble: "#e8ebfa",
      receivedBubble: "#ffffff",
      composeBar: "#ffffff",
      tabBar: "#ffffff",
      tabBarActive: "#5b5fc7",
      tabBarInactive: "#616161",
    },
  },
  dark: {
    ...base,
    color: {
      bg: "#1f1f1f",
      surface: "#292929",
      surfaceElevated: "#333333",
      border: "#3d3d3d",
      textPrimary: "#ffffff",
      textSecondary: "#d1d1d1",
      textMuted: "#8a8a8a",
      brand: "#7f85f5",
      brandStrong: "#9299f7",
      success: "#92c353",
      warning: "#f7630c",
      danger: "#d13438",
      info: "#2886de",
      presenceAvailable: "#92c353",
      presenceBusy: "#d13438",
      presenceAway: "#eaa300",
      presenceOffline: "#8a8a8a",
      hover: "#333333",
      pressed: "#3d3d3d",
      focusRing: "#7f85f5",
      selected: "#3d3f6b",
      unreadBadge: "#d13438",
      sentBubble: "#3d3f6b",
      receivedBubble: "#333333",
      composeBar: "#292929",
      tabBar: "#292929",
      tabBarActive: "#7f85f5",
      tabBarInactive: "#8a8a8a",
    },
  },
};
