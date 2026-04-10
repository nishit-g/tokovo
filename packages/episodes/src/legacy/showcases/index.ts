/**
 * Showcases - Demo episodes for feature demonstration
 *
 * Import this file in Root.tsx to load all showcase episodes:
 *   import "@tokovo/episodes/showcases";
 *
 * To add a new showcase:
 *   1. Create: showcases/my-showcase.episode.ts
 *   2. Add import below
 */

import type { EpisodeDefinition } from "../../types/episode-definition.js";
import { markLegacyEpisode } from "../../catalog/index.js";

import cameraDirectorFull from "./camera-director-full.episode.js";
import ghibliX from "./ghibli-x.episode.js";
import megaCameraShowcase from "./mega-camera-showcase.episode.js";
import iMessageDemo from "./imessage-demo.episode.js";
import instagramGhibliGoldenHour from "./instagram-ghibli-golden-hour.episode.js";
import linkedinGhibliStudio from "./linkedin-ghibli-studio.episode.js";
import lockscreenBaitUnlockSwitchShowcase from "./lockscreen-bait-unlock-switch-showcase.episode.js";
import parallelTimelineSplitScreenShowcase from "./parallel-timeline-split-screen-showcase.episode.js";
import teamsEnterpriseExhaustiveShowcase from "./teams-enterprise-exhaustive-showcase.episode.js";
import teamsGhibliNightShift from "./teams-ghibli-night-shift.episode.js";
import tennisCasual from "./tennis-casual.episode.js";
import tennisDramatic from "./tennis-dramatic.episode.js";
import tennisEnergetic from "./tennis-energetic.episode.js";
import tennisFluidDemo from "./tennis-fluid-demo.episode.js";
import tennisGroupOrganic from "./tennis-group-organic.episode.js";
import megaCameraDirector from "./mega-camera-director.episode.js";
// plop:episode-import

export const showcaseEpisodes: EpisodeDefinition[] = [
  markLegacyEpisode(cameraDirectorFull),
  markLegacyEpisode(ghibliX),
  markLegacyEpisode(megaCameraDirector),
  markLegacyEpisode(megaCameraShowcase),
  markLegacyEpisode(iMessageDemo),
  markLegacyEpisode(instagramGhibliGoldenHour),
  markLegacyEpisode(linkedinGhibliStudio),
  markLegacyEpisode(lockscreenBaitUnlockSwitchShowcase),
  markLegacyEpisode(parallelTimelineSplitScreenShowcase),
  markLegacyEpisode(teamsEnterpriseExhaustiveShowcase),
  markLegacyEpisode(teamsGhibliNightShift),
  markLegacyEpisode(tennisCasual),
  markLegacyEpisode(tennisDramatic),
  markLegacyEpisode(tennisEnergetic),
  markLegacyEpisode(tennisFluidDemo),
  markLegacyEpisode(tennisGroupOrganic),
  // plop:episode-entry
];

export default showcaseEpisodes;

export {
  cameraDirectorFull,
  ghibliX,
  megaCameraShowcase,
  iMessageDemo,
  instagramGhibliGoldenHour,
  linkedinGhibliStudio,
  lockscreenBaitUnlockSwitchShowcase,
  parallelTimelineSplitScreenShowcase,
  teamsEnterpriseExhaustiveShowcase,
  teamsGhibliNightShift,
  tennisCasual,
  tennisDramatic,
  tennisEnergetic,
  tennisFluidDemo,
  tennisGroupOrganic,
  megaCameraDirector,
};
