import type { WhatsAppPresentationStrategy } from "../presentation/strategy.js";
import type {
  Platform,
  WhatsAppTheme,
  WhatsAppThemeId,
} from "../theme/index.js";
import type {
  WhatsAppLocale,
  WhatsAppMessageKey,
  WhatsAppTextDirection,
} from "../localization/index.js";

export const WHATSAPP_UI_VERSION = "2026.1" as const;

export type WhatsAppAppearance = "light" | "dark";

export interface WhatsAppExperienceInput {
  platform: Platform;
  appearance: WhatsAppAppearance;
  themeId?: WhatsAppThemeId;
  locale: WhatsAppLocale;
}

export interface WhatsAppCapabilities {
  screens: readonly (
    | "chats"
    | "chat"
    | "updates"
    | "calls"
    | "communities"
    | "settings"
    | "profile"
  )[];
  supportsDarkMode: boolean;
  supportsCustomTheme: boolean;
  supportsMultiDeviceState: boolean;
}

export interface WhatsAppComponentRecipes {
  chatList: "modern";
  conversation: "sender-run";
  composer: "platform-native";
  navigation: "platform-native";
}

export interface WhatsAppExperience {
  appId: "app_whatsapp";
  uiVersion: typeof WHATSAPP_UI_VERSION;
  platform: Platform;
  appearance: WhatsAppAppearance;
  themeId: WhatsAppThemeId | "default";
  theme: WhatsAppTheme;
  locale: WhatsAppLocale;
  direction: WhatsAppTextDirection;
  t: (
    key: WhatsAppMessageKey,
    parameters?: Record<string, string | number>,
  ) => string;
  presentation: WhatsAppPresentationStrategy;
  capabilities: WhatsAppCapabilities;
  components: WhatsAppComponentRecipes;
  layout: {
    chat: WhatsAppTheme["spacing"];
    app: WhatsAppTheme["uiSpacing"];
  };
}
