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

import trackDemo from "./track-demo.episode.js";
import bakchodiBros from "./bakchodi-bros.episode.js";
import notificationDemo from "./notification-demo.episode.js";
import profileFocusDemo from "./profile-focus-demo.episode.js";
import cheatingExposed from "./cheating-exposed.episode.js";
import featureShowcase from "./feature-showcase.episode.js";
import ghibliShowcase from "./ghibli-showcase.episode.js";
import cyberpunkShowcase from "./cyberpunk-showcase.episode.js";
import cameraShowcase from "./camera-showcase.episode.js";
import whtEpi from "./wht-epi.episode.js";
import keyboardDemo from "./keyboard-demo.episode.js";
import typedMessageDemo from "./typed-message-demo.episode.js";
import cheatingExposedNewDx from "./cheating-exposed-new-dx.episode.js";
import voiceDemo from "./voice-demo.episode.js";
import megaX from "./mega-x.episode.js";
import megaLinkedIn from "./mega-linkedin.episode.js";
import megaWhatsapp from "./mega-whatsapp.episode.js";
import megaMegaWhatsapp from "./mega-mega-whatsapp.episode.js";
import whatsappGhibli from "./whatsapp-ghibli.episode.js";
import whatsappToX from "./whatsapp-to-x.episode.js";
import whatsappToXViral from "./whatsapp-to-x-viral.episode.js";
import xAnchorTour from "./x-anchor-tour.episode.js";
import iMessageAnchorTour from "./imessage-anchor-tour.episode.js";
import typewriterLetter from "./typewriter-letter.episode.js";
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
  megaLinkedIn,
  megaWhatsapp,
  megaMegaWhatsapp,
  whatsappGhibli,
  whatsappToX,
  whatsappToXViral,
  xAnchorTour,
  iMessageAnchorTour,
  typewriterLetter,
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
  megaLinkedIn,
  megaWhatsapp,
  megaMegaWhatsapp,
  whatsappGhibli,
  whatsappToX,
  whatsappToXViral,
  xAnchorTour,
  iMessageAnchorTour,
  typewriterLetter,
};
