import type { PluginLayoutStrategy } from "@tokovo/core";
import { computeInstagramChatLayout } from "./chat.js";
import { computeInstagramFeedLayout } from "./feed.js";
import { computeInstagramFullscreenLayout } from "./fullscreen.js";

export { computeInstagramChatLayout } from "./chat.js";
export { computeInstagramFeedLayout } from "./feed.js";
export { computeInstagramFullscreenLayout } from "./fullscreen.js";

export const instagramLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FEED", computeLayout: computeInstagramFeedLayout },
  { viewKind: "CHAT", computeLayout: computeInstagramChatLayout },
  { viewKind: "FULLSCREEN", computeLayout: computeInstagramFullscreenLayout },
];
