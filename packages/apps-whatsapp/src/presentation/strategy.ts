import type {
  WhatsAppChatFilter,
  WhatsAppScreenId,
} from "../types/state.js";

export type WhatsAppPlatform = "ios" | "android";
export type { WhatsAppScreenId } from "../types/state.js";

export type WhatsAppTabId =
  | "updates"
  | "calls"
  | "communities"
  | "chats"
  | "settings";

export type { WhatsAppChatFilter } from "../types/state.js";

export interface WhatsAppPresentationStrategy {
  platform: WhatsAppPlatform;
  navigation: {
    tabs: readonly WhatsAppTabId[];
    activeColor: "accent" | "headerText";
  };
  chatList: {
    titleStyle: "large" | "toolbar";
    filters: readonly WhatsAppChatFilter[];
  };
  conversation: {
    headerActionColor: "accent" | "headerText";
    composerLeadingAction: "add" | "emoji";
    composerIdleActions: readonly ("camera" | "microphone" | "attachment")[];
  };
}

export const IOS_WHATSAPP_PRESENTATION: WhatsAppPresentationStrategy = {
  platform: "ios",
  navigation: {
    tabs: ["updates", "calls", "communities", "chats", "settings"],
    activeColor: "accent",
  },
  chatList: {
    titleStyle: "large",
    filters: ["all", "unread", "favorites", "groups", "drafts"],
  },
  conversation: {
    headerActionColor: "headerText",
    composerLeadingAction: "add",
    composerIdleActions: ["camera", "microphone"],
  },
};

export const ANDROID_WHATSAPP_PRESENTATION: WhatsAppPresentationStrategy = {
  platform: "android",
  navigation: {
    tabs: ["chats", "updates", "communities", "calls"],
    activeColor: "accent",
  },
  chatList: {
    titleStyle: "toolbar",
    filters: ["all", "unread", "favorites", "groups", "drafts"],
  },
  conversation: {
    headerActionColor: "headerText",
    composerLeadingAction: "emoji",
    composerIdleActions: ["attachment", "camera", "microphone"],
  },
};

export function getWhatsAppPresentationStrategy(
  platform: WhatsAppPlatform,
): WhatsAppPresentationStrategy {
  return platform === "android"
    ? ANDROID_WHATSAPP_PRESENTATION
    : IOS_WHATSAPP_PRESENTATION;
}

const WHATSAPP_SCREENS = new Set<WhatsAppScreenId>([
  "chats",
  "chat",
  "updates",
  "calls",
  "communities",
  "settings",
  "profile",
]);

export function resolveWhatsAppScreenId(
  screen: string | undefined,
): WhatsAppScreenId {
  if (!screen) return "chats";
  if (!WHATSAPP_SCREENS.has(screen as WhatsAppScreenId)) {
    throw new Error(`Unsupported WhatsApp screen "${screen}"`);
  }
  return screen as WhatsAppScreenId;
}
