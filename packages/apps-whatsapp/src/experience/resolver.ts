import { z } from "zod";
import { getWhatsAppPresentationStrategy } from "../presentation/strategy.js";
import { getTheme } from "../theme/index.js";
import {
  getWhatsAppTextDirection,
  translateWhatsApp,
} from "../localization/index.js";
import {
  WHATSAPP_UI_VERSION,
  type WhatsAppExperience,
  type WhatsAppExperienceInput,
} from "./contract.js";

const experienceInputSchema = z
  .object({
    platform: z.enum(["ios", "android"]),
    appearance: z.enum(["light", "dark"]),
    themeId: z.enum(["whatsapp-storybook", "whatsapp-signal-pop", "whatsapp-coral-studio"]).optional(),
    locale: z.enum(["en-US", "ar"]),
  })
  .strict();

export function resolveWhatsAppExperience(
  input: WhatsAppExperienceInput,
): WhatsAppExperience {
  const parsed = experienceInputSchema.parse(input);
  const theme = getTheme(
    parsed.platform,
    parsed.appearance === "dark",
    parsed.themeId,
  );

  return {
    appId: "app_whatsapp",
    uiVersion: WHATSAPP_UI_VERSION,
    platform: parsed.platform,
    appearance: parsed.appearance,
    themeId: parsed.themeId ?? "default",
    theme,
    locale: parsed.locale,
    direction: getWhatsAppTextDirection(parsed.locale),
    t: (key, parameters) =>
      translateWhatsApp(parsed.locale, key, parameters),
    presentation: getWhatsAppPresentationStrategy(parsed.platform),
    capabilities: {
      screens: [
        "chats",
        "chat",
        "updates",
        "calls",
        "communities",
        "settings",
        "profile",
      ],
      supportsDarkMode: true,
      supportsCustomTheme: true,
      supportsMultiDeviceState: true,
    },
    components: {
      chatList: "modern",
      conversation: "sender-run",
      composer: "platform-native",
      navigation: "platform-native",
    },
    layout: {
      chat: theme.spacing,
      app: theme.uiSpacing,
    },
  };
}
