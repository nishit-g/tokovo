/**
 * V2 Baselines - Canonical episodes for future authoring
 *
 * Import this catalog in runtimes to expose baseline episodes:
 *   import v2Episodes from "@tokovo/episodes/v2";
 */

import type { EpisodeDefinition } from "../types/episode-definition.js";

import deviceBaseline from "./device-baseline.episode.js";
import enterpriseLongShowcase from "./enterprise-long-showcase.episode.js";
import whatsappGroupRoastBaseline from "./whatsapp-group-roast-baseline.episode.js";
import xRoastThreadBaseline from "./x-roast-thread-baseline.episode.js";

export const v2Episodes: EpisodeDefinition[] = [
  deviceBaseline,
  enterpriseLongShowcase,
  whatsappGroupRoastBaseline,
  xRoastThreadBaseline,
];

export default v2Episodes;

export {
  deviceBaseline,
  enterpriseLongShowcase,
  whatsappGroupRoastBaseline,
  xRoastThreadBaseline,
};
