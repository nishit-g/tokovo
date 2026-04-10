import type { PluginLayoutStrategy } from "@tokovo/core";
import { computeTeamsChatLayout } from "./chat.js";
import { computeTeamsFeedLayout } from "./feed.js";
import { computeTeamsFullscreenLayout } from "./fullscreen.js";

export { computeTeamsFeedLayout } from "./feed.js";
export { computeTeamsChatLayout } from "./chat.js";
export { computeTeamsFullscreenLayout } from "./fullscreen.js";

export const teamsLayoutStrategies: PluginLayoutStrategy[] = [
  { viewKind: "FEED", computeLayout: computeTeamsFeedLayout },
  { viewKind: "CHAT", computeLayout: computeTeamsChatLayout },
  { viewKind: "FULLSCREEN", computeLayout: computeTeamsFullscreenLayout },
];
