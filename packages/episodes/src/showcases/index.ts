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

import type { EpisodeDefinition } from "../types/episode-definition.js";

import cameraDirectorFull from "./camera-director-full.episode.js";
import megaCameraDirector from "./mega-camera-director.episode.js";
import megaCameraShowcase from "./mega-camera-showcase.episode.js";
import iMessageDemo from "./imessage-demo.episode.js";
import lockscreenBaitUnlockSwitchShowcase from "./lockscreen-bait-unlock-switch-showcase.episode.js";
import parallelTimelineSplitScreenShowcase from "./parallel-timeline-split-screen-showcase.episode.js";
import tennisCasual from "./tennis-casual.episode.js";
import tennisDramatic from "./tennis-dramatic.episode.js";
import tennisEnergetic from "./tennis-energetic.episode.js";
import tennisFluidDemo from "./tennis-fluid-demo.episode.js";
import tennisGroupOrganic from "./tennis-group-organic.episode.js";
import ghibliX from "./ghibli-x.episode.js";
import instagramGhibliGoldenHour from "./instagram-ghibli-golden-hour.episode.js";
import teamsEnterpriseExhaustiveShowcase from "./teams-enterprise-exhaustive-showcase.episode.js";
import teamsGhibliNightShift from "./teams-ghibli-night-shift.episode.js";
// plop:episode-import

export const showcaseEpisodes: EpisodeDefinition[] = [
  cameraDirectorFull,
  megaCameraDirector,
  megaCameraShowcase,
  iMessageDemo,
  lockscreenBaitUnlockSwitchShowcase,
  parallelTimelineSplitScreenShowcase,
  tennisCasual,
  tennisDramatic,
  tennisEnergetic,
  tennisFluidDemo,
  tennisGroupOrganic,
  ghibliX,
  instagramGhibliGoldenHour,
  teamsEnterpriseExhaustiveShowcase,
  teamsGhibliNightShift,
  // plop:episode-entry
];

export default showcaseEpisodes;

export {
  cameraDirectorFull,
  megaCameraDirector,
  megaCameraShowcase,
  iMessageDemo,
  lockscreenBaitUnlockSwitchShowcase,
  parallelTimelineSplitScreenShowcase,
  tennisCasual,
  tennisDramatic,
  tennisEnergetic,
  tennisFluidDemo,
  tennisGroupOrganic,
  ghibliX,
  instagramGhibliGoldenHour,
  teamsEnterpriseExhaustiveShowcase,
  teamsGhibliNightShift,
};
