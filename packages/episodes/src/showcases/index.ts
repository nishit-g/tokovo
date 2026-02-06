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

import cameraDirectorFull from "./camera-director-full.episode";
import megaCameraDirector from "./mega-camera-director.episode";
import megaCameraShowcase from "./mega-camera-showcase.episode";
import iMessageDemo from "./imessage-demo.episode";
import tennisCasual from "./tennis-casual.episode";
import tennisDramatic from "./tennis-dramatic.episode";
import tennisEnergetic from "./tennis-energetic.episode";
import tennisFluidDemo from "./tennis-fluid-demo.episode";
import tennisGroupOrganic from "./tennis-group-organic.episode";
import ghibliX from "./ghibli-x.episode";
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
