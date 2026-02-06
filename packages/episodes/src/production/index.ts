/**
 * Production Episodes
 *
 * Import this file to load all production episodes.
 *
 * @example
 * // In Root.tsx:
 * import "@tokovo/episodes/production";
 *
 * @see docs-v2/EPISODE-ARCH.md
 */

import type { EpisodeDefinition } from "../types/episode-definition.js";

import trackDemo from "./track-demo.episode";
import bakchodiBros from "./bakchodi-bros.episode";
import notificationDemo from "./notification-demo.episode";
import profileFocusDemo from "./profile-focus-demo.episode";
import cheatingExposed from "./cheating-exposed.episode";
import featureShowcase from "./feature-showcase.episode";
import ghibliShowcase from "./ghibli-showcase.episode";
import cyberpunkShowcase from "./cyberpunk-showcase.episode";
import cameraShowcase from "./camera-showcase.episode";
import whtEpi from "./wht-epi.episode";
import keyboardDemo from "./keyboard-demo.episode";
import typedMessageDemo from "./typed-message-demo.episode";
import cheatingExposedNewDx from "./cheating-exposed-new-dx.episode";
import voiceDemo from "./voice-demo.episode";
import megaX from "./mega-x.episode";
import megaWhatsapp from "./mega-whatsapp.episode";
import megaMegaWhatsapp from "./mega-mega-whatsapp.episode";
import whatsappGhibli from "./whatsapp-ghibli.episode";
import whatsappToX from "./whatsapp-to-x.episode";
import whatsappToXViral from "./whatsapp-to-x-viral.episode";
import xAnchorTour from "./x-anchor-tour.episode";
import iMessageAnchorTour from "./imessage-anchor-tour.episode";
// plop:episode-import

export const productionEpisodes: EpisodeDefinition[] = [
  trackDemo,
  bakchodiBros,
  notificationDemo,
  profileFocusDemo,
  cheatingExposed,
  featureShowcase,
  ghibliShowcase,
  cyberpunkShowcase,
  cameraShowcase,
  whtEpi,
  keyboardDemo,
  typedMessageDemo,
  cheatingExposedNewDx,
  voiceDemo,
  megaX,
  megaWhatsapp,
  megaMegaWhatsapp,
  whatsappGhibli,
  whatsappToX,
  whatsappToXViral,
  xAnchorTour,
  iMessageAnchorTour,
  // plop:episode-entry
];

export default productionEpisodes;

// Named exports for ergonomic imports (docs, tooling).
export {
  // Common names used in docs/examples
  trackDemo as trackDemoV2,

  // Direct exports (stable identifiers)
  trackDemo,
  bakchodiBros,
  notificationDemo,
  profileFocusDemo,
  cheatingExposed,
  featureShowcase,
  ghibliShowcase,
  cyberpunkShowcase,
  cameraShowcase,
  whtEpi,
  keyboardDemo,
  typedMessageDemo,
  cheatingExposedNewDx,
  voiceDemo,
  megaX,
  megaWhatsapp,
  megaMegaWhatsapp,
  whatsappGhibli,
  whatsappToX,
  whatsappToXViral,
  xAnchorTour,
  iMessageAnchorTour,
};
