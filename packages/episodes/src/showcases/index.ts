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
import tennisCasual from "./tennis-casual.episode.js";
import tennisDramatic from "./tennis-dramatic.episode.js";
import tennisEnergetic from "./tennis-energetic.episode.js";
import tennisFluidDemo from "./tennis-fluid-demo.episode.js";
import tennisGroupOrganic from "./tennis-group-organic.episode.js";
import ghibliX from "./ghibli-x.episode.js";
// plop:episode-import

export const showcaseEpisodes: EpisodeDefinition[] = [
  cameraDirectorFull,
  megaCameraDirector,
  megaCameraShowcase,
  iMessageDemo,
  tennisCasual,
  tennisDramatic,
  tennisEnergetic,
  tennisFluidDemo,
  tennisGroupOrganic,
  ghibliX,
  // plop:episode-entry
];

export default showcaseEpisodes;

export {
  cameraDirectorFull,
  megaCameraDirector,
  megaCameraShowcase,
  iMessageDemo,
  tennisCasual,
  tennisDramatic,
  tennisEnergetic,
  tennisFluidDemo,
  tennisGroupOrganic,
  ghibliX,
};
