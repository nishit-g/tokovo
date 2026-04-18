/**
 * V2 Baselines - Canonical episodes for future authoring
 *
 * Import this catalog in runtimes to expose baseline episodes:
 *   import v2Episodes from "@tokovo/episodes/v2";
 */

import type { EpisodeDefinition } from "../types/episode-definition.js";

import deviceBaseline from "./device-baseline.episode.js";
import enterpriseLongShowcase from "./enterprise-long-showcase.episode.js";
import hinglishFriendsBakchodiNoOverlay from "./hinglish-friends-bakchodi-no-overlay.episode.js";
import kannadaBakchodiMultiapp from "./kannada-bakchodi-multiapp.episode.js";
import mysuruFriendsBakchodiNoOverlay from "./mysuru-friends-bakchodi-no-overlay.episode.js";
import overlayBaseline from "./overlay-baseline.episode.js";
import reactorBaseline from "./reactor-baseline.episode.js";
import whatsappGroupRoastBaseline from "./whatsapp-group-roast-baseline.episode.js";
import xRoastThreadBaseline from "./x-roast-thread-baseline.episode.js";

export const v2Episodes: EpisodeDefinition[] = [
  deviceBaseline,
  enterpriseLongShowcase,
  hinglishFriendsBakchodiNoOverlay,
  kannadaBakchodiMultiapp,
  mysuruFriendsBakchodiNoOverlay,
  overlayBaseline,
  reactorBaseline,
  whatsappGroupRoastBaseline,
  xRoastThreadBaseline,
];

export default v2Episodes;

export {
  deviceBaseline,
  enterpriseLongShowcase,
  hinglishFriendsBakchodiNoOverlay,
  kannadaBakchodiMultiapp,
  mysuruFriendsBakchodiNoOverlay,
  overlayBaseline,
  reactorBaseline,
  whatsappGroupRoastBaseline,
  xRoastThreadBaseline,
};
