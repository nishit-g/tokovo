export interface NotificationTokens {
  platform: "ios" | "android";

  banner: {
    background: string;
    backgroundBlur: string;
    border: string;
    borderRadius: number;
    margin: { top: number; horizontal: number };
    padding: { top: number; bottom: number; horizontal: number };
    height: number;
    shadow: string;
    gap: number;
  };

  lockScreen: {
    background: string;
    backgroundBlur: string;
    border: string;
    borderRadius: number;
    margin: { bottom: number; horizontal: number };
    padding: { top: number; bottom: number; horizontal: number };
    gap: number;
    maxVisible: number;
  };

  icon: {
    size: number;
    borderRadius: number;
    shadow: string;
  };

  text: {
    appName: {
      fontSize: number;
      fontWeight: number;
      color: string;
      opacity: number;
    };
    title: {
      fontSize: number;
      fontWeight: number;
      color: string;
    };
    body: {
      fontSize: number;
      fontWeight: number;
      color: string;
      opacity: number;
      maxLines: number;
    };
    timestamp: {
      fontSize: number;
      fontWeight: number;
      color: string;
      opacity: number;
    };
  };

  animation: {
    enterDuration: number;
    exitDuration: number;
    defaultVisibleDuration: number;
    curve: string;
    stackSpacing: number;
    // Banner animation values
    enterTranslateY: number;
    exitTranslateY: number;
    enterScale: number;
    stackScaleDecay: number;
    // LockScreen animation values
    lockScreenEnterTranslateY: number;
    lockScreenExitTranslateX: number;
  };

  typography: {
    fontFamily: string;
  };
}

export type NotificationTheme = "light" | "dark";

export interface NotificationTokensConfig {
  light: NotificationTokens;
  dark: NotificationTokens;
}

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface DeviceAwareTokensOptions {
  platform: "ios" | "android";
  theme?: NotificationTheme;
  safeArea?: SafeAreaInsets;
}
