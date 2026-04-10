import type { PluginLayoutStrategy } from "@tokovo/core";
import { computeXChatLayout } from "./chat.js";
import { computeXFeedLayout } from "./feed.js";
import { computeXFullscreenLayout } from "./fullscreen.js";

export { computeXChatLayout } from "./chat.js";
export { computeXFeedLayout } from "./feed.js";
export { computeXFullscreenLayout } from "./fullscreen.js";

export const xLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FEED", computeLayout: computeXFeedLayout },
  { viewKind: "CHAT", computeLayout: computeXChatLayout },
  { viewKind: "FULLSCREEN", computeLayout: computeXFullscreenLayout },
];
